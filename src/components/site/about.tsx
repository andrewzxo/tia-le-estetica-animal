'use client'

import Image from 'next/image'
import { Heart, BadgeCheck, HeartHandshake, ShieldCheck } from 'lucide-react'
import { Reveal } from './reveal'

const HIGHLIGHTS = [
  { icon: BadgeCheck, text: 'Produtos premium, seguros para pele e pelagem' },
  { icon: HeartHandshake, text: 'Atendimento individualizado, sem pressa' },
  { icon: ShieldCheck, text: 'Ambiente higienizado, tranquilo e seguro' },
]

export function AboutSection({
  title,
  text,
  businessName,
}: {
  title: string
  text: string
  businessName: string
}) {
  if (!title && !text) return null

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Composição de fotos sobrepostas */}
        <Reveal className="relative order-2 mx-auto w-full max-w-md lg:order-1 lg:max-w-none">
          <div className="relative">
            {/* Foto grande — placa real da loja */}
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-paper-deep shadow-xl shadow-ink/10 ring-1 ring-ink/5">
              <Image
                src="/uploads/tia-le-placa.webp"
                alt={`Placa da ${businessName} na fachada da loja`}
                fill
                sizes="(max-width: 1024px) 90vw, 45vw"
                className="object-cover"
              />
            </div>
            {/* Foto de detalhe sobreposta — logo com os filhotes */}
            <div className="absolute -bottom-6 -right-3 w-[44%] rotate-2 overflow-hidden rounded-lg border-[5px] border-paper shadow-lg shadow-ink/15 sm:-right-6">
              <div className="relative aspect-square">
                <Image
                  src="/uploads/logo-tia-le-v2.webp"
                  alt="Logo da Tia Lê com três filhotes na banheira"
                  fill
                  sizes="220px"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </Reveal>

        {/* História */}
        <Reveal delay={120} className="order-1 text-center lg:order-2 lg:text-left">
          <p className="eyebrow flex items-center justify-center gap-3 text-bronze lg:justify-start">
            <span className="h-px w-8 bg-bronze/60" aria-hidden="true" />
            Nossa história
          </p>
          <h2 className="font-display mt-4 text-3xl font-normal leading-[1.1] tracking-tight text-ink-deep sm:text-[2.5rem]">
            {title || (
              <>
                Uma paixão de torcer o rabo,
                <br />
                <em className="font-light italic text-bronze">em cada detalhe.</em>
              </>
            )}
          </h2>
          <p className="mt-5 text-[1.02rem] leading-relaxed text-ink/65">{text}</p>

          <ul className="mx-auto mt-8 max-w-md space-y-4 text-left lg:mx-0">
            {HIGHLIGHTS.map((h) => (
              <li key={h.text} className="flex items-start gap-3.5 border-b border-ink/8 pb-4 last:border-0">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-bronze/10 text-bronze">
                  <h.icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="pt-1.5 text-sm font-semibold text-ink/75">{h.text}</span>
              </li>
            ))}
          </ul>

          <p className="font-display mt-7 inline-flex items-center gap-2 text-[0.95rem] italic text-ink/50">
            <Heart className="h-3.5 w-3.5 fill-bronze text-bronze" aria-hidden="true" />
            Feito à mão, com amor — por quem entende de pets
          </p>
        </Reveal>
      </div>
    </section>
  )
}
