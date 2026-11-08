import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { db } from '@/lib/db'
import { computeDayAvailability } from '@/lib/availability'
import { activeAppointmentsForDate, addBooking } from '@/lib/bookings'
import { todayISO, minToHHMM, weekdayNamePt, weekdayFromISO, formatDateBR } from '@/lib/time'
import { buildBookingMessage, waLink } from '@/lib/whatsapp'
import { SITE_WHATSAPP } from '@/lib/site-url'
import { phoneDigits, maskPhoneBR } from '@/lib/format'

type BookingBody = {
  serviceId?: string
  date?: string
  startMin?: number
  tutorName?: string
  tutorPhone?: string
  petName?: string
  species?: string
  breed?: string
  size?: string
  obs?: string
  paymentMethod?: string
  needsChange?: string
  taxiDog?: boolean
}

const PAYMENT_LABELS: Record<string, string> = {
  PIX: 'PIX',
  CREDITO: 'Cartão de crédito',
  DEBITO: 'Cartão de débito',
  DINHEIRO: 'Dinheiro',
}

/** Valor fixo do adicional de táxi dog (buscar e levar) */
export const TAXI_DOG_PRICE = 10

/** Monta o texto legível da forma de pagamento escolhida no agendamento */
function buildPaymentInfo(method: string, needsChange: string | undefined): string {
  const label = PAYMENT_LABELS[method]
  if (!label) return ''
  if (method === 'DINHEIRO') {
    if (needsChange === 'SIM') return 'Dinheiro — precisa de troco'
    if (needsChange === 'NAO') return 'Dinheiro — não precisa de troco'
    return 'Dinheiro'
  }
  return label
}

/**
 * Cria um pedido de agendamento (status PENDENTE) com persistência real:
 * o horário fica OCCUPADO para qualquer pessoa que agendar em seguida.
 * A forma de pagamento é OBRIGATÓRIA antes de gerar o pedido do WhatsApp.
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as BookingBody

    // ── Validações ────────────────────────────────────────────────
    const { serviceId, date, startMin } = body
    if (!serviceId || !date || typeof startMin !== 'number') {
      return NextResponse.json({ error: 'Dados incompletos.' }, { status: 400 })
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date < todayISO()) {
      return NextResponse.json({ error: 'Data inválida.' }, { status: 400 })
    }

    const tutorName = (body.tutorName || '').trim()
    const petName = (body.petName || '').trim()
    const breed = (body.breed || '').trim()
    const obs = (body.obs || '').trim()
    const phone = phoneDigits(body.tutorPhone || '')
    const species = body.species || ''
    const size = body.size || ''

    if (tutorName.length < 2)
      return NextResponse.json({ error: 'Informe o nome do tutor.' }, { status: 400 })
    if (phone.length < 10 || phone.length > 11)
      return NextResponse.json(
        { error: 'Informe um telefone/WhatsApp válido com DDD.' },
        { status: 400 }
      )
    if (petName.length < 1)
      return NextResponse.json({ error: 'Informe o nome do pet.' }, { status: 400 })
    if (!['CAO', 'GATO'].includes(species))
      return NextResponse.json({ error: 'Selecione a espécie do pet.' }, { status: 400 })
    if (!['PEQUENO', 'MEDIO', 'GRANDE'].includes(size))
      return NextResponse.json({ error: 'Selecione o porte do pet.' }, { status: 400 })

    // ── Forma de pagamento (OBRIGATÓRIA antes de enviar ao WhatsApp) ──
    const paymentMethod = (body.paymentMethod || '').trim().toUpperCase()
    if (!paymentMethod) {
      return NextResponse.json(
        { error: 'Selecione a forma de pagamento para confirmar o agendamento.' },
        { status: 400 }
      )
    }
    if (!PAYMENT_LABELS[paymentMethod]) {
      return NextResponse.json({ error: 'Forma de pagamento inválida.' }, { status: 400 })
    }
    const needsChange = (body.needsChange || '').trim().toUpperCase()
    if (paymentMethod === 'DINHEIRO' && !['SIM', 'NAO'].includes(needsChange)) {
      return NextResponse.json(
        { error: 'Informe se será necessário troco.' },
        { status: 400 }
      )
    }
    const paymentInfo = buildPaymentInfo(paymentMethod, needsChange)

    // ── Adicional de táxi dog (opcional, escolhido na etapa do serviço) ─
    const taxiDog = body.taxiDog === true

    // ── Serviço ───────────────────────────────────────────────────
    const service = await db.service.findUnique({ where: { id: serviceId } })
    if (!service || !service.active) {
      return NextResponse.json({ error: 'Serviço indisponível.' }, { status: 400 })
    }
    if (service.species === 'CAES' && species === 'GATO') {
      return NextResponse.json(
        { error: 'Este serviço é destinado apenas a cães.' },
        { status: 400 }
      )
    }
    if (service.species === 'GATOS' && species === 'CAO') {
      return NextResponse.json(
        { error: 'Este serviço é destinado apenas a gatos.' },
        { status: 400 }
      )
    }

    // ── Preço conforme porte/espécie (+ táxi dog, se escolhido) ─────
    let price = service.basePrice
    if (species === 'GATO') price = service.catPrice ?? service.basePrice
    else if (size === 'PEQUENO') price = service.smallPrice ?? service.basePrice
    else if (size === 'MEDIO') price = service.mediumPrice ?? service.basePrice
    else if (size === 'GRANDE') price = service.largePrice ?? service.basePrice
    if (taxiDog && !service.priceOnConsult) price += TAXI_DOG_PRICE

    // ── Disponibilidade (validação contra conflitos reais) ────────
    const [workingHours, exceptions, activeAppointments] = await Promise.all([
      db.workingHours.findMany(),
      db.scheduleException.findMany({ where: { date } }),
      activeAppointmentsForDate(date),
    ])

    const day = computeDayAvailability({
      dateISO: date,
      durationMin: service.durationMin,
      workingHours,
      exceptions,
      activeAppointments,
    })

    const slot = day.slots.find((s) => s.min === startMin)
    if (!day.open || !slot || !slot.available) {
      return NextResponse.json(
        { error: 'Este horário acabou de ficar indisponível. Escolha outro horário.' },
        { status: 409 }
      )
    }

    // ── Cliente/Pet no banco local (melhor esforço, p/ aba de clientes) ─
    let customerId = `c_${randomUUID().replace(/-/g, '').slice(0, 12)}`
    let petId = `p_${randomUUID().replace(/-/g, '').slice(0, 12)}`
    try {
      const customer = await db.customer.upsert({
        where: { phone },
        create: { name: tutorName, phone },
        update: { name: tutorName },
      })
      customerId = customer.id
      let pet = await db.pet.findFirst({
        where: { customerId: customer.id, name: { equals: petName } },
      })
      if (!pet) {
        pet = await db.pet.findFirst({
          where: { customerId: customer.id, name: petName },
        })
      }
      if (pet) {
        pet = await db.pet.update({
          where: { id: pet.id },
          data: { species, breed, size },
        })
      } else {
        pet = await db.pet.create({
          data: { customerId: customer.id, name: petName, species, breed, size },
        })
      }
      petId = pet.id
    } catch (err) {
      // Em ambientes sem SQLite persistente (Vercel), seguimos só com o store
      console.error('[public/appointments] customer/pet local (best effort):', err)
    }

    // ── Agendamento no store persistente (PENDENTE até confirmar) ──
    const appointment = await addBooking({
      serviceId: service.id,
      customerId,
      petId,
      date,
      startMin,
      endMin: startMin + service.durationMin,
      price: service.priceOnConsult ? 0 : price,
      status: 'PENDENTE',
      petNotes: obs,
      paymentInfo,
      internalNotes: '',
      taxiDog,
      service: { id: service.id, name: service.name, durationMin: service.durationMin },
      pet: { id: petId, name: petName, species, breed, size },
      customer: { id: customerId, name: tutorName, phone },
    })

    // ── Mensagem do WhatsApp ──────────────────────────────────────
    const settings = await db.siteSettings.findUnique({ where: { id: 'main' } })
    const template =
      settings?.waBookingTemplate ||
      `🐾 *{negocio}*\n*Novo agendamento pelo site*\n\n*Serviço:* {servico}\n*Data:* {data}\n*Horário:* {horario}\n*Pet:* {pet}\n*Tutor:* {tutor}\n*Telefone:* {telefone}\n*Preço estimado:* {preco}\n*Forma de pagamento:* {pagamento}\n*Táxi dog (adicional):* {taxidog}\n*Observações:* {obs}\n\nPoderiam confirmar meu agendamento? Obrigado(a)! 💕`

    const message = buildBookingMessage(template, {
      businessName: settings?.businessName || 'Tia Lê Estética Animal',
      serviceName: service.name,
      dateISO: date,
      startMin,
      petName,
      species,
      breed,
      size,
      tutorName,
      tutorPhone: maskPhoneBR(phone),
      price: service.priceOnConsult ? null : price,
      obs,
      paymentLabel: paymentInfo,
      taxiDog,
    })

    const whatsapp = settings?.whatsapp || SITE_WHATSAPP
    const link = waLink(whatsapp, message)

    return NextResponse.json({
      id: appointment.id,
      status: appointment.status,
      message,
      waLink: link,
      resume: {
        serviceName: service.name,
        dateBR: formatDateBR(date),
        weekday: weekdayNamePt(weekdayFromISO(date)),
        time: minToHHMM(startMin),
        petName,
        tutorName,
        price: service.priceOnConsult ? null : price,
        paymentInfo,
        taxiDog,
      },
    })
  } catch (err) {
    console.error('[public/appointments]', err)
    return NextResponse.json(
      { error: 'Não foi possível concluir o agendamento. Tente novamente.' },
      { status: 500 }
    )
  }
}
