import { ArrowLeft, Shield, Check, X } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

function Yes() { return <span className="inline-flex items-center gap-1 text-green-600 font-medium text-xs"><Check className="h-3 w-3" /> Yes</span>; }
function No() { return <span className="inline-flex items-center gap-1 text-red-500 font-medium text-xs"><X className="h-3 w-3" /> No</span>; }

export default function DataSafetyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-2 mb-8">
        <Link href="/">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Data Safety</h1>
          <p className="text-muted-foreground">Google Play Data Safety Declaration — App: com.hyrisecrown.tescopricecomparison</p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
        <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-blue-800">
          This page matches exactly what is declared in the Google Play Console Data Safety section for this app. 
          It shows every type of data collected or shared, and how it is handled.
        </p>
      </div>

      <div className="space-y-6">

        {/* Overview */}
        <Card>
          <CardHeader><CardTitle>Overview</CardTitle></CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-3 gap-4 text-sm">
              <div className="border rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-blue-600 mb-1">Yes</p>
                <p className="text-muted-foreground">Data is collected</p>
              </div>
              <div className="border rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-orange-500 mb-1">Limited</p>
                <p className="text-muted-foreground">Data is shared with third parties (payment, analytics only)</p>
              </div>
              <div className="border rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-green-600 mb-1">Yes</p>
                <p className="text-muted-foreground">You can request data deletion</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Collected */}
        <Card>
          <CardHeader><CardTitle>Data Collected & How It Is Used</CardTitle></CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="p-2 border font-semibold">Data Type</th>
                  <th className="p-2 border font-semibold">Collected</th>
                  <th className="p-2 border font-semibold">Shared</th>
                  <th className="p-2 border font-semibold">Encrypted in Transit</th>
                  <th className="p-2 border font-semibold">You Can Delete</th>
                  <th className="p-2 border font-semibold">Purpose</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2 border"><Badge variant="outline">Name</Badge></td>
                  <td className="p-2 border"><Yes /></td>
                  <td className="p-2 border"><No /></td>
                  <td className="p-2 border"><Yes /></td>
                  <td className="p-2 border"><Yes /></td>
                  <td className="p-2 border text-xs text-muted-foreground">Account management</td>
                </tr>
                <tr>
                  <td className="p-2 border"><Badge variant="outline">Email address</Badge></td>
                  <td className="p-2 border"><Yes /></td>
                  <td className="p-2 border">SendGrid only</td>
                  <td className="p-2 border"><Yes /></td>
                  <td className="p-2 border"><Yes /></td>
                  <td className="p-2 border text-xs text-muted-foreground">Account management, emails</td>
                </tr>
                <tr>
                  <td className="p-2 border"><Badge variant="outline">Search history</Badge></td>
                  <td className="p-2 border"><Yes /></td>
                  <td className="p-2 border"><No /></td>
                  <td className="p-2 border"><Yes /></td>
                  <td className="p-2 border"><Yes /></td>
                  <td className="p-2 border text-xs text-muted-foreground">Personalised recommendations</td>
                </tr>
                <tr>
                  <td className="p-2 border"><Badge variant="outline">Photos / Images</Badge></td>
                  <td className="p-2 border">Temporary</td>
                  <td className="p-2 border">OpenAI (temp)</td>
                  <td className="p-2 border"><Yes /></td>
                  <td className="p-2 border">Auto-deleted</td>
                  <td className="p-2 border text-xs text-muted-foreground">Visual product search only</td>
                </tr>
                <tr>
                  <td className="p-2 border"><Badge variant="outline">Audio</Badge></td>
                  <td className="p-2 border">Not stored</td>
                  <td className="p-2 border"><No /></td>
                  <td className="p-2 border"><Yes /></td>
                  <td className="p-2 border">N/A</td>
                  <td className="p-2 border text-xs text-muted-foreground">Voice search (real-time only)</td>
                </tr>
                <tr>
                  <td className="p-2 border"><Badge variant="outline">Device / other IDs</Badge></td>
                  <td className="p-2 border"><Yes /></td>
                  <td className="p-2 border">Google Analytics</td>
                  <td className="p-2 border"><Yes /></td>
                  <td className="p-2 border"><Yes /></td>
                  <td className="p-2 border text-xs text-muted-foreground">Analytics, crash reporting</td>
                </tr>
                <tr>
                  <td className="p-2 border"><Badge variant="outline">Purchase history</Badge></td>
                  <td className="p-2 border">Reference IDs only</td>
                  <td className="p-2 border">Stripe / M-Pesa</td>
                  <td className="p-2 border"><Yes /></td>
                  <td className="p-2 border">7-year legal hold</td>
                  <td className="p-2 border text-xs text-muted-foreground">Payment processing, receipts</td>
                </tr>
                <tr>
                  <td className="p-2 border"><Badge variant="outline">App interactions</Badge></td>
                  <td className="p-2 border"><Yes /></td>
                  <td className="p-2 border">Google Analytics</td>
                  <td className="p-2 border"><Yes /></td>
                  <td className="p-2 border"><Yes /></td>
                  <td className="p-2 border text-xs text-muted-foreground">App improvement, analytics</td>
                </tr>
                <tr>
                  <td className="p-2 border"><Badge variant="outline">Crash logs</Badge></td>
                  <td className="p-2 border"><Yes /></td>
                  <td className="p-2 border"><No /></td>
                  <td className="p-2 border"><Yes /></td>
                  <td className="p-2 border"><Yes /></td>
                  <td className="p-2 border text-xs text-muted-foreground">App stability, bug fixes</td>
                </tr>
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Security practices */}
        <Card>
          <CardHeader><CardTitle>Security Practices</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <p>All data is encrypted in transit using HTTPS/TLS 1.2+</p>
            </div>
            <div className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <p>Passwords are stored as bcrypt hashed values — never in plain text</p>
            </div>
            <div className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <p>Payment card data is never stored on our servers — handled entirely by Stripe (PCI DSS Level 1 certified)</p>
            </div>
            <div className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <p>Camera images and audio are processed in real-time and are never permanently stored</p>
            </div>
            <div className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
              <p>You can request complete account and data deletion at any time</p>
            </div>
            <div className="flex items-start gap-2">
              <X className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
              <p>We do not use data for tracking across other apps or websites</p>
            </div>
          </CardContent>
        </Card>

        {/* How to delete */}
        <Card className="border-red-200">
          <CardHeader><CardTitle>Request Data Deletion</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-3">
            <p>To delete all your personal data from our systems:</p>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>Email <strong>erickotienokjv@gmail.com</strong></li>
              <li>Subject line: "Delete My Account and Data"</li>
              <li>Include your registered email address</li>
              <li>We will confirm deletion within 7 business days</li>
            </ol>
            <a href="mailto:erickotienokjv@gmail.com?subject=Delete%20My%20Account%20and%20Data&body=Please%20delete%20all%20my%20personal%20data.%20My%20account%20email%20is%3A%20">
              <Button variant="destructive" size="sm">Request Data Deletion</Button>
            </a>
          </CardContent>
        </Card>

        <div className="text-xs text-muted-foreground text-center pt-4">
          <p>Full Privacy Policy: <Link href="/privacy" className="text-blue-600 underline">/privacy</Link> — Terms of Service: <Link href="/terms" className="text-blue-600 underline">/terms</Link></p>
          <p className="mt-1">Contact: erickotienokjv@gmail.com | App: com.hyrisecrown.tescopricecomparison</p>
        </div>
      </div>
    </div>
  );
}
