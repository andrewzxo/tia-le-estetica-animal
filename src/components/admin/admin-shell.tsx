'use client'

import { useEffect, useState } from 'react'
import {
  LayoutDashboard,
  CalendarDays,
  ClipboardList,
  Scissors,
  Clock3,
  Images,
  Users,
  Wallet,
  MessageSquareQuote,
  Globe,
  PawPrint,
  LogOut,
  ExternalLink,
  Menu,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { AdminTab } from './ui'
import { DashboardTab } from './dashboard-tab'
import { AgendaTab } from './agenda-tab'
import { AppointmentsTab } from './appointments-tab'
import { ServicesTab } from './services-tab'
import { HoursTab } from './hours-tab'
import { GalleryTab } from './gallery-tab'
import { CustomersTab } from './customers-tab'
import { ReportsTab } from './reports-tab'
import { TestimonialsTab } from './testimonials-tab'
import { SettingsTab } from './settings-tab'

const TABS: { id: AdminTab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'agenda', label: 'Agenda visual', icon: CalendarDays },
  { id: 'appointments', label: 'Agendamentos', icon: ClipboardList },
  { id: 'services', label: 'Serviços', icon: Scissors },
  { id: 'hours', label: 'Horários', icon: Clock3 },
  { id: 'gallery', label: 'Galeria', icon: Images },
  { id: 'customers', label: 'Clientes', icon: Users },
  { id: 'reports', label: 'Relatórios', icon: Wallet },
  { id: 'testimonials', label: 'Depoimentos', icon: MessageSquareQuote },
  { id: 'settings', label: 'Site & Config.', icon: Globe },
]

export type { AdminTab }

export function AdminShell({
  user,
  onLogout,
}: {
  user: { name: string; username: string }
  onLogout: () => void
}) {
  const [tab, setTab] = useState<AdminTab>('dashboard')
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const selectTab = (id: AdminTab) => {
    setTab(id)
    setMobileNavOpen(false)
  }

  return (
    <div className="flex min-h-screen bg-stone-100">
      {/* ── Sidebar desktop: grafite sólido, identidade própria do painel ── */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col bg-stone-900 lg:flex">
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-400 text-stone-900">
            <PawPrint className="h-5 w-5" aria-hidden="true" />
          </span>
          <div>
            <p className="text-[15px] font-bold leading-tight tracking-tight text-white">
              Tia Lê
            </p>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-400/90">
              Painel de gestão
            </p>
          </div>
        </div>

        <nav
          className="custom-scrollbar flex-1 space-y-0.5 overflow-y-auto px-3 py-3"
          aria-label="Seções do painel"
        >
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => selectTab(t.id)}
              className={cn(
                'flex w-full items-center gap-3 rounded-md px-3 py-2 text-[13px] font-semibold transition',
                tab === t.id
                  ? 'bg-white/10 text-white'
                  : 'text-stone-400 hover:bg-white/5 hover:text-stone-100'
              )}
              aria-current={tab === t.id ? 'page' : undefined}
            >
              <t.icon
                className={cn(
                  'h-4 w-4 shrink-0',
                  tab === t.id ? 'text-amber-400' : 'text-stone-500'
                )}
                aria-hidden="true"
              />
              {t.label}
              {t.id === 'appointments' && <PendingBadge />}
            </button>
          ))}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-white/10 text-sm font-bold text-amber-300">
                {user.name.slice(0, 1).toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="truncate text-[13px] font-bold text-white">{user.name}</p>
                <p className="truncate text-xs text-stone-500">@{user.username}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onLogout}
              className="h-9 w-9 shrink-0 rounded-md text-stone-500 hover:bg-red-500/15 hover:text-red-400"
              aria-label="Sair do painel"
              title="Sair"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="mt-3 w-full rounded-md border-white/15 bg-transparent text-xs font-semibold text-stone-300 hover:bg-white/10 hover:text-white"
          >
            <a href="/" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
              Ver site público
            </a>
          </Button>
        </div>
      </aside>

      {/* ── Conteúdo ─────────────────────────────────────────── */}
      <div className="flex min-h-screen flex-1 flex-col lg:pl-60">
        {/* Topbar mobile */}
        <div className="sticky top-0 z-20 border-b border-stone-200 bg-white/95 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-stone-900 text-amber-400">
                <PawPrint className="h-4 w-4" aria-hidden="true" />
              </span>
              <p className="text-[15px] font-bold tracking-tight text-stone-900">
                Painel Tia Lê
              </p>
            </div>
            <div className="flex items-center gap-1">
              <Button
                asChild
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-md text-stone-400"
                aria-label="Ver site público"
              >
                <a href="/" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onLogout}
                className="h-9 w-9 rounded-md text-stone-400 hover:bg-red-50 hover:text-red-500"
                aria-label="Sair"
              >
                <LogOut className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileNavOpen(!mobileNavOpen)}
                className="h-9 w-9 rounded-md text-stone-600"
                aria-label={mobileNavOpen ? 'Fechar menu' : 'Abrir menu'}
                aria-expanded={mobileNavOpen}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
          {mobileNavOpen && (
            <nav
              className="grid grid-cols-2 gap-1 border-t border-stone-200 bg-white p-3"
              aria-label="Menu do painel"
            >
              {TABS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => selectTab(t.id)}
                  className={cn(
                    'flex items-center gap-2 rounded-md px-3 py-2.5 text-[13px] font-semibold transition',
                    tab === t.id ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100'
                  )}
                >
                  <t.icon
                    className={cn(
                      'h-4 w-4',
                      tab === t.id ? 'text-amber-400' : 'text-stone-400'
                    )}
                    aria-hidden="true"
                  />
                  {t.label}
                </button>
              ))}
            </nav>
          )}
        </div>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto max-w-6xl">
            {tab === 'dashboard' && <DashboardTab onNavigate={selectTab} />}
            {tab === 'agenda' && <AgendaTab />}
            {tab === 'appointments' && <AppointmentsTab />}
            {tab === 'services' && <ServicesTab />}
            {tab === 'hours' && <HoursTab />}
            {tab === 'gallery' && <GalleryTab />}
            {tab === 'customers' && <CustomersTab />}
            {tab === 'reports' && <ReportsTab />}
            {tab === 'testimonials' && <TestimonialsTab />}
            {tab === 'settings' && <SettingsTab />}
          </div>
        </main>
      </div>
    </div>
  )
}

/** Ponto âmbar com nº de pendências ao lado de "Agendamentos" */
function PendingBadge() {
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d && typeof d.pendentes === 'number') setCount(d.pendentes)
      })
      .catch(() => {})
  }, [])

  if (count == null || count === 0) return null
  return (
    <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-400 px-1.5 text-[10px] font-extrabold text-stone-900">
      {count}
    </span>
  )
}
