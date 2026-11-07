'use client'

import Image from 'next/image'
import { ArrowRight, Star, Sparkles, Clock3, MessageCircle } from 'lucide-react'
import { Reveal } from './reveal'

const TRUST_ITEMS = [
  {
    icon: Sparkles,
    title: 'Produtos naturais',
    text: 'Seguros e premium, para pele e pelagem sensíveis',
  },
  {
    icon: Clock3,
    title: 'Hora marcada',
    text: 'Agendamento online em menos de 1 minuto',
  },
  {
    icon: MessageCircle,
    title: 'Confirmação no WhatsApp',
    text: 'Você recebe tudo direto no seu celular',
  },
]

/** Selo circular giratório com texto curvo */
function Stamp() {
  return (
    <div className="animate-spin-slow relative h-24 w-24 sm:h-28 sm:w-28" aria-hidden="true">
      <svg viewBox="0 0 100 100" className="h-full w-full" style={{ fill: 'var(--paper)' }}>
        <defs>
          <path id="stamp-circle" d="M 50,50 m -36,0 a 36,36 0 1,1 72,0 a 36,36 0 1,1 -72,0" />
        </defs>
        <circle cx="50" cy="50" r="49" style={{ fill: 'var(--paper)' }} />
        <circle cx="50" cy="50" r="49" fill="none" stroke="oklch(0.66 0.11 68)" strokeWidth="1.5" />
        <circle cx="50" cy="50" r="26" fill="none" stroke="oklch(0.66 0.11 68)" strokeWidth="1" strokeDasharray="2 3" />
        <text style={{ fill: 'var(--ink)', fontSize: '8.5px', letterSpacing: '1.5px', fontWeight: 700 }}>
          <textPath href="#stamp-circle">BANHO · TOSA · CARINHO · CUIDADO</textPath>
        </text>
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-xl" role="img" aria-label="Patinha">
        🐾
      </span>
    </div>
  )
}

export function Hero({
  businessName,
  title,
  subtitle,
  imageUrl,
  onBook,
}: {
  businessName: string
  title: string
  subtitle: string
  imageUrl: string | null
  onBook: () => void
}) {
  return (
    <section id="inicio" className="relative overflow-hidden pt-[4.5rem]">
      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid items-end gap-10 pb-10 pt-10 sm:pt-14 lg:grid-cols-[1.02fr_0.98fr] lg:gap-8 lg:pb-14 lg:pt-20">
          {/* ── Texto editorial ─────────────────────────────── */}
          <Reveal className="pb-4 text-center lg:pb-14 lg:text-left">
            <p className="eyebrow flex items-center justify-center gap-3 text-bronze lg:justify-start">
              <span className="hidden h-px w-8 bg-bronze/60 sm:block" aria-hidden="true" />
              Estética Animal · Banho &amp; Tosa
            </p>

            <h1 className="font-display mt-5 text-[2.6rem] font-normal leading-[1.04] tracking-tight text-ink-deep text-balance sm:text-6xl lg:text-[4.2rem]">
              {title || (
                <>
                  Onde o cuidado vira{' '}
                  <em className="font-light italic text-bronze">carinho</em> de verdade.
                </>
              )}
            </h1>

            <p className="mx-auto mt-6 max-w-md text-[1.05rem] leading-relaxed text-ink/65 lg:mx-0">
              {subtitle ||
                'Banho, tosa e spa para cães e gatos — com produtos premium, hora marcada e aquele cuidado que só quem ama pets sabe dar.'}
            </p>

            <div className="mt-9 flex flex-col items-center gap-5 sm:flex-row sm:justify-center lg:justify-start">
              <button
                onClick={onBook}
                className="group inline-flex items-center gap-2.5 rounded-lg bg-ink px-7 py-3.5 text-[0.95rem] font-semibold text-paper transition-all hover:-translate-y-0.5 hover:bg-ink-deep hover:shadow-xl hover:shadow-ink/25"
              >
                Agendar horário
                <ArrowRight
                  className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </button>
              <a
                href="#servicos"
                className="link-line text-[0.95rem] font-semibold text-ink"
              >
                Conhecer os serviços
              </a>
            </div>

            <p className="font-display mt-10 hidden items-center gap-2 text-[0.95rem] italic text-ink/50 lg:inline-flex">
              — Tia Lê &amp; equipe, apaixonados por pets
            </p>
          </Reveal>

          {/* ── Composição fotográfica ──────────────────────── */}
          <Reveal delay={150} className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="relative">
              {/* Foto principal em arco */}
              <div className="relative aspect-[4/5] overflow-hidden rounded-t-[11rem] rounded-b-2xl bg-paper-deep shadow-2xl shadow-ink/20 ring-1 ring-ink/5">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={`Pet cuidado com carinho no ${businessName}`}
                    fill
                    priority
                    sizes="(max-width: 1024px) 90vw, 45vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-paper-deep">
                    <span className="text-5xl" aria-hidden="true">🐾</span>
                  </div>
                )}
              </div>

              {/* Foto secundária sobreposta — serviços reais da placa */}
              <div className="absolute -bottom-8 -left-4 hidden w-[46%] overflow-hidden rounded-xl border-[6px] border-paper shadow-xl shadow-ink/15 sm:block lg:-left-12">
                <div className="relative aspect-square">
                  <Image
                    src="/uploads/tia-le-servicos.webp"
                    alt="Serviços oferecidos: banho simples, tosa higiênica, tosa na máquina, tosa na tesoura, desembolo, hidratação e táxi dog"
                    fill
                    sizes="240px"
                    className="object-cover"
                  />
                </div>
              </div>

              {/* Selo giratório */}
              <div className="absolute -right-3 top-6 sm:-right-6">
                <Stamp />
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      {/* ── Barra de confiança em tinta ───────────────────── */}
      <div className="relative z-10 bg-ink texture-grain">
        <div className="mx-auto grid max-w-6xl gap-px overflow-hidden px-4 sm:px-6 md:grid-cols-3">
          {TRUST_ITEMS.map(({ icon: Icon, title, text }, i) => (
            <div
              key={title}
              className={`flex items-start gap-4 py-6 md:py-7 ${
                i > 0 ? 'border-t border-paper/10 md:border-l md:border-t-0 md:pl-8' : ''
              } ${i === 0 ? 'md:pr-8' : ''}`}
            >
              <Icon className="mt-0.5 h-5 w-5 shrink-0 text-bronze-soft" aria-hidden="true" />
              <div>
                <p className="text-sm font-bold text-paper">{title}</p>
                <p className="mt-0.5 text-[0.8rem] leading-relaxed text-paper/60">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Estrelas + avaliação editorial abaixo da barra */}
      <div className="border-b border-ink/5 bg-paper-deep/60">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-8 gap-y-2 px-4 py-3.5 sm:px-6 lg:justify-between">
          <p className="flex items-center gap-2 text-[0.8rem] font-semibold text-ink/60">
            <span className="flex gap-0.5" aria-hidden="true">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-bronze text-bronze" />
              ))}
            </span>
            Recomendado por tutores exigentes
          </p>
          <p className="eyebrow hidden text-[0.625rem] text-ink/40 lg:block">
            Cães &amp; gatos · Todos os portes · Atendimento com hora marcada
          </p>
        </div>
      </div>
    </section>
  )
}
