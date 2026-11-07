import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withAdmin } from '@/lib/api'
import { todayISO, todayMonth } from '@/lib/time'

export async function GET() {
  return withAdmin(async () => {
    const today = todayISO()
    const month = todayMonth()
    const monthStart = `${month}-01`
    const monthEnd = `${month}-31`

    const [
      agendamentosHoje,
      pendentes,
      confirmadosHoje,
      concluidosMes,
      canceladosMes,
      faturamentoAgg,
      totalClientes,
      totalPets,
      proximos,
      hojeList,
    ] = await Promise.all([
      db.appointment.count({ where: { date: today } }),
      db.appointment.count({ where: { status: 'PENDENTE' } }),
      db.appointment.count({ where: { date: today, status: 'CONFIRMADO' } }),
      db.appointment.count({
        where: { date: { gte: monthStart, lte: monthEnd }, status: 'CONCLUIDO' },
      }),
      db.appointment.count({
        where: { date: { gte: monthStart, lte: monthEnd }, status: 'CANCELADO' },
      }),
      db.appointment.aggregate({
        where: {
          date: { gte: monthStart, lte: monthEnd },
          status: { in: ['CONCLUIDO', 'CONFIRMADO'] },
        },
        _sum: { price: true },
      }),
      db.customer.count(),
      db.pet.count(),
      db.appointment.findMany({
        where: { date: { gte: today }, status: { in: ['PENDENTE', 'CONFIRMADO'] } },
        orderBy: [{ date: 'asc' }, { startMin: 'asc' }],
        take: 8,
        include: { service: true, pet: true, customer: true },
      }),
      db.appointment.findMany({
        where: { date: today },
        orderBy: { startMin: 'asc' },
        include: { service: true, pet: true, customer: true },
      }),
    ])

    return NextResponse.json({
      hoje: today,
      agendamentosHoje,
      pendentes,
      confirmadosHoje,
      concluidosMes,
      canceladosMes,
      faturamentoMes: faturamentoAgg._sum.price ?? 0,
      totalClientes,
      totalPets,
      proximos,
      hojeList,
    })
  })
}
