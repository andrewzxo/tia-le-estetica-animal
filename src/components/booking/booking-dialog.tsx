'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
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
import { Textarea } from '@/components/ui/textarea'
import { ImportantNoticeInline } from '@/components/site/important-notice'
import { waLink } from '@/lib/whatsapp'
import { SITE_WHATSAPP } from '@/lib/site-url'
import {
  PawPrint,
  Dog,
  Cat,
  Clock3,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Scissors,
  ClipboardList,
  Loader2,
  AlertCircle,
  Wallet,
  QrCode,
  CreditCard,
  Banknote,
  CarTaxiFront,
} from 'lucide-react'
import { formatBRL, maskPhoneBR, SPECIES_LABELS, SIZE_LABELS } from '@/lib/format'
import {
  minToHHMM,
  todayISO,
  todayMonth,
  weekdayShortPt,
  monthNamePt,
  formatDateBR,
  weekdayNamePt,
  weekdayFromISO,
  addDaysISO,
  formatDuration,
} from '@/lib/time'
import type { PublicService, PublicSettings } from '@/lib/public-types'
import { WhatsAppIcon } from '@/components/site/icons'
import { cn } from '@/lib/utils'

const STEP_LABELS = ['Serviço', 'Pet', 'Data', 'Horário', 'Confirmar']
const STEP_ICONS = [Scissors, PawPrint, CalendarDays, Clock3, CheckCircle2]
const MAX_MONTHS_AHEAD = 3
/** Valor fixo do adicional de táxi dog (buscar e levar) */
const TAXI_DOG_PRICE = 10

type BookingForm = {
  tutorName: string
  tutorPhone: string
  petName: string
  species: 'CAO' | 'GATO'
  breed: string
  size: 'PEQUENO' | 'MEDIO' | 'GRANDE'
  obs: string
  paymentMethod: '' | 'PIX' | 'CREDITO' | 'DEBITO' | 'DINHEIRO'
  needsChange: '' | 'SIM' | 'NAO'
}

type BookingResult = {
  message: string
  waLink: string | null
  resume: {
    serviceName: string
    dateBR: string
    weekday: string
    time: string
    petName: string
    tutorName: string
    price: number | null
    paymentInfo?: string
    taxiDog?: boolean
  }
}

function priceFor(service: PublicService, species: string, size: string): number | null {
  if (service.priceOnConsult) return null
  if (species === 'GATO') return service.catPrice ?? service.basePrice
  if (size === 'PEQUENO') return service.smallPrice ?? service.basePrice
  if (size === 'MEDIO') return service.mediumPrice ?? service.basePrice
  if (size === 'GRANDE') return service.largePrice ?? service.basePrice
  return service.basePrice
}

function serviceMinPrice(service: PublicService): number {
  const prices = [
    service.smallPrice,
    service.mediumPrice,
    service.largePrice,
    service.catPrice,
  ].filter((p): p is number => p != null)
  if (prices.length === 0) return service.basePrice
  return Math.min(...prices)
}

function servicePriceText(service: PublicService): string {
  if (service.priceOnConsult) return 'Sob consulta'
  const hasTiers = [
    service.smallPrice,
    service.mediumPrice,
    service.largePrice,
    service.catPrice,
  ].some((p) => p != null)
  const value = formatBRL(serviceMinPrice(service))
  return hasTiers ? `A partir de ${value}` : value
}

const PAYMENT_OPTIONS = [
  { value: 'PIX', label: 'PIX', Icon: QrCode },
  { value: 'CREDITO', label: 'Crédito', Icon: CreditCard },
  { value: 'DEBITO', label: 'Débito', Icon: CreditCard },
  { value: 'DINHEIRO', label: 'Dinheiro', Icon: Banknote },
] as const

export function BookingDialog({
  open,
  onOpenChange,
  services,
  settings,
  initialServiceId,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  services: PublicService[]
  settings: PublicSettings
  initialServiceId: string | null
}) {
  const [step, setStep] = useState(1)
  const [serviceId, setServiceId] = useState<string | null>(null)
  const [taxiDog, setTaxiDog] = useState(false)
  const [form, setForm] = useState<BookingForm>({
    tutorName: '',
    tutorPhone: '',
    petName: '',
    species: 'CAO',
    breed: '',
    size: 'PEQUENO',
    obs: '',
    paymentMethod: '',
    needsChange: '',
  })
  const [date, setDate] = useState<string | null>(null)
  const [time, setTime] = useState<number | null>(null)
  const [month, setMonth] = useState(todayMonth())
  const [monthMap, setMonthMap] = useState<Record<string, { open: boolean; reason: string | null }> | null>(null)
  const [slots, setSlots] = useState<{ min: number; available: boolean }[] | null>(null)
  const [slotsReason, setSlotsReason] = useState<string | null>(null)
  const [loadingMonth, setLoadingMonth] = useState(false)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<BookingResult | null>(null)

  const service = useMemo(() => services.find((s) => s.id === serviceId) ?? null, [services, serviceId])
  const today = todayISO()

  const resetAll = useCallback(
    (keepService: boolean) => {
      setStep(1)
      if (!keepService) setServiceId(null)
      setTaxiDog(false)
      setDate(null)
      setTime(null)
      setMonth(todayMonth())
      setMonthMap(null)
      setSlots(null)
      setSlotsReason(null)
      setError(null)
      setResult(null)
    },
    []
  )

  // Ao abrir o diálogo
  useEffect(() => {
    if (open) {
      resetAll(true)
      if (initialServiceId) {
        setServiceId(initialServiceId)
      }
    }
  }, [open, initialServiceId, resetAll])

  // Carrega mapa do mês
  useEffect(() => {
    if (!open || step > 3) return
    let cancelled = false
    setLoadingMonth(true)
    fetch(`/api/public/availability/month?month=${month}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setMonthMap(data.days ?? {})
      })
      .catch(() => {
        if (!cancelled) setMonthMap({})
      })
      .finally(() => {
        if (!cancelled) setLoadingMonth(false)
      })
    return () => {
      cancelled = true
    }
  }, [open, month, step])

  // Carrega horários do dia
  useEffect(() => {
    if (!open || !date || !service || step < 4) return
    let cancelled = false
    setLoadingSlots(true)
    setSlots(null)
    setSlotsReason(null)
    fetch(`/api/public/availability?date=${date}&serviceId=${service.id}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return
        setSlots(data.slots ?? [])
        setSlotsReason(data.open ? null : data.reason || 'Fechado neste dia')
      })
      .catch(() => {
        if (!cancelled) setSlots([])
      })
      .finally(() => {
        if (!cancelled) setLoadingSlots(false)
      })
    return () => {
      cancelled = true
    }
  }, [open, date, service, step])

  const canAdvanceFromStep1 = !!serviceId

  const validateStep2 = (): string | null => {
    if (form.tutorName.trim().length < 2) return 'Informe o seu nome completo.'
    const digits = form.tutorPhone.replace(/\D/g, '')
    if (digits.length < 10 || digits.length > 11) return 'Informe um WhatsApp válido com DDD.'
    if (!form.petName.trim()) return 'Informe o nome do pet.'
    if (!form.size) return 'Selecione o porte do pet.'
    return null
  }

  const goNext = () => {
    setError(null)
    if (step === 1 && !canAdvanceFromStep1) {
      setError('Escolha um serviço para continuar.')
      return
    }
    if (step === 2) {
      const err = validateStep2()
      if (err) {
        setError(err)
        return
      }
    }
    if (step === 3 && !date) {
      setError('Escolha uma data no calendário.')
      return
    }
    if (step === 4 && time == null) {
      setError('Escolha um horário disponível.')
      return
    }
    if (step === 5) {
      if (!form.paymentMethod) {
        setError('Selecione a forma de pagamento para continuar.')
        return
      }
      if (form.paymentMethod === 'DINHEIRO' && !form.needsChange) {
        setError('Nos diga se você vai precisar de troco.')
        return
      }
    }
    setStep(step + 1)
  }

  const goBack = () => {
    setError(null)
    if (step > 1) setStep(step - 1)
  }

  const selectService = (id: string) => {
    setServiceId(id)
    setDate(null)
    setTime(null)
    setSlots(null)
  }

  const selectDate = (d: string) => {
    setDate(d)
    setTime(null)
    setSlots(null)
    setStep(4)
  }

  const selectTime = (min: number) => {
    setTime(min)
    setStep(5)
  }

  const submitBooking = async () => {
    if (!service || !date || time == null) return
    if (!form.paymentMethod) {
      setError('Selecione a forma de pagamento para confirmar.')
      return
    }
    if (form.paymentMethod === 'DINHEIRO' && !form.needsChange) {
      setError('Nos diga se você vai precisar de troco.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/public/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: service.id,
          date,
          startMin: time,
          tutorName: form.tutorName,
          tutorPhone: form.tutorPhone,
          petName: form.petName,
          species: form.species,
          breed: form.breed,
          size: form.size,
          obs: form.obs,
          paymentMethod: form.paymentMethod,
          needsChange: form.paymentMethod === 'DINHEIRO' ? form.needsChange : undefined,
          taxiDog,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Não foi possível agendar. Tente novamente.')
        return
      }
      setResult(data as BookingResult)
      // Redirecionamento OBRIGATÓRIO para o WhatsApp com o pedido pronto.
      // Usamos navegação na própria aba (location.assign): não é bloqueado por
      // bloqueadores de pop-up e funciona em celular (app) e desktop (WhatsApp Web).
      const wa = data.waLink || waLink(SITE_WHATSAPP, data.message || '')
      window.location.assign(wa)
    } catch {
      setError('Falha de conexão. Verifique sua internet e tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleOpenChange = (v: boolean) => {
    if (!v) {
      resetAll(false)
    }
    onOpenChange(v)
  }

  // ── Calendário ────────────────────────────────────────────────────
  const calendarGrid = useMemo(() => {
    const [y, m] = month.split('-').map(Number)
    const firstWeekday = new Date(y, m - 1, 1).getDay()
    const totalDays = new Date(y, m, 0).getDate()
    const cells: (string | null)[] = []
    for (let i = 0; i < firstWeekday; i++) cells.push(null)
    for (let d = 1; d <= totalDays; d++) {
      cells.push(`${month}-${String(d).padStart(2, '0')}`)
    }
    return cells
  }, [month])

  const price = service && date && time != null ? priceFor(service, form.species, form.size) : null
  const total = price != null ? price + (taxiDog ? TAXI_DOG_PRICE : 0) : null

  if (!open) return null

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto custom-scrollbar max-w-lg sm:max-w-xl rounded-2xl p-0 gap-0">
        <DialogHeader className="border-b border-ink/8 bg-paper-deep/60 px-6 pb-5 pt-6">
          <DialogTitle className="font-display flex items-center gap-3 text-xl font-semibold text-ink-deep">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink text-paper">
              <PawPrint className="h-4.5 w-4.5" aria-hidden="true" />
            </span>
            Agendar horário
          </DialogTitle>
          <DialogDescription className="text-sm text-ink/55">
            Em poucos passos seu pet está com hora marcada 💕
          </DialogDescription>
        </DialogHeader>

        {result ? (
          /* ── Tela de sucesso ─────────────────────────────────── */
          <div className="px-6 py-8 text-center">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-bronze/15 text-bronze">
              <CheckCircle2 className="h-9 w-9" aria-hidden="true" />
            </span>
            <h3 className="font-display mt-4 text-2xl font-semibold text-ink-deep">
              Pedido enviado!
            </h3>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink/65">
              Seu agendamento de <strong>{result.resume.serviceName}</strong> foi registrado e está{' '}
              <strong>aguardando confirmação</strong>. Abrimos o WhatsApp com o seu pedido pronto —
              <strong> envie a mensagem</strong> para completarmos a confirmação!
            </p>
            <div className="mx-auto mt-5 max-w-sm rounded-xl bg-paper-deep/70 p-4 text-left text-sm text-ink/80 ring-1 ring-ink/10">
              <p>
                <strong>Serviço:</strong> {result.resume.serviceName}
              </p>
              <p>
                <strong>Data:</strong> {result.resume.weekday}, {result.resume.dateBR}
              </p>
              <p>
                <strong>Horário:</strong> {result.resume.time}
              </p>
              <p>
                <strong>Pet:</strong> {result.resume.petName}
              </p>
              {result.resume.taxiDog && (
                <p>
                  <strong>Táxi dog:</strong> buscar e levar (+ {formatBRL(TAXI_DOG_PRICE)})
                </p>
              )}
              {result.resume.paymentInfo && (
                <p>
                  <strong>Pagamento:</strong> {result.resume.paymentInfo}
                </p>
              )}
            </div>
            <div className="mt-6 flex flex-col gap-2.5">
              {result.waLink && (
                <Button
                  asChild
                  className="rounded-lg bg-[#25d366] font-bold text-white hover:bg-[#1fb958]"
                >
                  <a href={result.waLink} target="_blank" rel="noopener noreferrer">
                    <WhatsAppIcon className="mr-1.5 h-4 w-4" />
                    Abrir WhatsApp novamente
                  </a>
                </Button>
              )}
              <Button
                variant="outline"
                className="rounded-lg border-ink/20 text-ink/70 hover:bg-ink/5 hover:text-ink"
                onClick={() => handleOpenChange(false)}
              >
                Fechar
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* ── Indicador de etapas ───────────────────────────── */}
            <div className="border-b border-ink/8 px-6 py-4">
              <ol className="flex items-center justify-between">
                {STEP_LABELS.map((label, i) => {
                  const n = i + 1
                  const Icon = STEP_ICONS[i]
                  const done = step > n
                  const current = step === n
                  return (
                    <li key={label} className="flex flex-1 items-center last:flex-none">
                      <div className="flex flex-col items-center gap-1">
                        <span
                          className={cn(
                            'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors',
                            done && 'bg-bronze/15 text-bronze',
                            current && 'bg-ink text-paper shadow-md shadow-ink/20',
                            !done && !current && 'bg-ink/5 text-ink/40'
                          )}
                        >
                          {done ? <Check className="h-4 w-4" aria-hidden="true" /> : <Icon className="h-4 w-4" aria-hidden="true" />}
                        </span>
                        <span
                          className={cn(
                            'hidden text-[10px] font-bold uppercase tracking-wide sm:block',
                            current ? 'text-ink' : 'text-ink/40'
                          )}
                        >
                          {label}
                        </span>
                      </div>
                      {n < STEP_LABELS.length && (
                        <div
                          className={cn(
                            'mx-1 h-0.5 flex-1 rounded sm:mx-2',
                            step > n ? 'bg-bronze/50' : 'bg-ink/10'
                          )}
                          aria-hidden="true"
                        />
                      )}
                    </li>
                  )
                })}
              </ol>
            </div>

            {/* ── Conteúdo da etapa ─────────────────────────────── */}
            <div className="px-6 py-5">
              {/* Etapa 1 — Serviço */}
              {step === 1 && (
                <div className="space-y-3">
                  {services.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => selectService(s.id)}
                      className={cn(
                        'flex w-full items-center gap-4 rounded-xl border p-3 text-left transition',
                        serviceId === s.id
                          ? 'border-ink bg-paper-deep/60 shadow-sm'
                          : 'border-ink/10 bg-white hover:border-ink/35'
                      )}
                      aria-pressed={serviceId === s.id}
                    >
                      <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-paper-deep">
                        {s.imageUrl && (
                          <Image
                            src={s.imageUrl}
                            alt=""
                            fill
                            sizes="64px"
                            className="object-cover object-[50%_35%]"
                          />
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-bold text-ink-deep">{s.name}</span>
                        <span className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs font-semibold text-ink/55">
                          <span className="inline-flex items-center gap-1">
                            <Clock3 className="h-3 w-3 text-bronze" aria-hidden="true" />
                            {formatDuration(s.durationMin)}
                          </span>
                          <span className="font-display italic text-bronze">
                            {servicePriceText(s)}
                          </span>
                        </span>
                      </span>
                      <span
                        className={cn(
                          'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition',
                          serviceId === s.id ? 'border-ink bg-ink' : 'border-ink/25'
                        )}
                        aria-hidden="true"
                      >
                        {serviceId === s.id && <Check className="h-3 w-3 text-paper" />}
                      </span>
                    </button>
                  ))}

                  {/* Adicional opcional — Táxi dog */}
                  <div className="pt-2">
                    <p className="flex items-center gap-2 text-[0.7rem] font-extrabold uppercase tracking-wider text-ink/40">
                      <CarTaxiFront className="h-3.5 w-3.5 text-bronze" aria-hidden="true" />
                      Adicional opcional
                    </p>
                    <button
                      type="button"
                      onClick={() => setTaxiDog(!taxiDog)}
                      className={cn(
                        'mt-2 flex w-full items-center gap-4 rounded-xl border p-3 text-left transition',
                        taxiDog
                          ? 'border-ink bg-paper-deep/60 shadow-sm'
                          : 'border-dashed border-ink/20 bg-white hover:border-ink/40'
                      )}
                      aria-pressed={taxiDog}
                    >
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-bronze/10 text-bronze">
                        <CarTaxiFront className="h-6 w-6" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-bold text-ink-deep">Táxi dog</span>
                        <span className="mt-0.5 block text-xs font-semibold text-ink/55">
                          Buscamos e levamos seu pet com todo cuidado
                        </span>
                        <span className="mt-0.5 block font-display text-xs italic text-bronze">
                          + {formatBRL(TAXI_DOG_PRICE)} (buscar e levar)
                        </span>
                      </span>
                      <span
                        className={cn(
                          'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition',
                          taxiDog ? 'border-ink bg-ink' : 'border-ink/25'
                        )}
                        aria-hidden="true"
                      >
                        {taxiDog && <Check className="h-3 w-3 text-paper" />}
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* Etapa 2 — Pet */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="bk-tutor">Seu nome *</Label>
                      <Input
                        id="bk-tutor"
                        value={form.tutorName}
                        onChange={(e) => setForm({ ...form, tutorName: e.target.value })}
                        placeholder="Ex.: Maria Silva"
                        autoComplete="name"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="bk-phone">WhatsApp / Telefone *</Label>
                      <Input
                        id="bk-phone"
                        value={form.tutorPhone}
                        onChange={(e) => setForm({ ...form, tutorPhone: maskPhoneBR(e.target.value) })}
                        placeholder="(11) 99999-9999"
                        inputMode="tel"
                        autoComplete="tel"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="bk-pet">Nome do pet *</Label>
                      <Input
                        id="bk-pet"
                        value={form.petName}
                        onChange={(e) => setForm({ ...form, petName: e.target.value })}
                        placeholder="Ex.: Thor"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="bk-breed">Raça</Label>
                      <Input
                        id="bk-breed"
                        value={form.breed}
                        onChange={(e) => setForm({ ...form, breed: e.target.value })}
                        placeholder="Ex.: Poodle"
                      />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label>Espécie *</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {(
                          [
                            { v: 'CAO', Icon: Dog, label: 'Cachorro' },
                            { v: 'GATO', Icon: Cat, label: 'Gato' },
                          ] as const
                        ).map(({ v, Icon, label }) => {
                          const blocked =
                            (service?.species === 'CAES' && v === 'GATO') ||
                            (service?.species === 'GATOS' && v === 'CAO')
                          return (
                            <button
                              key={v}
                              type="button"
                              disabled={blocked}
                              onClick={() => setForm({ ...form, species: v })}
                              className={cn(
                                'flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-bold transition',
                                form.species === v
                                  ? 'border-ink bg-ink text-paper'
                                  : 'border-ink/15 text-ink/60 hover:border-ink/40',
                                blocked && 'cursor-not-allowed opacity-40'
                              )}
                              aria-pressed={form.species === v}
                            >
                              <Icon className="h-4 w-4" aria-hidden="true" />
                              {label}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label>Porte *</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['PEQUENO', 'MEDIO', 'GRANDE'] as const).map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setForm({ ...form, size: s })}
                            className={cn(
                              'rounded-xl border px-2 py-2.5 text-sm font-bold transition',
                              form.size === s
                                ? 'border-ink bg-ink text-paper'
                                : 'border-ink/15 text-ink/60 hover:border-ink/40'
                            )}
                            aria-pressed={form.size === s}
                          >
                            {SIZE_LABELS[s]}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="bk-obs">Observações (alergias, comportamento, etc.)</Label>
                    <Textarea
                      id="bk-obs"
                      value={form.obs}
                      onChange={(e) => setForm({ ...form, obs: e.target.value })}
                      placeholder="Conte algo importante sobre o seu pet…"
                      rows={2}
                    />
                  </div>
                </div>
              )}

              {/* Etapa 3 — Data */}
              {step === 3 && (
                <div>
                  <div className="flex items-center justify-between">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-lg text-ink/60 hover:bg-ink/5"
                      disabled={month <= todayMonth()}
                      onClick={() => {
                        const [y, m] = month.split('-').map(Number)
                        const d = new Date(y, m - 2, 1)
                        setMonth(
                          `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
                        )
                      }}
                      aria-label="Mês anterior"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <p className="font-display text-lg font-semibold text-ink-deep">
                      {monthNamePt(month)}
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-lg text-ink/60 hover:bg-ink/5"
                      disabled={month >= addMonthsISO(todayMonth(), MAX_MONTHS_AHEAD)}
                      onClick={() => {
                        const [y, m] = month.split('-').map(Number)
                        const d = new Date(y, m, 1)
                        setMonth(
                          `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
                        )
                      }}
                      aria-label="Próximo mês"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </div>

                  <div className="mt-3 grid grid-cols-7 gap-1 text-center">
                    {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
                      <span
                        key={i}
                        className="py-1 text-xs font-extrabold uppercase text-ink/40"
                        aria-hidden="true"
                      >
                        {d}
                      </span>
                    ))}
                    {calendarGrid.map((iso, i) => {
                      if (!iso) return <span key={`blank-${i}`} />
                      const info = monthMap?.[iso]
                      const disabled = !info?.open
                      const selected = date === iso
                      return (
                        <button
                          key={iso}
                          type="button"
                          disabled={disabled}
                          onClick={() => selectDate(iso)}
                          className={cn(
                            'mx-auto flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition',
                            selected
                              ? 'bg-ink text-paper shadow-md shadow-ink/20'
                              : disabled
                                ? 'cursor-not-allowed text-ink/25'
                                : 'text-ink/75 hover:bg-ink/10 hover:text-ink'
                          )}
                          aria-label={`${formatDateBR(iso)}${disabled ? ' (indisponível)' : ' (disponível)'}`}
                          aria-pressed={selected}
                        >
                          {Number(iso.slice(-2))}
                        </button>
                      )
                    })}
                  </div>

                  {loadingMonth && (
                    <p className="mt-3 flex items-center justify-center gap-2 text-sm text-ink/45">
                      <Loader2 className="h-4 w-4 animate-spin" /> Carregando calendário…
                    </p>
                  )}
                  <p className="mt-3 text-center text-xs text-ink/40">
                    Os dias em cinza estão fechados (folga, feriado ou fora do funcionamento).
                  </p>
                </div>
              )}

              {/* Etapa 4 — Horário */}
              {step === 4 && (
                <div>
                  <p className="text-center font-display text-lg font-semibold text-ink-deep">
                    {weekdayNamePt(weekdayFromISO(date!))}, {formatDateBR(date!)}
                  </p>
                  <p className="mt-1 text-center text-sm text-ink/55">
                    Horários disponíveis para <strong>{service?.name}</strong>
                  </p>

                  {loadingSlots && (
                    <p className="mt-6 flex items-center justify-center gap-2 text-sm text-ink/45">
                      <Loader2 className="h-4 w-4 animate-spin" /> Buscando horários…
                    </p>
                  )}

                  {!loadingSlots && slotsReason && (
                    <div className="mt-6 flex flex-col items-center gap-2 rounded-xl bg-amber-50 p-5 text-center ring-1 ring-amber-200/70">
                      <AlertCircle className="h-6 w-6 text-amber-500" aria-hidden="true" />
                      <p className="text-sm font-semibold text-amber-700">{slotsReason}</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg"
                        onClick={() => setStep(3)}
                      >
                        Escolher outra data
                      </Button>
                    </div>
                  )}

                  {!loadingSlots && !slotsReason && slots && (
                    <>
                      <div className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-4">
                        {slots.map((slot) => (
                          <button
                            key={slot.min}
                            type="button"
                            disabled={!slot.available}
                            onClick={() => selectTime(slot.min)}
                            className={cn(
                              'rounded-xl border-2 py-2.5 text-sm font-bold transition',
                              slot.available
                                ? 'border-ink/15 text-ink/80 hover:border-ink hover:bg-ink/5 hover:text-ink'
                                : 'cursor-not-allowed border-ink/10 text-ink/25 line-through'
                            )}
                            aria-label={
                              slot.available
                                ? `Agendar às ${minToHHMM(slot.min)}`
                                : `${minToHHMM(slot.min)} indisponível`
                            }
                          >
                            {minToHHMM(slot.min)}
                          </button>
                        ))}
                      </div>
                      {slots.every((s) => !s.available) && (
                        <p className="mt-4 text-center text-sm font-semibold text-ink/60">
                          Todos os horários deste dia já foram preenchidos. 😔
                        </p>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Etapa 5 — Confirmação */}
              {step === 5 && service && date && time != null && (
                <div className="space-y-4">
                  <ImportantNoticeInline />

                  <div className="rounded-xl bg-ink p-5 texture-grain">
                    <p className="font-display text-lg font-semibold text-paper">
                      {service.name}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-bronze-soft">
                      {weekdayNamePt(weekdayFromISO(date))}, {formatDateBR(date)} às{' '}
                      {minToHHMM(time)}
                    </p>
                    <p className="mt-2 text-sm text-paper/65">
                      Duração estimada: {formatDuration(service.durationMin)}
                    </p>
                    {taxiDog && (
                      <p className="mt-2.5 flex items-center gap-2 rounded-lg bg-bronze/15 px-3 py-1.5 text-xs font-bold text-bronze-soft">
                        <CarTaxiFront className="h-4 w-4 shrink-0" aria-hidden="true" />
                        Táxi dog solicitado — buscamos e levamos seu pet
                      </p>
                    )}
                  </div>

                  <dl className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-xl border border-ink/10 p-5 text-sm">
                    <div>
                      <dt className="text-xs font-bold uppercase tracking-wide text-ink/45">Pet</dt>
                      <dd className="mt-0.5 font-bold text-ink">
                        {form.petName} ({SPECIES_LABELS[form.species]}
                        {form.breed ? ` • ${form.breed}` : ''} • porte {SIZE_LABELS[form.size]})
                      </dd>
                    </div>
                    <div>
                      <dt className="text-xs font-bold uppercase tracking-wide text-ink/45">
                        Tutor(a)
                      </dt>
                      <dd className="mt-0.5 font-bold text-ink">{form.tutorName}</dd>
                      <dd className="text-ink/55">{form.tutorPhone}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-bold uppercase tracking-wide text-ink/45">
                        Preço estimado
                      </dt>
                      <dd className="mt-0.5 font-bold text-bronze">
                        {total != null ? formatBRL(total) : 'A consultar'}
                      </dd>
                      {taxiDog && (
                        <dd className="mt-0.5 text-[0.7rem] font-semibold text-ink/55">
                          Inclui táxi dog ({formatBRL(TAXI_DOG_PRICE)})
                          {price != null ? '' : ' + valor do serviço'}
                        </dd>
                      )}
                    </div>
                    {form.obs && (
                      <div className="col-span-2">
                        <dt className="text-xs font-bold uppercase tracking-wide text-ink/45">
                          Observações
                        </dt>
                        <dd className="mt-0.5 text-ink/70">{form.obs}</dd>
                      </div>
                    )}
                  </dl>

                  {/* Forma de pagamento */}
                  <div className="rounded-xl border border-ink/10 p-5">
                    <p className="flex items-center gap-2 text-sm font-bold text-ink-deep">
                      <Wallet className="h-4 w-4 text-bronze" aria-hidden="true" />
                      Como você prefere pagar?
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {PAYMENT_OPTIONS.map(({ value, label, Icon }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() =>
                            setForm({
                              ...form,
                              paymentMethod: value,
                              needsChange: value === 'DINHEIRO' ? form.needsChange : '',
                            })
                          }
                          className={cn(
                            'flex flex-col items-center gap-1.5 rounded-xl border px-2 py-2.5 text-xs font-bold transition',
                            form.paymentMethod === value
                              ? 'border-ink bg-ink text-paper shadow-sm'
                              : 'border-ink/15 text-ink/60 hover:border-ink/40'
                          )}
                          aria-pressed={form.paymentMethod === value}
                        >
                          <Icon className="h-4 w-4" aria-hidden="true" />
                          {label}
                        </button>
                      ))}
                    </div>

                    {form.paymentMethod === 'CREDITO' && (
                      <p className="mt-3 rounded-lg bg-bronze/8 px-3 py-2 text-xs font-semibold text-ink/70 ring-1 ring-bronze/20">
                        💳 Parcelamos em até 3x com juros da maquininha — combine com a gente.
                      </p>
                    )}

                    {form.paymentMethod === 'DINHEIRO' && (
                      <div className="mt-3">
                        <p className="text-xs font-bold uppercase tracking-wide text-ink/45">
                          Precisa de troco?
                        </p>
                        <div className="mt-1.5 grid grid-cols-2 gap-2">
                          {(
                            [
                              { v: 'SIM', label: 'Sim, preciso de troco' },
                              { v: 'NAO', label: 'Não preciso' },
                            ] as const
                          ).map(({ v, label }) => (
                            <button
                              key={v}
                              type="button"
                              onClick={() => setForm({ ...form, needsChange: v })}
                              className={cn(
                                'rounded-xl border px-2 py-2 text-xs font-bold transition',
                                form.needsChange === v
                                  ? 'border-ink bg-ink text-paper'
                                  : 'border-ink/15 text-ink/60 hover:border-ink/40'
                              )}
                              aria-pressed={form.needsChange === v}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <p className="mt-3 text-[0.72rem] leading-relaxed text-ink/50">
                      O pagamento não é marcado antecipadamente: PIX no dia do atendimento (envie o
                      comprovante no WhatsApp) e dinheiro ou cartão na entrega do seu animalzinho.
                    </p>
                  </div>

                  <p className="text-center text-xs leading-relaxed text-ink/55">
                    Ao confirmar, seu pedido será registrado e aparecerá para a proprietária como{' '}
                    <strong>“Aguardando confirmação”</strong>. A confirmação final acontece pelo
                    WhatsApp.
                  </p>
                </div>
              )}

              {error && (
                <p
                  className="mt-4 flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-600 ring-1 ring-red-100"
                  role="alert"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  {error}
                </p>
              )}
            </div>

            {/* ── Rodapé do diálogo ─────────────────────────────── */}
            <div className="flex items-center justify-between gap-3 border-t border-ink/8 px-6 py-4">
              <Button
                variant="ghost"
                onClick={goBack}
                disabled={step === 1}
                className="rounded-lg text-ink/60 hover:bg-ink/5"
              >
                <ChevronLeft className="mr-1 h-4 w-4" aria-hidden="true" />
                Voltar
              </Button>

              {step < 5 ? (
                <Button
                  onClick={goNext}
                  className="rounded-lg bg-ink px-7 shadow-md shadow-ink/15 hover:bg-ink-deep"
                >
                  {step === 4 ? 'Revisar' : 'Continuar'}
                  <ChevronRight className="ml-1 h-4 w-4" aria-hidden="true" />
                </Button>
              ) : (
                <Button
                  onClick={submitBooking}
                  disabled={submitting}
                  className="rounded-lg bg-[#25d366] px-6 font-bold text-white shadow-md shadow-emerald-100/60 hover:bg-[#1fb958]"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enviando…
                    </>
                  ) : (
                    <>
                      <WhatsAppIcon className="mr-1.5 h-4 w-4" />
                      Confirmar pelo WhatsApp
                    </>
                  )}
                </Button>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

function addMonthsISO(ym: string, n: number): string {
  const [y, m] = ym.split('-').map(Number)
  const d = new Date(y, m - 1 + n, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}
