import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { computeDayAvailability } from '@/lib/availability'
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
function buildPaymentInfo(method: string | undefined, needsChange: string | undefined): string {
  const label = method ? PAYMENT_LABELS[method] : ''
  if (!label) return ''
  if (method === 'DINHEIRO') {
    if (needsChange === 'SIM') return 'Dinheiro — precisa de troco'
    if (needsChange === 'NAO') return 'Dinheiro — não precisa de troco'
    return 'Dinheiro'
  }
  return label
}

/**
 * Cria um pedido de agendamento (status PENDENTE).
 * Valida disponibilidade no servidor para impedir conflitos.
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

    // ── Forma de pagamento (informada no passo de confirmação) ────
    const paymentMethod = (body.paymentMethod || '').trim().toUpperCase()
    if (paymentMethod && !PAYMENT_LABELS[paymentMethod])
      return NextResponse.json({ error: 'Forma de pagamento inválida.' }, { status: 400 })
    const needsChange = (body.needsChange || '').trim().toUpperCase()
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

    // ── Disponibilidade (validação contra conflitos) ──────────────
    const [workingHours, exceptions, activeAppointments] = await Promise.all([
      db.workingHours.findMany(),
      db.scheduleException.findMany({ where: { date } }),
      db.appointment.findMany({
        where: { date, status: { in: ['PENDENTE', 'CONFIRMADO'] } },
        select: { id: true, startMin: true, endMin: true },
      }),
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

    // ── Cliente (upsert por telefone) ─────────────────────────────
    const customer = await db.customer.upsert({
      where: { phone },
      create: { name: tutorName, phone },
      update: { name: tutorName },
    })

    // ── Pet (reutiliza se mesmo tutor já tiver pet com mesmo nome) ─
    let pet = await db.pet.findFirst({
      where: {
        customerId: customer.id,
        name: { equals: petName },
      },
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

    // ── Agendamento (PENDENTE até a proprietária confirmar) ───────
    const appointment = await db.appointment.create({
      data: {
        serviceId: service.id,
        customerId: customer.id,
        petId: pet.id,
        date,
        startMin,
        endMin: startMin + service.durationMin,
        price: service.priceOnConsult ? 0 : price,
        status: 'PENDENTE',
        petNotes: obs,
        paymentInfo,
        taxiDog,
      },
    })

    // ── Mensagem do WhatsApp ──────────────────────────────────────
    const settings = await db.siteSettings.findUnique({ where: { id: 'main' } })
    const template =
      settings?.waBookingTemplate ||
      `🐾 *{negocio}*\n*Novo agendamento pelo site*\n\n*Serviço:* {servico}\n*Data:* {data}\n*Horário:* {horario}\n*Pet:* {pet}\n*Tutor:* {tutor}\n*Telefone:* {telefone}\n*Preço estimado:* {preco}\n*Táxi dog (adicional):* {taxidog}\n*Observações:* {obs}\n\nPoderiam confirmar meu agendamento? Obrigado(a)! 💕`

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
      paymentLabel: paymentInfo || undefined,
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
