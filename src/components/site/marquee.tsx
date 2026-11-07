'use client'

const WORDS = ['banho', 'tosa', 'spa pet', 'hidratação', 'patinhas', 'carinho', 'bem-estar']

/** Faixa marquee editorial que separa o hero dos serviços */
export function Marquee() {
  const row = [...WORDS, ...WORDS, ...WORDS]
  return (
    <div
      className="overflow-hidden border-y border-ink/8 bg-paper py-4"
      aria-hidden="true"
    >
      <div className="animate-marquee flex w-max items-center">
        {[0, 1].map((half) => (
          <div key={half} className="flex items-center">
            {row.map((word, i) => (
              <span key={`${half}-${i}`} className="flex items-center">
                <span
                  className={`font-display px-6 text-lg italic text-ink/45 ${
                    i % 2 === 0 ? '' : 'not-italic text-bronze/70'
                  }`}
                >
                  {word}
                </span>
                <span className="text-[0.6rem] text-bronze">✦</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
