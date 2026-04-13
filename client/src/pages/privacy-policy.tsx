import { ArrowLeft, Shield, Eye, Lock, Trash2, Bell, CreditCard, Mic, Camera } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-2 mb-8">
        <Link href="/">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Privacy Policy</h1>
          <p className="text-muted-foreground">Last Updated: April 11, 2026 — Effective immediately</p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
        <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-blue-800">
          <strong>Your privacy matters.</strong> Hyrise Crown ("we", "our", or "us") operates the Global Price Comparison platform 
          available at hyrisecrown.com and as a mobile app (package: <code>com.hyrisecrown.tescopricecomparison</code>). 
          This policy explains exactly what data we collect, why, and your rights over it.
        </p>
      </div>

      <div className="space-y-6">

        {/* Data Collected */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Eye className="h-5 w-5 text-blue-600" /> 1. Data We Collect</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">Account Data</Badge>
                </div>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Name and email address (on registration)</li>
                  <li>• Password (stored as encrypted hash)</li>
                  <li>• Account preferences and settings</li>
                </ul>
              </div>
              <div className="border rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">Usage Data</Badge>
                </div>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Search queries and product comparisons</li>
                  <li>• Pages visited and features used</li>
                  <li>• Device type, OS version, browser type</li>
                  <li>• IP address and approximate location</li>
                </ul>
              </div>
              <div className="border rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">Camera / Photos</Badge>
                  <Camera className="h-4 w-4 text-orange-500" />
                </div>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Images captured for visual product search</li>
                  <li>• Images are processed by AI and NOT stored permanently</li>
                  <li>• Deleted immediately after search results are returned</li>
                </ul>
              </div>
              <div className="border rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">Microphone / Audio</Badge>
                  <Mic className="h-4 w-4 text-orange-500" />
                </div>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Voice input for speech-to-text product search</li>
                  <li>• Audio is converted to text and NOT stored</li>
                  <li>• Used only when you actively start voice search</li>
                </ul>
              </div>
              <div className="border rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">Payment Data</Badge>
                  <CreditCard className="h-4 w-4 text-green-600" />
                </div>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Payment processed securely by Stripe & M-Pesa</li>
                  <li>• We do NOT store card numbers or MPesa PINs</li>
                  <li>• Only transaction reference IDs are retained</li>
                </ul>
              </div>
              <div className="border rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">Notifications</Badge>
                  <Bell className="h-4 w-4 text-purple-600" />
                </div>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Push notification token (if you allow notifications)</li>
                  <li>• Price alert preferences you set</li>
                  <li>• You can disable at any time in device settings</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How We Use Data */}
        <Card>
          <CardHeader>
            <CardTitle>2. How We Use Your Data</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2"><span className="text-green-600 font-bold">✓</span> To provide and maintain the price comparison service</li>
              <li className="flex items-start gap-2"><span className="text-green-600 font-bold">✓</span> To process payments and subscriptions via Stripe and M-Pesa (Paybill 6061123)</li>
              <li className="flex items-start gap-2"><span className="text-green-600 font-bold">✓</span> To power AI visual search (OpenAI / GPT-4o) — your images are not used for AI training</li>
              <li className="flex items-start gap-2"><span className="text-green-600 font-bold">✓</span> To send price drop alerts and notifications you requested</li>
              <li className="flex items-start gap-2"><span className="text-green-600 font-bold">✓</span> To improve the platform through anonymous analytics (Google Analytics)</li>
              <li className="flex items-start gap-2"><span className="text-green-600 font-bold">✓</span> To show relevant ads via Google AdSense (you can opt out below)</li>
              <li className="flex items-start gap-2"><span className="text-red-500 font-bold">✗</span> We do NOT sell your personal data to any third party</li>
              <li className="flex items-start gap-2"><span className="text-red-500 font-bold">✗</span> We do NOT share your data for third-party advertising purposes</li>
            </ul>
          </CardContent>
        </Card>

        {/* Third Parties */}
        <Card>
          <CardHeader>
            <CardTitle>3. Third-Party Services We Use</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left p-2 border">Service</th>
                    <th className="text-left p-2 border">Purpose</th>
                    <th className="text-left p-2 border">Data Shared</th>
                    <th className="text-left p-2 border">Their Privacy Policy</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2 border font-medium">Stripe</td>
                    <td className="p-2 border">Payment processing</td>
                    <td className="p-2 border">Payment details</td>
                    <td className="p-2 border"><a href="https://stripe.com/privacy" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">stripe.com/privacy</a></td>
                  </tr>
                  <tr>
                    <td className="p-2 border font-medium">M-Pesa / Safaricom</td>
                    <td className="p-2 border">Mobile payments (Kenya)</td>
                    <td className="p-2 border">Phone number, amount</td>
                    <td className="p-2 border"><a href="https://www.safaricom.co.ke/privacy-policy" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">safaricom.co.ke</a></td>
                  </tr>
                  <tr>
                    <td className="p-2 border font-medium">OpenAI</td>
                    <td className="p-2 border">AI search & recommendations</td>
                    <td className="p-2 border">Search queries, images</td>
                    <td className="p-2 border"><a href="https://openai.com/privacy" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">openai.com/privacy</a></td>
                  </tr>
                  <tr>
                    <td className="p-2 border font-medium">Google Analytics</td>
                    <td className="p-2 border">Anonymous usage stats</td>
                    <td className="p-2 border">Anonymized usage data</td>
                    <td className="p-2 border"><a href="https://policies.google.com/privacy" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">policies.google.com</a></td>
                  </tr>
                  <tr>
                    <td className="p-2 border font-medium">Google AdSense</td>
                    <td className="p-2 border">Advertising</td>
                    <td className="p-2 border">Cookie/device data</td>
                    <td className="p-2 border"><a href="https://policies.google.com/privacy" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">policies.google.com</a></td>
                  </tr>
                  <tr>
                    <td className="p-2 border font-medium">SendGrid</td>
                    <td className="p-2 border">Transactional emails</td>
                    <td className="p-2 border">Email address</td>
                    <td className="p-2 border"><a href="https://sendgrid.com/privacy" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">sendgrid.com/privacy</a></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Permissions */}
        <Card>
          <CardHeader>
            <CardTitle>4. App Permissions Explained</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-100">
              <Camera className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm">Camera</p>
                <p className="text-sm text-muted-foreground">Used only for visual product search — take a photo and find matching products across stores. You must actively tap the camera button. We never access camera in the background.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-100">
              <Mic className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm">Microphone</p>
                <p className="text-sm text-muted-foreground">Used only for voice search — speak a product name to search hands-free. You must actively tap the microphone button. We never record audio in the background.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <Shield className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-sm">Internet Access</p>
                <p className="text-sm text-muted-foreground">Required to fetch live product prices from our servers and store partners.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Rights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Lock className="h-5 w-5 text-blue-600" /> 5. Your Rights & Choices</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">You have full control over your data. You can exercise any of these rights by emailing us:</p>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="border rounded p-3 text-sm">
                <p className="font-medium">Access your data</p>
                <p className="text-muted-foreground">Request a copy of all data we hold about you</p>
              </div>
              <div className="border rounded p-3 text-sm">
                <p className="font-medium">Correct your data</p>
                <p className="text-muted-foreground">Update inaccurate information in your account</p>
              </div>
              <div className="border rounded p-3 text-sm">
                <p className="font-medium">Delete your data</p>
                <p className="text-muted-foreground">Request permanent deletion of your account and all associated data</p>
              </div>
              <div className="border rounded p-3 text-sm">
                <p className="font-medium">Opt out of ads</p>
                <p className="text-muted-foreground">Disable personalised ads via your device settings or Google's ad settings</p>
              </div>
              <div className="border rounded p-3 text-sm">
                <p className="font-medium">Opt out of analytics</p>
                <p className="text-muted-foreground">Use our app without Google Analytics tracking by enabling Do Not Track</p>
              </div>
              <div className="border rounded p-3 text-sm">
                <p className="font-medium">Data portability</p>
                <p className="text-muted-foreground">Receive your data in a machine-readable format</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Deletion */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700"><Trash2 className="h-5 w-5" /> 6. How to Delete Your Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm">Google Play requires all apps to offer account deletion. Here's how to delete your account and all your data:</p>
            <ol className="text-sm space-y-2 list-decimal list-inside text-muted-foreground">
              <li>Email <strong>erickotienokjv@gmail.com</strong> with subject: "Delete My Account"</li>
              <li>Include your registered email address in the message</li>
              <li>We will permanently delete your account within <strong>7 business days</strong></li>
              <li>You will receive a confirmation email once deletion is complete</li>
            </ol>
            <div className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700">
              <strong>What gets deleted:</strong> Your name, email, search history, saved products, price alerts, and payment transaction references. 
              Anonymised analytics data may be retained for up to 90 days as required by law.
            </div>
            <a href="mailto:erickotienokjv@gmail.com?subject=Delete%20My%20Account&body=Please%20delete%20my%20account%20and%20all%20associated%20data.%20My%20registered%20email%20is%3A%20">
              <Button variant="destructive" size="sm" className="mt-2">
                <Trash2 className="h-4 w-4 mr-2" />
                Request Account Deletion
              </Button>
            </a>
          </CardContent>
        </Card>

        {/* Data Retention */}
        <Card>
          <CardHeader>
            <CardTitle>7. Data Retention</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-2 border">Data Type</th>
                  <th className="text-left p-2 border">Retention Period</th>
                </tr>
              </thead>
              <tbody>
                <tr><td className="p-2 border">Account information</td><td className="p-2 border">Until account deletion requested</td></tr>
                <tr><td className="p-2 border">Camera images (visual search)</td><td className="p-2 border">Deleted immediately after search</td></tr>
                <tr><td className="p-2 border">Voice audio (speech search)</td><td className="p-2 border">Never stored — processed in real-time only</td></tr>
                <tr><td className="p-2 border">Payment transaction IDs</td><td className="p-2 border">7 years (legal/financial compliance)</td></tr>
                <tr><td className="p-2 border">Search history</td><td className="p-2 border">90 days, then auto-deleted</td></tr>
                <tr><td className="p-2 border">Analytics data</td><td className="p-2 border">26 months (Google Analytics default)</td></tr>
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Children */}
        <Card>
          <CardHeader>
            <CardTitle>8. Children's Privacy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              This app is <strong>not directed at children under the age of 13</strong>. We do not knowingly collect personal information from children under 13. 
              If you are a parent or guardian and believe your child has provided us with personal information, please contact us at 
              <strong> erickotienokjv@gmail.com</strong> and we will delete that information immediately.
              This app is rated <strong>Everyone (E)</strong> for content.
            </p>
          </CardContent>
        </Card>

        {/* Affiliate Partnerships — Medisave UK (required disclosure) */}
        <Card id="affiliate-tracking" className="border-amber-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-300">AD</span>
              9. Affiliate Partnerships
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-3">
            <p>Our app participates in the <strong>Medisave UK affiliate programme</strong> through Shopify Collabs. When you click on product links in our app, we may receive a <strong>5% commission</strong> on qualifying purchases at <strong>no extra cost to you</strong>.</p>
            <div className="space-y-2">
              <p><strong>What is tracked:</strong> We use tracking links that include a unique affiliate identifier. Medisave UK may place cookies in your browser for up to <strong>90 days</strong> to track referrals from our app.</p>
              <p><strong>What is NOT shared:</strong> We do not share your personal data with Medisave UK. The only data transmitted is anonymised click and purchase data for commission tracking purposes.</p>
              <p><strong>Opting out:</strong> You can opt out by using private/incognito mode, clearing your browser cookies, or avoiding the affiliate links in the <a href="/medisave" className="text-blue-600 underline">Medisave store page</a>.</p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded p-3 space-y-1 text-xs text-amber-900">
              <p><strong>Disclosure required by UK ASA CAP Code Rule 2.1 and FTC 16 CFR Part 255.</strong></p>
              <p>For Medisave UK's own privacy policy, visit:{" "}
                <a href="https://www.medisave.co.uk/privacy-policy" target="_blank" rel="noopener noreferrer" className="underline text-amber-700">medisave.co.uk/privacy-policy</a>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader>
            <CardTitle>10. Contact Us</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-1">
            <p><strong>Data Controller:</strong> Hyrise Crown</p>
            <p><strong>Email:</strong> <a href="mailto:erickotienokjv@gmail.com" className="text-blue-600 underline">erickotienokjv@gmail.com</a></p>
            <p><strong>Website:</strong> <a href="https://hyrisecrown.com" className="text-blue-600 underline">hyrisecrown.com</a></p>
            <p><strong>App Package:</strong> com.hyrisecrown.tescopricecomparison</p>
            <p className="pt-2 text-muted-foreground">We will respond to all privacy requests within 30 days.</p>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
