'use client'

import Image from 'next/image'
import { MoveRight } from 'lucide-react'
import { InstagramIcon } from './icons'
import { Reveal } from './reveal'

export function TipTosaSection({ onBook }: { onBook?: () => void }) {
  return (
    <section className="bg-paper-deep/40">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          {/* Conteúdo do slogan */}
          <Reveal>
            <p className="eyebrow flex items-center gap-3 text-bronze">
              <span className="h-px w-8 bg-bronze/60" aria-hidden="true" />
              Dica da Tia Lê
            </p>
            <h2 className="font-display mt-4 text-3xl font-normal leading-[1.1] tracking-tight text-ink-deep sm:text-[2.5rem]">
              A importância da
              <br />
              <em className="font-light italic text-bronze">tosa higiênica.</em>
            </h2>
            <div className="mt-6 max-w-xl space-y-4 text-[0.98rem] leading-relaxed text-ink/70">
              <p>
                A tosa higiênica previne o acúmulo de sujeiras na pelagem do animal, evitando a
                proliferação de <strong className="font-semibold text-ink">bactérias e parasitas</strong> que
                podem trazer danos à saúde dos pets, além de prevenir acidentes e melhorar o{' '}
                <strong className="font-semibold text-ink">bem-estar dos peludos</strong>.
              </p>
            </div>

            {/* CTA — agendar o serviço */}
            {onBook && (
              <button
                onClick={onBook}
                className="group mt-8 inline-flex items-center gap-3 rounded-full border border-ink/12 bg-paper px-5 py-3 transition-all hover:border-bronze hover:bg-bronze/10"
                aria-label="Agendar tosa higiênica para o seu pet"
              >
                <span className="text-sm text-ink/75">
                  Agende a <strong className="font-semibold text-ink-deep">tosa higiênica</strong> para
                  o seu pet
                </span>
                <MoveRight
                  className="h-4 w-4 text-bronze transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
                />
              </button>
            )}
          </Reveal>

          {/* Foto real do post do Instagram */}
          <Reveal delay={120} className="relative mx-auto w-full max-w-[230px] lg:max-w-[260px]">
            <div className="relative rotate-1 overflow-hidden rounded-2xl bg-paper-deep shadow-xl shadow-ink/10 ring-1 ring-ink/8 transition-transform duration-500 hover:rotate-0">
              <Image
                src="/uploads/dica-tosa-higienica.webp"
                alt="Cachorrinho de orelhas em pé — post real do Instagram da Tia Lê sobre a importância da tosa higiênica"
                width={432}
                height={916}
                sizes="(max-width: 1024px) 90vw, 35vw"
                unoptimized
                className="w-full h-auto"
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

export function TipSection({ instagram }: { instagram: string }) {
  const handle = instagram ? instagram.replace('@', '') : 'tiale.esteticaanimal'
  const url = `https://instagram.com/${handle}`

  return (
    <section className="border-y border-ink/8 bg-paper">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          {/* Foto real do post do Instagram */}
          <Reveal className="relative mx-auto w-full max-w-sm lg:max-w-none">
            <div className="relative -rotate-1 overflow-hidden rounded-2xl bg-paper-deep shadow-xl shadow-ink/10 ring-1 ring-ink/8 transition-transform duration-500 hover:rotate-0">
              <Image
                src="/uploads/dica-escovacao-v2.webp"
                alt="Yorkshire tendo a pelagem escovada — post real do Instagram da Tia Lê"
                width={602}
                height={416}
                sizes="(max-width: 1024px) 90vw, 35vw"
                className="w-full h-auto"
              />
            </div>
          </Reveal>

          {/* Conteúdo da dica */}
          <Reveal delay={120}>
            <p className="eyebrow flex items-center gap-3 text-bronze">
              <span className="h-px w-8 bg-bronze/60" aria-hidden="true" />
              Dica da Tia Lê
            </p>
            <h2 className="font-display mt-4 text-3xl font-normal leading-[1.1] tracking-tight text-ink-deep sm:text-[2.5rem]">
              A importância da escovação
              <br />
              <em className="font-light italic text-bronze">na pelagem do seu companheiro.</em>
            </h2>
            <div className="mt-6 space-y-4 text-[0.98rem] leading-relaxed text-ink/70">
              <p>
                Ela é necessária porque remove pelos mortos, evita a formação de nós, estimula o
                crescimento de novos pelos e ajuda a manter a superfície da pele limpa e arejada.
                Além disso, também ajuda a manter a casa livre de pelos. Nos gatos, a escovação
                também é importante para evitar a formação de bolas de pelos.
              </p>
              <p>
                Porém, além da questão da higiene, escovar os pelos dos cães regularmente é muito
                importante também para manter o <strong className="font-semibold text-ink">bem-estar e a saúde</strong> dos
                animais.
              </p>
            </div>

            {/* CTA — seguir no Instagram */}
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-8 inline-flex items-center gap-3 rounded-full border border-ink/12 bg-paper-deep px-5 py-3 transition-all hover:border-bronze hover:bg-bronze/10"
              aria-label={`Seguir a Tia Lê no Instagram, @${handle}`}
            >
              <InstagramIcon className="h-5 w-5 text-bronze transition-transform group-hover:scale-110" />
              <span className="text-sm text-ink/75">
                Siga e acompanhe mais dicas em{' '}
                <strong className="font-semibold text-ink-deep">@{handle}</strong>
              </span>
              <MoveRight
                className="h-4 w-4 text-bronze transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </a>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
