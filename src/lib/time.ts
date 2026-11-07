export const BIZ_TZ = 'America/Sao_Paulo'

/** Data de hoje no fuso do estabelecimento, formato YYYY-MM-DD */
export function todayISO(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: BIZ_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

/** Minutos desde a meia-noite no fuso do estabelecimento */
export function nowMinutesInSP(): number {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: BIZ_TZ,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date())
  const [h, m] = parts.split(':').map(Number)
  return h * 60 + m
}

/** Parse seguro de YYYY-MM-DD (evita problemas de fuso) */
export function parseISO(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** Dia da semana (0=domingo .. 6=sábado) de uma data YYYY-MM-DD */
export function weekdayFromISO(iso: string): number {
  return parseISO(iso).getDay()
}

export function addDaysISO(iso: string, days: number): string {
  const d = parseISO(iso)
  d.setDate(d.getDate() + days)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

export function monthOf(iso: string): string {
  return iso.slice(0, 7)
}

export function todayMonth(): string {
  return todayISO().slice(0, 7)
}

export function daysInMonth(ym: string): string[] {
  const [y, m] = ym.split('-').map(Number)
  const total = new Date(y, m, 0).getDate()
  const days: string[] = []
  for (let i = 1; i <= total; i++) {
    days.push(`${ym}-${String(i).padStart(2, '0')}`)
  }
  return days
}

/** Primeiro dia (YYYY-MM-DD) do mês de um YYYY-MM */
export function firstDayOf(ym: string): string {
  return `${ym}-01`
}

const WEEKDAYS_PT = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
]

const WEEKDAYS_PT_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

const MONTHS_PT = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

export function weekdayNamePt(wd: number): string {
  return WEEKDAYS_PT[wd] ?? ''
}

export function weekdayShortPt(wd: number): string {
  return WEEKDAYS_PT_SHORT[wd] ?? ''
}

export function monthNamePt(ym: string): string {
  const [y, m] = ym.split('-').map(Number)
  return `${MONTHS_PT[(m ?? 1) - 1]} de ${y}`
}

/** 540 -> "09:00" */
export function minToHHMM(min: number): string {
  const h = Math.floor(min / 60)
  const m = min % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

/** "09:00" -> 540 */
export function hhmmToMin(v: string): number {
  const [h, m] = v.split(':').map(Number)
  return (h || 0) * 60 + (m || 0)
}

/** 60 -> "1 hora", 45 -> "45min", 90 -> "1h30" */
export function formatDuration(min: number): string {
  const h = Math.floor(min / 60)
  const m = min % 60
  if (h === 0) return `${m}min`
  if (m === 0) return h === 1 ? '1 hora' : `${h} horas`
  return `${h}h${String(m).padStart(2, '0')}`
}

export function formatDateBR(iso: string): string {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

/** Formata data completa: "sábado, 22/11/2025" */
export function formatDateLongBR(iso: string): string {
  return `${weekdayShortPt(weekdayFromISO(iso))}, ${formatDateBR(iso)}`
}

export function isPastISO(iso: string): boolean {
  return iso < todayISO()
}
