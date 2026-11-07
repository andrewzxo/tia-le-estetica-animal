'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Users, Search, Loader2, PawPrint, StickyNote, History } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { api, StatusChip, SectionTitle } from './ui'
import { formatPhoneBR } from '@/lib/format'
import { formatDateBR, minToHHMM } from '@/lib/time'

type CustomerPet = {
  id: string
  name: string
  species: string
  breed: string
  size: string
  appointmentCount: number
}

type CustomerAppointment = {
  id: string
  date: string
  startMin: number
  status: string
  price: number
  service: { name: string }
  pet: { name: string }
}

type Customer = {
  id: string
  name: string
  phone: string
  notes: string
  createdAt: string
  pets: CustomerPet[]
  appointmentCount: number
  completedCount: number
  appointments: CustomerAppointment[]
}

export function CustomersTab() {
  const { toast } = useToast()
  const [customers, setCustomers] = useState<Customer[] | null>(null)
  const [q, setQ] = useState('')
  const [editing, setEditing] = useState<Customer | null>(null)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(() => {
    api<{ customers: Customer[] }>('/api/admin/customers')
      .then((d) => setCustomers(d.customers))
      .catch(() => setCustomers([]))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const filtered = useMemo(() => {
    if (!customers) return null
    const term = q.trim().toLowerCase()
    if (!term) return customers
    return customers.filter((c) =>
      `${c.name} ${c.phone} ${c.pets.map((p) => p.name).join(' ')}`
        .toLowerCase()
        .includes(term)
    )
  }, [customers, q])

  const saveNotes = async () => {
    if (!editing) return
    setSaving(true)
    try {
      await api(`/api/admin/customers/${editing.id}`, { method: 'PATCH', json: { notes } })
      toast({ title: 'Observações salvas!' })
      setEditing(null)
      load()
    } catch (err) {
      toast({
        title: 'Erro',
        description: err instanceof Error ? err.message : undefined,
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5">
      <SectionTitle
        title="Clientes"
        subtitle="Cadastro automático de quem agendou pelo site — pets, histórico e observações."
      />

      <div className="relative max-w-md">
        <Search
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          aria-hidden="true"
        />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nome, telefone ou pet…"
          className="rounded-full pl-9"
          aria-label="Buscar clientes"
        />
      </div>

      {filtered === null && (
        <p className="flex items-center gap-2 text-sm text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin" /> Carregando…
        </p>
      )}

      {filtered && filtered.length === 0 && (
        <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-400">
          Nenhum cliente encontrado. Os clientes aparecem aqui automaticamente após o primeiro
          agendamento.
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {filtered?.map((c) => (
          <div key={c.id} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-stone-200 to-amber-50 text-sm font-extrabold text-ink">
                  {c.name.slice(0, 1).toUpperCase()}
                </span>
                <div>
                  <p className="font-bold leading-tight text-slate-800">{c.name}</p>
                  <p className="text-sm font-semibold text-slate-500">
                    {formatPhoneBR(c.phone)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-extrabold text-ink">{c.appointmentCount}</p>
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                  agendamentos
                </p>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {c.pets.map((p) => (
                <span
                  key={p.id}
                  className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-600 ring-1 ring-slate-100"
                >
                  <PawPrint className="h-3 w-3 text-stone-400" aria-hidden="true" />
                  {p.name}
                  <span className="font-semibold text-slate-400">
                    ({p.breed || p.species} • {p.appointmentCount}x)
                  </span>
                </span>
              ))}
            </div>

            {c.notes && (
              <p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800 ring-1 ring-amber-100">
                {c.notes}
              </p>
            )}

            {c.appointments.length > 0 && (
              <div className="mt-3 space-y-1.5 border-t border-slate-50 pt-3">
                <p className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wide text-slate-400">
                  <History className="h-3.5 w-3.5" /> Últimos atendimentos
                </p>
                {c.appointments.slice(0, 3).map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between gap-2 text-xs text-slate-600"
                  >
                    <span className="font-semibold">
                      {formatDateBR(a.date)} {minToHHMM(a.startMin)} • {a.pet.name} —{' '}
                      {a.service.name}
                    </span>
                    <StatusChip status={a.status} />
                  </div>
                ))}
              </div>
            )}

            <div className="mt-3 flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-400">
                {c.completedCount} concluído(s) • cliente desde {formatDateBR(c.createdAt.slice(0, 10))}
              </p>
              <Button
                size="sm"
                variant="outline"
                className="h-7 rounded-full px-3 text-xs font-bold"
                onClick={() => {
                  setEditing(c)
                  setNotes(c.notes)
                }}
              >
                <StickyNote className="mr-1 h-3 w-3" /> Observações
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent className="max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="">
              Observações — {editing?.name}
            </DialogTitle>
            <DialogDescription>
              Informações úteis sobre o cliente (visíveis apenas para a equipe).
            </DialogDescription>
          </DialogHeader>
          <Label htmlFor="cust-notes">Observações</Label>
          <Textarea
            id="cust-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder="Ex.: prefere sábado pela manhã; sempre busca o pet no horário…"
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" className="rounded-full" onClick={() => setEditing(null)}>
              Cancelar
            </Button>
            <Button
              onClick={saveNotes}
              disabled={saving}
              className="rounded-full bg-ink hover:bg-ink-deep"
            >
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
