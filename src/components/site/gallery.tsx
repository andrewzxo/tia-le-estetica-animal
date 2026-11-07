'use client'

import { useState } from 'react'
import Image from 'next/image'
import { X, MoveRight } from 'lucide-react'
import type { PublicGalleryItem } from '@/lib/public-types'
import { Reveal } from './reveal'

export function GallerySection({ items }: { items: PublicGalleryItem[] }) {
  const [lightbox, setLightbox] = useState<string | null>(null)

  if (items.length === 0) return null

  const photos = items.filter((i) => i.kind !== 'ANTES_DEPOIS' && i.imageUrl)
  const transformations = items.filter((i) => i.kind === 'ANTES_DEPOIS' && i.beforeUrl && i.afterUrl)

  return (
    <section id="galeria" className="scroll-mt-20 border-y border-ink/8 bg-paper-deep/50">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
        {/* Cabeçalho */}
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="eyebrow flex items-center gap-3 text-bronze">
                <span className="h-px w-8 bg-bronze/60" aria-hidden="true" />
                Portfólio
              </p>
              <h2 className="font-display mt-4 text-3xl font-normal leading-[1.08] tracking-tight text-ink-deep sm:text-[2.75rem]">
                Trabalhos que falam
                <br />
                <em className="font-light italic text-bronze">por si.</em>
              </h2>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-ink/55">
              Pets limpos, estilosos e felizes — resultado do cuidado que a gente tem com
              cada um deles.
            </p>
          </div>
        </Reveal>

        {/* Masonry editorial */}
        {photos.length > 0 && (
          <div className="mt-12 columns-2 gap-4 lg:columns-3 [&>*]:mb-4">
            {photos.map((item, idx) => (
              <Reveal key={item.id} delay={(idx % 3) * 60} className="break-inside-avoid">
                <button
                  type="button"
                  onClick={() => setLightbox(item.imageUrl!)}
                  className="group block w-full text-left"
                  aria-label={item.caption || 'Abrir foto ampliada'}
                >
                  {/* Proporção natural da foto — nunca corta o pet */}
                  <div className="relative w-full overflow-hidden rounded-xl bg-paper-deep ring-1 ring-ink/5">
                    <Image
                      src={item.imageUrl!}
                      alt={item.caption || 'Trabalho realizado'}
                      width={800}
                      height={1000}
                      sizes="(max-width: 640px) 45vw, (max-width: 1024px) 45vw, 30vw"
                      className="w-full h-auto transition duration-700 group-hover:scale-[1.04]"
                    />
                  </div>
                  {item.caption && (
                    <p className="eyebrow mt-2.5 flex items-center gap-2 text-[0.625rem] text-ink/45">
                      <span className="h-px w-4 bg-bronze/50" aria-hidden="true" />
                      <span className="normal-case tracking-normal">{item.caption}</span>
                    </p>
                  )}
                </button>
              </Reveal>
            ))}
          </div>
        )}

        {/* Antes & Depois */}
        {transformations.length > 0 && (
          <div className="mt-16 lg:mt-20">
            <Reveal>
              <div className="rounded-2xl bg-ink texture-grain p-6 sm:p-10">
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="eyebrow text-bronze-soft">Antes &amp; depois</p>
                    <h3 className="font-display mt-2 text-2xl font-normal text-paper sm:text-3xl">
                      A transformação <em className="font-light italic text-bronze-soft">completa</em>.
                    </h3>
                  </div>
                  <p className="text-sm text-paper/55">
                    O poder de um bom banho e tosa — arraste os olhos da esquerda para a direita.
                  </p>
                </div>

                <div className="mt-8 grid gap-6 md:grid-cols-2">
                  {transformations.map((item, idx) => (
                    <Reveal key={item.id} delay={idx * 90}>
                      <figure>
                        <div className="grid grid-cols-2 overflow-hidden rounded-xl">
                          <div className="relative aspect-square">
                            <Image
                              src={item.beforeUrl!}
                              alt={`Antes — ${item.caption}`}
                              fill
                              sizes="(max-width: 768px) 45vw, 25vw"
                              className="object-cover"
                            />
                            <span className="absolute left-3 top-3 rounded-md bg-ink-deep/85 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-paper/90">
                              Antes
                            </span>
                          </div>
                          <div className="relative aspect-square">
                            <Image
                              src={item.afterUrl!}
                              alt={`Depois — ${item.caption}`}
                              fill
                              sizes="(max-width: 768px) 45vw, 25vw"
                              className="object-cover"
                            />
                            <span className="absolute right-3 top-3 rounded-md bg-bronze px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-ink-deep">
                              Depois
                            </span>
                          </div>
                        </div>
                        <figcaption className="font-display mt-3.5 flex items-center gap-2 text-[0.95rem] italic text-paper/70">
                          <MoveRight className="h-4 w-4 shrink-0 text-bronze-soft" aria-hidden="true" />
                          {item.caption || 'Transformação completa'}
                        </figcaption>
                      </figure>
                    </Reveal>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink-deep/90 p-4 backdrop-blur-sm"
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Foto ampliada"
        >
          <button
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-paper/90 text-ink transition hover:bg-paper"
            onClick={() => setLightbox(null)}
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
          <div
            className="relative h-[80vh] w-full max-w-3xl overflow-hidden rounded-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image src={lightbox} alt="Foto ampliada" fill className="object-contain" sizes="90vw" />
          </div>
        </div>
      )}
    </section>
  )
}
