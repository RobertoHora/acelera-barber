export interface OpeningHour {
  day: string;
  hours: string;
}

export interface GoogleChecklistItem {
  item: string;
  status: string;
}

export interface BookingInfo {
  status: string;
  label: string;
  url: string | null;
  upsellOpportunity: boolean;
}

export interface BarberCut {
  id: string;
  name: string;
  price: number;
  priceFormatted: string;
  durationMinutes: number;
  imageUrl: string;
}

export interface BarbershopLead {
  id: string;
  name: string;
  cleanName?: string;
  slug: string;
  aliases?: string[];
  phone?: string;
  whatsapp?: string;
  address?: string;
  neighborhood: string;
  city?: string;
  state?: string;
  lat?: number;
  lng?: number;
  distanceKm?: number;
  rating?: number;
  reviewsCount?: number;
  placeId?: string;
  reviewUrl: string;
  googleMapsUrl?: string;
  photosCount?: number;
  featuredImageUrl?: string;
  openingHours?: OpeningHour[];
  opportunityScore?: number;
  gaps?: string[];
  googleChecklist?: GoogleChecklistItem[];
  bookingInfo?: BookingInfo;
  instagram?: string;
  hours?: string;
  cuts?: BarberCut[];
  attributes?: Record<string, boolean>;
  actions?: Record<string, string>;
  leadStage?: string;
  leadSource?: string;
}

export interface CompetitorInfo {
  id: string;
  name: string;
  neighborhood: string;
  rating: number;
  reviewsCount: number;
  photosCount: number;
  whyBetter: string;
  highlights: string[];
}

export interface DiagnosisCriteria {
  id: number;
  name: string;
  done: boolean;
  weight: number;
  description: string;
  gapText: string;
}

export interface DiagnosisResult {
  score: number;
  label: string;
  criteria: DiagnosisCriteria[];
  gaps: string[];
}

export interface PlanFeature {
  text: string;
  highlight?: boolean;
}

export type PlanCode =
  | 'eleva_free'
  | 'eleva_google_pro'
  | 'eleva_complete'
  | 'eleva_complete_upgrade'
  | 'agenda_basic_monthly'
  | 'agenda_ai_monthly'
  | 'free'
  | 'google_pro'
  | 'complete';

export type PlanCategory = 'ONETIME_MODULE' | 'UPGRADE' | 'RECURRING_SUBSCRIPTION';

export interface PlanConfig {
  id: PlanCode;
  legacyAlias?: string;
  category: PlanCategory;
  name: string;
  price: number;
  priceCents: number;
  priceFormatted: string;
  badge?: string;
  description: string;
  features: string[];
  grantedTrialDays?: number;
  grantedTrialDaysDelta?: number;
  billingInterval?: 'ONETIME' | 'MONTHLY';
}

export interface PaymentIntentRecord {
  planId: string;
  planName: string;
  price: number;
  businessName: string;
  clientPhone: string;
  status: 'AWAITING_PAYMENT_LINK' | 'PAYMENT_LINK_OPENED' | 'PROOF_SUBMISSION_REQUESTED';
  createdAt: string;
}
