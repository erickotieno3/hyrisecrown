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
              <li>Medisave affiliate store page</li>
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
              <p className="text-muted-foreground">Compare grocery and household prices across stores, find the best deals fast, and browse trusted product links with AI search, voice search, and clear affiliate disclosures.</p>
            </div>
            <div>
              <p className="font-medium mb-1">Full description add-on</p>
              <p className="text-muted-foreground">
                Hyrise Crown Price Comparison helps shoppers compare grocery and household prices across multiple stores and marketplaces in one place. Search faster with AI-powered product discovery, voice search, and live price tracking. Browse trusted retailer links with clear affiliate disclosures, so you always know when a link may earn us a commission at no extra cost to you.
                <br /><br />
                Use the app to find better deals, save time, and make smarter buying decisions. We also support Medisave UK affiliate shopping for medical supplies, with visible disclosure before any affiliate content. Your privacy matters: we explain what data we collect, why we collect it, and how you can manage or delete it in our Privacy Policy.
                <br /><br />
                The app includes permissions only when needed. Camera access is used for visual product search, microphone access is used for voice search, and notifications are used for price alerts you request. We do not access these features in the background without your action.
                <br /><br />
                Hyrise Crown is designed for transparent shopping, clear comparisons, and helpful guidance across regions and stores. If you are looking for a simple way to compare products, discover deals, and understand affiliate content clearly, this app is built for you.
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
            <p className="text-muted-foreground">Initial release of the global price comparison app with AI search, voice search, and Medisave UK affiliate integration.</p>
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
