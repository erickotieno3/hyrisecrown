import { ArrowLeft, CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PlayConsoleHandoffPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-2 mb-8">
        <Link href="/">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Play Console Handoff</h1>
          <p className="text-muted-foreground">Everything you need to copy into Google Play Console</p>
        </div>
      </div>

      <div className="space-y-6">
        <Card className="border-green-200">
          <CardHeader><CardTitle className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-600" /> Ready in App</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-2">
            <p>These are already implemented in the app:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
              <li>Data Safety page</li>
              <li>Permission rationale dialogs</li>
              <li>Affiliate disclosures and store page</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Safe Reference Links</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-2">
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li><a href="/privacy" className="text-blue-600 underline">/privacy</a></li>
              <li><a href="/terms" className="text-blue-600 underline">/terms</a></li>
              <li><a href="/data-safety" className="text-blue-600 underline">/data-safety</a></li>
              <li><a href="/medisave" className="text-blue-600 underline">/medisave</a></li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Store Listing Text</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <p className="font-medium mb-1">App name</p>
              <p className="text-muted-foreground">Hyrise Crown Price Comparison</p>
            </div>
            <div>
              <p className="font-medium mb-1">Short description</p>
              <p className="text-muted-foreground">Compare grocery and household prices across stores with AI search and voice search.</p>
            </div>
            <div>
              <p className="font-medium mb-1">Full description add-on</p>
              <p className="text-muted-foreground">
                Hyrise Crown Price Comparison helps shoppers compare grocery and household prices across multiple stores and marketplaces in one place. Use AI-powered product discovery, voice search, and live updates to find product information faster. The app includes affiliate disclosures so you know when a link may earn us a commission.
                <br /><br />
                Browse retailer links, save time, and make informed buying decisions with a simple shopping experience built for clarity and transparency. We also support Medisave UK affiliate shopping for medical supplies, with disclosure shown before any affiliate content.
                <br /><br />
                Your privacy matters. We explain what data we collect, why we collect it, and how you can manage or delete it in our Privacy Policy. Camera access is used only for visual product search, microphone access is used only for voice search, and notifications are used only for price alerts you request.
                <br /><br />
                Hyrise Crown is designed for transparent shopping, clear comparisons, and helpful guidance across regions and stores.
              </p>
            </div>
            <div>
              <p className="font-medium mb-1">What to set in Play Console</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Contains Ads: Yes</li>
                <li>Category: Health & Fitness</li>
                <li>Privacy Policy URL: https://hyrisecrown.com/privacy</li>
                <li>Terms URL: https://hyrisecrown.com/terms</li>
                <li>Data Safety URL: https://hyrisecrown.com/data-safety</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Release Notes</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="text-muted-foreground">Initial release of the global price comparison app with AI search, voice search, and affiliate shopping support.</p>
            <pre className="bg-gray-50 rounded p-3 text-xs overflow-x-auto">
Compare grocery prices across Tesco, Walmart, Carrefour and more.
Features voice search, AI product scanner, and real-time price tracking.
            </pre>
          </CardContent>
        </Card>

        <Card className="border-yellow-200">
          <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-yellow-600" /> Console-only steps</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-2">
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Upload the signed .aab</li>
              <li>Complete Content rating</li>
              <li>Complete Data Safety questionnaire</li>
              <li>Set up App integrity / signing</li>
              <li>Confirm the SHA-256 fingerprint in assetlinks.json</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Video URLs to add in Play Console</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-3">
            <div>
              <p className="font-medium mb-1">Spatial XR video</p>
              <p className="text-muted-foreground">Add a public or unlisted YouTube video with ads off and no age restriction. This should be 360°, 180°, or 3D if you use the spatial XR slot.</p>
            </div>
            <div>
              <p className="font-medium mb-1">Non-spatial XR video</p>
              <p className="text-muted-foreground">Add a public or unlisted YouTube video with ads off and no age restriction for the non-spatial XR slot.</p>
            </div>
            <div>
              <p className="font-medium mb-1">Standard app video</p>
              <p className="text-muted-foreground">Add a public or unlisted YouTube video with ads off and no age restriction for the regular app preview slot.</p>
            </div>
            <p className="text-xs text-muted-foreground">
              Keep the videos safe, clean, and directly relevant to the app so they can be reused in GitHub notes later.
            </p>
          </CardContent>
        </Card>

        <Button asChild>
          <a href="https://play.google.com/console" target="_blank" rel="noopener noreferrer">
            Open Play Console <ExternalLink className="h-4 w-4 ml-2" />
          </a>
        </Button>
      </div>
    </div>
  );
}
