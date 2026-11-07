'use client'

import { useEffect, useState } from 'react'
import {
  CalendarCheck,
  Hourglass,
  CheckCheck,
  XCircle,
  Wallet,
  Users,
  PawPrint,
  ChevronRight,
  ArrowRight,
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { StatCard, StatusChip } from './ui'
import { AppointmentCard, type AdminAppointment } from './appointment-card'
import { minToHHMM, formatDateBR, weekdayShortPt } from '@/lib/time'
import { formatBRL } from '@/lib/format'
import { api, type AdminTab } from './ui'
import { Button } from '@/components/ui/button'

type DashboardData = {
  hoje: string
  agendamentosHoje: number
  pendentes: number
  confirmadosHoje: number
  concluidosMes: number
  canceladosMes: number
  faturamentoMes: number
  totalClientes: number
  totalPets: number
  proximos: AdminAppointment[]
  hojeList: AdminAppointment[]
}

export function DashboardTab({ onNavigate }: { onNavigate: (tab: AdminTab) => void }) {
  const [data, setData] = useState<DashboardData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api<DashboardData>('/api/admin/dashboard')
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : 'Erro'))
  }, [])

  if (error) {
    return <p className="rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-600">{error}</p>
  }

  if (!data) {
    return (
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">
          Bom trabalho! 💕
        </h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Visão geral do negócio —{' '}
          {weekdayShortPt(new Date(`${data.hoje}T12:00:00`).getDay())}, {formatDateBR(data.hoje)}
        </p>
      </div>

      {/* Indicadores */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Agendamentos hoje"
          value={data.agendamentosHoje}
          icon={<CalendarCheck className="h-4 w-4" />}
          tone="rose"
          hint={`${data.confirmadosHoje} confirmado(s)`}
        />
        <StatCard
          label="Aguardando confirmação"
          value={data.pendentes}
          icon={<Hourglass className="h-4 w-4" />}
          tone="amber"
          hint="pedidos feitos pelo site"
        />
        <StatCard
          label="Concluídos no mês"
          value={data.concluidosMes}
          icon={<CheckCheck className="h-4 w-4" />}
          tone="emerald"
        />
        <StatCard
          label="Cancelamentos no mês"
          value={data.canceladosMes}
          icon={<XCircle className="h-4 w-4" />}
          tone="red"
        />
        <StatCard
          label="Faturamento estimado (mês)"
          value={formatBRL(data.faturamentoMes)}
          icon={<Wallet className="h-4 w-4" />}
          tone="green"
          hint="confirmados + concluídos"
        />
        <StatCard
          label="Clientes & pets"
          value={`${data.totalClientes} / ${data.totalPets}`}
          icon={<Users className="h-4 w-4" />}
          tone="stone"
          hint={`${data.totalPets} pets cadastrados`}
        />
      </div>

      {/* Próximos atendimentos */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">
            Próximos atendimentos
          </h2>
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full text-xs font-bold text-ink hover:bg-stone-100"
            onClick={() => onNavigate('appointments')}
          >
            Ver todos <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Button>
        </div>
        {data.proximos.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-400">
            Nenhum atendimento futuro por enquanto.
          </p>
        ) : (
          <div className="space-y-2.5">
            {data.proximos.slice(0, 5).map((a) => (
              <button
                key={a.id}
                onClick={() => onNavigate('agenda')}
                className="flex w-full items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3.5 text-left shadow-sm transition hover:border-stone-300 hover:shadow-md"
              >
                <div className="flex w-14 flex-col items-center rounded-xl bg-slate-50 px-1 py-1.5 ring-1 ring-slate-100">
                  <span className="text-[10px] font-bold uppercase text-slate-400">
                    {weekdayShortPt(new Date(`${a.date}T12:00:00`).getDay())}
                  </span>
                  <span className="text-xs font-extrabold text-slate-700">
                    {formatDateBR(a.date).slice(0, 5)}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-slate-800">
                    {a.pet.name} — {a.service.name}
                  </p>
                  <p className="truncate text-xs font-semibold text-slate-500">
                    {minToHHMM(a.startMin)} • {a.customer.name}
                  </p>
                </div>
                <StatusChip status={a.status} />
                <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Agenda de hoje */}
      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-800">Agenda de hoje</h2>
        {data.hojeList.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-400">
            Nenhum atendimento agendado para hoje.
          </p>
        ) : (
          <div className="space-y-3">
            {data.hojeList.map((a) => (
              <AppointmentCard
                key={a.id}
                appointment={a}
                onChanged={() => {
                  api<DashboardData>('/api/admin/dashboard')
                    .then(setData)
                    .catch(() => {})
                }}
              />
            ))}
          </div>
        )}
      </section>

      <p className="flex items-center justify-center gap-1.5 pb-2 text-center text-xs text-slate-400">
        <PawPrint className="h-3.5 w-3.5" aria-hidden="true" />
        Dica: configure feriados e folgas na aba <strong>Horários</strong> para bloquear a agenda
        automaticamente.
      </p>
    </div>
  )
}
