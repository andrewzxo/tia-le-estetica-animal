import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyPassword, createSession } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { username, password } = (await req.json()) as {
      username?: string
      password?: string
    }

    if (!username || !password) {
      return NextResponse.json({ error: 'Informe usuário e senha.' }, { status: 400 })
    }

    const user = await db.adminUser.findUnique({
      where: { username: username.trim().toLowerCase() },
    })

    if (!user || !verifyPassword(password, user.passwordHash)) {
      return NextResponse.json({ error: 'Usuário ou senha incorretos.' }, { status: 401 })
    }

    await createSession(user.id)

    return NextResponse.json({ ok: true, user: { name: user.name, username: user.username } })
  } catch (err) {
    console.error('[admin/login]', err)
    return NextResponse.json({ error: 'Erro ao entrar. Tente novamente.' }, { status: 500 })
  }
}
