/** URL canônica do site (sem barra final). Configure NEXT_PUBLIC_SITE_URL em produção. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://tialeesteticaanimal.com.br"
).replace(/\/+$/, "");

/** Dados públicos da empresa usados em SEO/JSON-LD */
export const SITE_NAME = "Tia Lê Estética Animal";
export const SITE_ALTERNATE_NAME = "Lê bicho mimado BANHO E TOSA";
export const SITE_DESCRIPTION =
  "Banho, tosa e estética animal para cães e gatos com carinho de quem ama pets. Agende online em poucos cliques — e conte com o táxi dog (buscar e levar).";
export const SITE_PHONE_DISPLAY = "(19) 98904-4489";
export const SITE_PHONE_E164 = "+5519989044489";
export const SITE_WHATSAPP = "5519989044489";
export const SITE_INSTAGRAM_HANDLE = "tiale.esteticaanimal";
export const SITE_INSTAGRAM_URL = `https://instagram.com/${SITE_INSTAGRAM_HANDLE}`;
