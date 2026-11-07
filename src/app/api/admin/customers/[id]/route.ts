import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withAdmin } from '@/lib/api'

/** Observações internas do cliente */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAdmin(async () => {
    const { id } = await params
    const body = (await req.json()) as { notes?: string }
    const customer = await db.customer.update({
      where: { id },
      data: { notes: (body.notes || '').trim() },
    })
    return NextResponse.json({ customer: { id: customer.id, notes: customer.notes } })
  })
}
