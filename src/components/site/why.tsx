'use client'

import { Reveal } from './reveal'

const REASONS = [
  {
    title: 'Carinho em primeiro lugar',
    text: 'Cada pet é recebido como família — com paciência, respeito e atenção individual, sem pressa.',
  },
  {
    title: 'Produtos premium',
    text: 'Cosméticos de alta qualidade, ideais para pele e pelagem sensíveis. Sem aroma forte, sem agressão.',
  },
  {
    title: 'Ambiente seguro',
    text: 'Espaço higienizado e tranquilo, com acompanhamento constante do início ao fim do atendimento.',
  },
  {
    title: 'Agendar é simples',
    text: 'Escolha dia e horário pelo site e receba a confirmação direto no seu WhatsApp. Sem ligação, sem espera.',
  },
]

export function WhySection() {
  return (
    <section className="relative overflow-hidden bg-ink texture-grain">
      {/* brilho quente discreto */}
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            'radial-gradient(40rem 30rem at 90% 0%, oklch(0.4 0.08 70 / 0.25), transparent 60%)',
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          {/* Declaração editorial */}
          <Reveal>
            <p className="eyebrow flex items-center gap-3 text-bronze-soft">
              <span className="h-px w-8 bg-bronze/70" aria-hidden="true" />
              Por que escolher a gente?
            </p>
            <h2 className="font-display mt-5 text-3xl font-normal leading-[1.12] tracking-tight text-paper sm:text-[2.6rem]">
              Bem-estar do seu pet
              <br />
              <em className="font-light italic text-bronze-soft">acima de tudo.</em>
            </h2>
            <p className="mt-6 max-w-sm text-[0.95rem] leading-relaxed text-paper/60">
              Não trabalhamos com volume — trabalhamos com confiança. Cada banho sai daqui
              do jeito que a gente gostaria que saísse do nosso próprio pet.
            </p>
            <div className="mt-8 hidden h-px w-24 bg-bronze/50 lg:block" aria-hidden="true" />
          </Reveal>

          {/* Valores numerados */}
          <div className="grid gap-px overflow-hidden sm:grid-cols-2">
            {REASONS.map((reason, idx) => (
              <Reveal key={reason.title} delay={idx * 80}>
                <div className="group h-full border-t border-paper/12 py-7 pr-2 sm:pl-8 sm:pt-9">
                  <p className="font-display text-sm italic text-bronze-soft/80">
                    n° {String(idx + 1).padStart(2, '0')}
                  </p>
                  <h3 className="font-display mt-2.5 text-xl font-medium tracking-tight text-paper">
                    {reason.title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-paper/55">{reason.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
