'use client'

import { WhatsAppIcon } from './icons'

export function FloatingWhatsApp({ whatsapp }: { whatsapp: string }) {
  if (!whatsapp) return null
  const message = encodeURIComponent('Olá! Vim pelo site e gostaria de mais informações 💕')
  return (
    <a
      href={`https://api.whatsapp.com/send?phone=${whatsapp}&text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp"
      className="group fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-xl bg-[#25d366] text-ink-deep shadow-xl shadow-ink/20 ring-1 ring-ink/10 transition hover:-translate-y-0.5 hover:bg-[#1fb958]"
    >
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  )
}
