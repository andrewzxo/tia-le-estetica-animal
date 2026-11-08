import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withAdmin } from '@/lib/api'
import { computeDayAvailability } from '@/lib/availability'
import { findBooking, updateBooking, deleteBooking, activeAppointmentsForDate } from '@/lib/bookings'
import { todayISO } from '@/lib/time'

type PatchBody = {
  action: 'confirm' | 'refuse' | 'cancel' | 'complete' | 'notes' | 'reschedule'
  internalNotes?: string
  date?: string
  startMin?: number
}

/** Ações administrativas sobre um agendamento (armazenamento persistente) */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAdmin(async () => {
    const { id } = await params
    const body = (await req.json()) as PatchBody

    const appointment = await findBooking(id)
    if (!appointment) {
      return NextResponse.json({ error: 'Agendamento não encontrado.' }, { status: 404 })
    }

    switch (body.action) {
      case 'confirm': {
        if (appointment.status !== 'PENDENTE') {
          return NextResponse.json(
            { error: 'Somente agendamentos pendentes podem ser confirmados.' },
            { status: 400 }
          )
        }
        const updated = await updateBooking(id, { status: 'CONFIRMADO' })
        return NextResponse.json({ appointment: updated })
      }

      case 'refuse': {
        if (appointment.status !== 'PENDENTE') {
          return NextResponse.json(
            { error: 'Somente agendamentos pendentes podem ser recusados.' },
            { status: 400 }
          )
        }
        const updated = await updateBooking(id, { status: 'RECUSADO' })
        return NextResponse.json({ appointment: updated })
      }

      case 'cancel': {
        if (!['PENDENTE', 'CONFIRMADO'].includes(appointment.status)) {
          return NextResponse.json(
            { error: 'Este agendamento não pode mais ser cancelado.' },
            { status: 400 }
          )
        }
        const updated = await updateBooking(id, { status: 'CANCELADO' })
        return NextResponse.json({ appointment: updated })
      }

      case 'complete': {
        if (!['PENDENTE', 'CONFIRMADO'].includes(appointment.status)) {
          return NextResponse.json(
            { error: 'Este agendamento não pode ser marcado como concluído.' },
            { status: 400 }
          )
        }
        const updated = await updateBooking(id, { status: 'CONCLUIDO' })
        return NextResponse.json({ appointment: updated })
      }

      case 'notes': {
        const updated = await updateBooking(id, {
          internalNotes: (body.internalNotes || '').trim(),
        })
        return NextResponse.json({ appointment: updated })
      }

      case 'reschedule': {
        const date = body.date || ''
        const startMin = body.startMin
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || typeof startMin !== 'number') {
          return NextResponse.json({ error: 'Nova data/horário inválidos.' }, { status: 400 })
        }
        if (date < todayISO()) {
          return NextResponse.json(
            { error: 'Não é possível remarcar para o passado.' },
            { status: 400 }
          )
        }

        const [workingHours, exceptions, activeAppointments] = await Promise.all([
          db.workingHours.findMany(),
          db.scheduleException.findMany({ where: { date } }),
          activeAppointmentsForDate(date, id),
        ])

        const day = computeDayAvailability({
          dateISO: date,
          durationMin: appointment.service.durationMin,
          workingHours,
          exceptions,
          activeAppointments,
        })
        const slot = day.slots.find((s) => s.min === startMin)
        if (!day.open || !slot || !slot.available) {
          return NextResponse.json(
            { error: 'Horário indisponível para remarcação.' },
            { status: 409 }
          )
        }

        const updated = await updateBooking(id, {
          date,
          startMin,
          endMin: startMin + appointment.service.durationMin,
          status: 'CONFIRMADO',
        })
        return NextResponse.json({ appointment: updated })
      }

      default:
        return NextResponse.json({ error: 'Ação desconhecida.' }, { status: 400 })
    }
  })
}

/** Excluir definitivamente (limpeza de histórico/testes) */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAdmin(async () => {
    const { id } = await params
    const removed = await deleteBooking(id)
    if (!removed) {
      return NextResponse.json({ error: 'Agendamento não encontrado.' }, { status: 404 })
    }
    return NextResponse.json({ ok: true })
  })
}
