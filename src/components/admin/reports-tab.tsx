'use client'

import { useCallback, useEffect, useState } from 'react'
import { Wallet, TrendingUp, Users, Receipt, Loader2 } from 'lucide-react'
import { StatCard, SectionTitle } from './ui'
import { formatBRL } from '@/lib/format'
import { monthNamePt, todayISO, addDaysISO } from '@/lib/time'
import { cn } from '@/lib/utils'

type ReportData = {
  period: { from: string; to: string }
  revenueConcluded: number
  revenueConfirmed: number
  revenueTotal: number
  concludedCount: number
  confirmedCount: number
  pendingCount: number
  cancelledCount: number
  refusedCount: number
  customersServed: number
  newCustomers: number
  totalCustomers: number
  avgTicket: number
  topServices: { id: string; name: string; count: number; revenue: number }[]
  monthly: { month: string; revenue: number; count: number; concluded: number }[]
}

type Preset = {
  id: string
  label: string
  from: () => string
  to: () => string
}

function monthStart(ym: string): string {
  return `${ym}-01`
}

function thisMonth(): string {
  return todayISO().slice(0, 7)
}

function lastMonth(): string {
  const [y, m] = todayISO().slice(0, 7).split('-').map(Number)
  const d = new Date(y, m - 2, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function monthEnd(ym: string): string {
  const [y, m] = ym.split('-').map(Number)
  const last = new Date(y, m, 0).getDate()
  return `${ym}-${String(last).padStart(2, '0')}`
}

const PRESETS: Preset[] = [
  {
    id: '30d',
    label: 'Últimos 30 dias',
    from: () => addDaysISO(todayISO(), -30),
    to: () => todayISO(),
  },
  {
    id: 'this-month',
    label: 'Este mês',
    from: () => monthStart(thisMonth()),
    to: () => monthEnd(thisMonth()),
  },
  {
    id: 'last-month',
    label: 'Mês passado',
    from: () => monthStart(lastMonth()),
    to: () => monthEnd(lastMonth()),
  },
  {
    id: '90d',
    label: 'Últimos 90 dias',
    from: () => addDaysISO(todayISO(), -90),
    to: () => todayISO(),
  },
  {
    id: 'year',
    label: 'Este ano',
    from: () => `${todayISO().slice(0, 4)}-01-01`,
    to: () => todayISO(),
  },
]

export function ReportsTab() {
  const [preset, setPreset] = useState('30d')
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback((id: string) => {
    const p = PRESETS.find((x) => x.id === id) ?? PRESETS[0]
    fetch(`/api/admin/reports?from=${p.from()}&to=${p.to()}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('Erro no relatório'))))
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load(preset)
  }, [preset, load])

  const changePreset = (id: string) => {
    setLoading(true)
    setPreset(id)
  }

  const maxServiceRevenue = Math.max(1, ...(data?.topServices.map((s) => s.revenue) ?? [1]))
  const maxMonthRevenue = Math.max(1, ...(data?.monthly.map((m) => m.revenue) ?? [1]))

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Relatórios & Financeiro"
        subtitle="Acompanhe o faturamento estimado, serviços mais vendidos e o desempenho do negócio."
      />

      {/* Presets */}
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            onClick={() => changePreset(p.id)}
            className={cn(
              'rounded-full px-4 py-2 text-xs font-extrabold transition',
              preset === p.id
                ? 'bg-ink text-white shadow-md shadow-stone-300'
                : 'border border-slate-200 bg-white text-slate-500 hover:border-stone-300 hover:text-ink'
            )}
            aria-pressed={preset === p.id}
          >
            {p.label}
          </button>
        ))}
      </div>

      {loading && (
        <p className="flex items-center gap-2 text-sm text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin" /> Calculando…
        </p>
      )}

      {!loading && data && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Faturamento estimado"
              value={formatBRL(data.revenueTotal)}
              icon={<Wallet className="h-4 w-4" />}
              tone="green"
              hint="confirmados + concluídos"
            />
            <StatCard
              label="Já realizado"
              value={formatBRL(data.revenueConcluded)}
              icon={<TrendingUp className="h-4 w-4" />}
              tone="rose"
              hint={`${data.concludedCount} atendimento(s) concluído(s)`}
            />
            <StatCard
              label="A realizar"
              value={formatBRL(data.revenueConfirmed)}
              icon={<Receipt className="h-4 w-4" />}
              tone="amber"
              hint={`${data.confirmedCount} confirmado(s) para o período`}
            />
            <StatCard
              label="Ticket médio"
              value={formatBRL(data.avgTicket)}
              icon={<Receipt className="h-4 w-4" />}
              tone="stone"
            />
            <StatCard
              label="Clientes atendidos"
              value={data.customersServed}
              icon={<Users className="h-4 w-4" />}
              tone="rose"
            />
            <StatCard
              label="Novos clientes"
              value={data.newCustomers}
              icon={<Users className="h-4 w-4" />}
              tone="emerald"
              hint={`${data.totalCustomers} no total`}
            />
            <StatCard
              label="Cancelamentos"
              value={data.cancelledCount}
              icon={<Receipt className="h-4 w-4" />}
              tone="red"
            />
            <StatCard
              label="Pendentes / recusados"
              value={`${data.pendingCount} / ${data.refusedCount}`}
              icon={<Receipt className="h-4 w-4" />}
              tone="amber"
            />
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {/* Serviços mais vendidos */}
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-800">
                Serviços mais vendidos
              </h3>
              {data.topServices.length === 0 ? (
                <p className="mt-4 text-sm text-slate-400">
                  Sem atendimentos no período selecionado.
                </p>
              ) : (
                <div className="mt-4 space-y-3">
                  {data.topServices.map((s) => (
                    <div key={s.id}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-bold text-slate-700">{s.name}</span>
                        <span className="text-xs font-semibold text-slate-400">
                          {s.count}x • {formatBRL(s.revenue)}
                        </span>
                      </div>
                      <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-stone-400 to-ink"
                          style={{ width: `${Math.max(6, (s.revenue / maxServiceRevenue) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Desempenho mensal */}
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-800">
                Desempenho mensal
              </h3>
              {data.monthly.length === 0 ? (
                <p className="mt-4 text-sm text-slate-400">
                  Sem dados no período selecionado.
                </p>
              ) : (
                <div className="mt-4 flex h-44 items-end gap-3">
                  {data.monthly.map((m) => (
                    <div key={m.month} className="flex flex-1 flex-col items-center gap-1.5">
                      <span className="text-[10px] font-extrabold text-slate-500">
                        {formatBRL(m.revenue).replace('R$', '').trim()}
                      </span>
                      <div
                        className="w-full max-w-12 rounded-t-xl bg-gradient-to-t from-ink to-stone-400 transition-all"
                        style={{ height: `${Math.max(8, (m.revenue / maxMonthRevenue) * 130)}px` }}
                        title={`${m.count} atendimentos — ${formatBRL(m.revenue)}`}
                      />
                      <span className="text-[10px] font-bold uppercase text-slate-400">
                        {monthNamePt(m.month).split(' ')[0].slice(0, 3)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
