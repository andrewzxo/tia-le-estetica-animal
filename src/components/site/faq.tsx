'use client'

import { MessageCircleQuestion } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { FAQ_ITEMS } from '@/lib/faq-data'
import { Reveal } from './reveal'

export function FaqSection() {
  return (
    <section
      id="faq"
      className="mx-auto max-w-6xl scroll-mt-20 border-t border-ink/10 px-4 py-16 sm:px-6 lg:py-24"
    >
      <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
        {/* Cabeçalho editorial */}
        <Reveal>
          <p className="eyebrow flex items-center gap-3 text-bronze">
            <span className="h-px w-8 bg-bronze/60" aria-hidden="true" />
            Dúvidas frequentes
          </p>
          <h2 className="font-display mt-4 text-3xl font-normal leading-[1.1] tracking-tight text-ink-deep sm:text-[2.5rem]">
            Antes de agendar,
            <br />
            <em className="font-light italic text-bronze">que tal tirar as dúvidas?</em>
          </h2>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-ink/55">
            Reunimos as perguntas que mais chegam no nosso WhatsApp. Se a sua não estiver aqui,
            é só chamar — respondemos rapidinho!
          </p>
          <p className="font-display mt-7 inline-flex items-center gap-2 text-[0.95rem] italic text-ink/50">
            <MessageCircleQuestion className="h-4 w-4 text-bronze" aria-hidden="true" />
            Ficou com outra dúvida? Fale com a gente
          </p>
        </Reveal>

        {/* Acordeão editorial */}
        <Reveal delay={120}>
          <Accordion type="single" collapsible className="border-t border-ink/10">
            {FAQ_ITEMS.map((item, idx) => (
              <AccordionItem
                key={item.question}
                value={`faq-${idx}`}
                className="border-ink/10"
              >
                <AccordionTrigger className="group gap-4 py-5 hover:no-underline">
                  <span className="flex items-baseline gap-3.5 text-left">
                    <span
                      className="font-display hidden shrink-0 text-sm font-light italic text-bronze/70 sm:inline"
                      aria-hidden="true"
                    >
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span className="font-display text-[1.05rem] font-medium leading-snug tracking-tight text-ink-deep sm:text-lg">
                      {item.question}
                    </span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pl-0 text-[0.92rem] leading-relaxed text-ink/65 sm:pl-9">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  )
}
