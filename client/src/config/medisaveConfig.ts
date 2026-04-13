/**
 * Medisave UK Affiliate Configuration
 *
 * HOW TO ACTIVATE YOUR AFFILIATE ID:
 * 1. When Shopify Collabs approves your application, you will receive an affiliate ID/link.
 * 2. Add it as an environment variable in Replit Secrets:
 *       Name:  VITE_MEDISAVE_AFFILIATE_ID
 *       Value: your-affiliate-id-from-shopify-collabs
 * 3. The entire app will automatically use your new ID — no code changes needed.
 */

export const MEDISAVE_CONFIG = {
  brand: "Medisave UK",
  baseUrl: "https://www.medisave.co.uk",
  privacyUrl: "https://www.medisave.co.uk/privacy-policy",
  commissionRate: "5%",
  referralWindowDays: 90,
  paymentHoldingDays: 30,
  utmSource: "hyrisecrown",
  utmMedium: "affiliate",

  // Affiliate ID — auto-populated from env var when approved; falls back to pending placeholder
  affiliateId: import.meta.env.VITE_MEDISAVE_AFFILIATE_ID || "PENDING_APPROVAL",

  // Status — changes automatically when env var is set
  get isApproved() {
    return this.affiliateId !== "PENDING_APPROVAL";
  },
};

/**
 * Build a tracked affiliate URL for any Medisave page or product
 */
export function buildMedisaveUrl(
  path = "",
  campaign = "general",
  productSlug?: string
): string {
  const url = new URL(MEDISAVE_CONFIG.baseUrl + path);
  url.searchParams.set("utm_source", MEDISAVE_CONFIG.utmSource);
  url.searchParams.set("utm_medium", MEDISAVE_CONFIG.utmMedium);
  url.searchParams.set("utm_campaign", campaign);

  if (MEDISAVE_CONFIG.isApproved) {
    url.searchParams.set("ref", MEDISAVE_CONFIG.affiliateId);
    url.searchParams.set("aff", MEDISAVE_CONFIG.affiliateId);
  }

  if (productSlug) {
    url.searchParams.set("product", productSlug);
  }

  return url.toString();
}

export const MEDISAVE_CATEGORIES = [
  {
    id: "stethoscopes",
    name: "Stethoscopes",
    icon: "🩺",
    path: "/stethoscopes",
    campaign: "stethoscopes",
    description: "Littmann, 3M and professional-grade stethoscopes for doctors, nurses and students.",
    highlights: ["3M Littmann Classic III", "Cardiology IV", "Electronic Stethoscopes"],
    bestFor: "Medical students & clinicians",
  },
  {
    id: "diagnostics",
    name: "Diagnostic Sets",
    icon: "🔦",
    path: "/diagnostic-sets",
    campaign: "diagnostics",
    description: "Welch Allyn otoscopes, ophthalmoscopes and full diagnostic kits.",
    highlights: ["Welch Allyn PocketScope", "Otoscope & Ophthalmoscope Sets", "Ophthalmoscopes"],
    bestFor: "GPs & hospital doctors",
  },
  {
    id: "firstaid",
    name: "First Aid Kits",
    icon: "🧰",
    path: "/first-aid-kits",
    campaign: "firstaid",
    description: "HSE-compliant first aid kits for workplaces, schools and home.",
    highlights: ["HSE Workplace Kits", "Travel First Aid", "Burns Kits"],
    bestFor: "Offices, schools & public venues",
  },
  {
    id: "gloves",
    name: "Medical Gloves",
    icon: "🧤",
    path: "/disposable-gloves",
    campaign: "gloves",
    description: "Latex, nitrile and vinyl medical gloves in bulk for clinical use.",
    highlights: ["Nitrile Examination Gloves", "Latex Gloves", "Vinyl Gloves"],
    bestFor: "Nursing homes & GP surgeries",
  },
  {
    id: "disposables",
    name: "Medical Disposables",
    icon: "💊",
    path: "/medical-supplies",
    campaign: "disposables",
    description: "Syringes, dressings, wound care and everyday medical consumables.",
    highlights: ["Wound Dressings", "Syringes & Needles", "Bandages"],
    bestFor: "Hospitals & clinics",
  },
  {
    id: "bp-monitors",
    name: "Blood Pressure Monitors",
    icon: "📊",
    path: "/blood-pressure-monitors",
    campaign: "bp-monitors",
    description: "Clinical and home blood pressure monitors from leading brands.",
    highlights: ["Omron BP Monitors", "Wrist Monitors", "Professional Sphygmomanometers"],
    bestFor: "Home monitoring & practices",
  },
];

export const MEDISAVE_BRANDS = [
  { name: "3M Littmann", specialty: "Stethoscopes" },
  { name: "Welch Allyn", specialty: "Diagnostics" },
  { name: "Omron", specialty: "BP Monitors" },
  { name: "Ansell", specialty: "Gloves" },
  { name: "Smith & Nephew", specialty: "Wound Care" },
];
