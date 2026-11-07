import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withAdmin } from '@/lib/api'

type GalleryBody = {
  kind?: string
  imageUrl?: string | null
  beforeUrl?: string | null
  afterUrl?: string | null
  caption?: string
  visible?: boolean
  sortOrder?: number
}

function validate(body: GalleryBody): string | null {
  if (body.kind === 'ANTES_DEPOIS') {
    if (!body.beforeUrl || !body.afterUrl)
      return 'Envie as duas fotos (antes e depois).'
  } else {
    if (!body.imageUrl) return 'Envie uma foto.'
  }
  return null
}

export async function GET() {
  return withAdmin(async () => {
    const items = await db.galleryItem.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    })
    return NextResponse.json({ items })
  })
}

export async function POST(req: NextRequest) {
  return withAdmin(async () => {
    const body = (await req.json()) as GalleryBody
    const error = validate(body)
    if (error) return NextResponse.json({ error }, { status: 400 })

    const maxOrder = await db.galleryItem.aggregate({ _max: { sortOrder: true } })

    const item = await db.galleryItem.create({
      data: {
        kind: body.kind === 'ANTES_DEPOIS' ? 'ANTES_DEPOIS' : 'FOTO',
        imageUrl: body.kind === 'ANTES_DEPOIS' ? null : body.imageUrl ?? null,
        beforeUrl: body.kind === 'ANTES_DEPOIS' ? body.beforeUrl ?? null : null,
        afterUrl: body.kind === 'ANTES_DEPOIS' ? body.afterUrl ?? null : null,
        caption: (body.caption || '').trim(),
        visible: body.visible ?? true,
        sortOrder: (maxOrder._max.sortOrder ?? 0) + 1,
        isExample: false,
      },
    })

    return NextResponse.json({ item })
  })
}
