import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Camera, Mic, Bell, Shield, X } from 'lucide-react';

export type PermissionType = 'camera' | 'microphone' | 'notifications';

interface PermissionConfig {
  icon: React.ReactNode;
  title: string;
  reason: string;
  howUsed: string[];
  notUsedFor: string[];
  allowLabel: string;
  denyLabel: string;
}

const PERMISSION_CONFIGS: Record<PermissionType, PermissionConfig> = {
  camera: {
    icon: <Camera className="h-10 w-10 text-blue-600" />,
    title: 'Camera Access Needed',
    reason: 'To search for a product by photo, we need access to your camera.',
    howUsed: [
      'Capture a product photo to find matching prices across all stores',
      'Scan product barcodes for instant price lookup',
      'Camera is only used while you are actively on the visual search screen',
    ],
    notUsedFor: [
      'We never access your camera in the background',
      'We never store your photos on our servers',
      'Photos are processed instantly and discarded after search results appear',
    ],
    allowLabel: 'Allow Camera',
    denyLabel: 'No thanks, I\'ll upload instead',
  },
  microphone: {
    icon: <Mic className="h-10 w-10 text-blue-600" />,
    title: 'Microphone Access Needed',
    reason: 'To use voice search, we need access to your microphone.',
    howUsed: [
      'Say a product name and we\'ll search all stores instantly',
      'Dictate search queries hands-free while shopping',
      'Microphone is only active while you hold the record button',
    ],
    notUsedFor: [
      'We never record audio in the background',
      'We never store voice recordings',
      'Audio is converted to text in real-time and immediately discarded',
    ],
    allowLabel: 'Allow Microphone',
    denyLabel: 'No thanks, I\'ll type instead',
  },
  notifications: {
    icon: <Bell className="h-10 w-10 text-blue-600" />,
    title: 'Enable Price Alerts',
    reason: 'Allow notifications to get price drop alerts for products you\'re watching.',
    howUsed: [
      'Instant alerts when a product price drops to your target price',
      'Weekly deals digest from your favourite stores',
      'Order and price update confirmations',
    ],
    notUsedFor: [
      'We never send spam or promotional messages without your consent',
      'You can turn off any notification category at any time',
      'We never share your notification preferences with advertisers',
    ],
    allowLabel: 'Allow Notifications',
    denyLabel: 'Maybe Later',
  },
};

interface PermissionDialogProps {
  type: PermissionType;
  open: boolean;
  onAllow: () => void;
  onDeny: () => void;
}

export function PermissionDialog({ type, open, onAllow, onDeny }: PermissionDialogProps) {
  const config = PERMISSION_CONFIGS[type];

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onDeny(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-2">
            <div className="bg-blue-50 rounded-full p-4">
              {config.icon}
            </div>
          </div>
          <DialogTitle className="text-center text-xl">{config.title}</DialogTitle>
          <DialogDescription className="text-center text-base">
            {config.reason}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
              <Shield className="h-4 w-4 text-green-600" /> How we use it:
            </p>
            <ul className="space-y-1">
              {config.howUsed.map((item, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-green-600 font-bold mt-0.5">✓</span> {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
              <X className="h-4 w-4 text-red-500" /> We will never:
            </p>
            <ul className="space-y-1">
              {config.notUsedFor.map((item, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-red-500 font-bold mt-0.5">✗</span> {item}
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-center text-muted-foreground border-t pt-3">
            You can change this at any time in your device settings or in our{' '}
            <a href="/permissions" className="text-blue-600 underline">Permissions Settings</a>.
          </p>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button onClick={onAllow} className="w-full bg-blue-600 hover:bg-blue-700">
            {config.allowLabel}
          </Button>
          <Button variant="ghost" onClick={onDeny} className="w-full text-muted-foreground">
            {config.denyLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
