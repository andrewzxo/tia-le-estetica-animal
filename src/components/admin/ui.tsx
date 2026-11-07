'use client'

import { cn } from '@/lib/utils'

export type AdminTab =
  | 'dashboard'
  | 'agenda'
  | 'appointments'
  | 'services'
  | 'hours'
  | 'gallery'
  | 'customers'
  | 'reports'
  | 'testimonials'
  | 'settings'

/** Fetch helper com tratamento de erro/401 */
export async function api<T = unknown>(
  path: string,
  options?: RequestInit & { json?: unknown }
): Promise<T> {
  const init: RequestInit = { ...options }
  if (options?.json !== undefined) {
    init.method = options.method || 'POST'
    init.headers = { 'Content-Type': 'application/json', ...(options.headers || {}) }
    init.body = JSON.stringify(options.json)
  }
  const res = await fetch(path, init)
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>
  if (res.status === 401) {
    window.dispatchEvent(new Event('dale:unauthorized'))
    throw new Error('Sessão expirada. Faça login novamente.')
  }
  if (!res.ok) {
    throw new Error((data.error as string) || 'Ocorreu um erro. Tente novamente.')
  }
  return data as T
}

export const STATUS_STYLES: Record<
  string,
  { badge: string; dot: string; label: string }
> = {
  PENDENTE: {
    badge: 'bg-amber-100 text-amber-800 ring-amber-200',
    dot: 'bg-amber-400',
    label: 'Aguardando confirmação',
  },
  CONFIRMADO: {
    badge: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
    dot: 'bg-emerald-500',
    label: 'Confirmado',
  },
  CONCLUIDO: {
    badge: 'bg-violet-100 text-violet-700 ring-violet-200',
    dot: 'bg-violet-500',
    label: 'Concluído',
  },
  CANCELADO: {
    badge: 'bg-red-100 text-red-700 ring-red-200',
    dot: 'bg-red-400',
    label: 'Cancelado',
  },
  RECUSADO: {
    badge: 'bg-stone-200 text-stone-500 ring-stone-300',
    dot: 'bg-stone-400',
    label: 'Recusado',
  },
}

export function StatusChip({ status, className }: { status: string; className?: string }) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.RECUSADO
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-bold ring-1',
        style.badge,
        className
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', style.dot)} aria-hidden="true" />
      {style.label}
    </span>
  )
}

export function SectionTitle({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children?: React.ReactNode
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-stone-900">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-stone-500">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}

export function StatCard({
  label,
  value,
  icon,
  tone = 'stone',
  hint,
}: {
  label: string
  value: string | number
  icon: React.ReactNode
  tone?: 'rose' | 'amber' | 'emerald' | 'red' | 'stone' | 'green'
  hint?: string
}) {
  const tones: Record<string, string> = {
    rose: 'bg-rose-50 text-rose-600',
    amber: 'bg-amber-50 text-amber-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    red: 'bg-red-50 text-red-600',
    stone: 'bg-stone-100 text-stone-500',
    green: 'bg-green-50 text-green-700',
  }
  return (
    <div className="rounded-lg border border-stone-200 bg-white p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-stone-400">{label}</p>
        <span className={cn('flex h-8 w-8 items-center justify-center rounded-md', tones[tone])}>
          {icon}
        </span>
      </div>
      <p className="mt-2 text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl">{value}</p>
      {hint && <p className="mt-1 text-xs font-medium text-stone-400">{hint}</p>}
    </div>
  )
}

export function PlaceholderWarn({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-start gap-1.5 rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800 ring-1 ring-amber-200">
      <span aria-hidden="true">⚠</span>
      <span>{children}</span>
    </p>
  )
}
