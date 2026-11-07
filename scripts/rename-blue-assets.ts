import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

/** Troca as URLs das imagens para os novos nomes (cache-busting) — idempotente. */
async function main() {
  // 1. Hero
  await db.siteSettings.updateMany({
    where: { heroImageUrl: '/uploads/hero.png' },
    data: { heroImageUrl: '/uploads/hero-azul.png' },
  })

  // 2. Galeria: shih tzu rosa -> novo arquivo azul
  await db.galleryItem.updateMany({
    where: { imageUrl: '/uploads/gallery-1.png' },
    data: { imageUrl: '/uploads/galeria-shihtzu.png', caption: 'Shih Tzu com tosa e bandana azul' },
  })

  // 3. Serviço que usava a foto antiga da galeria
  await db.service.updateMany({
    where: { imageUrl: '/uploads/gallery-1.png' },
    data: { imageUrl: '/uploads/galeria-shihtzu.png' },
  })

  // 4. Antes/Depois: foto "depois" -> novo arquivo
  await db.galleryItem.updateMany({
    where: { afterUrl: '/uploads/depois.png' },
    data: { afterUrl: '/uploads/depois-azul.png' },
  })

  const hero = await db.siteSettings.findUnique({ where: { id: 'main' }, select: { heroImageUrl: true } })
  console.log('heroImageUrl:', hero?.heroImageUrl)
  console.log('✅ URLs atualizadas!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
