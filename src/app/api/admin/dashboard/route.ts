import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withAdmin } from '@/lib/api'
import { listBookings, sortBookings, occupiesAgenda } from '@/lib/bookings'
import { todayISO, todayMonth } from '@/lib/time'

export async function GET() {
  return withAdmin(async () => {
    const today = todayISO()
    const month = todayMonth()
    const monthStart = `${month}-01`
    const monthEnd = `${month}-31`

    const all = sortBookings(await listBookings())
    const inMonth = all.filter((a) => a.date >= monthStart && a.date <= monthEnd)

    const [totalClientes, totalPets] = await Promise.all([
      db.customer.count(),
      db.pet.count(),
    ])

    const agendamentosHoje = all.filter((a) => a.date === today)
    const faturamentoMes = inMonth
      .filter((a) => a.status === 'CONCLUIDO' || a.status === 'CONFIRMADO')
      .reduce((sum, a) => sum + a.price, 0)

    return NextResponse.json({
      hoje: today,
      agendamentosHoje: agendamentosHoje.length,
      pendentes: all.filter((a) => a.status === 'PENDENTE').length,
      confirmadosHoje: agendamentosHoje.filter((a) => a.status === 'CONFIRMADO').length,
      concluidosMes: inMonth.filter((a) => a.status === 'CONCLUIDO').length,
      canceladosMes: inMonth.filter((a) => a.status === 'CANCELADO').length,
      faturamentoMes,
      totalClientes,
      totalPets,
      proximos: sortBookings(
        all.filter((a) => a.date >= today && occupiesAgenda(a))
      ).slice(0, 8),
      hojeList: agendamentosHoje,
    })
  })
}
