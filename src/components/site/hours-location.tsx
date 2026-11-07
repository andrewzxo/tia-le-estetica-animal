'use client'

import { MapPin, Phone, CalendarX, Clock3, QrCode, CreditCard, Banknote, Wallet } from 'lucide-react'
import { minToHHMM, weekdayNamePt, formatDateBR } from '@/lib/time'
import type { PublicSettings, WorkingHoursType, ExceptionType } from '@/lib/public-types'
import { WhatsAppIcon } from './icons'
import { Reveal } from './reveal'

/** Agrupa dias da semana com horários idênticos */
export function groupHours(hours: WorkingHoursType[]): string[] {
  const enabled = hours
    .filter((h) => h.enabled)
    .sort((a, b) => (a.weekday === 0 ? 7 : a.weekday) - (b.weekday === 0 ? 7 : b.weekday))
  const groups: { keys: number[]; h: WorkingHoursType }[] = []

  for (const h of enabled) {
    const last = groups[groups.length - 1]
    if (
      last &&
      last.h.openMin === h.openMin &&
      last.h.closeMin === h.closeMin &&
      last.h.lunchStartMin === h.lunchStartMin &&
      last.h.lunchEndMin === h.lunchEndMin
    ) {
      last.keys.push(h.weekday)
    } else {
      groups.push({ keys: [h.weekday], h })
    }
  }

  return groups.map(({ keys, h }) => {
    const names = keys.map((k) => weekdayNamePt(k).replace('-feira', ''))
    const label =
      names.length === 1
        ? names[0]
        : keys.length === 5 && JSON.stringify(keys) === JSON.stringify([1, 2, 3, 4, 5])
          ? 'Segunda a sexta'
          : `${names[0]} a ${names[names.length - 1]}`
    const lunch =
      h.lunchStartMin != null && h.lunchEndMin != null
        ? ` • almoço ${minToHHMM(h.lunchStartMin)}–${minToHHMM(h.lunchEndMin)}`
        : ''
    return `${label}: ${minToHHMM(h.openMin)} às ${minToHHMM(h.closeMin)}${lunch}`
  })
}

export function HoursLocationSection({
  settings,
  workingHours,
  exceptions,
}: {
  settings: PublicSettings
  workingHours: WorkingHoursType[]
  exceptions: ExceptionType[]
}) {
  const lines = groupHours(workingHours)
  const waMessage = encodeURIComponent(
    'Olá! Vim pelo site e gostaria de mais informações sobre os serviços 🐾'
  )
  const waHref = settings.whatsapp ? `https://api.whatsapp.com/send?phone=${settings.whatsapp}&text=${waMessage}` : null
  const mapSrc = settings.address
    ? `https://www.google.com/maps?q=${encodeURIComponent(settings.address)}&output=embed`
    : null

  const upcomingExceptions = exceptions
    .filter((e) => e.type === 'FECHADO')
    .slice(0, 3)

  return (
    <section id="contato" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6 lg:py-24">
      <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        {/* ── Horários estilo "menu" ─────────────────────────── */}
        <Reveal>
          <p className="eyebrow flex items-center gap-3 text-bronze">
            <span className="h-px w-8 bg-bronze/60" aria-hidden="true" />
            Funcionamento &amp; contato
          </p>
          <h2 className="font-display mt-4 text-3xl font-normal leading-[1.08] tracking-tight text-ink-deep sm:text-[2.75rem]">
            Venha <em className="font-light italic text-bronze">nos visitar.</em>
          </h2>

          <div className="mt-9 max-w-lg">
            {lines.map((line) => {
              const sep = line.indexOf(':')
              const label = sep > 0 ? line.slice(0, sep) : line
              const time = sep > 0 ? line.slice(sep + 1).trim() : ''
              return (
                <div key={line} className="flex items-baseline gap-3 py-2.5">
                  <span className="font-display text-[1.05rem] font-medium text-ink">{label}</span>
                  <span className="leader" aria-hidden="true" />
                  <span className="whitespace-nowrap text-sm font-semibold text-ink/60">{time}</span>
                </div>
              )
            })}
            {lines.length === 0 && (
              <p className="text-sm text-ink/55">
                Horários sendo atualizados. Entre em contato pelo WhatsApp.
              </p>
            )}
          </div>

          {upcomingExceptions.length > 0 && (
            <div className="mt-7 max-w-lg rounded-xl bg-bronze/8 px-5 py-4 ring-1 ring-bronze/20">
              <p className="eyebrow flex items-center gap-2 text-[0.625rem] text-bronze">
                <CalendarX className="h-3.5 w-3.5" aria-hidden="true" />
                Datas fechadas
              </p>
              <ul className="mt-2 space-y-1">
                {upcomingExceptions.map((e) => (
                  <li key={e.id} className="text-sm font-semibold text-ink/70">
                    {formatDateBR(e.date)}
                    {e.reason ? ` — ${e.reason}` : ''}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {settings.hoursNote && (
            <p className="font-display mt-6 max-w-lg text-sm italic text-ink/50">
              {settings.hoursNote}
            </p>
          )}
        </Reveal>

        {/* ── Cartão de contato em tinta ─────────────────────── */}
        <Reveal delay={120}>
          <div className="flex h-full flex-col overflow-hidden rounded-2xl bg-ink texture-grain">
            <div className="p-7 sm:p-9">
              <p className="eyebrow flex items-center gap-2.5 text-bronze-soft">
                <Clock3 className="h-4 w-4" aria-hidden="true" />
                Estamos esperando vocês
              </p>
              <h3 className="font-display mt-3 text-2xl font-normal text-paper">
                Fale com a <em className="font-light italic text-bronze-soft">gente.</em>
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-paper/60">
                {settings.address
                  ? settings.address
                  : 'O endereço completo será informado em breve. Enquanto isso, fale com a gente pelo WhatsApp — respondemos rapidinho! 🐾'}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                {waHref && (
                  <a
                    href={waHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-[#25d366] px-5 py-2.5 text-sm font-bold text-ink-deep transition hover:bg-[#1fb958] hover:shadow-lg hover:shadow-[#25d366]/25"
                  >
                    <WhatsAppIcon className="h-4 w-4" />
                    Falar no WhatsApp
                  </a>
                )}
                {settings.phone && (
                  <a
                    href={`tel:${settings.phone.replace(/\D/g, '')}`}
                    className="inline-flex items-center gap-2 rounded-lg border border-paper/20 px-5 py-2.5 text-sm font-semibold text-paper/90 transition hover:border-paper/50 hover:text-paper"
                  >
                    <Phone className="h-4 w-4 text-bronze-soft" aria-hidden="true" />
                    {settings.phone}
                  </a>
                )}
              </div>
            </div>

            {settings.address && mapSrc && (
              <div className="relative mt-auto border-t border-paper/10">
                <iframe
                  title="Mapa do estabelecimento"
                  src={mapSrc}
                  className="h-52 w-full border-0 grayscale-[35%]"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <span className="pointer-events-none absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-md bg-ink-deep/85 px-3 py-1.5 text-xs font-semibold text-paper backdrop-blur">
                  <MapPin className="h-3.5 w-3.5 text-bronze-soft" aria-hidden="true" />
                  Onde ficamos
                </span>
              </div>
            )}
          </div>
        </Reveal>
      </div>

      {/* ── Formas de pagamento ─────────────────────────────── */}
      <Reveal delay={80}>
        <div className="mt-16 rounded-2xl border border-ink/10 bg-paper-deep/50 p-7 sm:p-10">
          <p className="eyebrow flex items-center gap-3 text-bronze">
            <span className="h-px w-8 bg-bronze/60" aria-hidden="true" />
            Nossas formas de pagamento
          </p>
          <h3 className="font-display mt-4 text-2xl font-normal leading-[1.1] tracking-tight text-ink-deep sm:text-3xl">
            Pague como ficar <em className="font-light italic text-bronze">melhor pra você.</em>
          </h3>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              {
                Icon: QrCode,
                title: 'PIX',
                desc: 'Prático e na hora — envie o comprovante no WhatsApp.',
              },
              {
                Icon: CreditCard,
                title: 'Cartão de crédito e débito',
                desc: 'Parcelamos com juros da maquininha.',
              },
              {
                Icon: Banknote,
                title: 'Dinheiro',
                desc: 'Avisamos antes se precisar levar troco.',
              },
            ].map(({ Icon, title, desc }) => (
              <div
                key={title}
                className="flex flex-col gap-2 rounded-xl border border-ink/10 bg-paper p-5"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-bronze/12 text-bronze">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <p className="font-display text-lg font-medium text-ink-deep">{title}</p>
                <p className="text-sm leading-relaxed text-ink/60">{desc}</p>
              </div>
            ))}
          </div>

          <ul className="mt-8 grid gap-2.5 text-sm leading-relaxed text-ink/65 sm:grid-cols-2">
            <li className="flex items-start gap-2">
              <span aria-hidden="true">🐾</span>
              <span>
                <strong className="font-semibold text-ink">Parcelamos com juros da maquininha.</strong>
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span aria-hidden="true">🐾</span>
              <span>
                <strong className="font-semibold text-ink">Pagamento no PIX</strong> deve ser feito
                no dia do atendimento (favor enviar o comprovante no WhatsApp).
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span aria-hidden="true">🐾</span>
              <span>
                <strong className="font-semibold text-ink">OBS:</strong> pagamento em dinheiro ou
                cartões devem ser feitos na entrega do seu animalzinho.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span aria-hidden="true">🐾</span>
              <span>
                <strong className="font-semibold text-ink">Não marcamos pagamento.</strong>
              </span>
            </li>
            <li className="flex items-start gap-2 sm:col-span-2">
              <span aria-hidden="true">🐾</span>
              <span>
                <strong className="font-semibold text-ink">Pagamentos de pacotes</strong> deverão
                ser feitos no dia do vencimento.
              </span>
            </li>
          </ul>
        </div>
      </Reveal>
    </section>
  )
}
