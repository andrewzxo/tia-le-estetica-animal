import { randomUUID } from 'crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import path from 'path'

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Store de agendamentos com PERSISTÊNCIA REAL.
 * ─────────────────────────────────────────────────────────────────────────────
 * O SQLite (Prisma) não persiste na Vercel: cada instância serverless recebe
 * uma cópia descartável do banco em /tmp, que se perde a cada cold start ou
 * redeploy — agendamentos "sumiam" e horários nunca ficavam ocupados.
 *
 * Solução: os agendamentos vivem em um documento JSON versionado no próprio
 * repositório GitHub (data/appointments.json), escrito via Contents API com
 * commit "[skip ci]" (para não disparar deploy). Em desenvolvimento (sem
 * GITHUB_TOKEN), o mesmo documento é um arquivo local em db/bookings.json.
 *
 * Consistência:
 *  - Cache em memória por instância com TTL curto (15s) para leituras.
 *  - Escrita com concorrência otimista: lê o sha atual, grava e, se outro
 *    cliente alterou o arquivo no meio (HTTP 409), repete até 4×.
 *  - Após escrever, o cache local é atualizado imediatamente.
 */

export type StoredBooking = {
  id: string
  serviceId: string
  customerId: string
  petId: string
  date: string // YYYY-MM-DD
  startMin: number
  endMin: number
  price: number
  status: 'PENDENTE' | 'CONFIRMADO' | 'RECUSADO' | 'CANCELADO' | 'CONCLUIDO' | string
  petNotes: string
  paymentInfo: string
  internalNotes: string
  taxiDog: boolean
  createdAt: string
  updatedAt: string
  /** Snapshot desnormalizado do serviço no momento do agendamento */
  service: { id: string; name: string; durationMin: number }
  /** Snapshot desnormalizado do pet */
  pet: { id: string; name: string; species: string; breed: string; size: string }
  /** Snapshot desnormalizado do tutor/cliente */
  customer: { id: string; name: string; phone: string }
}

export type NewBooking = Omit<StoredBooking, 'id' | 'createdAt' | 'updatedAt'> &
  Partial<Pick<StoredBooking, 'id' | 'createdAt' | 'updatedAt'>>

type StoreDoc = { appointments: StoredBooking[] }

const GH_API = 'https://api.github.com'
const CACHE_TTL_MS = 15_000
const MAX_WRITE_ATTEMPTS = 4

function ghConfig() {
  const token = process.env.GITHUB_TOKEN
  const repo = process.env.GITHUB_REPO
  if (!token || !repo) return null
  return {
    token,
    repo,
    branch: process.env.GITHUB_BRANCH || 'main',
    dataPath: process.env.GITHUB_DATA_PATH || 'data/appointments.json',
  }
}

/** Caminho do arquivo local (modo desenvolvimento) */
function localFilePath(): string {
  return path.join(process.cwd(), 'db', 'bookings.json')
}

function emptyDoc(): StoreDoc {
  return { appointments: [] }
}

function parseDoc(raw: string): StoreDoc {
  try {
    const parsed = JSON.parse(raw) as Partial<StoreDoc>
    if (parsed && Array.isArray(parsed.appointments)) {
      return { appointments: parsed.appointments as StoredBooking[] }
    }
  } catch {
    // documento corrompido → recomeça vazio (não deve acontecer)
  }
  return emptyDoc()
}

// ── Cache em memória (por instância) ─────────────────────────────────────────
const globalForBookings = globalThis as unknown as {
  __bookingsCache?: { data: StoredBooking[]; fetchedAt: number }
}

function setCache(data: StoredBooking[]) {
  globalForBookings.__bookingsCache = { data, fetchedAt: Date.now() }
}

// ── GitHub Contents API ──────────────────────────────────────────────────────
function ghHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }
}

async function ghGet(
  cfg: NonNullable<ReturnType<typeof ghConfig>>
): Promise<{ sha: string | null; doc: StoreDoc }> {
  const res = await fetch(
    `${GH_API}/repos/${cfg.repo}/contents/${cfg.dataPath}?ref=${cfg.branch}`,
    { headers: ghHeaders(cfg.token), cache: 'no-store' }
  )
  if (res.status === 404) return { sha: null, doc: emptyDoc() }
  if (!res.ok) {
    throw new Error(`GitHub GET falhou (${res.status})`)
  }
  const json = (await res.json()) as { sha: string; content: string }
  const doc = parseDoc(Buffer.from(json.content, 'base64').toString('utf8'))
  return { sha: json.sha, doc }
}

async function ghPut(
  cfg: NonNullable<ReturnType<typeof ghConfig>>,
  doc: StoreDoc,
  sha: string | null
): Promise<void> {
  const res = await fetch(`${GH_API}/repos/${cfg.repo}/contents/${cfg.dataPath}`, {
    method: 'PUT',
    headers: { ...ghHeaders(cfg.token), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'chore: atualiza agendamentos [skip ci] [skip vercel]',
      content: Buffer.from(JSON.stringify(doc, null, 2)).toString('base64'),
      ...(sha ? { sha } : {}),
      branch: cfg.branch,
    }),
  })
  if (!res.ok) {
    throw new Error(`GitHub PUT falhou (${res.status})`)
  }
}

// ── Leitura do documento (com cache) ─────────────────────────────────────────
async function readDocFresh(): Promise<StoreDoc> {
  const cfg = ghConfig()
  if (cfg) {
    const { doc } = await ghGet(cfg)
    setCache(doc.appointments)
    return doc
  }
  // Modo desenvolvimento: arquivo local
  const file = localFilePath()
  if (!existsSync(file)) return emptyDoc()
  const doc = parseDoc(readFileSync(file, 'utf8'))
  setCache(doc.appointments)
  return doc
}

/**
 * Lista todos os agendamentos (ordenados por data e horário).
 * Usa cache em memória com TTL de 15s por instância.
 */
export async function listBookings(): Promise<StoredBooking[]> {
  const cached = globalForBookings.__bookingsCache
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.data
  }
  const doc = await readDocFresh()
  return doc.appointments
}

/** Busca um agendamento por id */
export async function findBooking(id: string): Promise<StoredBooking | null> {
  const all = await listBookings()
  return all.find((b) => b.id === id) ?? null
}

/**
 * Aplica uma mutação ao documento com concorrência otimista.
 * Em caso de conflito (outra escrita venceu), relê e tenta de novo.
 */
async function mutateDoc(
  mutate: (doc: StoreDoc) => StoreDoc
): Promise<void> {
  const cfg = ghConfig()
  if (cfg) {
    let lastError: unknown = null
    for (let attempt = 0; attempt < MAX_WRITE_ATTEMPTS; attempt++) {
      try {
        const { sha, doc } = await ghGet(cfg)
        const next = mutate(doc)
        await ghPut(cfg, next, sha)
        setCache(next.appointments)
        return
      } catch (err) {
        lastError = err
        // 409/conflito → aguarda um pouco e repete com leitura nova
        await new Promise((r) => setTimeout(r, 250 * (attempt + 1)))
      }
    }
    throw lastError instanceof Error
      ? lastError
      : new Error('Não foi possível salvar o agendamento.')
  }

  // Modo desenvolvimento: arquivo local
  const file = localFilePath()
  const doc = existsSync(file) ? parseDoc(readFileSync(file, 'utf8')) : emptyDoc()
  const next = mutate(doc)
  mkdirSync(path.dirname(file), { recursive: true })
  writeFileSync(file, JSON.stringify(next, null, 2), 'utf8')
  setCache(next.appointments)
}

/** Cria um novo agendamento */
export async function addBooking(input: NewBooking): Promise<StoredBooking> {
  const now = new Date().toISOString()
  const booking: StoredBooking = {
    ...input,
    id: input.id || `bk_${randomUUID().replace(/-/g, '').slice(0, 20)}`,
    createdAt: input.createdAt || now,
    updatedAt: now,
  }
  await mutateDoc((doc) => ({ appointments: [...doc.appointments, booking] }))
  return booking
}

/** Atualiza campos de um agendamento existente */
export async function updateBooking(
  id: string,
  patch: Partial<Omit<StoredBooking, 'id' | 'createdAt'>>
): Promise<StoredBooking> {
  const existing = await findBooking(id)
  if (!existing) throw new Error('Agendamento não encontrado.')
  let updated: StoredBooking | null = null
  await mutateDoc((doc) => ({
    appointments: doc.appointments.map((b) => {
      if (b.id !== id) return b
      updated = { ...b, ...patch, id: b.id, createdAt: b.createdAt, updatedAt: new Date().toISOString() }
      return updated
    }),
  }))
  if (!updated) throw new Error('Agendamento não encontrado.')
  return updated
}

/** Remove um agendamento definitivamente. Retorna false se não existia. */
export async function deleteBooking(id: string): Promise<boolean> {
  const existing = await findBooking(id)
  if (!existing) return false
  let removed = false
  await mutateDoc((doc) => {
    const before = doc.appointments.length
    const appointments = doc.appointments.filter((b) => b.id !== id)
    removed = appointments.length < before
    return { appointments }
  })
  return removed
}

/** Somente agendamentos que ocupam agenda */
export function occupiesAgenda(b: StoredBooking): boolean {
  return b.status === 'PENDENTE' || b.status === 'CONFIRMADO'
}

/** Lista agendamentos ativos de um dia no formato esperado por computeDayAvailability */
export async function activeAppointmentsForDate(
  date: string,
  excludeId?: string
): Promise<{ id: string; startMin: number; endMin: number }[]> {
  const all = await listBookings()
  return all
    .filter(
      (b) => b.date === date && occupiesAgenda(b) && (!excludeId || b.id !== excludeId)
    )
    .map((b) => ({ id: b.id, startMin: b.startMin, endMin: b.endMin }))
}

/** Ordenação padrão: data, depois horário */
export function sortBookings(list: StoredBooking[]): StoredBooking[] {
  return [...list].sort((a, b) =>
    a.date === b.date ? a.startMin - b.startMin : a.date.localeCompare(b.date)
  )
}
