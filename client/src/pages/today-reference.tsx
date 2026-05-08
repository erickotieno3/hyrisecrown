import { ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const steps = [
  '1. Play Console handoff page created at /play-console-handoff',
  '2. Privacy Policy updated with Medisave disclosure and affiliate tracking notes',
  '3. Terms of Service updated with affiliate and payment language',
  '4. Data Safety page created for Play Console declaration',
  '5. App icon generated for Play Store listing',
  '6. Feature graphic generated for Play Store listing',
  '7. Phone screenshots generated for Play Store listing',
  '8. Tablet screenshots generated for Play Store listing',
  '9. Android TV banner and screenshots generated',
  '10. Wear OS screenshots generated',
  '11. Chromebook screenshots generated',
  '12. Android XR screenshots generated',
  '13. Android automation screenshots generated',
  '14. Video guidance added for spatial XR, non-spatial XR, and standard app URLs',
  '15. Store listing text prepared with app name and descriptions',
];

export default function TodayReferencePage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-2 mb-8">
        <Link href="/">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Today Reference</h1>
          <p className="text-muted-foreground">One copy of today’s completed work</p>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>Completed today</CardTitle></CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          {steps.map((step) => <p key={step}>{step}</p>)}
        </CardContent>
      </Card>
    </div>
  );
}
