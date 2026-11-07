'use client'

import Image from 'next/image'
import { ArrowRight, Clock3, Dog, Cat, CarTaxiFront } from 'lucide-react'
import { formatBRL } from '@/lib/format'
import { formatDuration } from '@/lib/time'
import type { PublicService } from '@/lib/public-types'
import { Reveal } from './reveal'

function servicePriceLabel(service: PublicService): string {
  if (service.priceOnConsult) return 'Sob consulta'
  const prices = [service.smallPrice, service.mediumPrice, service.largePrice, service.catPrice].filter(
    (p): p is number => p != null
  )
  if (prices.length === 0) return formatBRL(service.basePrice)
  return `a partir de ${formatBRL(Math.min(...prices))}`
}

export function ServicesSection({
  services,
  onBook,
}: {
  services: PublicService[]
  onBook: (serviceId: string) => void
}) {
  if (services.length === 0) {
    return (
      <section id="servicos" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="rounded-2xl border border-dashed border-ink/15 bg-paper-deep/60 p-10 text-center">
          <p className="font-display text-lg italic text-ink/60">
            Os serviços serão publicados em breve. 🐾
          </p>
        </div>
      </section>
    )
  }

  return (
    <section id="servicos" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6 lg:py-24">
      {/* Cabeçalho editorial assimétrico */}
      <Reveal>
        <div className="grid items-end gap-6 lg:grid-cols-[1fr_auto]">
          <div className="max-w-xl">
            <p className="eyebrow flex items-center gap-3 text-bronze">
              <span className="h-px w-8 bg-bronze/60" aria-hidden="true" />
              O que fazemos
            </p>
            <h2 className="font-display mt-4 text-3xl font-normal leading-[1.08] tracking-tight text-ink-deep sm:text-[2.75rem]">
              Cuidados autorais,
              <br />
              <em className="font-light italic text-bronze">sob medida</em> para o seu pet.
            </h2>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-ink/55 lg:pb-2 lg:text-right">
            Cada atendimento é único. Os valores podem variar conforme o porte do seu
            companheiro — e sempre combinamos antes.
          </p>
        </div>
      </Reveal>

      {/* Índice editorial de serviços */}
      <div className="mt-12 border-t border-ink/10">
        {services.map((service, idx) => (
          <Reveal key={service.id} delay={idx * 60}>
            <article className="group grid items-center gap-5 border-b border-ink/10 py-8 transition-colors duration-300 hover:bg-card/60 sm:py-10 lg:grid-cols-[3.5rem_1fr_1.1fr_0.9fr] lg:gap-10">
              {/* Número — decorativo, apenas em telas grandes */}
              <p className="font-display hidden text-2xl font-light italic text-bronze/80 lg:block lg:text-3xl">
                {String(idx + 1).padStart(2, '0')}
              </p>

              {/* Nome + descrição */}
              <div className="order-2 lg:order-none">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h3 className="font-display text-2xl font-medium tracking-tight text-ink-deep sm:text-[1.7rem]">
                    {service.name}
                  </h3>
                  <span className="flex items-center gap-1.5 text-ink/35" aria-label="Espécies atendidas">
                    {service.species !== 'GATOS' && <Dog className="h-4 w-4" aria-hidden="true" />}
                    {service.species !== 'CAES' && <Cat className="h-4 w-4" aria-hidden="true" />}
                  </span>
                </div>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-ink/60">
                  {service.description}
                </p>
                <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.8rem] font-semibold text-ink/50">
                  <span className="inline-flex items-center gap-1.5">
                    <Clock3 className="h-3.5 w-3.5 text-bronze" aria-hidden="true" />
                    {formatDuration(service.durationMin)}
                  </span>
                  <span className="font-display italic text-bronze">
                    {servicePriceLabel(service)}
                  </span>
                </p>
              </div>

              {/* Fotografia — visível também no mobile (bug corrigido) */}
              <div className="relative order-first aspect-[16/9] overflow-hidden rounded-xl bg-paper-deep lg:order-none lg:aspect-[4/3]">
                {service.imageUrl ? (
                  <Image
                    src={service.imageUrl}
                    alt={service.name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 340px"
                    className="object-cover object-[50%_35%] transition duration-700 group-hover:scale-[1.04]"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-4xl" aria-hidden="true">
                    ✂️
                  </div>
                )}
              </div>

              {/* Ação */}
              <div className="order-3 lg:order-none lg:text-right">
                <button
                  onClick={() => onBook(service.id)}
                  className="group/btn inline-flex items-center gap-2 rounded-lg border border-ink/15 px-5 py-2.5 text-sm font-semibold text-ink transition-all hover:border-ink hover:bg-ink hover:text-paper"
                  aria-label={`Agendar ${service.name}`}
                >
                  Agendar
                  <ArrowRight
                    className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-0.5"
                    aria-hidden="true"
                  />
                </button>
              </div>
            </article>
          </Reveal>
        ))}
      </div>

      {/* Adicional — Táxi dog */}
      <Reveal>
        <div className="mt-10 flex flex-col gap-4 rounded-2xl bg-ink p-6 text-paper texture-grain sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <div className="flex items-start gap-4">
            <span
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-bronze/20 text-bronze-soft"
              aria-hidden="true"
            >
              <CarTaxiFront className="h-6 w-6" />
            </span>
            <div>
              <p className="font-display text-lg font-semibold">
                Táxi dog — adicional para qualquer serviço
              </p>
              <p className="mt-1 text-sm leading-relaxed text-paper/65">
                Buscamos e levamos seu pet com todo cuidado e segurança. Você escolhe essa opção na
                hora de agendar.
              </p>
            </div>
          </div>
          <p className="font-display shrink-0 text-xl italic text-bronze-soft sm:text-right">
            R$ 10,00
            <span className="mt-0.5 block text-xs font-semibold not-italic text-paper/50">
              buscar e levar
            </span>
          </p>
        </div>
      </Reveal>
    </section>
  )
}
