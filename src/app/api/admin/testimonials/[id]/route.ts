import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withAdmin } from '@/lib/api'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAdmin(async () => {
    const { id } = await params
    const body = (await req.json()) as {
      customerName?: string
      petName?: string
      text?: string
      rating?: number
      visible?: boolean
    }
    const data: Record<string, unknown> = {}
    if (body.customerName !== undefined) data.customerName = body.customerName.trim()
    if (body.petName !== undefined) data.petName = body.petName.trim()
    if (body.text !== undefined) data.text = body.text.trim()
    if (body.rating !== undefined) data.rating = Math.min(5, Math.max(1, body.rating))
    if (body.visible !== undefined) data.visible = body.visible

    const testimonial = await db.testimonial.update({ where: { id }, data })
    return NextResponse.json({ testimonial })
  })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAdmin(async () => {
    const { id } = await params
    await db.testimonial.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  })
}
