import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ExternalLink, ShoppingBag, Star, Clock, Percent, Shield, AlertCircle } from "lucide-react";
import {
  AffiliateDisclosureBanner,
  AffiliateDisclosureModal,
  AffiliateLegalFooter,
  AdTag,
} from "@/components/affiliate/AffiliateDisclosure";
import {
  MEDISAVE_CONFIG,
  MEDISAVE_CATEGORIES,
  MEDISAVE_BRANDS,
  buildMedisaveUrl,
} from "@/config/medisaveConfig";
import { trackAffiliateClick, recordMedisaveClick } from "@/lib/affiliate";

function handleMedisaveClick(name: string, path: string, campaign: string) {
  recordMedisaveClick();
  const url = buildMedisaveUrl(path, campaign);
  trackAffiliateClick("Medisave UK", undefined, name, url);
  window.open(url, "_blank", "noopener,noreferrer");
}

export default function MedisaveStorePage() {
  const [showModal, setShowModal] = useState(false);
  const [clicked, setClicked] = useState<string | null>(null);

  function onCategoryClick(cat: typeof MEDISAVE_CATEGORIES[0]) {
    setClicked(cat.id);
    handleMedisaveClick(cat.name, cat.path, cat.campaign);
  }

  function onShopAll() {
    handleMedisaveClick("All Products", "", "homepage");
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">

      {/* ── Legal Disclosure Banner — REQUIRED by UK ASA & FTC ── */}
      <AffiliateDisclosureBanner
        onViewFull={() => setShowModal(true)}
      />
      {showModal && <AffiliateDisclosureModal><span /></AffiliateDisclosureModal>}

      {/* ── Hero ── */}
      <div className="rounded-2xl bg-gradient-to-br from-blue-700 to-blue-900 text-white p-8">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <Badge className="bg-white/20 text-white border-0 text-xs">Shopify Collabs Partner</Badge>
              <Badge className="bg-green-400/20 text-green-200 border-0 text-xs">5% Commission</Badge>
              <AdTag className="bg-amber-400/20 text-amber-200 border-amber-400/30" />
            </div>
            <h1 className="text-3xl font-bold mb-2">{MEDISAVE_CONFIG.brand}</h1>
            <p className="text-blue-100 text-lg mb-1">Professional Medical Supplies</p>
            <p className="text-blue-200 text-sm mb-4">
              UK's leading supplier of clinical equipment for hospitals, GP surgeries, nursing homes,
              medical students and healthcare professionals.
            </p>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-1.5 text-sm text-blue-100">
                <Percent className="h-4 w-4" /> {MEDISAVE_CONFIG.commissionRate} commission on every sale
              </div>
              <div className="flex items-center gap-1.5 text-sm text-blue-100">
                <Clock className="h-4 w-4" /> {MEDISAVE_CONFIG.referralWindowDays}-day referral window
              </div>
              <div className="flex items-center gap-1.5 text-sm text-blue-100">
                <Shield className="h-4 w-4" /> UK-regulated medical supplies
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center gap-3 shrink-0">
            <div className="text-6xl">🏥</div>
            <Button
              onClick={onShopAll}
              className="bg-white text-blue-800 hover:bg-blue-50 font-semibold px-6"
              size="lg"
            >
              <ShoppingBag className="h-4 w-4 mr-2" />
              Shop Medisave UK
              <ExternalLink className="h-3 w-3 ml-2" />
            </Button>
            <p className="text-xs text-blue-300 flex items-center gap-1">
              <AdTag className="bg-amber-400/20 text-amber-200 border-amber-400/30" />
              Affiliate link
            </p>
          </div>
        </div>
      </div>

      {/* ── Featured Brands ── */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Featured Brands</h2>
        <div className="flex flex-wrap gap-2">
          {MEDISAVE_BRANDS.map((brand) => (
            <Badge key={brand.name} variant="outline" className="py-1.5 px-3 text-sm">
              <Star className="h-3 w-3 mr-1 text-yellow-500" />
              {brand.name}
              <span className="text-gray-400 ml-1 text-xs">· {brand.specialty}</span>
            </Badge>
          ))}
        </div>
      </div>

      <Separator />

      {/* ── Product Categories — each card has AD tag ── */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-xl font-bold text-gray-900">Shop by Category</h2>
          <AdTag />
        </div>
        <p className="text-sm text-gray-500 mb-5">
          All links are affiliate links. We earn {MEDISAVE_CONFIG.commissionRate} on qualifying purchases.{" "}
          <AffiliateDisclosureModal />
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {MEDISAVE_CATEGORIES.map((cat) => (
            <Card
              key={cat.id}
              className={`cursor-pointer transition-all hover:shadow-md hover:border-blue-300 ${
                clicked === cat.id ? "border-blue-500 bg-blue-50" : ""
              }`}
              onClick={() => onCategoryClick(cat)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <span className="text-3xl">{cat.icon}</span>
                  <div className="flex items-center gap-1">
                    <AdTag />
                    <Badge variant="secondary" className="text-xs">{cat.bestFor}</Badge>
                  </div>
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
                  onClick={(e) => { e.stopPropagation(); onCategoryClick(cat); }}
                >
                  Browse {cat.name}
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* ── Partnership Status Banner ── */}
      {!MEDISAVE_CONFIG.isApproved && (
        <Alert className="border-yellow-300 bg-yellow-50">
          <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0" />
          <AlertDescription className="text-yellow-800 text-sm">
            <p className="font-semibold mb-1">Partnership Application Pending</p>
            <p>
              Your Shopify Collabs application with Medisave UK is under review. Once approved, add your
              affiliate ID as <code className="bg-yellow-100 px-1 rounded text-xs">VITE_MEDISAVE_AFFILIATE_ID</code> in
              Replit Secrets and all links will automatically update. Check{" "}
              <strong>erickotienokjv@gmail.com</strong> for the approval email.
            </p>
          </AlertDescription>
        </Alert>
      )}

      {/* ── Legal Footer — REQUIRED on every affiliate screen ── */}
      <AffiliateLegalFooter />

    </div>
  );
}
