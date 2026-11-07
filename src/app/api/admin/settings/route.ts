import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withAdmin } from '@/lib/api'
import { normalizeWhatsapp } from '@/lib/format'

export async function GET() {
  return withAdmin(async () => {
    const settings = await db.siteSettings.findUnique({ where: { id: 'main' } })
    if (!settings) {
      return NextResponse.json({ error: 'Configurações não encontradas.' }, { status: 404 })
    }
    const { sessionSecret: _secret, ...rest } = settings
    return NextResponse.json({ settings: rest })
  })
}

export async function PUT(req: NextRequest) {
  return withAdmin(async () => {
    const body = (await req.json()) as Record<string, unknown>
    const data: Record<string, unknown> = {}

    const strFields = [
      'businessName',
      'phone',
      'address',
      'instagram',
      'facebook',
      'heroTitle',
      'heroSubtitle',
      'aboutTitle',
      'aboutText',
      'hoursNote',
      'waBookingTemplate',
    ] as const

    for (const f of strFields) {
      if (body[f] !== undefined && typeof body[f] === 'string') data[f] = body[f]
    }

    if (body.whatsapp !== undefined) {
      const wa = normalizeWhatsapp(String(body.whatsapp))
      if (!wa) {
        return NextResponse.json(
          { error: 'WhatsApp inválido. Use DDD + número (ex.: 11999998888).' },
          { status: 400 }
        )
      }
      data.whatsapp = wa
    }

    if (body.logoUrl !== undefined) data.logoUrl = body.logoUrl || null
    if (body.heroImageUrl !== undefined) data.heroImageUrl = body.heroImageUrl || null

    if (data.businessName !== undefined && String(data.businessName).trim().length < 2) {
      return NextResponse.json(
        { error: 'O nome do estabelecimento é obrigatório.' },
        { status: 400 }
      )
    }

    const settings = await db.siteSettings.update({ where: { id: 'main' }, data })
    const { sessionSecret: _secret, ...rest } = settings
    return NextResponse.json({ settings: rest })
  })
}
