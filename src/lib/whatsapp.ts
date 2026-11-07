import { formatDateBR, minToHHMM, weekdayNamePt, weekdayFromISO } from './time'
import { formatBRL, formatPhoneBR, phoneDigits, SPECIES_LABELS, SIZE_LABELS } from './format'

export type BookingMessageData = {
  businessName: string
  serviceName: string
  dateISO: string
  startMin: number
  petName: string
  species: string
  breed: string
  size: string
  tutorName: string
  tutorPhone: string
  price: number | null
  obs: string
  paymentLabel?: string
  taxiDog?: boolean
}

/** Preenche o template configurável no painel */
export function buildBookingMessage(template: string, data: BookingMessageData): string {
  const map: Record<string, string> = {
    negocio: data.businessName,
    servico: data.serviceName,
    data: `${formatDateBR(data.dateISO)} (${weekdayNamePt(weekdayFromISO(data.dateISO))})`,
    horario: minToHHMM(data.startMin),
    pet: data.petName,
    especie: SPECIES_LABELS[data.species] ?? data.species,
    raca: data.breed || '—',
    porte: SIZE_LABELS[data.size] ?? data.size,
    tutor: data.tutorName,
    telefone: formatPhoneBR(data.tutorPhone),
    preco: data.price != null ? formatBRL(data.price) : 'A consultar',
    taxidog: data.taxiDog ? 'Sim — buscar e levar (+ R$ 10,00)' : 'Não',
    pagamento: data.paymentLabel || '—',
    obs: data.obs || '—',
  }
  return template.replace(/\{(\w+)\}/g, (_, key: string) => map[key] ?? '')
}

/** Link universal do WhatsApp com mensagem pronta.
 *  Usa api.whatsapp.com diretamente: o redirecionador wa.me corrompe emojis
 *  (caracteres fora do BMP viram U+FFFD durante o redirect). */
export function waLink(whatsappNumber: string, message: string): string {
  const digits = phoneDigits(whatsappNumber)
  return `https://api.whatsapp.com/send?phone=${digits}&text=${encodeURIComponent(message)}`
}
