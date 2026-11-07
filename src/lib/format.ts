/** Somente dígitos de um telefone */
export function phoneDigits(phone: string): string {
  return phone.replace(/\D/g, '')
}

/** Valida e normaliza número de WhatsApp para o padrão internacional sem "+" */
export function normalizeWhatsapp(raw: string): string | null {
  const digits = phoneDigits(raw)
  if (digits.length < 10 || digits.length > 13) return null
  return digits
}

/** (11) 99999-9999 para exibição */
export function formatPhoneBR(raw: string): string {
  const d = phoneDigits(raw)
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return raw
}

/** Máscara progressiva para input de telefone BR */
export function maskPhoneBR(value: string): string {
  const d = phoneDigits(value).slice(0, 11)
  if (d.length <= 2) return d
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

export const SIZE_LABELS: Record<string, string> = {
  PEQUENO: 'Pequeno',
  MEDIO: 'Médio',
  GRANDE: 'Grande',
}

export const SPECIES_LABELS: Record<string, string> = {
  CAO: 'Cão',
  GATO: 'Gato',
}

export const STATUS_LABELS: Record<string, string> = {
  PENDENTE: 'Aguardando confirmação',
  CONFIRMADO: 'Confirmado',
  CONCLUIDO: 'Concluído',
  CANCELADO: 'Cancelado',
  RECUSADO: 'Recusado',
}

export function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}
