import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withAdmin } from '@/lib/api'

/**
 * Clientes cadastrados automaticamente pelos agendamentos.
 */
export async function GET() {
  return withAdmin(async () => {
    const customers = await db.customer.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        pets: { include: { _count: { select: { appointments: true } } } },
        appointments: {
          orderBy: [{ date: 'desc' }, { startMin: 'desc' }],
          include: { service: true, pet: true },
        },
      },
    })

    return NextResponse.json({
      customers: customers.map((c) => ({
        id: c.id,
        name: c.name,
        phone: c.phone,
        notes: c.notes,
        createdAt: c.createdAt,
        pets: c.pets,
        appointmentCount: c.appointments.length,
        completedCount: c.appointments.filter((a) => a.status === 'CONCLUIDO').length,
        appointments: c.appointments.slice(0, 10),
      })),
    })
  })
}
