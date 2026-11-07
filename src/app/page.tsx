'use client'

import { useCallback, useEffect, useState } from 'react'
import { RefreshCcw, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { BootstrapData } from '@/lib/public-types'
import { SiteHeader } from '@/components/site/header'
import { Hero } from '@/components/site/hero'
import { Marquee } from '@/components/site/marquee'
import { AboutSection } from '@/components/site/about'
import { ServicesSection } from '@/components/site/services'
import { WhySection } from '@/components/site/why'
import { GallerySection } from '@/components/site/gallery'
import { TipSection, TipTosaSection } from '@/components/site/tip'
import { TestimonialsSection } from '@/components/site/testimonials'
import { ImportantNoticeSection } from '@/components/site/important-notice'
import { FaqSection } from '@/components/site/faq'
import { HoursLocationSection, groupHours } from '@/components/site/hours-location'
import { SiteFooter } from '@/components/site/footer'
import { FloatingWhatsApp } from '@/components/site/floating-whatsapp'
import { BookingDialog } from '@/components/booking/booking-dialog'

export default function PublicHomePage() {
  const [data, setData] = useState<BootstrapData | null>(null)
  const [loadError, setLoadError] = useState(false)
  const [bookingOpen, setBookingOpen] = useState(false)
  const [initialService, setInitialService] = useState<string | null>(null)

  const load = useCallback(() => {
    fetch('/api/public/bootstrap')
      .then((r) => r.json())
      .then((d) => {
        if (d && d.error) setLoadError(true)
        else setData(d as BootstrapData)
      })
      .catch(() => setLoadError(true))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const retry = () => {
    setLoadError(false)
    load()
  }

  const openBooking = (serviceId?: string) => {
    setInitialService(serviceId ?? null)
    setBookingOpen(true)
  }

  // ── Carregando ──────────────────────────────────────────────────
  if (!data) {
    if (loadError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-paper px-4 text-center">
          <AlertCircle className="h-12 w-12 text-bronze" aria-hidden="true" />
          <h1 className="font-display text-2xl font-medium text-ink-deep">
            Não foi possível carregar o site
          </h1>
          <p className="max-w-sm text-sm text-ink/60">
            Verifique sua conexão e tente novamente em instantes.
          </p>
          <Button onClick={retry} className="rounded-lg bg-ink text-paper hover:bg-ink-deep">
            <RefreshCcw className="mr-2 h-4 w-4" /> Tentar novamente
          </Button>
        </div>
      )
    }
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-paper">
        <span className="flex h-16 w-16 animate-bounce items-center justify-center rounded-full bg-ink text-2xl text-paper shadow-lg shadow-ink/20">
          🐾
        </span>
        <p className="font-display text-lg font-medium italic text-ink-deep">Tia Lê Estética Animal</p>
        <p className="text-sm text-ink/40">Preparando tudo para você…</p>
      </div>
    )
  }

  const hoursLines = groupHours(data.workingHours)
  const tosaServiceId = data.services.find((s) => s.name === 'Tosa Higiênica')?.id

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader
        businessName={data.settings.businessName}
        logoUrl={data.settings.logoUrl}
        onBook={() => openBooking()}
      />

      <main className="flex-1">
        <Hero
          businessName={data.settings.businessName}
          title={data.settings.heroTitle}
          subtitle={data.settings.heroSubtitle}
          imageUrl={data.settings.heroImageUrl}
          onBook={() => openBooking()}
        />

        <Marquee />

        <AboutSection
          businessName={data.settings.businessName}
          title={data.settings.aboutTitle}
          text={data.settings.aboutText}
        />

        <ServicesSection services={data.services} onBook={openBooking} />

        <WhySection />

        <GallerySection items={data.gallery} />

        <TipTosaSection onBook={() => openBooking(tosaServiceId)} />

        <TipSection instagram={data.settings.instagram} />

        <TestimonialsSection testimonials={data.testimonials} />

        <ImportantNoticeSection />

        <FaqSection />

        <HoursLocationSection
          settings={data.settings}
          workingHours={data.workingHours}
          exceptions={data.exceptions}
        />
      </main>

      <SiteFooter settings={data.settings} hoursLines={hoursLines} onBook={() => openBooking()} />

      <FloatingWhatsApp whatsapp={data.settings.whatsapp} />

      <BookingDialog
        open={bookingOpen}
        onOpenChange={setBookingOpen}
        services={data.services}
        settings={data.settings}
        initialServiceId={initialService}
      />
    </div>
  )
}
