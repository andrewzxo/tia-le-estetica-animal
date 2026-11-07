'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import { minToHHMM, todayISO, formatDateBR, weekdayNamePt, weekdayFromISO } from '@/lib/time'
import { cn } from '@/lib/utils'

type Slot = { min: number; available: boolean }

/** Diálogo para remarcar um agendamento: escolhe nova data e horário */
export function RescheduleDialog({
  open,
  onOpenChange,
  appointment,
  onConfirm,
  busy,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  appointment: { id: string; date: string; service: { id: string; name: string } }
  onConfirm: (date: string, startMin: number) => void
  busy: boolean
}) {
  const [date, setDate] = useState(appointment.date >= todayISO() ? appointment.date : todayISO())
  const [slots, setSlots] = useState<Slot[] | null>(null)
  const [reason, setReason] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<number | null>(null)

  useEffect(() => {
    if (!open || !date || !appointment.service.id) return
    let cancelled = false
    fetch(
      `/api/public/availability?date=${date}&serviceId=${appointment.service.id}&excludeId=${appointment.id}`
    )
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return
        setSelected(null)
        setReason(null)
        setSlots(data.slots ?? [])
        setReason(data.open ? null : data.reason || 'Fechado neste dia')
      })
      .catch(() => {
        if (!cancelled) setSlots([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [open, date, appointment.service.id, appointment.id])

  const changeDate = (v: string) => {
    setLoading(true)
    setSlots(null)
    setDate(v)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto custom-scrollbar max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle className="">Remarcar agendamento</DialogTitle>
          <DialogDescription>
            Serviço: {appointment.service.name}. Escolha a nova data e horário.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="rs-date">Nova data</Label>
            <Input
              id="rs-date"
              type="date"
              value={date}
              min={todayISO()}
              onChange={(e) => changeDate(e.target.value)}
            />
            {date && (
              <p className="text-xs font-semibold text-slate-400">
                {weekdayNamePt(weekdayFromISO(date))}, {formatDateBR(date)}
              </p>
            )}
          </div>

          {loading && (
            <p className="flex items-center justify-center gap-2 py-4 text-sm text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin" /> Buscando horários…
            </p>
          )}

          {!loading && reason && (
            <p className="rounded-xl bg-amber-50 p-3 text-sm font-semibold text-amber-700 ring-1 ring-amber-100">
              {reason}
            </p>
          )}

          {!loading && !reason && slots && (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {slots.map((s) => (
                <button
                  key={s.min}
                  type="button"
                  disabled={!s.available}
                  onClick={() => setSelected(s.min)}
                  className={cn(
                    'rounded-xl border-2 py-2 text-sm font-bold transition',
                    selected === s.min
                      ? 'border-ink bg-ink text-white'
                      : s.available
                        ? 'border-stone-300 text-slate-700 hover:border-stone-400'
                        : 'cursor-not-allowed border-slate-100 text-slate-300 line-through'
                  )}
                >
                  {minToHHMM(s.min)}
                </button>
              ))}
              {slots.every((s) => !s.available) && (
                <p className="col-span-full text-center text-sm font-semibold text-slate-500">
                  Nenhum horário livre neste dia.
                </p>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" className="rounded-full" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            disabled={selected == null || busy}
            onClick={() => selected != null && onConfirm(date, selected)}
            className="rounded-full bg-ink hover:bg-ink-deep"
          >
            {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Remarcar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
