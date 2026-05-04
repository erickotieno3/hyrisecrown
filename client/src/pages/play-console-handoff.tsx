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
          <CardHeader><CardTitle>Store Listing Text</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <p className="font-medium mb-1">Short description</p>
              <p className="text-muted-foreground">Compare supermarket prices globally and find the best deals fast.</p>
            </div>
            <div>
              <p className="font-medium mb-1">Full description add-on</p>
              <p className="text-muted-foreground">This app contains affiliate links to medical supply products.</p>
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

        <Button asChild>
          <a href="https://play.google.com/console" target="_blank" rel="noopener noreferrer">
            Open Play Console <ExternalLink className="h-4 w-4 ml-2" />
          </a>
        </Button>
      </div>
    </div>
  );
}
