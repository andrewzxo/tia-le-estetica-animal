'use client'

import { ArrowRight, Lock } from 'lucide-react'
import type { PublicSettings } from '@/lib/public-types'
import { WhatsAppIcon, InstagramIcon, FacebookIcon } from './icons'

export function SiteFooter({
  settings,
  hoursLines,
  onBook,
}: {
  settings: PublicSettings
  hoursLines: string[]
  onBook?: () => void
}) {
  const year = new Date().getFullYear()
  const waMessage = encodeURIComponent(
    'Olá! Vim pelo site e gostaria de mais informações 🐾'
  )

  const socials = [
    settings.whatsapp
      ? {
          href: `https://api.whatsapp.com/send?phone=${settings.whatsapp}&text=${waMessage}`,
          label: 'WhatsApp',
          icon: WhatsAppIcon,
        }
      : null,
    settings.instagram
      ? {
          href: settings.instagram.startsWith('http')
            ? settings.instagram
            : `https://instagram.com/${settings.instagram.replace('@', '')}`,
          label: 'Instagram',
          icon: InstagramIcon,
        }
      : null,
    settings.facebook
      ? {
          href: settings.facebook.startsWith('http')
            ? settings.facebook
            : `https://facebook.com/${settings.facebook}`,
          label: 'Facebook',
          icon: FacebookIcon,
        }
      : null,
  ].filter(Boolean) as { href: string; label: string; icon: (p: { className?: string }) => React.ReactNode }[]

  return (
    <footer className="mt-auto bg-ink-deep texture-grain text-paper">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        {/* CTA editorial */}
        <div className="flex flex-wrap items-end justify-between gap-6 border-b border-paper/10 pb-10">
          <h2 className="font-display max-w-lg text-3xl font-normal leading-[1.1] tracking-tight sm:text-4xl">
            Pronto para mimar seu pet?
            <br />
            <em className="font-light italic text-bronze-soft">Agende um horário.</em>
          </h2>
          {onBook ? (
            <button
              onClick={onBook}
              className="group inline-flex items-center gap-2.5 rounded-lg bg-paper px-6 py-3 text-sm font-bold text-ink-deep transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/20"
            >
              Agendar horário
              <ArrowRight
                className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
                aria-hidden="true"
              />
            </button>
          ) : settings.whatsapp ? (
            <a
              href={`https://api.whatsapp.com/send?phone=${settings.whatsapp}&text=${waMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2.5 rounded-lg bg-paper px-6 py-3 text-sm font-bold text-ink-deep transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/20"
            >
              Chamar no WhatsApp
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
            </a>
          ) : null}
        </div>

        {/* Colunas */}
        <div className="grid gap-10 pt-10 md:grid-cols-3">
          <div>
            <p className="font-display text-xl font-medium tracking-tight text-paper">
              {settings.businessName}
            </p>
            <p className="eyebrow mt-1 text-[0.5625rem] text-bronze-soft">Estética Animal</p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-paper/55">
              Cuidado, carinho e dedicação para o seu melhor amigo. Agende pelo site e
              receba a confirmação no WhatsApp.
            </p>
            {socials.length > 0 && (
              <div className="mt-5 flex gap-2.5">
                {socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-paper/15 text-paper/70 transition hover:border-bronze-soft hover:text-bronze-soft"
                  >
                    <s.icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="eyebrow text-[0.625rem] text-bronze-soft">Contato</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-paper/65">
              {settings.whatsapp && (
                <li>
                  <a
                    href={`https://api.whatsapp.com/send?phone=${settings.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-line"
                  >
                    WhatsApp
                  </a>
                </li>
              )}
              {settings.phone && <li>{settings.phone}</li>}
              {settings.address && <li className="leading-relaxed">{settings.address}</li>}
            </ul>
          </div>

          <div>
            <h3 className="eyebrow text-[0.625rem] text-bronze-soft">Funcionamento</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-paper/65">
              {hoursLines.map((line) => (
                <li key={line}>{line}</li>
              ))}
              {hoursLines.length === 0 && <li>Consulte pelo WhatsApp</li>}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-paper/10 pt-6 text-xs text-paper/45 sm:flex-row">
          <p>
            © {year} {settings.businessName}. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-4">
            <p className="font-display italic">Feito com carinho para pets felizes</p>
            <a
              href="/admin"
              className="group flex items-center gap-1.5 text-paper/40 transition-colors hover:text-bronze-soft"
              aria-label="Área do administrador"
            >
              <Lock className="h-3 w-3 transition-transform group-hover:-rotate-12" aria-hidden="true" />
              <span className="underline-offset-2 group-hover:underline">Área do administrador</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
