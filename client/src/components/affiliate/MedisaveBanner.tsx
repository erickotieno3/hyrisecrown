import { useState } from "react";
import { X, ExternalLink, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trackAffiliateClick } from "@/lib/affiliate";

const MEDISAVE_URL = "https://www.medisave.co.uk/?utm_source=hyrisecrown&utm_medium=affiliate&utm_campaign=banner&ref=hyrisecrown";

export function MedisaveBanner() {
  const [dismissed, setDismissed] = useState(() =>
    sessionStorage.getItem("medisave_banner_dismissed") === "1"
  );

  if (dismissed) return null;

  function handleClick() {
    trackAffiliateClick("Medisave UK", undefined, "Banner Click", MEDISAVE_URL);
    window.open(MEDISAVE_URL, "_blank", "noopener,noreferrer");
  }

  function handleDismiss() {
    sessionStorage.setItem("medisave_banner_dismissed", "1");
    setDismissed(true);
  }

  return (
    <div className="bg-gradient-to-r from-blue-700 to-blue-800 text-white px-4 py-2.5">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Stethoscope className="h-4 w-4 shrink-0 text-blue-200" />
          <p className="text-sm truncate">
            <span className="font-semibold">Medisave UK</span>
            <span className="text-blue-200 ml-2 hidden sm:inline">Professional medical supplies — stethoscopes, diagnostic kits & more</span>
          </p>
          <span className="text-xs text-blue-300 shrink-0 hidden md:inline">
            #ad · Affiliate
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            onClick={handleClick}
            className="bg-white text-blue-800 hover:bg-blue-50 text-xs font-semibold h-7 px-3"
          >
            Shop Now <ExternalLink className="h-3 w-3 ml-1" />
          </Button>
          <button
            onClick={handleDismiss}
            className="text-blue-300 hover:text-white transition-colors p-1"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
