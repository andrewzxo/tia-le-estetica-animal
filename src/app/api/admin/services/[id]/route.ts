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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAdmin(async () => {
    const { id } = await params
    const body = (await req.json()) as ServiceBody

    const existing = await db.service.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Serviço não encontrado.' }, { status: 404 })
    }

    const data: Record<string, unknown> = {}
    if (body.name !== undefined) {
      if (body.name.trim().length < 2)
        return NextResponse.json({ error: 'Informe o nome do serviço.' }, { status: 400 })
      data.name = body.name.trim()
    }
    if (body.description !== undefined) data.description = body.description.trim()
    if (body.durationMin !== undefined) {
      if (body.durationMin < 10)
        return NextResponse.json({ error: 'Duração mínima de 10 minutos.' }, { status: 400 })
      data.durationMin = body.durationMin
    }
    if (body.priceOnConsult !== undefined) data.priceOnConsult = body.priceOnConsult
    if (body.basePrice !== undefined) data.basePrice = body.basePrice
    if (body.smallPrice !== undefined) data.smallPrice = body.smallPrice
    if (body.mediumPrice !== undefined) data.mediumPrice = body.mediumPrice
    if (body.largePrice !== undefined) data.largePrice = body.largePrice
    if (body.catPrice !== undefined) data.catPrice = body.catPrice
    if (body.species !== undefined) {
      if (!['AMBOS', 'CAES', 'GATOS'].includes(body.species))
        return NextResponse.json({ error: 'Espécie inválida.' }, { status: 400 })
      data.species = body.species
    }
    if (body.imageUrl !== undefined) data.imageUrl = body.imageUrl
    if (body.active !== undefined) data.active = body.active
    if (body.sortOrder !== undefined) data.sortOrder = body.sortOrder

    const service = await db.service.update({ where: { id }, data })
    return NextResponse.json({ service })
  })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAdmin(async () => {
    const { id } = await params
    const count = await db.appointment.count({ where: { serviceId: id } })
    if (count > 0) {
      // Serviço com histórico: apenas desativa para preservar registros
      await db.service.update({ where: { id }, data: { active: false } })
      return NextResponse.json({
        ok: true,
        deactivated: true,
        message:
          'O serviço possui agendamentos no histórico, então foi desativado em vez de excluído.',
      })
    }
    await db.service.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  })
}
