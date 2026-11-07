import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withAdmin, jsonError } from '@/lib/api'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAdmin(async () => {
    const { id } = await params
    const body = (await req.json()) as {
      caption?: string
      visible?: boolean
      sortOrder?: number
      kind?: string
      imageUrl?: string | null
      beforeUrl?: string | null
      afterUrl?: string | null
    }

    const existing = await db.galleryItem.findUnique({ where: { id } })
    if (!existing) return jsonError('Item não encontrado.', 404)

    const data: Record<string, unknown> = {}
    if (body.caption !== undefined) data.caption = body.caption.trim()
    if (body.visible !== undefined) data.visible = body.visible
    if (body.sortOrder !== undefined) data.sortOrder = body.sortOrder

    // Estado final desejado (para validação quando tipo/imagens mudam)
    const changingKindOrImage =
      body.kind !== undefined ||
      body.imageUrl !== undefined ||
      body.beforeUrl !== undefined ||
      body.afterUrl !== undefined

    if (changingKindOrImage) {
      const nextKind = body.kind === 'ANTES_DEPOIS' ? 'ANTES_DEPOIS' : body.kind === 'FOTO' ? 'FOTO' : existing.kind
      const nextImageUrl = body.imageUrl !== undefined ? body.imageUrl : existing.imageUrl
      const nextBefore = body.beforeUrl !== undefined ? body.beforeUrl : existing.beforeUrl
      const nextAfter = body.afterUrl !== undefined ? body.afterUrl : existing.afterUrl

      if (nextKind === 'FOTO') {
        if (!nextImageUrl) return jsonError('Envie uma foto.', 400)
        data.kind = 'FOTO'
        data.imageUrl = nextImageUrl
        data.beforeUrl = null
        data.afterUrl = null
      } else {
        if (!nextBefore || !nextAfter) return jsonError('Envie as duas fotos (antes e depois).', 400)
        data.kind = 'ANTES_DEPOIS'
        data.imageUrl = null
        data.beforeUrl = nextBefore
        data.afterUrl = nextAfter
      }
    }

    const item = await db.galleryItem.update({ where: { id }, data })
    return NextResponse.json({ item })
  })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAdmin(async () => {
    const { id } = await params
    await db.galleryItem.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  })
}
