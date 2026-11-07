'use client'

import { useCallback, useEffect, useState } from 'react'
import { Clock3, CalendarX, Plus, Loader2, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { api, SectionTitle, PlaceholderWarn } from './ui'
import { minToHHMM, weekdayNamePt, formatDateBR } from '@/lib/time'

type HoursRow = {
  weekday: number
  enabled: boolean
  open: string
  close: string
  lunchEnabled: boolean
  lunchStart: string
  lunchEnd: string
  slotIntervalMin: number
  gapMin: number
  capacity: number
}

type ExceptionRow = {
  id: string
  date: string
  type: string
  startMin: number | null
  endMin: number | null
  reason: string
}

function minToInput(min: number): string {
  return minToHHMM(min)
}

export function HoursTab() {
  const { toast } = useToast()
  const [rows, setRows] = useState<HoursRow[] | null>(null)
  const [saving, setSaving] = useState(false)
  const [exceptions, setExceptions] = useState<ExceptionRow[] | null>(null)

  // form de exceção
  const [excDate, setExcDate] = useState('')
  const [excType, setExcType] = useState('FECHADO')
  const [excReason, setExcReason] = useState('')
  const [excStart, setExcStart] = useState('12:00')
  const [excEnd, setExcEnd] = useState('13:00')
  const [excBusy, setExcBusy] = useState(false)

  const load = useCallback(() => {
    api<{ workingHours: Array<Record<string, unknown>> }>('/api/admin/working-hours').then(
      (d) => {
        setRows(
          d.workingHours.map((h) => ({
            weekday: h.weekday as number,
            enabled: h.enabled as boolean,
            open: minToInput(h.openMin as number),
            close: minToInput(h.closeMin as number),
            lunchEnabled: h.lunchStartMin != null,
            lunchStart: h.lunchStartMin != null ? minToInput(h.lunchStartMin as number) : '12:00',
            lunchEnd: h.lunchEndMin != null ? minToInput(h.lunchEndMin as number) : '13:00',
            slotIntervalMin: h.slotIntervalMin as number,
            gapMin: h.gapMin as number,
            capacity: h.capacity as number,
          }))
        )
      }
    )
    api<{ exceptions: ExceptionRow[] }>('/api/admin/exceptions')
      .then((d) => setExceptions(d.exceptions))
      .catch(() => setExceptions([]))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const updateRow = (weekday: number, patch: Partial<HoursRow>) => {
    setRows((prev) => prev?.map((r) => (r.weekday === weekday ? { ...r, ...patch } : r)) ?? null)
  }

  const saveHours = async () => {
    if (!rows) return
    setSaving(true)
    try {
      await api('/api/admin/working-hours', { method: 'PUT', json: { hours: rows } })
      toast({
        title: 'Horários salvos!',
        description: 'A agenda pública já reflete a nova configuração.',
      })
    } catch (err) {
      toast({
        title: 'Erro ao salvar',
        description: err instanceof Error ? err.message : undefined,
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const addException = async () => {
    setExcBusy(true)
    try {
      await api('/api/admin/exceptions', {
        json: {
          date: excDate,
          type: excType,
          reason: excReason,
          start: excStart,
          end: excEnd,
        },
      })
      toast({ title: 'Bloqueio criado!', description: 'A data ficou indisponível para clientes.' })
      setExcDate('')
      setExcReason('')
      setExcType('FECHADO')
      load()
    } catch (err) {
      toast({
        title: 'Erro ao criar bloqueio',
        description: err instanceof Error ? err.message : undefined,
        variant: 'destructive',
      })
    } finally {
      setExcBusy(false)
    }
  }

  const removeException = async (id: string) => {
    try {
      await api(`/api/admin/exceptions/${id}`, { method: 'DELETE' })
      toast({ title: 'Bloqueio removido', description: 'A data voltou a ficar disponível.' })
      load()
    } catch (err) {
      toast({
        title: 'Erro',
        description: err instanceof Error ? err.message : undefined,
        variant: 'destructive',
      })
    }
  }

  return (
    <div className="space-y-6">
      <SectionTitle
        title="Horários de funcionamento"
        subtitle="Define os horários disponíveis no agendamento online para cada dia da semana."
      />

      {rows?.some((r) => r.enabled) === false && (
        <PlaceholderWarn>
          Nenhum dia está habilitado — o site ficará sem horários disponíveis. Habilite pelo menos
          um dia da semana.
        </PlaceholderWarn>
      )}

      {rows === null && (
        <p className="flex items-center gap-2 text-sm text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin" /> Carregando…
        </p>
      )}

      {rows && (
        <>
          <div className="space-y-3">
            {rows.map((r) => (
              <div
                key={r.weekday}
                className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={r.enabled}
                      onCheckedChange={(v) => updateRow(r.weekday, { enabled: v })}
                      aria-label={`Habilitar ${weekdayNamePt(r.weekday)}`}
                    />
                    <p className="font-bold text-slate-800">{weekdayNamePt(r.weekday)}</p>
                    {!r.enabled && (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-extrabold uppercase text-slate-400">
                        fechado
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-slate-400">
                    {r.enabled
                      ? `${r.open} às ${r.close}`
                        + (r.lunchEnabled ? ` • almoço ${r.lunchStart}–${r.lunchEnd}` : '')
                      : 'sem atendimento'}
                  </p>
                </div>

                {r.enabled && (
                  <div className="mt-4 grid gap-3 border-t border-slate-50 pt-4 sm:grid-cols-2 lg:grid-cols-6">
                    <div className="space-y-1">
                      <Label className="text-xs" htmlFor={`open-${r.weekday}`}>Abre</Label>
                      <Input
                        id={`open-${r.weekday}`}
                        type="time"
                        value={r.open}
                        onChange={(e) => updateRow(r.weekday, { open: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs" htmlFor={`close-${r.weekday}`}>Fecha</Label>
                      <Input
                        id={`close-${r.weekday}`}
                        type="time"
                        value={r.close}
                        onChange={(e) => updateRow(r.weekday, { close: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Almoço</Label>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={r.lunchEnabled}
                          onCheckedChange={(v) => updateRow(r.weekday, { lunchEnabled: v })}
                          aria-label="Ativar intervalo de almoço"
                        />
                        {r.lunchEnabled && (
                          <>
                            <Input
                              type="time"
                              value={r.lunchStart}
                              onChange={(e) => updateRow(r.weekday, { lunchStart: e.target.value })}
                              className="px-2"
                              aria-label="Início do almoço"
                            />
                            <Input
                              type="time"
                              value={r.lunchEnd}
                              onChange={(e) => updateRow(r.weekday, { lunchEnd: e.target.value })}
                              className="px-2"
                              aria-label="Fim do almoço"
                            />
                          </>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs" htmlFor={`slot-${r.weekday}`}>Horários a cada</Label>
                      <Select
                        value={String(r.slotIntervalMin)}
                        onValueChange={(v) => updateRow(r.weekday, { slotIntervalMin: Number(v) })}
                      >
                        <SelectTrigger id={`slot-${r.weekday}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[10, 15, 20, 30, 45, 60].map((n) => (
                            <SelectItem key={n} value={String(n)}>{n} min</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs" htmlFor={`gap-${r.weekday}`}>Pausa entre pets</Label>
                      <Select
                        value={String(r.gapMin)}
                        onValueChange={(v) => updateRow(r.weekday, { gapMin: Number(v) })}
                      >
                        <SelectTrigger id={`gap-${r.weekday}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[0, 5, 10, 15, 20, 30].map((n) => (
                            <SelectItem key={n} value={String(n)}>
                              {n === 0 ? 'Sem pausa' : `${n} min`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs" htmlFor={`cap-${r.weekday}`}>Simultâneos</Label>
                      <Select
                        value={String(r.capacity)}
                        onValueChange={(v) => updateRow(r.weekday, { capacity: Number(v) })}
                      >
                        <SelectTrigger id={`cap-${r.weekday}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5].map((n) => (
                            <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <Button
            onClick={saveHours}
            disabled={saving}
            className="rounded-full bg-ink px-8 shadow-md shadow-stone-300 hover:bg-ink"
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar horários
          </Button>
        </>
      )}

      {/* ── Exceções ─────────────────────────────────────────── */}
      <section className="pt-2">
        <SectionTitle
          title="Bloqueios e datas especiais"
          subtitle="Feriados, férias e folgas — o sistema bloqueia automaticamente essas datas no agendamento."
        />

        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-1">
              <Label className="text-xs" htmlFor="exc-date">Data</Label>
              <Input
                id="exc-date"
                type="date"
                value={excDate}
                onChange={(e) => setExcDate(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Tipo</Label>
              <Select value={excType} onValueChange={setExcType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FECHADO">Fechado o dia todo</SelectItem>
                  <SelectItem value="PARCIAL">Bloquear período</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {excType === 'PARCIAL' && (
              <>
                <div className="space-y-1">
                  <Label className="text-xs" htmlFor="exc-start">De</Label>
                  <Input
                    id="exc-start"
                    type="time"
                    value={excStart}
                    onChange={(e) => setExcStart(e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs" htmlFor="exc-end">Até</Label>
                  <Input
                    id="exc-end"
                    type="time"
                    value={excEnd}
                    onChange={(e) => setExcEnd(e.target.value)}
                  />
                </div>
              </>
            )}
            <div className="space-y-1">
              <Label className="text-xs" htmlFor="exc-reason">Motivo (opcional)</Label>
              <Input
                id="exc-reason"
                value={excReason}
                onChange={(e) => setExcReason(e.target.value)}
                placeholder="Ex.: Feriado, folga…"
              />
            </div>
          </div>
          <Button
            onClick={addException}
            disabled={!excDate || excBusy}
            className="mt-3 rounded-full bg-ink hover:bg-ink-deep"
          >
            {excBusy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-1.5 h-4 w-4" />}
            Criar bloqueio
          </Button>
        </div>

        {exceptions && exceptions.length > 0 && (
          <div className="mt-4 space-y-2">
            {exceptions.map((e) => (
              <div
                key={e.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-amber-100 bg-amber-50/60 px-4 py-3"
              >
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                    <CalendarX className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-extrabold text-slate-800">
                      {formatDateBR(e.date)}
                      <span className="ml-2 text-xs font-bold text-amber-700">
                        {e.type === 'FECHADO'
                          ? 'Fechado o dia todo'
                          : `Bloqueado ${minToHHMM(e.startMin ?? 0)}–${minToHHMM(e.endMin ?? 0)}`}
                      </span>
                    </p>
                    {e.reason && <p className="text-xs text-slate-500">{e.reason}</p>}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="rounded-full text-xs font-bold text-red-400 hover:bg-red-50 hover:text-red-600"
                  onClick={() => removeException(e.id)}
                >
                  <Trash2 className="mr-1 h-3.5 w-3.5" /> Remover
                </Button>
              </div>
            ))}
          </div>
        )}

        {exceptions && exceptions.length === 0 && (
          <p className="mt-4 flex items-center gap-2 rounded-2xl border border-dashed border-slate-200 bg-white p-5 text-sm text-slate-400">
            <Clock3 className="h-4 w-4" />
            Nenhum bloqueio cadastrado — todos os dias configurados acima estão livres.
          </p>
        )}
      </section>
    </div>
  )
}
