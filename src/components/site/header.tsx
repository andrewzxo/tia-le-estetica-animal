'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { ArrowRight, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '#inicio', label: 'Início' },
  { href: '#servicos', label: 'Serviços' },
  { href: '#galeria', label: 'Galeria' },
  { href: '#depoimentos', label: 'Depoimentos' },
  { href: '#contato', label: 'Contato' },
]

export function SiteHeader({
  businessName,
  logoUrl,
  onBook,
}: {
  businessName: string
  logoUrl: string | null
  onBook: () => void
}) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-40 transition-all duration-300',
        scrolled
          ? 'bg-paper/95 shadow-[0_1px_0_0_oklch(0.885_0.018_86)] backdrop-blur-md'
          : 'bg-paper/70 backdrop-blur-sm'
      )}
    >
      <div
        className={cn(
          'mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 transition-all duration-300 sm:px-6',
          scrolled ? 'h-14' : 'h-[4.5rem]'
        )}
      >
        {/* Marca */}
        <a href="#inicio" className="group flex items-center gap-3" aria-label={businessName}>
          {logoUrl ? (
            <span className="relative block h-11 w-11 overflow-hidden rounded-full ring-1 ring-ink/10">
              <Image src={logoUrl} alt={businessName} fill className="object-cover" sizes="44px" />
            </span>
          ) : (
            <span className="font-display flex h-11 w-11 items-center justify-center rounded-full bg-ink text-lg italic text-paper">
              L
            </span>
          )}
          <span className="leading-tight">
            <span className="font-display block text-[1.05rem] font-medium tracking-tight text-ink-deep">
              {businessName}
            </span>
            <span className="eyebrow block text-[0.5625rem] text-bronze">Estética Animal</span>
          </span>
        </a>

        {/* Navegação */}
        <nav className="hidden items-center gap-7 md:flex" aria-label="Navegação principal">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="link-line text-[0.8rem] font-semibold tracking-wide text-ink/70 transition-colors hover:text-ink"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={onBook}
            className="group hidden items-center gap-2 rounded-lg bg-ink px-5 py-2.5 text-sm font-semibold text-paper transition-all hover:bg-ink-deep hover:shadow-lg hover:shadow-ink/20 sm:inline-flex"
          >
            Agendar horário
            <ArrowRight
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </button>
          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-ink transition hover:bg-ink/5 md:hidden"
            onClick={() => setOpen(!open)}
            aria-label={open ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      <div
        className={cn(
          'overflow-hidden border-t border-ink/5 bg-paper/98 backdrop-blur-md transition-all duration-300 md:hidden',
          open ? 'max-h-96' : 'max-h-0 border-t-0'
        )}
      >
        <nav className="flex flex-col gap-1 px-4 py-3" aria-label="Menu mobile">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="font-display rounded-lg px-3 py-2.5 text-lg text-ink transition hover:bg-ink/5"
            >
              {item.label}
            </a>
          ))}
          <button
            onClick={() => {
              setOpen(false)
              onBook()
            }}
            className="mt-1 inline-flex items-center justify-center gap-2 rounded-lg bg-ink px-5 py-3 text-sm font-semibold text-paper"
          >
            Agendar horário
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </nav>
      </div>
    </header>
  )
}
