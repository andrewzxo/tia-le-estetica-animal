'use client'

import { Star } from 'lucide-react'
import type { PublicTestimonial } from '@/lib/public-types'
import { Reveal } from './reveal'

export function TestimonialsSection({ testimonials }: { testimonials: PublicTestimonial[] }) {
  if (testimonials.length === 0) return null

  return (
    <section id="depoimentos" className="scroll-mt-20">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
        {/* Cabeçalho centralizado, contraste com as demais seções */}
        <Reveal className="text-center">
          <p className="eyebrow flex items-center justify-center gap-3 text-bronze">
            <span className="h-px w-8 bg-bronze/60" aria-hidden="true" />
            Palavra de quem é tutor
            <span className="h-px w-8 bg-bronze/60" aria-hidden="true" />
          </p>
          <h2 className="font-display mx-auto mt-4 max-w-xl text-3xl font-normal leading-[1.08] tracking-tight text-ink-deep sm:text-[2.75rem]">
            Quem conhece, <em className="font-light italic text-bronze">recomenda.</em>
          </h2>
        </Reveal>

        <div className="mt-14 grid gap-x-10 gap-y-12 md:grid-cols-3">
          {testimonials.map((t, idx) => (
            <Reveal key={t.id} delay={idx * 90}>
              <figure className={`flex h-full flex-col ${idx === 1 ? 'md:pt-10' : ''}`}>
                <span
                  className="font-display text-6xl leading-none text-bronze/50"
                  aria-hidden="true"
                >
                  “
                </span>
                <div
                  className="mt-1 flex gap-1"
                  aria-label={`Avaliação: ${t.rating} de 5 estrelas`}
                >
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${
                        i < t.rating ? 'fill-bronze text-bronze' : 'fill-ink/10 text-ink/10'
                      }`}
                      aria-hidden="true"
                    />
                  ))}
                </div>
                <blockquote className="font-display mt-4 flex-1 text-[1.1rem] leading-relaxed text-ink/80">
                  {t.text}
                </blockquote>
                <figcaption className="mt-6 border-t border-ink/10 pt-4">
                  <p className="text-sm font-bold text-ink">{t.customerName}</p>
                  {t.petName && (
                    <p className="eyebrow mt-0.5 text-[0.625rem] text-ink/45">
                      tutor(a) da {t.petName}
                    </p>
                  )}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
