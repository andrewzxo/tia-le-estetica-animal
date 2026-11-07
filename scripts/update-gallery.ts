import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

/** Atualiza a galeria do banco atual com as novas fotos azuis (idempotente). */
async function main() {
  const additions = [
    {
      kind: 'FOTO',
      imageUrl: '/uploads/gallery-3.png',
      caption: 'Poodle com tosa teddy bear e bandana',
      isExample: true,
      sortOrder: 4,
    },
    {
      kind: 'FOTO',
      imageUrl: '/uploads/gallery-4.png',
      caption: 'Gata Persa durante a escovação',
      isExample: true,
      sortOrder: 5,
    },
  ]

  for (const item of additions) {
    const exists = await db.galleryItem.findFirst({
      where: { imageUrl: item.imageUrl },
    })
    if (!exists) {
      await db.galleryItem.create({ data: item })
      console.log(`  ✓ Adicionado: ${item.caption}`)
    } else {
      console.log(`  • Já existe: ${item.caption}`)
    }
  }

  // Atualiza a legenda do antes/depois (a foto "depois" foi refeita)
  const ad = await db.galleryItem.findFirst({ where: { kind: 'ANTES_DEPOIS' } })
  if (ad && ad.caption === 'Transformação completa — Poodle') {
    await db.galleryItem.update({
      where: { id: ad.id },
      data: { caption: 'Transformação completa — banho e tosa' },
    })
    console.log('  ✓ Legenda do antes/depois atualizada')
  }

  console.log('✅ Galeria atualizada!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
