import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withAdmin } from '@/lib/api'

/**
 * Relatório financeiro e de desempenho.
 * GET /api/admin/reports?from=YYYY-MM-DD&to=YYYY-MM-DD
 */
export async function GET(req: NextRequest) {
  return withAdmin(async () => {
    const sp = req.nextUrl.searchParams
    const from = sp.get('from')
    const to = sp.get('to')
    if (!from || !to) {
      return NextResponse.json({ error: 'Período inválido.' }, { status: 400 })
    }

    const [appointments, newCustomers, totalCustomers] = await Promise.all([
      db.appointment.findMany({
        where: { date: { gte: from, lte: to } },
        include: { service: true },
      }),
      db.customer.count({ where: { createdAt: { gte: new Date(`${from}T03:00:00.000Z`), lte: new Date(`${to}T23:59:59.999Z`) } } }),
      db.customer.count(),
    ])

    const valid = appointments.filter((a) => a.status !== 'RECUSADO')
    const concluded = appointments.filter((a) => a.status === 'CONCLUIDO')
    const confirmed = appointments.filter((a) => a.status === 'CONFIRMADO')
    const pending = appointments.filter((a) => a.status === 'PENDENTE')
    const cancelled = appointments.filter((a) => a.status === 'CANCELADO')
    const refused = appointments.filter((a) => a.status === 'RECUSADO')

    // Faturamento estimado: concluídos (realizado) + confirmados (a realizar)
    const revenueConcluded = concluded.reduce((s, a) => s + a.price, 0)
    const revenueConfirmed = confirmed.reduce((s, a) => s + a.price, 0)
    const revenueTotal = revenueConcluded + revenueConfirmed

    // Serviços mais vendidos
    const serviceMap = new Map<string, { name: string; count: number; revenue: number }>()
    for (const a of [...concluded, ...confirmed]) {
      const cur = serviceMap.get(a.serviceId) || { name: a.service.name, count: 0, revenue: 0 }
      cur.count += 1
      cur.revenue += a.price
      serviceMap.set(a.serviceId, cur)
    }
    const topServices = [...serviceMap.entries()]
      .map(([id, v]) => ({ id, ...v }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)

    // Clientes atendidos no período
    const customersServed = new Set([...concluded, ...confirmed].map((a) => a.customerId)).size

    // Ticket médio
    const paidCount = concluded.length + confirmed.length
    const avgTicket = paidCount > 0 ? revenueTotal / paidCount : 0

    // Desempenho mensal (buckes por mês dentro do período)
    const monthMap = new Map<string, { revenue: number; count: number; concluded: number }>()
    for (const a of [...concluded, ...confirmed]) {
      const ym = a.date.slice(0, 7)
      const cur = monthMap.get(ym) || { revenue: 0, count: 0, concluded: 0 }
      cur.revenue += a.price
      cur.count += 1
      if (a.status === 'CONCLUIDO') cur.concluded += 1
      monthMap.set(ym, cur)
    }
    const monthly = [...monthMap.entries()]
      .map(([month, v]) => ({ month, ...v }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-12)

    return NextResponse.json({
      period: { from, to },
      revenueConcluded,
      revenueConfirmed,
      revenueTotal,
      concludedCount: concluded.length,
      confirmedCount: confirmed.length,
      pendingCount: pending.length,
      cancelledCount: cancelled.length,
      refusedCount: refused.length,
      customersServed,
      newCustomers,
      totalCustomers,
      avgTicket,
      topServices,
      monthly,
    })
  })
}
