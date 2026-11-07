'use client'

import { useCallback, useEffect, useState } from 'react'
import { ClipboardList, Search, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { api, StatusChip } from './ui'
import { AppointmentCard, type AdminAppointment } from './appointment-card'

export function AppointmentsTab() {
  const [status, setStatus] = useState('TODOS')
  const [q, setQ] = useState('')
  const [appointments, setAppointments] = useState<AdminAppointment[] | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (status !== 'TODOS') params.set('status', status)
    if (q.trim()) params.set('q', q.trim())
    api<{ appointments: AdminAppointment[] }>(`/api/admin/appointments?${params.toString()}`)
      .then((d) => setAppointments(d.appointments))
      .catch(() => setAppointments([]))
      .finally(() => setLoading(false))
  }, [status, q])

  useEffect(() => {
    const t = setTimeout(load, q ? 350 : 0)
    return () => clearTimeout(t)
  }, [load, q])

  return (
    <div className="space-y-5">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold text-slate-800">
          <ClipboardList className="h-6 w-6 text-ink" aria-hidden="true" />
          Agendamentos
        </h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Confirme, recuse, remarque e acompanhe todos os pedidos.
        </p>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-3">
        <div className="relative min-w-56 flex-1">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por pet, tutor, telefone…"
            className="rounded-full pl-9"
            aria-label="Buscar agendamentos"
          />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-56 rounded-full" aria-label="Filtrar por status">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="TODOS">Todos os status</SelectItem>
            <SelectItem value="PENDENTE">Aguardando confirmação</SelectItem>
            <SelectItem value="CONFIRMADO">Confirmados</SelectItem>
            <SelectItem value="CONCLUIDO">Concluídos</SelectItem>
            <SelectItem value="CANCELADO">Cancelados</SelectItem>
            <SelectItem value="RECUSADO">Recusados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading && (
        <p className="flex items-center gap-2 text-sm text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin" /> Buscando…
        </p>
      )}

      {!loading && appointments && appointments.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center">
          <p className="text-sm font-semibold text-slate-400">
            Nenhum agendamento encontrado com esses filtros.
          </p>
        </div>
      )}

      {!loading && appointments && appointments.length > 0 && (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-400">
              {appointments.length} resultado(s)
            </span>
            <StatusChip status={appointments[0].status} className="hidden" />
          </div>
          <div className="space-y-3">
            {appointments.map((a) => (
              <AppointmentCard key={a.id} appointment={a} onChanged={load} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
