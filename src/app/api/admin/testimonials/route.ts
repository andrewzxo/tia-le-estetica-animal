import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withAdmin } from '@/lib/api'

export async function GET() {
  return withAdmin(async () => {
    const testimonials = await db.testimonial.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    })
    return NextResponse.json({ testimonials })
  })
}

export async function POST(req: NextRequest) {
  return withAdmin(async () => {
    const body = (await req.json()) as {
      customerName?: string
      petName?: string
      text?: string
      rating?: number
    }
    if (!body.customerName || body.customerName.trim().length < 2) {
      return NextResponse.json({ error: 'Informe o nome do cliente.' }, { status: 400 })
    }
    if (!body.text || body.text.trim().length < 5) {
      return NextResponse.json({ error: 'Escreva o depoimento.' }, { status: 400 })
    }
    const maxOrder = await db.testimonial.aggregate({ _max: { sortOrder: true } })
    const testimonial = await db.testimonial.create({
      data: {
        customerName: body.customerName.trim(),
        petName: (body.petName || '').trim(),
        text: body.text.trim(),
        rating: Math.min(5, Math.max(1, body.rating ?? 5)),
        sortOrder: (maxOrder._max.sortOrder ?? 0) + 1,
        isExample: false,
      },
    })
    return NextResponse.json({ testimonial })
  })
}
