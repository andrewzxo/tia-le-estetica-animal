import type { Metadata, Viewport } from "next";
import { Fraunces, Instrument_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { GoogleAnalytics, MicrosoftClarity } from "@/components/analytics";
import {
  SITE_URL,
  SITE_NAME,
  SITE_ALTERNATE_NAME,
  SITE_DESCRIPTION,
  SITE_PHONE_E164,
  SITE_INSTAGRAM_URL,
  SITE_WHATSAPP,
} from "@/lib/site-url";

const instrument = Instrument_Sans({
  variable: "--font-sans-instrument",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-display-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const OG_IMAGE = "/uploads/og-tia-le.png";
const OG_IMAGE_ALT = "Tia Lê Estética Animal — banho, tosa e estética animal";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | Banho, tosa e cuidado com amor`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "banho e tosa",
    "estética animal",
    "pet shop",
    "grooming",
    "banho para cachorro",
    "tosa para cachorro",
    "cachorro",
    "gato",
    "táxi dog",
    "agendamento online",
    "pet shop com agendamento",
    "Lê bicho mimado",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "/",
    siteName: SITE_NAME,
    title: `${SITE_NAME} | Banho, tosa e muito carinho`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: OG_IMAGE_ALT,
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | Banho, tosa e muito carinho`,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  verification: {
    // Cole o código de verificação do Google Search Console no .env
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
  },
  category: "Estética animal",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1d2b4e",
};

/** Dados estruturados (schema.org) para o Google entender o negócio */
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "PetGroomer",
  "@id": `${SITE_URL}/#petshop`,
  name: SITE_NAME,
  alternateName: SITE_ALTERNATE_NAME,
  description: SITE_DESCRIPTION,
  url: SITE_URL,
  telephone: SITE_PHONE_E164,
  image: `${SITE_URL}${OG_IMAGE}`,
  logo: `${SITE_URL}/uploads/logo-tia-le-v2.webp`,
  priceRange: "R$ 25 - R$ 110",
  currenciesAccepted: "BRL",
  paymentAccepted: "PIX, Cartão de crédito, Cartão de débito, Dinheiro",
  sameAs: [SITE_INSTAGRAM_URL],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "reservations",
    telephone: SITE_PHONE_E164,
    availableLanguage: ["Portuguese"],
    url: `https://wa.me/${SITE_WHATSAPP}`,
  },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "18:00",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: "Saturday",
      opens: "09:00",
      closes: "17:00",
    },
  ],
  makesOffer: [
    ...[
      { name: "Banho Simples", price: 50, desc: "Banho completo com shampoo e condicionador premium, secagem, escovação, limpeza de ouvidos e perfume." },
      { name: "Tosa Higiênica", price: 40, desc: "Acabamento nas regiões íntimas, patinhas, face e olhos para manter a higiene entre banhos." },
      { name: "Tosa na Máquina", price: 45, desc: "Tosa completa feita na máquina, no comprimento que você preferir." },
      { name: "Tosa na Tesoura", price: 70, desc: "Tosa artística toda feita na tesoura, com acabamento fino." },
      { name: "Hidratação", price: 30, desc: "Hidratação profunda da pelagem e da pele para deixar o pelo macio, brilhante e saudável." },
      { name: "Desembolo", price: 25, desc: "Remoção cuidadosa de nós e embaraços da pelagem, sem estressar o pet." },
    ].map((s) => ({
      "@type": "Offer",
      name: s.name,
      description: s.desc,
      priceSpecification: {
        "@type": "PriceSpecification",
        minPrice: s.price,
        priceCurrency: "BRL",
      },
      itemOffered: { "@type": "Service", name: s.name, serviceType: "Banho e tosa" },
    })),
    {
      "@type": "Offer",
      name: "Táxi dog (adicional)",
      description: "Buscar e levar o pet — adicional opcional de R$ 10,00 para qualquer serviço.",
      priceSpecification: {
        "@type": "PriceSpecification",
        price: 10,
        priceCurrency: "BRL",
      },
      itemOffered: { "@type": "Service", name: "Táxi dog", serviceType: "Transporte de animais" },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${instrument.variable} ${fraunces.variable} font-sans antialiased bg-background text-foreground`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
        <GoogleAnalytics />
        <MicrosoftClarity />
        <Toaster />
      </body>
    </html>
  );
}
