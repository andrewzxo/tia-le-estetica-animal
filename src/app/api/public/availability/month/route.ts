import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { computeMonthAvailability } from '@/lib/availability'
import { daysInMonth } from '@/lib/time'

/**
 * Mapa de abertura/fechamento de cada dia de um mês (para o calendário).
 * GET /api/public/availability/month?month=YYYY-MM
 */
export async function GET(req: NextRequest) {
  try {
    const month = req.nextUrl.searchParams.get('month') || ''
    if (!/^\d{4}-\d{2}$/.test(month)) {
      return NextResponse.json({ error: 'Mês inválido.' }, { status: 400 })
    }

    const [workingHours, exceptions] = await Promise.all([
      db.workingHours.findMany(),
      db.scheduleException.findMany({
        where: { date: { startsWith: month } },
      }),
    ])

    const days = daysInMonth(month)
    const map = computeMonthAvailability({
      monthISO: month,
      days,
      workingHours,
      exceptions,
    })

    return NextResponse.json({ month, days: map })
  } catch (err) {
    console.error('[public/availability/month]', err)
    return NextResponse.json({ error: 'Erro ao consultar calendário.' }, { status: 500 })
  }
}
