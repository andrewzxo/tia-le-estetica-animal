'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, CalendarDays, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { api, StatusChip, type AdminTab } from './ui'
import { AppointmentCard, type AdminAppointment } from './appointment-card'
import {
  minToHHMM,
  todayISO,
  addDaysISO,
  monthOf,
  monthNamePt,
  formatDateBR,
  weekdayNamePt,
  weekdayFromISO,
  daysInMonth,
} from '@/lib/time'
import { cn } from '@/lib/utils'

type View = 'dia' | 'semana' | 'mes'

const STATUS_COLORS: Record<string, string> = {
  PENDENTE: 'bg-amber-100 text-amber-800 border-amber-200',
  CONFIRMADO: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  CONCLUIDO: 'bg-stone-200 text-ink-deep border-stone-300',
  CANCELADO: 'bg-red-100 text-red-600 border-red-200',
  RECUSADO: 'bg-slate-200 text-slate-500 border-slate-300',
}

export function AgendaTab() {
  const [view, setView] = useState<View>('mes')
  const [anchor, setAnchor] = useState(todayISO())
  const [appointments, setAppointments] = useState<AdminAppointment[] | null>(null)
  const [loading, setLoading] = useState(false)

  const range = useMemo<{ from: string; to: string }>(() => {
    if (view === 'dia') return { from: anchor, to: anchor }
    if (view === 'semana') {
      const wd = weekdayFromISO(anchor)
      const start = addDaysISO(anchor, -wd)
      return { from: start, to: addDaysISO(start, 6) }
    }
    const days = daysInMonth(monthOf(anchor))
    return { from: days[0], to: days[days.length - 1] }
  }, [view, anchor])

  const load = useCallback(() => {
    api<{ appointments: AdminAppointment[] }>(
      `/api/admin/appointments?from=${range.from}&to=${range.to}`
    )
      .then((d) => setAppointments(d.appointments))
      .catch(() => setAppointments([]))
      .finally(() => setLoading(false))
  }, [range])

  useEffect(() => {
    load()
  }, [load])

  const shift = (dir: 1 | -1) => {
    setLoading(true)
    if (view === 'dia') setAnchor(addDaysISO(anchor, dir))
    else if (view === 'semana') setAnchor(addDaysISO(anchor, 7 * dir))
    else {
      const [y, m] = anchor.split('-').map(Number)
      const d = new Date(y, m - 1 + dir, 1)
      setAnchor(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`)
    }
  }

  const changeView = (v: View) => {
    setLoading(true)
    setView(v)
  }

  const title = useMemo(() => {
    if (view === 'dia') {
      return `${weekdayNamePt(weekdayFromISO(anchor))}, ${formatDateBR(anchor)}`
    }
    if (view === 'semana') {
      const wd = weekdayFromISO(anchor)
      const start = addDaysISO(anchor, -wd)
      return `${formatDateBR(start)} — ${formatDateBR(addDaysISO(start, 6))}`
    }
    return monthNamePt(monthOf(anchor))
  }, [view, anchor])

  const appointmentsFor = (date: string) =>
    (appointments ?? []).filter((a) => a.date === date).sort((a, b) => a.startMin - b.startMin)

  // Grade do mês
  const monthGrid = useMemo(() => {
    const days = daysInMonth(monthOf(anchor))
    const firstWd = weekdayFromISO(days[0])
    const cells: (string | null)[] = []
    for (let i = 0; i < firstWd; i++) cells.push(null)
    cells.push(...days)
    return cells
  }, [anchor])

  const weekDays = useMemo(() => {
    const wd = weekdayFromISO(anchor)
    const start = addDaysISO(anchor, -wd)
    return Array.from({ length: 7 }, (_, i) => addDaysISO(start, i))
  }, [anchor])

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-semibold text-slate-800">
            <CalendarDays className="h-6 w-6 text-ink" aria-hidden="true" />
            Agenda visual
          </h1>
          <p className="mt-0.5 text-sm font-semibold text-slate-500">{title}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-full border border-slate-200 bg-white p-1">
            {(['dia', 'semana', 'mes'] as View[]).map((v) => (
              <button
                key={v}
                onClick={() => changeView(v)}
                className={cn(
                  'rounded-full px-3.5 py-1.5 text-xs font-extrabold capitalize transition',
                  view === v ? 'bg-ink text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
                )}
                aria-pressed={view === v}
              >
                {v === 'mes' ? 'Mês' : v === 'semana' ? 'Semana' : 'Dia'}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-white p-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full"
              onClick={() => shift(-1)}
              aria-label="Período anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <button
              onClick={() => {
                setLoading(true)
                setAnchor(todayISO())
              }}
              className="rounded-full px-2.5 text-xs font-extrabold text-ink hover:bg-stone-100"
            >
              Hoje
            </button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full"
              onClick={() => shift(1)}
              aria-label="Próximo período"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Legenda */}
      <div className="flex flex-wrap gap-2">
        <StatusChip status="PENDENTE" />
        <StatusChip status="CONFIRMADO" />
        <StatusChip status="CONCLUIDO" />
        <StatusChip status="CANCELADO" />
        <StatusChip status="RECUSADO" />
      </div>

      {loading && (
        <p className="flex items-center gap-2 text-sm text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin" /> Carregando agenda…
        </p>
      )}

      {/* ── Visão MENSAL ─────────────────────────────────────── */}
      {view === 'mes' && !loading && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((d) => (
              <div
                key={d}
                className="py-2 text-center text-[11px] font-extrabold uppercase tracking-wide text-slate-400"
              >
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {monthGrid.map((iso, i) => {
              if (!iso) return <div key={`b-${i}`} className="min-h-24 border-b border-r border-slate-50 bg-slate-50/40" />
              const dayApps = appointmentsFor(iso)
              const isToday = iso === todayISO()
              return (
                <button
                  key={iso}
                  onClick={() => {
                    setLoading(true)
                    setAnchor(iso)
                    setView('dia')
                  }}
                  className={cn(
                    'min-h-24 border-b border-r border-slate-100 p-1.5 text-left transition hover:bg-stone-100/60',
                    isToday && 'bg-stone-100/50 ring-1 ring-inset ring-stone-300'
                  )}
                >
                  <span
                    className={cn(
                      'inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-extrabold',
                      isToday ? 'bg-ink text-white' : 'text-slate-600'
                    )}
                  >
                    {Number(iso.slice(-2))}
                  </span>
                  <div className="mt-1 space-y-1">
                    {dayApps.slice(0, 3).map((a) => (
                      <span
                        key={a.id}
                        className={cn(
                          'block truncate rounded border px-1 py-0.5 text-[10px] font-bold',
                          STATUS_COLORS[a.status] ?? STATUS_COLORS.RECUSADO
                        )}
                      >
                        {minToHHMM(a.startMin)} {a.pet.name}
                      </span>
                    ))}
                    {dayApps.length > 3 && (
                      <span className="block text-[10px] font-bold text-slate-400">
                        +{dayApps.length - 3} mais
                      </span>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Visão SEMANAL ────────────────────────────────────── */}
      {view === 'semana' && !loading && (
        <div className="grid gap-3 md:grid-cols-7">
          {weekDays.map((iso) => {
            const dayApps = appointmentsFor(iso)
            const isToday = iso === todayISO()
            return (
              <div
                key={iso}
                className={cn(
                  'rounded-2xl border bg-white p-2.5 shadow-sm',
                  isToday ? 'border-stone-400 ring-1 ring-stone-300' : 'border-slate-100'
                )}
              >
                <div className="mb-2 text-center">
                  <p className="text-[10px] font-extrabold uppercase tracking-wide text-slate-400">
                    {weekdayNamePt(weekdayFromISO(iso)).replace('-feira', '')}
                  </p>
                  <p
                    className={cn(
                      'text-sm font-extrabold',
                      isToday ? 'text-ink' : 'text-slate-700'
                    )}
                  >
                    {formatDateBR(iso).slice(0, 5)}
                  </p>
                </div>
                <div className="space-y-1.5">
                  {dayApps.map((a) => (
                    <span
                      key={a.id}
                      className={cn(
                        'block truncate rounded-lg border px-1.5 py-1 text-[10px] font-bold',
                        STATUS_COLORS[a.status] ?? STATUS_COLORS.RECUSADO
                      )}
                      title={`${minToHHMM(a.startMin)} — ${a.pet.name} (${a.customer.name})`}
                    >
                      {minToHHMM(a.startMin)} {a.pet.name}
                    </span>
                  ))}
                  {dayApps.length === 0 && (
                    <p className="py-2 text-center text-[10px] font-bold text-slate-300">—</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Visão DIÁRIA ─────────────────────────────────────── */}
      {view === 'dia' && !loading && (
        <div className="space-y-3">
          {(appointments ?? []).length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-400">
              Nenhum agendamento neste dia.
            </p>
          ) : (
            (appointments ?? [])
              .slice()
              .sort((a, b) => a.startMin - b.startMin)
              .map((a) => (
                <AppointmentCard key={a.id} appointment={a} onChanged={load} />
              ))
          )}
        </div>
      )}
    </div>
  )
}
