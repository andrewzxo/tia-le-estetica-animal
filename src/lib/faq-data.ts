/** Perguntas frequentes — conteúdo usado tanto na seção visual quanto no JSON-LD (FAQPage) */
export type FaqItem = { question: string; answer: string }

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'Preciso agendar com antecedência?',
    answer:
      'Sim! Atendemos com hora marcada para que cada pet receba atenção individual, sem espera e sem estresse. Você pode agendar aqui mesmo pelo site, em poucos cliques, ou falar com a gente no WhatsApp. Recomendamos agendar com 1 a 2 dias de antecedência — principalmente aos sábados, quando a agenda costuma preencher rápido.',
  },
  {
    question: 'Meu pet precisa estar com a vacinação em dia?',
    answer:
      'Sim, pedimos que a carteira de vacinação esteja em dia (V8 ou V10 para cães e V4 ou V5 para gatos) e que a vermifugação esteja recente. Assim protegemos a saúde do seu pet e de todos os outros que frequentam o espaço. Também não atendemos cães com comportamento agressivo ou que estejam com pulgas e carrapatos — segurança e higiene vêm primeiro.',
  },
  {
    question: 'Com que frequência devo levar meu pet para banho e tosa?',
    answer:
      'Depende da pelagem e da rotina: pelos curtos (pinscher, labrador, beagle) geralmente ficam bem com banho a cada 30–45 dias; pelos médios e longos (shih tzu, lhasa apso, maltês, poodle, spitz alemão) pedem banho e tosa a cada 15–21 dias para manter o pelo sempre sem nós. Gatos normalmente vão bem a cada 1–2 meses. Na dúvida, a gente ajuda a montar a rotina ideal para o seu companheiro.',
  },
  {
    question: 'Vocês atendem filhotes e pets idosos?',
    answer:
      'Atendemos com todo cuidado especial! Filhotes podem vir conhecer o espaço e ter o primeiro banho quando o veterinário liberar, normalmente após o ciclo inicial de vacinas — a experiência é tranquila para não gerar medo do banho. Pets idosos recebem ritmo mais devagar, atenção redobrada e menos tempo na banheira e na mesa, respeitando o limite de cada um.',
  },
  {
    question: 'Como funciona o táxi dog?',
    answer:
      'É simples: na hora de agendar, marque a opção de táxi dog. Buscamos seu pet em casa e levamos de volta depois do serviço, com todo cuidado e segurança. O adicional é de R$ 10,00 para buscar e levar, e está disponível para qualquer serviço.',
  },
]
