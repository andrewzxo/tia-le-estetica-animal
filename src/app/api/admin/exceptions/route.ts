import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withAdmin } from '@/lib/api'
import { hhmmToMin } from '@/lib/time'

export async function GET() {
  return withAdmin(async () => {
    const exceptions = await db.scheduleException.findMany({
      orderBy: { date: 'asc' },
    })
    return NextResponse.json({ exceptions })
  })
}

export async function POST(req: NextRequest) {
  return withAdmin(async () => {
    const body = (await req.json()) as {
      date?: string
      type?: string
      reason?: string
      start?: string
      end?: string
    }

    const date = body.date || ''
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json({ error: 'Data inválida.' }, { status: 400 })
    }

    const type = body.type === 'PARCIAL' ? 'PARCIAL' : 'FECHADO'
    let startMin: number | null = null
    let endMin: number | null = null

    if (type === 'PARCIAL') {
      if (!body.start || !body.end) {
        return NextResponse.json(
          { error: 'Informe o início e o fim do bloqueio.' },
          { status: 400 }
        )
      }
      startMin = hhmmToMin(body.start)
      endMin = hhmmToMin(body.end)
      if (startMin >= endMin) {
        return NextResponse.json(
          { error: 'O início do bloqueio deve ser antes do fim.' },
          { status: 400 }
        )
      }
    }

    const existing = await db.scheduleException.findUnique({ where: { date } })
    if (existing) {
      return NextResponse.json(
        { error: 'Já existe um bloqueio para esta data. Edite ou remova o existente.' },
        { status: 400 }
      )
    }

    const exception = await db.scheduleException.create({
      data: {
        date,
        type,
        startMin,
        endMin,
        reason: (body.reason || '').trim(),
      },
    })

    return NextResponse.json({ exception })
  })
}
