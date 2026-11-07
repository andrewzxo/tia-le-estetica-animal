'use client'

import { useState } from 'react'
import {
  Dog,
  Cat,
  Clock3,
  Phone,
  ChevronDown,
  StickyNote,
  CalendarCog,
  Check,
  X,
  Ban,
  CheckCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { minToHHMM, formatDateBR, weekdayShortPt, formatDuration } from '@/lib/time'
import { formatBRL, formatPhoneBR, SPECIES_LABELS, SIZE_LABELS } from '@/lib/format'
import { api, StatusChip } from './ui'
import { cn } from '@/lib/utils'
import { WhatsAppIcon } from '@/components/site/icons'
import { RescheduleDialog } from './reschedule-dialog'

export type AdminAppointment = {
  id: string
  date: string
  startMin: number
  endMin: number
  price: number
  status: string
  petNotes: string
  paymentInfo: string
  internalNotes: string
  taxiDog: boolean
  createdAt: string
  service: { id: string; name: string; durationMin: number }
  pet: { id: string; name: string; species: string; breed: string; size: string }
  customer: { id: string; name: string; phone: string }
}

export function AppointmentCard({
  appointment,
  onChanged,
}: {
  appointment: AdminAppointment
  onChanged: (updated?: AdminAppointment) => void
}) {
  const { toast } = useToast()
  const [busy, setBusy] = useState(false)
  const [notesOpen, setNotesOpen] = useState(false)
  const [notesText, setNotesText] = useState(appointment.internalNotes)
  const [expanded, setExpanded] = useState(false)
  const [rescheduleOpen, setRescheduleOpen] = useState(false)

  const a = appointment
  const waMessage = encodeURIComponent(
    `Olá, ${a.customer.name}! Aqui é da Tia Lê Estética Animal 🐾 Falando sobre o agendamento do(a) ${a.pet.name}…`
  )

  const doAction = async (action: string, extra?: Record<string, unknown>) => {
    setBusy(true)
    try {
      const data = await api<{ appointment: AdminAppointment }>(
        `/api/admin/appointments/${a.id}`,
        { method: 'PATCH', json: { action, ...extra } }
      )
      toast({
        title: 'Agendamento atualizado!',
        description:
          action === 'confirm'
            ? 'O cliente está confirmado. ✅'
            : action === 'complete'
              ? 'Atendimento marcado como concluído. 🎉'
              : 'Alteração salva com sucesso.',
      })
      onChanged(data.appointment)
      setNotesOpen(false)
      setRescheduleOpen(false)
    } catch (err) {
      toast({
        title: 'Não foi possível atualizar',
        description: err instanceof Error ? err.message : undefined,
        variant: 'destructive',
      })
    } finally {
      setBusy(false)
    }
  }

  const saveNotes = () => doAction('notes', { internalNotes: notesText })

  return (
    <div
      className={cn(
        'rounded-2xl border bg-white p-4 shadow-sm transition',
        a.status === 'PENDENTE' && 'border-amber-200',
        a.status === 'CONFIRMADO' && 'border-emerald-100',
        a.status === 'CONCLUIDO' && 'border-stone-200',
        (a.status === 'CANCELADO' || a.status === 'RECUSADO') && 'border-slate-100 opacity-75'
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-center rounded-xl bg-slate-50 px-2.5 py-1.5 ring-1 ring-slate-100">
            <span className="text-sm font-extrabold text-slate-800">{minToHHMM(a.startMin)}</span>
            <span className="text-[10px] font-bold uppercase text-slate-400">
              {minToHHMM(a.endMin)}
            </span>
          </div>
          <div>
            <p className="font-bold leading-tight text-slate-800">
              {a.pet.name}{' '}
              <span className="text-xs font-semibold text-slate-400">
                ({a.pet.breed || SPECIES_LABELS[a.pet.species]} • {SIZE_LABELS[a.pet.size]})
              </span>
            </p>
            <p className="text-sm font-semibold text-slate-500">
              {a.service.name} • {a.customer.name}
            </p>
            <p className="mt-0.5 text-xs font-semibold text-slate-400">
              {weekdayShortPt(new Date(a.date + 'T12:00:00').getDay())}, {formatDateBR(a.date)} •{' '}
              {formatDuration(a.service.durationMin)}
            </p>
            {(a.paymentInfo || a.taxiDog) && (
              <div className="mt-1 flex flex-wrap gap-1.5">
                {a.paymentInfo && (
                  <p className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-bold text-violet-700">
                    💰 {a.paymentInfo}
                  </p>
                )}
                {a.taxiDog && (
                  <p className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-0.5 text-[11px] font-bold text-sky-700">
                    🚕 Táxi dog
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <StatusChip status={a.status} />
          <p className="text-sm font-extrabold text-slate-700">
            {a.price > 0 ? formatBRL(a.price) : 'A consultar'}
          </p>
        </div>
      </div>

      {/* Detalhes expansíveis */}
      {expanded && (
        <div className="mt-3 space-y-1.5 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
          <p>
            <strong>Tutor(a):</strong> {a.customer.name} —{' '}
            <a
              href={`https://api.whatsapp.com/send?phone=55${a.customer.phone}&text=${waMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-emerald-600 underline decoration-emerald-200 underline-offset-2"
            >
              {formatPhoneBR(a.customer.phone)}
            </a>
          </p>
          <p>
            <strong>Espécie:</strong> {SPECIES_LABELS[a.pet.species]} •{' '}
            <strong>Porte:</strong> {SIZE_LABELS[a.pet.size]}
          </p>
          {a.paymentInfo && (
            <p>
              <strong>Forma de pagamento:</strong> {a.paymentInfo}
            </p>
          )}
          {a.taxiDog && (
            <p>
              <strong>Táxi dog:</strong> solicitado — buscar e levar (adicional de R$ 10,00)
            </p>
          )}
          {a.petNotes && (
            <p>
              <strong>Observações do tutor:</strong> {a.petNotes}
            </p>
          )}
          {a.internalNotes && (
            <p>
              <strong>Obs. interna:</strong>{' '}
              <span className="text-amber-700">{a.internalNotes}</span>
            </p>
          )}
        </div>
      )}

      {/* Ações */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {a.status === 'PENDENTE' && (
          <>
            <Button
              size="sm"
              disabled={busy}
              onClick={() => doAction('confirm')}
              className="h-8 rounded-full bg-emerald-500 text-xs font-bold hover:bg-emerald-600"
            >
              <Check className="mr-1 h-3.5 w-3.5" /> Confirmar
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={() => doAction('refuse')}
              className="h-8 rounded-full border-slate-200 text-xs font-bold text-slate-500 hover:bg-slate-50"
            >
              <X className="mr-1 h-3.5 w-3.5" /> Recusar
            </Button>
          </>
        )}
        {a.status === 'CONFIRMADO' && (
          <Button
            size="sm"
            disabled={busy}
            onClick={() => doAction('complete')}
            className="h-8 rounded-full bg-ink text-xs font-bold hover:bg-ink"
          >
            <CheckCheck className="mr-1 h-3.5 w-3.5" /> Concluir
          </Button>
        )}
        {(a.status === 'PENDENTE' || a.status === 'CONFIRMADO') && (
          <>
            <Button
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={() => setRescheduleOpen(true)}
              className="h-8 rounded-full border-stone-300 text-xs font-bold text-ink hover:bg-stone-100"
            >
              <CalendarCog className="mr-1 h-3.5 w-3.5" /> Remarcar
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={() => doAction('cancel')}
              className="h-8 rounded-full border-red-200 text-xs font-bold text-red-500 hover:bg-red-50"
            >
              <Ban className="mr-1 h-3.5 w-3.5" /> Cancelar
            </Button>
          </>
        )}

        <Button
          size="sm"
          variant="ghost"
          className="h-8 rounded-full text-xs font-bold text-slate-500 hover:bg-amber-50 hover:text-amber-600"
          onClick={() => {
            setNotesText(a.internalNotes)
            setNotesOpen(true)
          }}
        >
          <StickyNote className="mr-1 h-3.5 w-3.5" />
          {a.internalNotes ? 'Editar obs.' : 'Obs. interna'}
        </Button>

        <a
          href={`https://api.whatsapp.com/send?phone=55${a.customer.phone}&text=${waMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-8 items-center gap-1 rounded-full bg-emerald-50 px-3 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100"
          aria-label={`Falar com ${a.customer.name} no WhatsApp`}
        >
          <WhatsAppIcon className="h-3.5 w-3.5" /> WhatsApp
        </a>

        <button
          onClick={() => setExpanded(!expanded)}
          className="ml-auto inline-flex h-8 items-center gap-1 rounded-full px-2 text-xs font-bold text-slate-400 transition hover:text-slate-600"
          aria-expanded={expanded}
        >
          {expanded ? 'Menos' : 'Detalhes'}
          <ChevronDown className={cn('h-3.5 w-3.5 transition', expanded && 'rotate-180')} />
        </button>
      </div>

      {/* Dialog observações internas */}
      <Dialog open={notesOpen} onOpenChange={setNotesOpen}>
        <DialogContent className="max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="">Observação interna</DialogTitle>
            <DialogDescription>
              Visível apenas para a equipe — sobre {a.pet.name} ({a.customer.name}).
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={notesText}
            onChange={(e) => setNotesText(e.target.value)}
            rows={4}
            placeholder="Ex.: cliente prefere tosa curta; pet é ansioso…"
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" className="rounded-full" onClick={() => setNotesOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={saveNotes}
              disabled={busy}
              className="rounded-full bg-ink hover:bg-ink-deep"
            >
              Salvar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <RescheduleDialog
        open={rescheduleOpen}
        onOpenChange={setRescheduleOpen}
        appointment={a}
        onConfirm={(date, startMin) => doAction('reschedule', { date, startMin })}
        busy={busy}
      />
    </div>
  )
}
