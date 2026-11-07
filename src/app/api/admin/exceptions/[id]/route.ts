import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withAdmin } from '@/lib/api'

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAdmin(async () => {
    const { id } = await params
    await db.scheduleException.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  })
}
