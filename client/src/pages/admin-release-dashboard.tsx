import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Upload, CheckCircle, XCircle, AlertCircle, RefreshCw,
  Smartphone, Package, Radio, ShieldCheck, ExternalLink
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

const TRACK_COLORS: Record<string, string> = {
  internal: "bg-gray-100 text-gray-700",
  alpha: "bg-yellow-100 text-yellow-700",
  beta: "bg-blue-100 text-blue-700",
  production: "bg-green-100 text-green-700",
};

const TRACK_DESCRIPTIONS: Record<string, string> = {
  internal: "Up to 100 internal testers — no review required",
  alpha: "Closed testing group — limited review",
  beta: "Open testing — any user can join",
  production: "Live on Play Store — full Google review (1–3 days)",
};

export default function AdminReleaseDashboard() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [track, setTrack] = useState("internal");
  const [notes, setNotes] = useState(
    "Compare grocery prices across Tesco, Walmart, Carrefour and 50+ stores globally. Voice search, AI product scanner, and real-time price alerts."
  );
  const [releaseLogs, setReleaseLogs] = useState<string[]>([]);
  const [releaseResult, setReleaseResult] = useState<any>(null);

  const { data: status, isLoading: statusLoading, refetch: refetchStatus } = useQuery({
    queryKey: ["/api/play-store/status"],
    retry: false,
  });

  const releaseMutation = useMutation({
    mutationFn: async () => {
      if (!selectedFile) throw new Error("No AAB file selected");
      const formData = new FormData();
      formData.append("aab", selectedFile);
      formData.append("track", track);
      formData.append("notes", notes);
      const res = await fetch("/api/play-store/release", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Release failed");
      return data;
    },
    onSuccess: (data) => {
      setReleaseLogs(data.logs || []);
      setReleaseResult(data);
    },
    onError: (e: any) => {
      setReleaseLogs([`Error: ${e.message}`]);
      setReleaseResult({ success: false, error: e.message });
    },
  });

  const s = status as any;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-green-100 rounded-lg">
          <Smartphone className="h-6 w-6 text-green-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Play Store Release Pipeline</h1>
          <p className="text-sm text-gray-500">Hyrise Crown Price Compare · com.hyrisecrown.tescopricecomparison</p>
        </div>
        <Button variant="ghost" size="sm" className="ml-auto" onClick={() => refetchStatus()}>
          <RefreshCw className="h-4 w-4 mr-1" /> Refresh
        </Button>
      </div>

      {/* API Status Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" /> API Connection Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {statusLoading ? (
            <div className="flex items-center gap-2 text-gray-500">
              <RefreshCw className="h-4 w-4 animate-spin" /> Checking connection...
            </div>
          ) : s?.configured ? (
            s?.error ? (
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  <strong>Connected but error:</strong> {s.error}
                  {s.hint && <p className="mt-1 text-sm">{s.hint}</p>}
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="h-4 w-4" />
                  <span className="font-medium">Connected to Google Play API</span>
                </div>
                {s?.tracks && s.tracks.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700">Current tracks:</p>
                    {s.tracks.map((t: any) => (
                      <div key={t.track} className="flex items-center gap-2">
                        <Badge className={`text-xs ${TRACK_COLORS[t.track] || "bg-gray-100"}`}>
                          {t.track}
                        </Badge>
                        {t.releases?.[0] && (
                          <span className="text-sm text-gray-600">
                            {t.releases[0].name} — {t.releases[0].status}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          ) : (
            <Alert className="border-red-200 bg-red-50">
              <XCircle className="h-4 w-4 text-red-500" />
              <AlertDescription className="text-red-800">
                <strong>Not configured.</strong> Add your service account credentials as a secret named{" "}
                <code className="bg-red-100 px-1 rounded text-xs">PLAY_STORE_SERVICE_ACCOUNT_JSON</code>.
                <div className="mt-3 space-y-1 text-sm">
                  <p className="font-medium">How to get it:</p>
                  <ol className="list-decimal list-inside space-y-1 text-red-700">
                    <li>Go to <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="underline">Google Cloud Console</a></li>
                    <li>IAM & Admin → Service Accounts → your service account</li>
                    <li>Keys → Add Key → Create new key → JSON → Download</li>
                    <li>Add the file's full contents as the secret above</li>
                  </ol>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Release Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" /> Create New Release
          </CardTitle>
          <CardDescription>
            Upload an AAB file generated by PWABuilder and push it directly to the Play Store
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">

          {/* AAB Upload */}
          <div className="space-y-2">
            <Label>AAB File</Label>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                selectedFile ? "border-green-400 bg-green-50" : "border-gray-200 hover:border-blue-400 hover:bg-blue-50"
              }`}
              onClick={() => fileInputRef.current?.click()}
            >
              {selectedFile ? (
                <div className="flex items-center justify-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div className="text-left">
                    <p className="font-medium text-green-700">{selectedFile.name}</p>
                    <p className="text-sm text-green-600">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB · Ready to upload</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}>
                    Change
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto" />
                  <p className="text-sm font-medium text-gray-700">Click to select your .aab file</p>
                  <p className="text-xs text-gray-400">Generated by PWABuilder → Android → Download package</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".aab"
                className="hidden"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              />
            </div>
          </div>

          {/* Track Selection */}
          <div className="space-y-2">
            <Label>Release Track</Label>
            <Select value={track} onValueChange={setTrack}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TRACK_DESCRIPTIONS).map(([t, desc]) => (
                  <SelectItem key={t} value={t}>
                    <div className="flex items-center gap-2">
                      <Radio className="h-3 w-3" />
                      <span className="capitalize font-medium">{t}</span>
                      <span className="text-xs text-gray-500">— {desc}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">{TRACK_DESCRIPTIONS[track]}</p>
          </div>

          {/* Release Notes */}
          <div className="space-y-2">
            <Label>Release Notes <span className="text-gray-400 text-xs">(max 500 characters)</span></Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value.slice(0, 500))}
              rows={3}
              placeholder="What's new in this release..."
            />
            <p className="text-xs text-gray-400 text-right">{notes.length}/500</p>
          </div>

          {/* Warning for production */}
          {track === "production" && (
            <Alert className="border-orange-200 bg-orange-50">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800 text-sm">
                <strong>Production release</strong> — Google will review this (1–3 days). Make sure your store listing, screenshots, content rating, and privacy policy are all complete before submitting.
              </AlertDescription>
            </Alert>
          )}

          <Button
            className="w-full"
            size="lg"
            disabled={!selectedFile || !s?.configured || !!s?.error || releaseMutation.isPending}
            onClick={() => releaseMutation.mutate()}
          >
            {releaseMutation.isPending ? (
              <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Uploading & releasing...</>
            ) : (
              <><Upload className="h-4 w-4 mr-2" /> Release to {track}</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Release Logs */}
      {releaseLogs.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              {releaseResult?.success
                ? <CheckCircle className="h-4 w-4 text-green-600" />
                : <XCircle className="h-4 w-4 text-red-500" />}
              Release {releaseResult?.success ? "Succeeded" : "Failed"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {releaseResult?.success && (
              <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200 space-y-1">
                <p className="text-green-800 font-medium text-sm">✅ Published to Play Store</p>
                <p className="text-green-700 text-sm">Version code: <strong>{releaseResult.versionCode}</strong></p>
                <p className="text-green-700 text-sm">Track: <strong className="capitalize">{releaseResult.track}</strong></p>
                {releaseResult.track === "internal" && (
                  <a
                    href="https://play.google.com/console"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline mt-1"
                  >
                    Open Play Console <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            )}
            <div className="bg-gray-900 rounded-lg p-4 font-mono text-xs text-green-400 space-y-1 max-h-48 overflow-y-auto">
              {releaseLogs.map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Setup checklist */}
      <Card className="border-dashed">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-gray-600">Pre-release Checklist</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            {[
              { label: "Privacy Policy", url: "/privacy", done: true },
              { label: "Terms of Service", url: "/terms", done: true },
              { label: "Data Safety page", url: "/data-safety", done: true },
              { label: "Permission dialogs", url: "/permissions", done: true },
              { label: "App icons (all sizes)", done: true },
              { label: "PWA Manifest", done: true },
              { label: "Service account connected", done: !!s?.configured && !s?.error },
              { label: "SHA-256 in assetlinks.json", done: false, note: "Update after PWABuilder" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                {item.done
                  ? <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                  : <AlertCircle className="h-4 w-4 text-orange-400 shrink-0" />}
                {item.url ? (
                  <a href={item.url} className="hover:underline text-gray-700">{item.label}</a>
                ) : (
                  <span className="text-gray-700">{item.label}</span>
                )}
                {item.note && <span className="text-xs text-gray-400">({item.note})</span>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
