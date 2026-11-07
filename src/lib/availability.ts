import {
  nowMinutesInSP,
  todayISO,
  weekdayFromISO,
} from './time'

export type WorkingHoursLike = {
  weekday: number
  enabled: boolean
  openMin: number
  closeMin: number
  lunchStartMin: number | null
  lunchEndMin: number | null
  slotIntervalMin: number
  gapMin: number
  capacity: number
}

export type ExceptionLike = {
  date: string
  type: string // FECHADO | PARCIAL
  startMin: number | null
  endMin: number | null
  reason: string
}

export type ActiveAppointmentLike = {
  id: string
  startMin: number
  endMin: number
  // status PENDENTE | CONFIRMADO
}

export type Slot = { min: number; available: boolean }

export type DayAvailability = {
  open: boolean
  reason: string | null
  slots: Slot[]
}

/** Intervalos se sobrepõem? */
function overlaps(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return aStart < bEnd && bStart < aEnd
}

/**
 * Calcula a disponibilidade de um dia para um serviço de duração `durationMin`.
 * Considera: horário de funcionamento, almoço, exceções (fechado/parcial),
 * agendamentos existentes, capacidade simultânea, intervalo entre clientes e
 * horários já passados (com antecedência mínima de 30 min).
 */
export function computeDayAvailability(opts: {
  dateISO: string
  durationMin: number
  workingHours: WorkingHoursLike[]
  exceptions: ExceptionLike[]
  activeAppointments: ActiveAppointmentLike[]
  slotIntervalOverrideMin?: number
}): DayAvailability {
  const {
    dateISO,
    durationMin,
    workingHours,
    exceptions,
    activeAppointments,
  } = opts

  const today = todayISO()
  if (dateISO < today) {
    return { open: false, reason: 'Data já passou', slots: [] }
  }

  const wd = weekdayFromISO(dateISO)
  const wh = workingHours.find((h) => h.weekday === wd)
  if (!wh || !wh.enabled) {
    return { open: false, reason: 'Estabelecimento fechado neste dia', slots: [] }
  }

  const exception = exceptions.find((e) => e.date === dateISO)
  if (exception && exception.type === 'FECHADO') {
    return {
      open: false,
      reason: exception.reason ? `Fechado: ${exception.reason}` : 'Fechado nesta data',
      slots: [],
    }
  }

  let blockedRange: [number, number] | null = null
  if (exception && exception.type === 'PARCIAL') {
    if (exception.startMin != null && exception.endMin != null) {
      blockedRange = [exception.startMin, exception.endMin]
    }
  }

  const lunch: [number, number] | null =
    wh.lunchStartMin != null && wh.lunchEndMin != null
      ? [wh.lunchStartMin, wh.lunchEndMin]
      : null

  const nowMin = dateISO === today ? nowMinutesInSP() : -1
  const LEAD_MIN = 30 // antecedência mínima
  const capacity = Math.max(1, wh.capacity)
  const gap = Math.max(0, wh.gapMin)
  const interval = Math.max(5, opts.slotIntervalOverrideMin ?? wh.slotIntervalMin)

  const slots: Slot[] = []
  for (let t = wh.openMin; t + durationMin <= wh.closeMin; t += interval) {
    let available = true

    // Intervalo de almoço (atendimento não pode atravessar o almoço)
    if (lunch && overlaps(t, t + durationMin, lunch[0], lunch[1])) available = false

    // Bloqueio parcial
    if (available && blockedRange && overlaps(t, t + durationMin, blockedRange[0], blockedRange[1]))
      available = false

    // Conflitos com agendamentos existentes (considera capacidade simultânea e gap)
    if (available) {
      let busy = 0
      for (const ap of activeAppointments) {
        if (overlaps(t, t + durationMin + gap, ap.startMin, ap.endMin + gap)) {
          busy++
          if (busy >= capacity) {
            available = false
            break
          }
        }
      }
    }

    // Horário já passou (com antecedência mínima)
    if (available && nowMin >= 0 && t <= nowMin + LEAD_MIN) available = false

    slots.push({ min: t, available })
  }

  if (slots.length === 0) {
    return { open: false, reason: 'Sem horários configurados para este dia', slots: [] }
  }

  return { open: true, reason: null, slots }
}

/** Retorna os horários realmente disponíveis (apenas minutos) */
export function availableSlots(day: DayAvailability): number[] {
  return day.slots.filter((s) => s.available).map((s) => s.min)
}

/**
 * Disponibilidade de um mês inteiro (para o calendário público):
 * mapa dateISO -> { open, reason }
 */
export function computeMonthAvailability(opts: {
  monthISO: string // YYYY-MM
  days: string[] // todos os dias do mês
  workingHours: WorkingHoursLike[]
  exceptions: ExceptionLike[]
}): Record<string, { open: boolean; reason: string | null }> {
  const result: Record<string, { open: boolean; reason: string | null }> = {}
  const today = todayISO()
  for (const day of opts.days) {
    if (day < today) {
      result[day] = { open: false, reason: 'past' }
      continue
    }
    const wd = weekdayFromISO(day)
    const wh = opts.workingHours.find((h) => h.weekday === wd)
    if (!wh || !wh.enabled) {
      result[day] = { open: false, reason: 'closed-weekday' }
      continue
    }
    const exc = opts.exceptions.find((e) => e.date === day)
    if (exc && exc.type === 'FECHADO') {
      result[day] = { open: false, reason: 'exception' }
      continue
    }
    result[day] = { open: true, reason: null }
  }
  return result
}

/** Preço do serviço conforme espécie/porte do pet */
export function servicePrice(
  service: {
    priceOnConsult: boolean
    basePrice: number
    smallPrice: number | null
    mediumPrice: number | null
    largePrice: number | null
    catPrice: number | null
  },
  species: string,
  size: string
): number | null {
  if (service.priceOnConsult) return null
  if (species === 'GATO') return service.catPrice ?? service.basePrice
  if (size === 'PEQUENO') return service.smallPrice ?? service.basePrice
  if (size === 'MEDIO') return service.mediumPrice ?? service.basePrice
  if (size === 'GRANDE') return service.largePrice ?? service.basePrice
  return service.basePrice
}
