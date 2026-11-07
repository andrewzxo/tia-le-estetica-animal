import { PrismaClient } from '@prisma/client'
import { existsSync, copyFileSync } from 'fs'
import path from 'path'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

/**
 * Na Vercel (serverless) o filesystem é somente leitura, exceto /tmp.
 * Na primeira execução de cada instância, copiamos o snapshot do banco
 * (db/seed.db, incluído no bundle) para /tmp e usamos de lá.
 *
 * ⚠️ Limitação conhecida: dados gravados em /tmp vivem apenas naquela
 * instância — em redeploy ou cold start o banco volta ao snapshot.
 * Para persistência real, migrar para um banco gerenciado (Turso/Postgres).
 */
function resolveDatabaseUrl(): string {
  if (process.env.VERCEL === '1') {
    const target = '/tmp/custom.db'
    const candidates = [
      path.join(process.cwd(), 'db', 'seed.db'),
      path.join(process.cwd(), 'db', 'custom.db'),
    ]
    if (!existsSync(target)) {
      for (const src of candidates) {
        if (existsSync(src)) {
          copyFileSync(src, target)
          break
        }
      }
    }
    if (existsSync(target)) return `file:${target}`
  }
  return process.env.DATABASE_URL || 'file:../db/custom.db'
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: resolveDatabaseUrl(),
    log: ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
