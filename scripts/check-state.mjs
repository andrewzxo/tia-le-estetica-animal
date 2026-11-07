import { createRequire } from 'module'
const require = createRequire('/home/z/my-project/package.json')
const { PrismaClient } = require('@prisma/client')
const db = new PrismaClient()

const services = await db.service.findMany({ orderBy: { sortOrder: 'asc' } })
console.log('=== SERVICES ===')
for (const s of services) {
  console.log(`${s.active ? 'ATIVO ' : 'INATIV'} | ${s.name} | sort=${s.sortOrder} | img=${s.imageUrl}`)
}

const gallery = await db.galleryItem.findMany({ orderBy: { sortOrder: 'asc' } })
console.log('\n=== GALLERY ===')
for (const g of gallery) {
  console.log(`${g.visible ? 'VIS  ' : 'INV  '} | kind=${g.kind} | ${g.imageUrl || (g.beforeUrl + ' -> ' + g.afterUrl)} | ${g.caption}`)
}

const settings = await db.siteSettings.findUnique({ where: { id: 'main' } })
console.log('\n=== SETTINGS ===')
console.log(JSON.stringify({ businessName: settings?.businessName, logoUrl: settings?.logoUrl, whatsapp: settings?.whatsapp, address: settings?.address, instagram: settings?.instagram, phone: settings?.phone, hoursNote: settings?.hoursNote }, null, 2))

const wh = await db.workingHours.findMany({ orderBy: { weekday: 'asc' } })
console.log('\n=== WORKING HOURS ===')
for (const w of wh) {
  console.log(`dow=${w.weekday} enabled=${w.enabled} open=${w.openMin} close=${w.closeMin} lunch=${w.lunchStartMin}-${w.lunchEndMin}`)
}

await db.$disconnect()
