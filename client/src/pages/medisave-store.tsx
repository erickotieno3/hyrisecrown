import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  ExternalLink, Info, ShoppingBag, Star, Shield,
  Stethoscope, Heart, Package, AlertCircle, Clock, Percent
} from "lucide-react";
import { trackAffiliateClick } from "@/lib/affiliate";

const MEDISAVE_BASE_URL = "https://www.medisave.co.uk";
const AFFILIATE_ID = "hyrisecrown"; // Update when Shopify Collabs approves and provides your affiliate ID/link

function buildMedisaveUrl(path = "", campaign = "general") {
  const url = new URL(MEDISAVE_BASE_URL + path);
  url.searchParams.set("utm_source", "hyrisecrown");
  url.searchParams.set("utm_medium", "affiliate");
  url.searchParams.set("utm_campaign", campaign);
  url.searchParams.set("ref", AFFILIATE_ID);
  return url.toString();
}

const PRODUCT_CATEGORIES = [
  {
    name: "Stethoscopes",
    icon: "🩺",
    description: "Littmann, 3M and professional-grade stethoscopes for doctors, nurses and students.",
    campaign: "stethoscopes",
    path: "/stethoscopes",
    highlights: ["3M Littmann Classic III", "Cardiology IV", "Electronic Stethoscopes"],
    bestFor: "Medical students & clinicians",
  },
  {
    name: "Diagnostic Sets",
    icon: "🔦",
    description: "Welch Allyn otoscopes, ophthalmoscopes and full diagnostic kits.",
    campaign: "diagnostics",
    path: "/diagnostic-sets",
    highlights: ["Welch Allyn PocketScope", "Otoscope & Ophthalmoscope Sets", "Ophthalmoscopes"],
    bestFor: "GPs & hospital doctors",
  },
  {
    name: "First Aid Kits",
    icon: "🧰",
    description: "HSE-compliant first aid kits for workplaces, schools and home.",
    campaign: "firstaid",
    path: "/first-aid-kits",
    highlights: ["HSE Workplace Kits", "Travel First Aid", "Burns Kits"],
    bestFor: "Offices, schools & public venues",
  },
  {
    name: "Medical Gloves",
    icon: "🧤",
    description: "Latex, nitrile and vinyl medical gloves in bulk for clinical use.",
    campaign: "gloves",
    path: "/disposable-gloves",
    highlights: ["Nitrile Examination Gloves", "Latex Gloves", "Vinyl Gloves"],
    bestFor: "Nursing homes & GP surgeries",
  },
  {
    name: "Medical Disposables",
    icon: "💊",
    description: "Syringes, dressings, wound care and everyday medical consumables.",
    campaign: "disposables",
    path: "/medical-supplies",
    highlights: ["Wound Dressings", "Syringes & Needles", "Bandages"],
    bestFor: "Hospitals & clinics",
  },
  {
    name: "Blood Pressure Monitors",
    icon: "📊",
    description: "Clinical and home blood pressure monitors from leading brands.",
    campaign: "bp-monitors",
    path: "/blood-pressure-monitors",
    highlights: ["Omron BP Monitors", "Wrist Monitors", "Professional Sphygmomanometers"],
    bestFor: "Home monitoring & practices",
  },
];

const FEATURED_BRANDS = [
  { name: "3M Littmann", specialty: "Stethoscopes" },
  { name: "Welch Allyn", specialty: "Diagnostics" },
  { name: "Omron", specialty: "BP Monitors" },
  { name: "Ansell", specialty: "Gloves" },
  { name: "Smith & Nephew", specialty: "Wound Care" },
];

export default function MedisaveStorePage() {
  const [clickedCategory, setClickedCategory] = useState<string | null>(null);

  function handleCategoryClick(category: typeof PRODUCT_CATEGORIES[0]) {
    setClickedCategory(category.name);
    const url = buildMedisaveUrl(category.path, category.campaign);
    trackAffiliateClick("Medisave UK", undefined, category.name, url);
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function handleShopAllClick() {
    const url = buildMedisaveUrl("", "homepage");
    trackAffiliateClick("Medisave UK", undefined, "All Products", url);
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">

      {/* ── Legal Affiliate Disclosure (required by FTC, UK ASA & Shopify Collabs) ── */}
      <Alert className="border-blue-200 bg-blue-50">
        <Info className="h-4 w-4 text-blue-600 shrink-0" />
        <AlertDescription className="text-blue-800 text-sm">
          <strong>Affiliate Disclosure:</strong> Hyrise Crown has a commercial partnership with Medisave UK through the Shopify Collabs affiliate programme. We may earn a 5% commission when you purchase through our links, at no extra cost to you. This does not influence our recommendations. A 90-day referral cookie is placed when you click our links.{" "}
          <a href="/privacy#affiliate-tracking" className="underline">Learn more in our Privacy Policy</a>.
        </AlertDescription>
      </Alert>

      {/* ── Hero ── */}
      <div className="rounded-2xl bg-gradient-to-br from-blue-700 to-blue-900 text-white p-8">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Badge className="bg-white/20 text-white border-0 text-xs">Shopify Collabs Partner</Badge>
              <Badge className="bg-green-400/20 text-green-200 border-0 text-xs">5% Commission</Badge>
            </div>
            <h1 className="text-3xl font-bold mb-2">Medisave UK</h1>
            <p className="text-blue-100 text-lg mb-1">Professional Medical Supplies</p>
            <p className="text-blue-200 text-sm mb-4">
              UK's leading supplier of clinical equipment for hospitals, GP surgeries, nursing homes,
              medical students and healthcare professionals.
            </p>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-1.5 text-sm text-blue-100">
                <Percent className="h-4 w-4" /> 5% commission on every sale
              </div>
              <div className="flex items-center gap-1.5 text-sm text-blue-100">
                <Clock className="h-4 w-4" /> 90-day referral window
              </div>
              <div className="flex items-center gap-1.5 text-sm text-blue-100">
                <Shield className="h-4 w-4" /> UK-regulated medical supplies
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="text-6xl">🏥</div>
            <Button
              onClick={handleShopAllClick}
              className="bg-white text-blue-800 hover:bg-blue-50 font-semibold px-6"
              size="lg"
            >
              <ShoppingBag className="h-4 w-4 mr-2" />
              Shop Medisave UK
              <ExternalLink className="h-3 w-3 ml-2" />
            </Button>
          </div>
        </div>
      </div>

      {/* ── Featured Brands ── */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Featured Brands</h2>
        <div className="flex flex-wrap gap-2">
          {FEATURED_BRANDS.map((brand) => (
            <Badge key={brand.name} variant="outline" className="py-1.5 px-3 text-sm">
              <Star className="h-3 w-3 mr-1 text-yellow-500" />
              {brand.name}
              <span className="text-gray-400 ml-1 text-xs">· {brand.specialty}</span>
            </Badge>
          ))}
        </div>
      </div>

      <Separator />

      {/* ── Product Categories ── */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Shop by Category</h2>
        <p className="text-sm text-gray-500 mb-5">
          Click any category to browse products on Medisave UK. Our affiliate link tracks your visit for 90 days.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {PRODUCT_CATEGORIES.map((cat) => (
            <Card
              key={cat.name}
              className={`cursor-pointer transition-all hover:shadow-md hover:border-blue-300 ${
                clickedCategory === cat.name ? "border-blue-500 bg-blue-50" : ""
              }`}
              onClick={() => handleCategoryClick(cat)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <span className="text-3xl">{cat.icon}</span>
                  <Badge variant="secondary" className="text-xs">{cat.bestFor}</Badge>
                </div>
                <CardTitle className="text-base mt-2">{cat.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600">{cat.description}</p>
                <ul className="space-y-1">
                  {cat.highlights.map((h) => (
                    <li key={h} className="text-xs text-gray-500 flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-blue-400 shrink-0" />
                      {h}
                    </li>
                  ))}
                </ul>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-blue-700 border-blue-200 hover:bg-blue-50"
                  onClick={(e) => { e.stopPropagation(); handleCategoryClick(cat); }}
                >
                  Browse {cat.name}
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Separator />

      {/* ── Legal Compliance Section ── */}
      <Card className="border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4 text-gray-600" />
            Partnership & Legal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-gray-600">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="font-semibold text-gray-800">Affiliate Partnership Details</p>
              <p>Partner: Medisave UK Ltd (United Kingdom)</p>
              <p>Programme: Shopify Collabs</p>
              <p>Commission: 5% on completed orders</p>
              <p>Referral window: 90 days from click</p>
              <p>Payment holding: 30 days after order</p>
            </div>
            <div className="space-y-1">
              <p className="font-semibold text-gray-800">Your Rights</p>
              <p>• Prices on Medisave are unaffected by our links</p>
              <p>• You can opt out of tracking in our <a href="/privacy" className="text-blue-600 underline">Privacy Policy</a></p>
              <p>• UK consumer law applies to all purchases</p>
              <p>• Returns handled directly by Medisave UK</p>
            </div>
          </div>
          <Alert className="border-orange-200 bg-orange-50">
            <AlertCircle className="h-4 w-4 text-orange-600 shrink-0" />
            <AlertDescription className="text-orange-800 text-xs">
              <strong>UK ASA & FTC Compliance:</strong> Hyrise Crown is an affiliate of Medisave UK. All product links on this page are affiliate links. We are required by the UK Advertising Standards Authority (ASA) and the FTC to disclose this commercial relationship clearly and prominently.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* ── Partnership Status ── */}
      <Card className="border-dashed border-yellow-300 bg-yellow-50">
        <CardContent className="pt-5 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-800">
            <p className="font-semibold mb-1">Partnership Application Pending</p>
            <p>
              Your Shopify Collabs application with Medisave UK is currently under review. Once approved,
              you will receive your unique affiliate link and discount codes. All links above will continue
              tracking visits during this period. Check your email at{" "}
              <strong>erickotienokjv@gmail.com</strong> for approval notifications.
            </p>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
