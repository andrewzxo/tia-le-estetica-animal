'use client'

import { ShieldAlert, AlertTriangle, Bug, HeartHandshake } from 'lucide-react'
import { Reveal } from './reveal'

/**
 * Aviso informativo de restrições de atendimento.
 * Reutilizado em dois contextos:
 *  - <ImportantNoticeSection /> — seção discreta na página inicial
 *  - <ImportantNoticeInline />  — bloco compacto no agendamento (antes da confirmação)
 */

const NOTICE_INTRO =
  'Por questões de segurança, higiene e bem-estar dos animais, não atendemos:'

const NOTICE_ITEMS = [
  {
    Icon: AlertTriangle,
    text: 'Cães com comportamento agressivo ou extremamente bravos.',
  },
  {
    Icon: Bug,
    text: 'Cães que estejam com pulgas ou carrapatos.',
  },
] as const

/** Seção discreta de avisos importantes — página inicial */
export function ImportantNoticeSection() {
  return (
    <section
      aria-labelledby="avisos-importantes-title"
      className="border-y border-ink/8 bg-paper-deep/40"
    >
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
        <Reveal>
          <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl bg-paper shadow-sm ring-1 ring-bronze/25">
            {/* Cabeçalho do aviso */}
            <div className="flex items-center gap-3 border-b border-bronze/20 bg-bronze/8 px-6 py-4 sm:px-8">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-bronze/15 ring-1 ring-bronze/30">
                <ShieldAlert className="h-4.5 w-4.5 text-bronze" aria-hidden="true" />
              </span>
              <p className="text-[0.72rem] font-extrabold uppercase tracking-[0.18em] text-bronze sm:text-[0.8rem]">
                Aviso importante
              </p>
            </div>

            {/* Conteúdo */}
            <div className="px-6 py-6 sm:px-8 sm:py-7">
              <h2
                id="avisos-importantes-title"
                className="font-display text-xl font-normal leading-snug tracking-tight text-ink-deep sm:text-2xl"
              >
                Restrições de atendimento
              </h2>
              <p className="mt-3 text-[0.95rem] leading-relaxed text-ink/70">{NOTICE_INTRO}</p>

              <ul className="mt-4 space-y-2.5">
                {NOTICE_ITEMS.map(({ Icon, text }) => (
                  <li
                    key={text}
                    className="flex items-start gap-3 rounded-xl bg-paper-deep/60 px-4 py-3 ring-1 ring-ink/6"
                  >
                    <Icon
                      className="mt-0.5 h-4 w-4 shrink-0 text-bronze"
                      aria-hidden="true"
                    />
                    <span className="text-sm font-semibold leading-relaxed text-ink/85">
                      {text}
                    </span>
                  </li>
                ))}
              </ul>

              <p className="mt-5 flex items-start gap-2 text-[0.85rem] leading-relaxed text-ink/55">
                <HeartHandshake
                  className="mt-0.5 h-4 w-4 shrink-0 text-bronze/70"
                  aria-hidden="true"
                />
                Agradecemos a compreensão — essas medidas garantem um ambiente tranquilo, seguro e
                saudável para todos os pets que passam por aqui.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/** Bloco compacto — passo de confirmação do agendamento */
export function ImportantNoticeInline() {
  return (
    <div
      role="note"
      aria-label="Aviso importante sobre restrições de atendimento"
      className="rounded-xl bg-bronze/8 p-4 ring-1 ring-bronze/25"
    >
      <p className="flex items-center gap-2 text-[0.7rem] font-extrabold uppercase tracking-[0.15em] text-bronze">
        <ShieldAlert className="h-4 w-4 shrink-0" aria-hidden="true" />
        Aviso importante
      </p>
      <p className="mt-2 text-xs leading-relaxed text-ink/70">
        Por questões de <strong className="font-bold text-ink">segurança, higiene e bem-estar</strong>{' '}
        dos animais, não atendemos:
      </p>
      <ul className="mt-2 space-y-1.5">
        {NOTICE_ITEMS.map(({ Icon, text }) => (
          <li key={text} className="flex items-start gap-2">
            <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-bronze/80" aria-hidden="true" />
            <span className="text-xs font-semibold leading-relaxed text-ink/80">{text}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
