import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { withAdmin } from '@/lib/api'
import { hashPassword, verifyPassword } from '@/lib/auth'

/** Altera a senha do admin logado */
export async function POST(req: NextRequest) {
  return withAdmin(async (admin) => {
    const { currentPassword, newPassword } = (await req.json()) as {
      currentPassword?: string
      newPassword?: string
    }

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Preencha os dois campos.' }, { status: 400 })
    }
    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'A nova senha precisa ter pelo menos 6 caracteres.' },
        { status: 400 }
      )
    }

    const user = await db.adminUser.findUnique({ where: { id: admin.id } })
    if (!user || !verifyPassword(currentPassword, user.passwordHash)) {
      return NextResponse.json({ error: 'Senha atual incorreta.' }, { status: 400 })
    }

    await db.adminUser.update({
      where: { id: user.id },
      data: { passwordHash: hashPassword(newPassword) },
    })

    return NextResponse.json({ ok: true })
  })
}
