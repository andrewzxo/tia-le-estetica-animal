import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { computeDayAvailability } from '@/lib/availability'
import { activeAppointmentsForDate } from '@/lib/bookings'
import { todayISO } from '@/lib/time'

/**
 * Disponibilidade de um dia específico para um serviço.
 * GET /api/public/availability?date=YYYY-MM-DD&serviceId=xxx
 *
 * Considera agendamentos já feitos por qualquer pessoa (armazenamento
 * persistente) — horários ocupados aparecem indisponíveis.
 */
export async function GET(req: NextRequest) {
  try {
    const date = req.nextUrl.searchParams.get('date') || ''
    const serviceId = req.nextUrl.searchParams.get('serviceId') || ''
    const excludeId = req.nextUrl.searchParams.get('excludeId') || ''

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ error: 'Data inválida.' }, { status: 400 })
    }

    const service = await db.service.findUnique({ where: { id: serviceId } })
    if (!service || !service.active) {
      return NextResponse.json({ error: 'Serviço não encontrado.' }, { status: 404 })
    }

    const [workingHours, exceptions, activeAppointments] = await Promise.all([
      db.workingHours.findMany(),
      db.scheduleException.findMany({ where: { date } }),
      activeAppointmentsForDate(date, excludeId || undefined),
    ])

    const availability = computeDayAvailability({
      dateISO: date,
      durationMin: service.durationMin,
      workingHours,
      exceptions,
      activeAppointments,
    })

    return NextResponse.json(availability)
  } catch (err) {
    console.error('[public/availability]', err)
    return NextResponse.json({ error: 'Erro ao consultar disponibilidade.' }, { status: 500 })
  }
}
