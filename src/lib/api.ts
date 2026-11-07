import { NextResponse } from 'next/server'
import { requireAdmin, UnauthorizedError, type AdminSessionUser } from './auth'

export function jsonOk(data: unknown) {
  return NextResponse.json(data)
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status })
}

/** Executa o handler com admin autenticado; responde 401/500 automaticamente */
export async function withAdmin(
  handler: (admin: AdminSessionUser) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    const admin = await requireAdmin()
    return await handler(admin)
  } catch (err) {
    if (err instanceof UnauthorizedError) {
      return jsonError('Sessão expirada. Faça login novamente.', 401)
    }
    console.error('[API ERROR]', err)
    return jsonError('Erro interno do servidor.', 500)
  }
}
