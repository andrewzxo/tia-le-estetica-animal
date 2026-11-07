import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withAdmin } from '@/lib/api'

/**
 * Lista agendamentos com filtros.
 * GET /api/admin/appointments?from=YYYY-MM-DD&to=YYYY-MM-DD&status=PENDENTE&q=texto
 */
export async function GET(req: NextRequest) {
  return withAdmin(async () => {
    const sp = req.nextUrl.searchParams
    const from = sp.get('from') || undefined
    const to = sp.get('to') || undefined
    const status = sp.get('status') || undefined
    const q = (sp.get('q') || '').trim()

    const where: Record<string, unknown> = {}
    if (from && to) where.date = { gte: from, lte: to }
    else if (from) where.date = { gte: from }
    else if (to) where.date = { lte: to }
    if (status && status !== 'TODOS') where.status = status

    const appointments = await db.appointment.findMany({
      where,
      orderBy: [{ date: 'asc' }, { startMin: 'asc' }],
      include: { service: true, pet: true, customer: true },
    })

    const filtered = q
      ? appointments.filter((a) => {
          const hay = `${a.customer.name} ${a.pet.name} ${a.customer.phone} ${a.service.name}`.toLowerCase()
          return hay.includes(q.toLowerCase())
        })
      : appointments

    return NextResponse.json({ appointments: filtered })
  })
}
