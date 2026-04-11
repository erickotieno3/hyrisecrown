import { ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-2 mb-8">
        <Link href="/">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Terms of Service</h1>
          <p className="text-muted-foreground">Last Updated: April 11, 2026</p>
        </div>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader><CardTitle>1. Acceptance of Terms</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>By downloading, installing, or using the Hyrise Crown Price Comparison app (package: <code>com.hyrisecrown.tescopricecomparison</code>) or accessing hyrisecrown.com, you agree to be bound by these Terms of Service and our Privacy Policy.</p>
            <p>If you do not agree to these terms, do not use the app or website.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>2. Description of Service</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>Hyrise Crown provides a global supermarket price comparison service. Features include:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Real-time price comparison across multiple retailers</li>
              <li>AI-powered visual product search (camera required)</li>
              <li>Voice-activated product search (microphone required)</li>
              <li>Price alerts and notifications</li>
              <li>Affiliate links to retailer websites</li>
              <li>Payment services via Stripe and M-Pesa (Paybill 6061123)</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>3. User Accounts</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>You must be at least 13 years old to create an account. You are responsible for:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Maintaining the security of your account credentials</li>
              <li>All activity that occurs under your account</li>
              <li>Providing accurate registration information</li>
            </ul>
            <p>To delete your account, email <strong>erickotienokjv@gmail.com</strong> with subject "Delete My Account".</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>4. Payments & Refunds</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>Premium features may require payment processed via:</p>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Stripe</strong> — credit/debit card payments globally</li>
              <li><strong>M-Pesa Paybill 6061123</strong> — mobile payments in Kenya (merchant: Kisumu Hyrise Crown Restaurant)</li>
            </ul>
            <p>All payments are final unless otherwise required by applicable law. Contact us at erickotienokjv@gmail.com for payment disputes.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>5. Affiliate Links & Advertising</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>This app contains:</p>
            <ul className="list-disc list-inside space-y-1">
              <li><strong>Affiliate links:</strong> When you click retailer links and make purchases, we may earn a commission at no extra cost to you</li>
              <li><strong>Google AdSense ads:</strong> Contextual and personalised advertisements. You can opt out of personalised ads in your Google account settings</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>6. Intellectual Property</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>"Tesco", "Walmart", "Carrefour" and other retailer names are trademarks of their respective owners. Hyrise Crown is an independent price comparison service and is not affiliated with, endorsed by, or sponsored by any retailer.</p>
            <p>Our platform, code, design, and original content are © 2026 Hyrise Crown. All rights reserved.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>7. User Conduct</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>You agree not to:</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Use the app for any unlawful purpose</li>
              <li>Attempt to reverse-engineer, hack, or disrupt the service</li>
              <li>Upload harmful, offensive, or illegal content</li>
              <li>Misuse the visual search feature to identify people</li>
              <li>Create fake accounts or provide false information</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>8. Disclaimer of Warranties</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>Prices shown are for informational purposes only and may not reflect current in-store prices. Always verify prices at the retailer before purchasing. The service is provided "as is" without warranties of any kind.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>9. Limitation of Liability</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>To the maximum extent permitted by law, Hyrise Crown shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the service, including but not limited to purchasing decisions made based on price information shown in the app.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>10. Governing Law</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>These Terms are governed by the laws of Kenya. Disputes shall be resolved in the courts of Kenya.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>11. Changes to Terms</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <p>We may update these Terms at any time. We will notify you of significant changes via email or in-app notification. Continued use of the app after changes constitutes acceptance of the new terms.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>12. Contact Us</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-1">
            <p><strong>Hyrise Crown</strong></p>
            <p>Email: <a href="mailto:erickotienokjv@gmail.com" className="text-blue-600 underline">erickotienokjv@gmail.com</a></p>
            <p>Website: <a href="https://hyrisecrown.com" className="text-blue-600 underline">hyrisecrown.com</a></p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
