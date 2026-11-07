import ZAI from 'z-ai-web-dev-sdk'
import fs from 'fs'

async function main() {
  const zai = await ZAI.create()
  const response = await zai.images.generations.create({
    prompt:
      'Professional pet photography, happy freshly groomed shih tzu dog with neat trimmed fluffy clean fur wearing a blue bandana, seamless pastel light blue studio background, looking at camera with sweet expression, commercial advertising quality, soft studio lighting, high quality detailed photo',
    size: '1024x1024',
  })
  const b64 = response.data?.[0]?.base64
  if (!b64) throw new Error('resposta sem imagem')
  fs.writeFileSync('./public/uploads/galeria-shihtzu.png', Buffer.from(b64, 'base64'))
  console.log('OK galeria-shihtzu.png')
}

main()
