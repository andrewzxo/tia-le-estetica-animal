import ZAI from 'z-ai-web-dev-sdk'
import fs from 'fs'

type Item = { prompt: string; out: string; size: string }

const ITEMS: Item[] = [
  {
    out: './public/uploads/hero.png',
    size: '864x1152',
    prompt:
      'Professional pet grooming studio photography, adorable freshly groomed white maltese dog with fluffy clean shiny fur wearing a light blue bandana, sitting facing camera with happy gentle expression and tongue out, seamless soft light blue studio background, commercial advertising quality, soft diffused studio lighting, crisp details, sharp focus, high quality professional photo',
  },
  {
    out: './public/uploads/gallery-3.png',
    size: '1024x1024',
    prompt:
      'Professional pet photography, happy freshly groomed beige poodle with round fluffy teddy-bear haircut wearing a blue bandana, seamless pastel light blue studio background, looking at camera, commercial advertising quality, soft studio lighting, high quality detailed photo',
  },
  {
    out: './public/uploads/gallery-4.png',
    size: '1024x1024',
    prompt:
      'Professional pet photography, beautiful fluffy white persian cat freshly groomed with clean silky fur being gently brushed, seamless soft light blue studio background, calm elegant mood, commercial advertising quality, soft lighting, high quality detailed photo',
  },
  {
    out: './public/uploads/depois.png',
    size: '1024x1024',
    prompt:
      'Professional pet photography, small tan terrier mix dog freshly groomed with neat trimmed fluffy clean fur, happy proud expression with tongue out sitting straight, seamless light gray studio background, commercial advertising quality, soft studio lighting, high quality detailed photo',
  },
  {
    out: './public/uploads/about.png',
    size: '1152x864',
    prompt:
      'Professional photo inside a modern pet grooming salon, female groomer wearing a blue apron gently drying a happy small white fluffy dog on a grooming table, bright clean interior with light blue and white tones, softly blurred background, commercial advertising quality, warm soft lighting, high quality detailed photo',
  },
]

async function genWithRetry(zai: Awaited<ReturnType<typeof ZAI.create>>, item: Item, tries = 3) {
  for (let attempt = 1; attempt <= tries; attempt++) {
    try {
      const response = await zai.images.generations.create({
        prompt: item.prompt,
        size: item.size,
      })
      const b64 = response.data?.[0]?.base64
      if (!b64) throw new Error('resposta sem imagem')
      fs.writeFileSync(item.out, Buffer.from(b64, 'base64'))
      console.log(`OK ${item.out} (${attempt}ª tentativa)`)
      return true
    } catch (err) {
      console.error(`FALHA ${item.out} tentativa ${attempt}: ${err instanceof Error ? err.message : err}`)
      if (attempt < tries) await new Promise((r) => setTimeout(r, 2500 * attempt))
    }
  }
  return false
}

async function main() {
  const zai = await ZAI.create()
  let ok = 0
  for (const item of ITEMS) {
    const done = await genWithRetry(zai, item)
    if (done) ok++
  }
  console.log(`CONCLUIDO: ${ok}/${ITEMS.length}`)
}

main()
