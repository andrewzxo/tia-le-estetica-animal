import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'crypto'
import { cookies } from 'next/headers'
import { db } from './db'

const COOKIE_NAME = 'dale_admin_session'
const SESSION_MAX_AGE_S = 60 * 60 * 24 * 7 // 7 dias

// ── Senhas (scrypt) ────────────────────────────────────────────────

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':')
  if (!salt || !hash) return false
  const candidate = scryptSync(password, salt, 64)
  const expected = Buffer.from(hash, 'hex')
  if (candidate.length !== expected.length) return false
  return timingSafeEqual(candidate, expected)
}

// ── Token de sessão (HMAC) ─────────────────────────────────────────

function sign(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('base64url')
}

function makeToken(userId: string, secret: string): string {
  const payload = Buffer.from(
    JSON.stringify({ uid: userId, exp: Date.now() + SESSION_MAX_AGE_S * 1000 })
  ).toString('base64url')
  return `${payload}.${sign(payload, secret)}`
}

function readToken(token: string, secret: string): string | null {
  const [payload, sig] = token.split('.')
  if (!payload || !sig) return null
  const expected = sign(payload, secret)
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString()) as {
      uid: string
      exp: number
    }
    if (!data.uid || !data.exp || data.exp < Date.now()) return null
    return data.uid
  } catch {
    return null
  }
}

// ── Sessão ─────────────────────────────────────────────────────────

async function getSecret(): Promise<string | null> {
  const settings = await db.siteSettings.findUnique({
    where: { id: 'main' },
    select: { sessionSecret: true },
  })
  return settings?.sessionSecret || null
}

export async function createSession(userId: string): Promise<void> {
  const secret = await getSecret()
  if (!secret) throw new Error('Sistema não inicializado (secret ausente)')
  const token = makeToken(userId, secret)
  const store = await cookies()
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    path: '/',
    maxAge: SESSION_MAX_AGE_S,
  })
}

export async function destroySession(): Promise<void> {
  const store = await cookies()
  store.set(COOKIE_NAME, '', { httpOnly: true, path: '/', maxAge: 0 })
}

export type AdminSessionUser = { id: string; name: string; username: string }

/** Retorna o usuário administrador logado ou null */
export async function getAdmin(): Promise<AdminSessionUser | null> {
  const secret = await getSecret()
  if (!secret) return null
  const store = await cookies()
  const token = store.get(COOKIE_NAME)?.value
  if (!token) return null
  const uid = readToken(token, secret)
  if (!uid) return null
  const user = await db.adminUser.findUnique({
    where: { id: uid },
    select: { id: true, name: true, username: true },
  })
  return user
}

/** Helper para rotas protegidas: lança resposta 401 se não autenticado */
export async function requireAdmin(): Promise<AdminSessionUser> {
  const admin = await getAdmin()
  if (!admin) {
    throw new UnauthorizedError()
  }
  return admin
}

export class UnauthorizedError extends Error {
  constructor() {
    super('Não autorizado')
  }
}
