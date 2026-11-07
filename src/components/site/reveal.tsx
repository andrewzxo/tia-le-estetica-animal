'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

/** Wrapper que revela o conteúdo suavemente ao entrar na viewport */
export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode
  className?: string
  delay?: number
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Rede de segurança: nunca deixar o conteúdo invisível
    const timer = window.setTimeout(() => el.classList.add('reveal-visible'), 2500)

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.classList.add('reveal-visible')
            observer.unobserve(el)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -5% 0px' }
    )
    observer.observe(el)
    return () => {
      observer.disconnect()
      window.clearTimeout(timer)
    }
  }, [])

  return (
    <div ref={ref} className={cn('reveal', className)} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  )
}
