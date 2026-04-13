/**
 * Google Play Store Release API
 * Exposes endpoints for the admin release dashboard
 */

import { Router, Request, Response } from 'express';
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';

const router = Router();
const PACKAGE_NAME = process.env.PLAY_STORE_PACKAGE_NAME || 'com.hyrisecrown.tescopricecomparison';
const SCOPES = ['https://www.googleapis.com/auth/androidpublisher'];

// Store AAB uploads in /tmp
const upload = multer({ dest: '/tmp/aab-uploads/' });

function getAuth() {
  const raw = process.env.PLAY_STORE_SERVICE_ACCOUNT_JSON;
  if (!raw) return null;
  try {
    const credentials = JSON.parse(raw);
    return new google.auth.GoogleAuth({ credentials, scopes: SCOPES });
  } catch {
    return null;
  }
}

// ── GET /api/play-store/status ────────────────────────────────────────────────
// Returns whether API credentials are configured and the latest release info
router.get('/status', async (req: Request, res: Response) => {
  const auth = getAuth();
  if (!auth) {
    return res.json({
      configured: false,
      message: 'PLAY_STORE_SERVICE_ACCOUNT_JSON not set. Add your service account JSON to the secrets.',
    });
  }

  try {
    const androidpublisher = google.androidpublisher({ version: 'v3', auth });
    const editRes = await androidpublisher.edits.insert({ packageName: PACKAGE_NAME });
    const editId = editRes.data.id!;

    // Get tracks
    const tracksRes = await androidpublisher.tracks.list({ packageName: PACKAGE_NAME, editId });
    const tracks = (tracksRes.data.tracks || []).map((t: any) => ({
      track: t.track,
      releases: (t.releases || []).map((r: any) => ({
        name: r.name,
        status: r.status,
        versionCodes: r.versionCodes,
      })),
    }));

    // Clean up the temporary edit
    await androidpublisher.edits.delete({ packageName: PACKAGE_NAME, editId }).catch(() => {});

    return res.json({
      configured: true,
      packageName: PACKAGE_NAME,
      tracks,
    });
  } catch (e: any) {
    return res.json({
      configured: true,
      error: e.message,
      hint: e.message?.includes('403')
        ? 'Service account needs "Release manager" permission in Play Console'
        : undefined,
    });
  }
});

// ── POST /api/play-store/release ──────────────────────────────────────────────
// Accepts an AAB file upload and publishes it to the specified track
router.post('/release', upload.single('aab'), async (req: Request, res: Response) => {
  const auth = getAuth();
  if (!auth) {
    return res.status(400).json({ error: 'PLAY_STORE_SERVICE_ACCOUNT_JSON not configured.' });
  }

  const aabFile = (req as any).file;
  if (!aabFile) {
    return res.status(400).json({ error: 'No AAB file uploaded. Include it as multipart field "aab".' });
  }

  const track = (req.body.track as string) || 'internal';
  const notes = (req.body.notes as string) || 'Bug fixes and performance improvements.';
  const validTracks = ['internal', 'alpha', 'beta', 'production'];
  if (!validTracks.includes(track)) {
    return res.status(400).json({ error: `Invalid track "${track}". Use: ${validTracks.join(', ')}` });
  }

  const logs: string[] = [];
  const log = (msg: string) => { logs.push(msg); console.log(`[Play API] ${msg}`); };

  try {
    const androidpublisher = google.androidpublisher({ version: 'v3', auth });

    // Open edit
    log('Opening edit...');
    const editRes = await androidpublisher.edits.insert({ packageName: PACKAGE_NAME });
    const editId = editRes.data.id!;

    // Upload AAB
    log(`Uploading AAB (${(aabFile.size / 1024 / 1024).toFixed(2)} MB)...`);
    const aabStream = fs.createReadStream(aabFile.path);
    const uploadRes = await androidpublisher.bundles.upload({
      packageName: PACKAGE_NAME,
      editId,
      media: { mimeType: 'application/octet-stream', body: aabStream },
    });
    const versionCode = uploadRes.data.versionCode!;
    log(`AAB uploaded. Version code: ${versionCode}`);

    // Set track
    log(`Setting track "${track}"...`);
    await androidpublisher.tracks.update({
      packageName: PACKAGE_NAME,
      editId,
      track,
      requestBody: {
        track,
        releases: [{
          name: `v${versionCode}`,
          versionCodes: [String(versionCode)],
          status: 'completed',
          releaseNotes: [{ language: 'en-US', text: notes.substring(0, 500) }],
        }],
      },
    });

    // Commit
    log('Committing edit...');
    await androidpublisher.edits.commit({ packageName: PACKAGE_NAME, editId });
    log('✅ Release committed!');

    // Cleanup temp file
    fs.unlink(aabFile.path, () => {});

    return res.json({
      success: true,
      versionCode,
      track,
      packageName: PACKAGE_NAME,
      logs,
    });
  } catch (e: any) {
    fs.unlink(aabFile?.path, () => {});
    log(`Error: ${e.message}`);
    return res.status(500).json({ error: e.message, logs });
  }
});

// ── GET /api/play-store/tracks ────────────────────────────────────────────────
router.get('/tracks', async (req: Request, res: Response) => {
  const auth = getAuth();
  if (!auth) return res.status(400).json({ error: 'Not configured' });

  try {
    const androidpublisher = google.androidpublisher({ version: 'v3', auth });
    const editRes = await androidpublisher.edits.insert({ packageName: PACKAGE_NAME });
    const editId = editRes.data.id!;
    const tracksRes = await androidpublisher.tracks.list({ packageName: PACKAGE_NAME, editId });
    await androidpublisher.edits.delete({ packageName: PACKAGE_NAME, editId }).catch(() => {});
    return res.json({ tracks: tracksRes.data.tracks || [] });
  } catch (e: any) {
    return res.status(500).json({ error: e.message });
  }
});

export default router;
