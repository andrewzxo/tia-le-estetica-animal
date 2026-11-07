export type PublicService = {
  id: string
  name: string
  description: string
  durationMin: number
  priceOnConsult: boolean
  basePrice: number
  smallPrice: number | null
  mediumPrice: number | null
  largePrice: number | null
  catPrice: number | null
  species: string
  imageUrl: string | null
  active: boolean
  isExample: boolean
  sortOrder: number
}

export type PublicSettings = {
  id: string
  businessName: string
  logoUrl: string | null
  phone: string
  whatsapp: string
  address: string
  instagram: string
  facebook: string
  heroTitle: string
  heroSubtitle: string
  heroImageUrl: string | null
  aboutTitle: string
  aboutText: string
  hoursNote: string
  waBookingTemplate: string
  updatedAt: string
}

export type PublicGalleryItem = {
  id: string
  kind: string
  imageUrl: string | null
  beforeUrl: string | null
  afterUrl: string | null
  caption: string
  visible: boolean
  isExample: boolean
  sortOrder: number
}

export type PublicTestimonial = {
  id: string
  customerName: string
  petName: string
  text: string
  rating: number
  visible: boolean
  isExample: boolean
  sortOrder: number
}

export type WorkingHoursType = {
  id: string
  weekday: number
  enabled: boolean
  openMin: number
  closeMin: number
  lunchStartMin: number | null
  lunchEndMin: number | null
  slotIntervalMin: number
  gapMin: number
  capacity: number
}

export type ExceptionType = {
  id: string
  date: string
  type: string
  startMin: number | null
  endMin: number | null
  reason: string
}

export type BootstrapData = {
  settings: PublicSettings
  services: PublicService[]
  gallery: PublicGalleryItem[]
  testimonials: PublicTestimonial[]
  workingHours: WorkingHoursType[]
  exceptions: ExceptionType[]
}
