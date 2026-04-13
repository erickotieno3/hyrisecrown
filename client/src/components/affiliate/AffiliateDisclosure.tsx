/**
 * AffiliateDisclosure — Legal compliance components
 * Required by: FTC (16 CFR Part 255), UK ASA CAP Code Rule 2.1, Shopify Collabs ToS
 */

import { useState } from "react";
import { X, Info, ExternalLink, ChevronDown, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MEDISAVE_CONFIG } from "@/config/medisaveConfig";

// ── AD Tag ────────────────────────────────────────────────────────────────────
// Required: must appear on every card / link that earns commission

export function AdTag({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wide bg-amber-100 text-amber-700 border border-amber-300 ${className}`}
      title="This is an affiliate link. We may earn a commission."
      aria-label="Advertisement / Affiliate link"
    >
      AD
    </span>
  );
}

// ── Inline Disclosure Line ────────────────────────────────────────────────────

export function AffiliateInlineDisclosure() {
  return (
    <p className="text-xs text-gray-400 flex items-center gap-1">
      <AdTag />
      <span>Affiliate link · We earn {MEDISAVE_CONFIG.commissionRate} commission · No extra cost to you</span>
    </p>
  );
}

// ── Disclosure Banner ─────────────────────────────────────────────────────────
// Shown at top of every affiliate store screen — required by UK ASA & FTC

export function AffiliateDisclosureBanner({
  partner = MEDISAVE_CONFIG.brand,
  onViewFull,
}: {
  partner?: string;
  onViewFull?: () => void;
}) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">
      <Info className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-amber-900">
          <strong>#AD · Affiliate Content</strong> — This page contains affiliate links to{" "}
          <strong>{partner}</strong>. We earn a <strong>{MEDISAVE_CONFIG.commissionRate} commission</strong> on
          qualifying purchases at <strong>no extra cost to you</strong>. A {MEDISAVE_CONFIG.referralWindowDays}-day
          tracking cookie is placed when you click.
        </p>
        {onViewFull && (
          <button
            onClick={onViewFull}
            className="text-amber-700 underline text-xs mt-1 hover:text-amber-900"
          >
            View full disclosure →
          </button>
        )}
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="text-amber-400 hover:text-amber-700 shrink-0"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

// ── Full Disclosure Modal ─────────────────────────────────────────────────────
// Required by FTC: full disclosure must be accessible from all affiliate screens

export function AffiliateDisclosureModal({
  children,
}: {
  children?: React.ReactNode;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children || (
          <Button variant="ghost" size="sm" className="text-xs text-gray-500 hover:text-gray-700 h-7 px-2">
            <Shield className="h-3 w-3 mr-1" />
            View Full Disclosure
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Affiliate Disclosure
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-sm text-gray-700">
          <div className="bg-amber-50 border border-amber-200 rounded p-3">
            <p className="font-semibold text-amber-800 mb-1">
              #AD — Commercial Partnership
            </p>
            <p className="text-amber-700 text-xs">
              Per UK ASA CAP Code Rule 2.1 and the FTC's 16 CFR Part 255, we are required to
              clearly disclose commercial relationships before affiliate content is displayed.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <p className="font-semibold text-gray-900">Partnership Details</p>
              <ul className="mt-1 space-y-1 text-xs text-gray-600">
                <li>• <strong>Partner:</strong> {MEDISAVE_CONFIG.brand} (United Kingdom)</li>
                <li>• <strong>Programme:</strong> Shopify Collabs Affiliate Programme</li>
                <li>• <strong>Commission rate:</strong> {MEDISAVE_CONFIG.commissionRate} on qualifying purchases</li>
                <li>• <strong>Referral window:</strong> {MEDISAVE_CONFIG.referralWindowDays} days from your click</li>
                <li>• <strong>Payment holding:</strong> {MEDISAVE_CONFIG.paymentHoldingDays} days after order</li>
              </ul>
            </div>

            <div>
              <p className="font-semibold text-gray-900">What This Means for You</p>
              <ul className="mt-1 space-y-1 text-xs text-gray-600">
                <li>✅ You pay the <strong>exact same price</strong> whether you use our links or not</li>
                <li>✅ Our product recommendations are based on clinical relevance, <strong>not commission</strong></li>
                <li>✅ We <strong>do not share your personal data</strong> with {MEDISAVE_CONFIG.brand}</li>
                <li>✅ Only anonymised click data is used for commission tracking</li>
                <li>✅ You can opt out of tracking in our <a href="/privacy#affiliate-tracking" className="text-blue-600 underline">Privacy Policy</a></li>
              </ul>
            </div>

            <div>
              <p className="font-semibold text-gray-900">Cookie Tracking</p>
              <p className="text-xs text-gray-600">
                When you click any affiliate link, a {MEDISAVE_CONFIG.referralWindowDays}-day referral cookie is placed by{" "}
                {MEDISAVE_CONFIG.brand}. This is used solely to attribute your purchase for commission purposes.
                You can clear this at any time by clearing your browser cookies or using private/incognito mode.
              </p>
            </div>

            <div className="border-t pt-3">
              <p className="text-xs text-gray-500">
                For {MEDISAVE_CONFIG.brand}'s own privacy policy, visit:{" "}
                <a
                  href={MEDISAVE_CONFIG.privacyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline inline-flex items-center gap-1"
                >
                  medisave.co.uk/privacy-policy <ExternalLink className="h-3 w-3" />
                </a>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                To read our full Privacy Policy:{" "}
                <a href="/privacy" className="text-blue-600 underline">hyrisecrown.com/privacy</a>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                To read our full Terms of Service:{" "}
                <a href="/terms" className="text-blue-600 underline">hyrisecrown.com/terms</a>
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Legal Footer (shown at bottom of every affiliate store screen) ────────────

export function AffiliateLegalFooter({ partner = MEDISAVE_CONFIG.brand }: { partner?: string }) {
  return (
    <div className="border-t pt-4 mt-6 space-y-2">
      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
        <AdTag />
        <span>
          Affiliate content · {partner} · {MEDISAVE_CONFIG.commissionRate} commission ·{" "}
          {MEDISAVE_CONFIG.referralWindowDays}-day referral window
        </span>
        <AffiliateDisclosureModal />
      </div>
      <p className="text-xs text-gray-400">
        Prices are set by {partner}. Hyrise Crown is not responsible for product quality,
        availability, or delivery. UK consumer law applies to all purchases made on{" "}
        {MEDISAVE_CONFIG.baseUrl}.
      </p>
    </div>
  );
}
