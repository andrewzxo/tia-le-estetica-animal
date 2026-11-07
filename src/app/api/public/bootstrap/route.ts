import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { todayISO } from '@/lib/time'

/**
 * Bootstrap público: tudo que a página inicial e o agendamento precisam.
 */
export async function GET() {
  try {
    const [settings, services, gallery, testimonials, workingHours, exceptions] =
      await Promise.all([
        db.siteSettings.findUnique({ where: { id: 'main' } }),
        db.service.findMany({
          where: { active: true },
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
        }),
        db.galleryItem.findMany({
          where: { visible: true },
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        }),
        db.testimonial.findMany({
          where: { visible: true },
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        }),
        db.workingHours.findMany({ orderBy: { weekday: 'asc' } }),
        db.scheduleException.findMany({
          where: { date: { gte: todayISO() } },
          orderBy: { date: 'asc' },
        }),
      ])

    if (!settings) {
      return NextResponse.json(
        { error: 'Sistema não configurado. Execute o seed.' },
        { status: 500 }
      )
    }

    const { sessionSecret: _secret, ...publicSettings } = settings

    return NextResponse.json({
      settings: publicSettings,
      services,
      gallery,
      testimonials,
      workingHours,
      exceptions,
    })
  } catch (err) {
    console.error('[public/bootstrap]', err)
    return NextResponse.json({ error: 'Erro ao carregar dados do site.' }, { status: 500 })
  }
}
