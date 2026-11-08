import { NextRequest, NextResponse } from 'next/server'
import { withAdmin } from '@/lib/api'
import { listBookings, sortBookings } from '@/lib/bookings'

/**
 * Lista agendamentos com filtros (armazenamento persistente).
 * GET /api/admin/appointments?from=YYYY-MM-DD&to=YYYY-MM-DD&status=PENDENTE&q=texto
 */
export async function GET(req: NextRequest) {
  return withAdmin(async () => {
    const sp = req.nextUrl.searchParams
    const from = sp.get('from') || undefined
    const to = sp.get('to') || undefined
    const status = sp.get('status') || undefined
    const q = (sp.get('q') || '').trim()

    const all = sortBookings(await listBookings())

    const filtered = all.filter((a) => {
      if (from && a.date < from) return false
      if (to && a.date > to) return false
      if (status && status !== 'TODOS' && a.status !== status) return false
      if (q) {
        const hay =
          `${a.customer.name} ${a.pet.name} ${a.customer.phone} ${a.service.name}`.toLowerCase()
        if (!hay.includes(q.toLowerCase())) return false
      }
      return true
    })

    return NextResponse.json({ appointments: filtered })
  })
}
