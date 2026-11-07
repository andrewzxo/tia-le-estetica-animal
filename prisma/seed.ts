import { PrismaClient } from '@prisma/client'
import { randomBytes, scryptSync } from 'crypto'

const db = new PrismaClient()

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

const WA_TEMPLATE_DEFAULT = `🐾 *{negocio}*
*Novo agendamento pelo site*

*Serviço:* {servico}
*Data:* {data}
*Horário:* {horario}
*Pet:* {pet} ({especie} • {raca} • porte {porte})
*Tutor:* {tutor}
*Telefone:* {telefone}
*Preço estimado:* {preco}
*Táxi dog (adicional):* {taxidog}
*Forma de pagamento:* {pagamento}
*Observações:* {obs}

Poderiam confirmar meu agendamento? Obrigado(a)! 💕`

async function main() {
  console.log('🌱 Iniciando seed...')

  // ── Admin provisório ────────────────────────────────────────────
  const admin = await db.adminUser.findUnique({ where: { username: 'admin' } })
  if (!admin) {
    await db.adminUser.create({
      data: {
        username: 'admin',
        passwordHash: hashPassword('admin123'),
        name: 'Administrador',
      },
    })
    console.log('  ✓ Admin provisório criado: admin / admin123')
  }

  // ── Configurações do site ───────────────────────────────────────
  const settings = await db.siteSettings.findUnique({ where: { id: 'main' } })
  if (!settings) {
    await db.siteSettings.create({
      data: {
        id: 'main',
        businessName: 'Tia Lê Estética Animal',
        whatsapp: '5519989044489',
        phone: '(19) 98904-4489',
        address: '',
        instagram: '@tiale.esteticaanimal',
        facebook: '',
        logoUrl: '/uploads/logo-tia-le-v2.webp',
        heroTitle: 'Na Tia Lê, seu pet sai lindo, cheiroso e feliz',
        heroSubtitle:
          'Banho, tosa e estética animal com carinho de quem ama pets. Agende online em poucos cliques — também temos táxi dog!',
        heroImageUrl: '/uploads/tia-le-hero.webp',
        aboutTitle: 'Cuidado de tia, técnica de profissional',
        aboutText:
          'Na Tia Lê Estética Animal, cada pet é atendido como se fosse nosso: sem pressa, com produtos de qualidade e aquele carinho de tia. Do banho simples à tosa na tesoura, do desembolo ao táxi dog — tudo com hora marcada e muito amor.',
        hoursNote: '',
        waBookingTemplate: WA_TEMPLATE_DEFAULT,
        sessionSecret: randomBytes(32).toString('hex'),
      },
    })
    console.log('  ✓ Configurações criadas (WhatsApp: 5519989044489)')
  }

  // ── Horários de funcionamento (provisórios) ─────────────────────
  const hoursCount = await db.workingHours.count()
  if (hoursCount === 0) {
    const weekdays = [1, 2, 3, 4, 5]
    for (const wd of weekdays) {
      await db.workingHours.create({
        data: {
          weekday: wd,
          enabled: true,
          openMin: 540,
          closeMin: 1080,
          lunchStartMin: 720,
          lunchEndMin: 780,
          slotIntervalMin: 30,
          gapMin: 15,
          capacity: 1,
        },
      })
    }
    await db.workingHours.create({
      data: {
        weekday: 6,
        enabled: true,
        openMin: 540,
        closeMin: 1020,
        lunchStartMin: null,
        lunchEndMin: null,
        slotIntervalMin: 30,
        gapMin: 15,
        capacity: 1,
      },
    })
    await db.workingHours.create({
      data: {
        weekday: 0,
        enabled: false,
        openMin: 540,
        closeMin: 1080,
        lunchStartMin: null,
        lunchEndMin: null,
        slotIntervalMin: 30,
        gapMin: 15,
        capacity: 1,
      },
    })
    console.log('  ✓ Horários de funcionamento provisórios criados')
  }

  // ── Serviços reais (conforme a placa da loja) ───────────────────
  const serviceCount = await db.service.count()
  if (serviceCount === 0) {
    await db.service.createMany({
      data: [
        {
          name: 'Banho Simples',
          description:
            'Banho completo com shampoo e condicionador premium, secagem, escovação, limpeza de ouvidos e perfume.',
          durationMin: 60,
          basePrice: 50,
          smallPrice: 50,
          mediumPrice: 60,
          largePrice: 75,
          catPrice: 55,
          species: 'AMBOS',
          imageUrl: '/uploads/servico-banho-shihtzu-rosa.webp',
          isExample: false,
          sortOrder: 1,
        },
        {
          name: 'Tosa Higiênica',
          description:
            'Acabamento nas regiões íntimas, patinhas, face e olhos para manter a higiene entre banhos.',
          durationMin: 45,
          basePrice: 40,
          smallPrice: 40,
          mediumPrice: 45,
          largePrice: 55,
          catPrice: 45,
          species: 'AMBOS',
          imageUrl: '/uploads/pet-shihtzu-verde.webp',
          isExample: false,
          sortOrder: 2,
        },
        {
          name: 'Tosa na Máquina',
          description:
            'Tosa completa feita na máquina, no comprimento que você preferir. Prática, uniforme e confortável.',
          durationMin: 60,
          basePrice: 45,
          smallPrice: 45,
          mediumPrice: 55,
          largePrice: 70,
          catPrice: 50,
          species: 'AMBOS',
          imageUrl: '/uploads/pet-lulu-bandana.webp',
          isExample: false,
          sortOrder: 3,
        },
        {
          name: 'Tosa na Tesoura',
          description:
            'Tosa artística toda feita na tesoura, com acabamento fino no estilo que você escolher.',
          durationMin: 90,
          basePrice: 70,
          smallPrice: 70,
          mediumPrice: 85,
          largePrice: 110,
          catPrice: 75,
          species: 'AMBOS',
          imageUrl: '/uploads/pet-shihtzu-penelope.webp',
          isExample: false,
          sortOrder: 4,
        },
        {
          name: 'Hidratação',
          description:
            'Hidratação profunda da pelagem e da pele para deixar o pelo macio, brilhante e saudável.',
          durationMin: 30,
          basePrice: 30,
          smallPrice: 30,
          mediumPrice: 35,
          largePrice: 45,
          catPrice: 30,
          species: 'AMBOS',
          imageUrl: '/uploads/pet-golden-brasil.webp',
          isExample: false,
          sortOrder: 5,
        },
        {
          name: 'Desembolo',
          description:
            'Remoção cuidadosa de nós e embaraços da pelagem, com paciência e sem estressar o pet.',
          durationMin: 30,
          basePrice: 25,
          smallPrice: 25,
          mediumPrice: 35,
          largePrice: 45,
          catPrice: 25,
          species: 'AMBOS',
          imageUrl: '/uploads/servico-desembolo-antes.webp',
          isExample: false,
          sortOrder: 6,
        },
      ],
    })
    console.log('  ✓ 6 serviços reais criados (valores ajustáveis no painel)')
  }

  // ── Galeria de exemplo ──────────────────────────────────────────
  const galleryCount = await db.galleryItem.count()
  if (galleryCount === 0) {
    await db.galleryItem.createMany({
      data: [
        {
          kind: 'FOTO',
          imageUrl: '/uploads/pet-yorkshire-girassol.webp',
          caption: 'Yorkshire com laços de girassol, pronta para a festa',
          isExample: false,
          sortOrder: 1,
        },
        {
          kind: 'FOTO',
          imageUrl: '/uploads/pet-shihtzu-penelope.webp',
          caption: 'A Shih Tzu Penélope impecável depois do banho',
          isExample: false,
          sortOrder: 2,
        },
        {
          kind: 'FOTO',
          imageUrl: '/uploads/pet-lulu-bandana.webp',
          caption: 'Lulu da Pomerânia sorrindo após o banho, com bandana',
          isExample: false,
          sortOrder: 3,
        },
        {
          kind: 'FOTO',
          imageUrl: '/uploads/pet-golden-brasil.webp',
          caption: 'Golden Retriever com laço do Brasil',
          isExample: false,
          sortOrder: 4,
        },
        {
          kind: 'FOTO',
          imageUrl: '/uploads/pet-shihtzu-brasil.webp',
          caption: 'Shih Tzu com bandana do Brasil após a tosa',
          isExample: false,
          sortOrder: 5,
        },
        {
          kind: 'FOTO',
          imageUrl: '/uploads/pet-shihtzu-verde.webp',
          caption: 'Shih Tzu cinza com laços verdes após banho e tosa',
          isExample: false,
          sortOrder: 6,
        },
        {
          kind: 'ANTES_DEPOIS',
          beforeUrl: '/uploads/antes-real.webp',
          afterUrl: '/uploads/depois-real.webp',
          caption: 'A transformação completa — banho, tosa e finalização com laços',
          isExample: false,
          sortOrder: 7,
        },
      ],
    })
    console.log('  ✓ Galeria de exemplo criada')
  }

  // ── Depoimentos de exemplo ──────────────────────────────────────
  const testimonialCount = await db.testimonial.count()
  if (testimonialCount === 0) {
    await db.testimonial.createMany({
      data: [
        {
          customerName: 'Mariana S.',
          petName: 'Bolinha',
          text: 'A Lê é super atenciosa! O Bolinha volta para casa lindo, cheiroso e calmo. Agendo pelo site em poucos cliques, é muito prático.',
          isExample: true,
          sortOrder: 1,
        },
        {
          customerName: 'Carlos H.',
          petName: 'Mel',
          text: 'Minha gata é bem assustada e elas têm uma paciência incrível. O resultado do banho ficou impecável. Recomendo de olhos fechados!',
          isExample: true,
          sortOrder: 2,
        },
        {
          customerName: 'Fernanda L.',
          petName: 'Thor',
          text: 'Ambiente limpinho, cheiroso e um carinho enorme com os pets. O Thor sai daí passando na porta dele! Melhor banho e tosa da região.',
          isExample: true,
          sortOrder: 3,
        },
      ],
    })
    console.log('  ✓ Depoimentos de exemplo criados')
  }

  console.log('✅ Seed concluído!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
