import { useState, useEffect } from 'react';
import { ArrowLeft, Camera, Mic, Bell, Shield, CheckCircle, XCircle, AlertCircle, Settings } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PermissionDialog, PermissionType } from '@/components/common/PermissionDialog';

type PermStatus = 'granted' | 'denied' | 'prompt' | 'unsupported';

interface PermState {
  camera: PermStatus;
  microphone: PermStatus;
  notifications: PermStatus;
}

export default function PermissionsSettingsPage() {
  const [perms, setPerms] = useState<PermState>({
    camera: 'prompt',
    microphone: 'prompt',
    notifications: 'prompt',
  });
  const [dialog, setDialog] = useState<PermissionType | null>(null);

  useEffect(() => {
    checkAllPermissions();
  }, []);

  async function checkAllPermissions() {
    const updated: PermState = { camera: 'prompt', microphone: 'prompt', notifications: 'prompt' };

    try {
      const cam = await navigator.permissions.query({ name: 'camera' as PermissionName });
      updated.camera = cam.state as PermStatus;
    } catch { updated.camera = 'unsupported'; }

    try {
      const mic = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      updated.microphone = mic.state as PermStatus;
    } catch { updated.microphone = 'unsupported'; }

    if ('Notification' in window) {
      updated.notifications = Notification.permission as PermStatus;
    } else {
      updated.notifications = 'unsupported';
    }

    setPerms(updated);
  }

  async function handleAllow(type: PermissionType) {
    setDialog(null);
    if (type === 'camera') {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(t => t.stop());
        setPerms(p => ({ ...p, camera: 'granted' }));
      } catch { setPerms(p => ({ ...p, camera: 'denied' })); }
    } else if (type === 'microphone') {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(t => t.stop());
        setPerms(p => ({ ...p, microphone: 'granted' }));
      } catch { setPerms(p => ({ ...p, microphone: 'denied' })); }
    } else if (type === 'notifications') {
      const result = await Notification.requestPermission();
      setPerms(p => ({ ...p, notifications: result as PermStatus }));
    }
  }

  function StatusBadge({ status }: { status: PermStatus }) {
    if (status === 'granted') return <Badge className="bg-green-100 text-green-700 border-green-200"><CheckCircle className="h-3 w-3 mr-1" /> Allowed</Badge>;
    if (status === 'denied') return <Badge className="bg-red-100 text-red-700 border-red-200"><XCircle className="h-3 w-3 mr-1" /> Denied</Badge>;
    if (status === 'unsupported') return <Badge variant="secondary"><AlertCircle className="h-3 w-3 mr-1" /> Not supported</Badge>;
    return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200"><AlertCircle className="h-3 w-3 mr-1" /> Not set</Badge>;
  }

  const permissions = [
    {
      key: 'camera' as PermissionType,
      icon: <Camera className="h-6 w-6 text-blue-600" />,
      title: 'Camera',
      description: 'Used for visual product search — scan a product to compare prices instantly.',
      feature: 'Visual Search',
      featureLink: '/visual-search',
      required: false,
      alternative: 'You can upload a photo instead of using the camera.',
    },
    {
      key: 'microphone' as PermissionType,
      icon: <Mic className="h-6 w-6 text-blue-600" />,
      title: 'Microphone',
      description: 'Used for voice search — say a product name to search hands-free.',
      feature: 'Voice Search',
      featureLink: '/speech-to-text',
      required: false,
      alternative: 'You can type your search query instead.',
    },
    {
      key: 'notifications' as PermissionType,
      icon: <Bell className="h-6 w-6 text-blue-600" />,
      title: 'Notifications',
      description: 'Used to send you price drop alerts when watched products go on sale.',
      feature: 'Price Alerts',
      featureLink: '/',
      required: false,
      alternative: 'You can check prices manually by revisiting the app.',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {dialog && (
        <PermissionDialog
          type={dialog}
          open={true}
          onAllow={() => handleAllow(dialog)}
          onDeny={() => setDialog(null)}
        />
      )}

      <div className="flex items-center gap-2 mb-8">
        <Link href="/">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">App Permissions</h1>
          <p className="text-muted-foreground text-sm">Control what this app can access on your device</p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start gap-3">
        <Shield className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-blue-800">
          We only request permissions when you use a specific feature — never at startup. 
          All permissions are optional, and the app works without any of them.
        </p>
      </div>

      <div className="space-y-4">
        {permissions.map((perm) => (
          <Card key={perm.key}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-50 rounded-lg p-2">{perm.icon}</div>
                  <div>
                    <CardTitle className="text-base">{perm.title}</CardTitle>
                    <StatusBadge status={perms[perm.key]} />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{perm.description}</p>

              {perms[perm.key] === 'prompt' && (
                <Button
                  size="sm"
                  onClick={() => setDialog(perm.key)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Allow {perm.title}
                </Button>
              )}

              {perms[perm.key] === 'granted' && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <p className="text-sm text-green-700 font-medium">{perm.title} is allowed. <Link href={perm.featureLink} className="underline">Try {perm.feature}</Link></p>
                </div>
              )}

              {perms[perm.key] === 'denied' && (
                <div className="bg-orange-50 border border-orange-200 rounded p-3 space-y-2">
                  <p className="text-sm text-orange-700">
                    <strong>Access denied.</strong> {perm.alternative}
                  </p>
                  <p className="text-xs text-orange-600">
                    To re-enable, go to your device <strong>Settings → Site Settings → {perm.title}</strong> and allow this site.
                  </p>
                  <Button size="sm" variant="outline" onClick={() => setDialog(perm.key)}>
                    <Settings className="h-3 w-3 mr-1" /> Try Again
                  </Button>
                </div>
              )}

              <p className="text-xs text-muted-foreground">{perm.alternative}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Settings className="h-4 w-4" /> Device-Level Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>To manage permissions at the system level on your device:</p>
          <ul className="space-y-1 list-disc list-inside">
            <li><strong>Android:</strong> Settings → Apps → HyriseCrown → Permissions</li>
            <li><strong>Chrome browser:</strong> Click the lock icon in the address bar → Permissions</li>
            <li><strong>Safari (iOS):</strong> Settings → Safari → Website Settings</li>
          </ul>
          <p className="pt-2">
            Full privacy details: <Link href="/privacy" className="text-blue-600 underline">Privacy Policy</Link> — 
            Data we collect: <Link href="/data-safety" className="text-blue-600 underline">Data Safety</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
