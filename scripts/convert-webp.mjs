import { createRequire } from 'module'
import { readdirSync, mkdirSync, renameSync, statSync } from 'fs'
import path from 'path'
const require = createRequire('/home/z/my-project/package.json')
const sharp = require('sharp')
const { PrismaClient } = require('@prisma/client')

const ROOT = '/home/z/my-project'
const UPLOADS = path.join(ROOT, 'public/uploads')
const BACKUP = path.join(ROOT, '.backup-original-images')
const db = new PrismaClient()

/** Qualidade maior para logos/imagens com texto */
const HIGH_QUALITY = new Set(['logo-tia-le-v2'])

const mapping = new Map() // oldName -> newName

async function convertAll() {
  mkdirSync(BACKUP, { recursive: true })
  const files = readdirSync(UPLOADS).filter((f) => /\.(png|jpe?g)$/i.test(f))
  console.log(`Convertendo ${files.length} imagens para WebP...`)

  for (const file of files) {
    const src = path.join(UPLOADS, file)
    const ext = path.extname(file)
    const base = path.basename(file, ext)
    const outName = `${base}.webp`
    const out = path.join(UPLOADS, outName)

    if (statSync(src).size < 1024) {
      console.log(`  ⚠ pulado (muito pequeno): ${file}`)
      continue
    }

    const meta = await sharp(src).metadata()
    const quality = HIGH_QUALITY.has(base) ? 92 : 80
    const pipeline = sharp(src).rotate()
    if ((meta.width || 0) > 1600) pipeline.resize(1600, null, { withoutEnlargement: true })
    await pipeline.webp({ quality, effort: 4 }).toFile(out)

    const oldSize = statSync(src).size
    const newSize = statSync(out).size
    const pct = Math.round((1 - newSize / oldSize) * 100)
    console.log(`  ✓ ${file} → ${outName}  ${(oldSize / 1024).toFixed(0)}KB → ${(newSize / 1024).toFixed(0)}KB (-${pct}%)`)
    mapping.set(`/uploads/${file}`, `/uploads/${outName}`)
  }
}

function replaceAll(str) {
  if (!str) return str
  let result = str
  for (const [oldPath, newPath] of mapping) {
    if (result === oldPath) return newPath
    // fallback: replace extension if basename matches
    if (result.startsWith(oldPath)) result = result.replace(oldPath, newPath)
  }
  return result
}

async function updateDb() {
  console.log('\nAtualizando banco de dados...')

  const services = await db.service.findMany()
  for (const s of services) {
    const imageUrl = replaceAll(s.imageUrl)
    if (imageUrl !== s.imageUrl) {
      await db.service.update({ where: { id: s.id }, data: { imageUrl } })
      console.log(`  ✓ Service "${s.name}": ${s.imageUrl} → ${imageUrl}`)
    }
  }

  const gallery = await db.galleryItem.findMany()
  for (const g of gallery) {
    const data = {}
    const imageUrl = replaceAll(g.imageUrl)
    const beforeUrl = replaceAll(g.beforeUrl)
    const afterUrl = replaceAll(g.afterUrl)
    if (imageUrl !== g.imageUrl) data.imageUrl = imageUrl
    if (beforeUrl !== g.beforeUrl) data.beforeUrl = beforeUrl
    if (afterUrl !== g.afterUrl) data.afterUrl = afterUrl
    if (Object.keys(data).length > 0) {
      await db.galleryItem.update({ where: { id: g.id }, data })
      console.log(`  ✓ Gallery "${g.caption.slice(0, 40)}": ${JSON.stringify(data)}`)
    }
  }

  const settings = await db.siteSettings.findUnique({ where: { id: 'main' } })
  if (settings) {
    const data = {}
    const logoUrl = replaceAll(settings.logoUrl)
    const heroImageUrl = replaceAll(settings.heroImageUrl)
    if (logoUrl !== settings.logoUrl) data.logoUrl = logoUrl
    if (heroImageUrl !== settings.heroImageUrl) data.heroImageUrl = heroImageUrl
    if (Object.keys(data).length > 0) {
      await db.siteSettings.update({ where: { id: 'main' }, data })
      console.log(`  ✓ Settings: ${JSON.stringify(data)}`)
    }
  }
}

function moveOriginals() {
  console.log('\nMovendo originais para backup...')
  // backups dos uploads convertidos
  for (const [oldPath] of mapping) {
    const name = path.basename(oldPath)
    const src = path.join(UPLOADS, name)
    try {
      renameSync(src, path.join(BACKUP, name))
    } catch (e) {
      console.log(`  ⚠ ${name}: ${e.message}`)
    }
  }
  // arquivos não utilizados em public/
  for (const name of ['logo.svg']) {
    const src = path.join(ROOT, 'public', name)
    try {
      if (statSync(src).isFile()) renameSync(src, path.join(BACKUP, name))
      console.log(`  ✓ ${name} movido para backup`)
    } catch {
      /* não existe */
    }
  }
}

async function main() {
  await convertAll()
  await updateDb()
  moveOriginals()
  console.log(`\n✅ Concluído! ${mapping.size} imagens convertidas (originais em .backup-original-images/)`)
  await db.$disconnect()
}

main().catch(async (e) => {
  console.error(e)
  process.exit(1)
})
