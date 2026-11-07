import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withAdmin } from '@/lib/api'
import { hhmmToMin } from '@/lib/time'

type HoursBody = {
  hours: Array<{
    weekday: number
    enabled: boolean
    open: string
    close: string
    lunchEnabled: boolean
    lunchStart: string
    lunchEnd: string
    slotIntervalMin: number
    gapMin: number
    capacity: number
  }>
}

function validateHours(body: HoursBody): string | null {
  for (const h of body.hours) {
    const open = hhmmToMin(h.open)
    const close = hhmmToMin(h.close)
    if (open >= close) return 'Horário de abertura deve ser antes do fechamento.'
    if (h.enabled && h.lunchEnabled) {
      const ls = hhmmToMin(h.lunchStart)
      const le = hhmmToMin(h.lunchEnd)
      if (ls >= le) return 'Início do almoço deve ser antes do fim.'
      if (ls < open || le > close) return 'O almoço precisa estar dentro do horário de funcionamento.'
    }
    if (h.slotIntervalMin < 5 || h.slotIntervalMin > 240)
      return 'Intervalo entre horários deve estar entre 5 e 240 minutos.'
    if (h.capacity < 1 || h.capacity > 10) return 'Capacidade deve estar entre 1 e 10.'
  }
  return null
}

export async function GET() {
  return withAdmin(async () => {
    const workingHours = await db.workingHours.findMany({ orderBy: { weekday: 'asc' } })
    return NextResponse.json({ workingHours })
  })
}

export async function PUT(req: NextRequest) {
  return withAdmin(async () => {
    const body = (await req.json()) as HoursBody
    const error = validateHours(body)
    if (error) return NextResponse.json({ error }, { status: 400 })

    for (const h of body.hours) {
      await db.workingHours.update({
        where: { weekday: h.weekday },
        data: {
          enabled: h.enabled,
          openMin: hhmmToMin(h.open),
          closeMin: hhmmToMin(h.close),
          lunchStartMin: h.enabled && h.lunchEnabled ? hhmmToMin(h.lunchStart) : null,
          lunchEndMin: h.enabled && h.lunchEnabled ? hhmmToMin(h.lunchEnd) : null,
          slotIntervalMin: h.slotIntervalMin,
          gapMin: Math.max(0, h.gapMin || 0),
          capacity: Math.max(1, h.capacity || 1),
        },
      })
    }

    const workingHours = await db.workingHours.findMany({ orderBy: { weekday: 'asc' } })
    return NextResponse.json({ workingHours })
  })
}
