import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withAdmin } from '@/lib/api'

type ServiceBody = {
  name?: string
  description?: string
  durationMin?: number
  priceOnConsult?: boolean
  basePrice?: number
  smallPrice?: number | null
  mediumPrice?: number | null
  largePrice?: number | null
  catPrice?: number | null
  species?: string
  imageUrl?: string | null
  active?: boolean
  sortOrder?: number
}

function validate(body: ServiceBody): string | null {
  if (!body.name || body.name.trim().length < 2) return 'Informe o nome do serviço.'
  if (!body.durationMin || body.durationMin < 10) return 'Duração mínima de 10 minutos.'
  if (!['AMBOS', 'CAES', 'GATOS'].includes(body.species || '')) return 'Espécie inválida.'
  if (!body.priceOnConsult) {
    if (body.basePrice == null || body.basePrice < 0) return 'Informe o preço base.'
  }
  return null
}

export async function GET() {
  return withAdmin(async () => {
    const services = await db.service.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    })
    return NextResponse.json({ services })
  })
}

export async function POST(req: NextRequest) {
  return withAdmin(async () => {
    const body = (await req.json()) as ServiceBody
    const error = validate(body)
    if (error) return NextResponse.json({ error }, { status: 400 })

    const maxOrder = await db.service.aggregate({ _max: { sortOrder: true } })

    const service = await db.service.create({
      data: {
        name: body.name!.trim(),
        description: (body.description || '').trim(),
        durationMin: body.durationMin!,
        priceOnConsult: !!body.priceOnConsult,
        basePrice: body.priceOnConsult ? 0 : (body.basePrice ?? 0),
        smallPrice: body.smallPrice ?? null,
        mediumPrice: body.mediumPrice ?? null,
        largePrice: body.largePrice ?? null,
        catPrice: body.catPrice ?? null,
        species: body.species || 'AMBOS',
        imageUrl: body.imageUrl || null,
        active: body.active ?? true,
        sortOrder: body.sortOrder ?? (maxOrder._max.sortOrder ?? 0) + 1,
        isExample: false,
      },
    })

    return NextResponse.json({ service })
  })
}
