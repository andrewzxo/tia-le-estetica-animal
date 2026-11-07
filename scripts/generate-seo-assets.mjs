import { createRequire } from 'module'
import { mkdirSync } from 'fs'
import path from 'path'
const require = createRequire('/home/z/my-project/package.json')
const sharp = require('sharp')

const ROOT = '/home/z/my-project'
const LOGO = path.join(ROOT, 'public/uploads/logo-tia-le-v2.png')
const NAVY = '#1d2b4e'
const NAVY_DEEP = '#12203f'
const BRONZE = '#c99e6a'
const WHITE = '#ffffff'

async function makeSquareIcon(size, outPath, bg) {
  const img = sharp(LOGO).resize(size, size, {
    fit: 'contain',
    background: { r: 255, g: 255, b: 255, alpha: 1 },
  })
  const buf = await img.png().toBuffer()
  await sharp({
    create: { width: size, height: size, channels: 4, background: bg },
  })
    .composite([{ input: buf }])
    .png({ compressionLevel: 9 })
    .toFile(outPath)
  console.log(`✓ ícone gerado: ${outPath} (${size}x${size})`)
}

async function makeOgImage() {
  const meta = await sharp(LOGO).metadata()
  console.log(`logo original: ${meta.width}x${meta.height}, alpha=${meta.hasAlpha}`)

  const W = 1200
  const H = 630
  const LOGO_SIZE = 330
  const LOGO_X = 96
  const LOGO_Y = Math.round((H - LOGO_SIZE) / 2)

  const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${NAVY}"/>
      <stop offset="100%" stop-color="${NAVY_DEEP}"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <circle cx="1120" cy="-60" r="220" fill="${BRONZE}" opacity="0.10"/>
  <circle cx="60" cy="640" r="150" fill="${BRONZE}" opacity="0.08"/>
  <circle cx="${LOGO_X + LOGO_SIZE / 2}" cy="${LOGO_Y + LOGO_SIZE / 2}" r="${LOGO_SIZE / 2 + 10}" fill="none" stroke="${BRONZE}" stroke-width="3" opacity="0.85"/>
  <text x="492" y="185" font-family="DejaVu Sans" font-size="23" font-weight="bold" letter-spacing="4" fill="${BRONZE}">BANHO E TOSA • ESTÉTICA ANIMAL</text>
  <text x="488" y="285" font-family="DejaVu Sans" font-size="88" font-weight="bold" fill="${WHITE}">Tia Lê</text>
  <text x="492" y="350" font-family="DejaVu Sans" font-size="46" fill="${WHITE}" opacity="0.92">Estética Animal</text>
  <line x1="494" y1="392" x2="700" y2="392" stroke="${BRONZE}" stroke-width="3"/>
  <text x="492" y="452" font-family="DejaVu Sans" font-size="31" fill="${WHITE}" opacity="0.85">Banho, tosa e muito carinho para o seu pet.</text>
  <text x="492" y="496" font-family="DejaVu Sans" font-size="31" fill="${WHITE}" opacity="0.85">Agende online em poucos cliques.</text>
  <text x="492" y="560" font-family="DejaVu Sans" font-size="22" font-weight="bold" fill="${BRONZE}">WhatsApp (19) 98904-4489 • @tiale.esteticaanimal</text>
</svg>`

  const logoBuf = await sharp(LOGO)
    .resize(LOGO_SIZE, LOGO_SIZE, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toBuffer()

  await sharp({
    create: { width: W, height: H, channels: 4, background: NAVY },
  })
    .composite([
      { input: Buffer.from(svg), top: 0, left: 0 },
      { input: logoBuf, top: LOGO_Y, left: LOGO_X },
    ])
    .png({ compressionLevel: 9, palette: false })
    .toFile(path.join(ROOT, 'public/uploads/og-tia-le.png'))

  console.log('✓ og image gerada: public/uploads/og-tia-le.png (1200x630)')
}

async function main() {
  mkdirSync(path.join(ROOT, 'src/app'), { recursive: true })
  await makeSquareIcon(256, path.join(ROOT, 'src/app/icon.png'), { r: 255, g: 255, b: 255, alpha: 1 })
  await makeSquareIcon(180, path.join(ROOT, 'src/app/apple-icon.png'), { r: 255, g: 255, b: 255, alpha: 1 })
  await makeOgImage()
  console.log('✅ Assets SEO gerados!')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
