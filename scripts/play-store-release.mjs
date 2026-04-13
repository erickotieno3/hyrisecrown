/**
 * Google Play Store Automated Release Script
 * Usage:
 *   node scripts/play-store-release.mjs --aab path/to/app.aab [--track production|beta|alpha|internal]
 *
 * Required env var: PLAY_STORE_SERVICE_ACCOUNT_JSON (the full JSON content of the service account key)
 * Optional env var: PLAY_STORE_PACKAGE_NAME (defaults to com.hyrisecrown.tescopricecomparison)
 */

import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PACKAGE_NAME = process.env.PLAY_STORE_PACKAGE_NAME || 'com.hyrisecrown.tescopricecomparison';
const SCOPES = ['https://www.googleapis.com/auth/androidpublisher'];

// Parse CLI args
const args = process.argv.slice(2);
const getArg = (flag) => {
  const idx = args.indexOf(flag);
  return idx !== -1 ? args[idx + 1] : null;
};

const aabPath = getArg('--aab');
const track = getArg('--track') || 'internal';
const versionCode = getArg('--version-code') ? parseInt(getArg('--version-code')) : null;
const releaseNotes = getArg('--notes') || 'Bug fixes and performance improvements.';

// ─── Auth ─────────────────────────────────────────────────────────────────────

function getAuth() {
  const raw = process.env.PLAY_STORE_SERVICE_ACCOUNT_JSON;
  if (!raw) {
    console.error('❌ Missing PLAY_STORE_SERVICE_ACCOUNT_JSON environment variable.');
    console.error('   Set it to the full contents of your service account JSON key file.');
    process.exit(1);
  }
  let credentials;
  try {
    credentials = JSON.parse(raw);
  } catch {
    // Maybe it's a file path
    if (fs.existsSync(raw)) {
      credentials = JSON.parse(fs.readFileSync(raw, 'utf8'));
    } else {
      console.error('❌ PLAY_STORE_SERVICE_ACCOUNT_JSON is not valid JSON and not a file path.');
      process.exit(1);
    }
  }
  return new google.auth.GoogleAuth({ credentials, scopes: SCOPES });
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function log(msg) { console.log(`[Play Release] ${msg}`); }
function err(msg) { console.error(`[Play Release] ❌ ${msg}`); }

async function getNextVersionCode(publisher, editId) {
  try {
    const res = await publisher.apks.list({ packageName: PACKAGE_NAME, editId });
    const codes = (res.data.apks || []).map(a => a.versionCode || 0);
    const aabRes = await publisher.bundles.list({ packageName: PACKAGE_NAME, editId });
    const bundleCodes = (aabRes.data.bundles || []).map(b => b.versionCode || 0);
    const all = [...codes, ...bundleCodes];
    return all.length > 0 ? Math.max(...all) + 1 : 1;
  } catch {
    return 1;
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function run() {
  if (!aabPath) {
    console.log(`
Usage: node scripts/play-store-release.mjs --aab <path-to-file.aab> [options]

Options:
  --aab <path>           Path to the .aab file (required)
  --track <track>        Release track: internal | alpha | beta | production (default: internal)
  --version-code <n>     Override version code (auto-increments if omitted)
  --notes <text>         Release notes text

Environment:
  PLAY_STORE_SERVICE_ACCOUNT_JSON   Full JSON of your service account key (required)
  PLAY_STORE_PACKAGE_NAME           Override package name (optional)
`);
    process.exit(0);
  }

  if (!fs.existsSync(aabPath)) {
    err(`AAB file not found: ${aabPath}`);
    process.exit(1);
  }

  log(`Package:     ${PACKAGE_NAME}`);
  log(`Track:       ${track}`);
  log(`AAB file:    ${aabPath} (${(fs.statSync(aabPath).size / 1024 / 1024).toFixed(2)} MB)`);

  const auth = getAuth();
  const androidpublisher = google.androidpublisher({ version: 'v3', auth });

  // ── Step 1: Open an edit ────────────────────────────────────────────────────
  log('Opening edit...');
  let editId;
  try {
    const editRes = await androidpublisher.edits.insert({ packageName: PACKAGE_NAME });
    editId = editRes.data.id;
    log(`Edit opened: ${editId}`);
  } catch (e) {
    err(`Failed to open edit: ${e.message}`);
    if (e.message?.includes('401') || e.message?.includes('403')) {
      console.error('\n  → Check that the service account has "Release manager" permission in Play Console');
      console.error('  → Play Console → Users and permissions → your service account → Edit → enable Release apps');
    }
    process.exit(1);
  }

  // ── Step 2: Upload the AAB ──────────────────────────────────────────────────
  log('Uploading AAB...');
  let uploadedVersionCode;
  try {
    const aabStream = fs.createReadStream(aabPath);
    const uploadRes = await androidpublisher.bundles.upload({
      packageName: PACKAGE_NAME,
      editId,
      media: { mimeType: 'application/octet-stream', body: aabStream },
    });
    uploadedVersionCode = uploadRes.data.versionCode;
    log(`AAB uploaded. Version code: ${uploadedVersionCode}`);
  } catch (e) {
    err(`AAB upload failed: ${e.message}`);
    await androidpublisher.edits.delete({ packageName: PACKAGE_NAME, editId }).catch(() => {});
    process.exit(1);
  }

  const vc = versionCode || uploadedVersionCode;

  // ── Step 3: Set the track ───────────────────────────────────────────────────
  log(`Setting track to "${track}"...`);
  try {
    await androidpublisher.tracks.update({
      packageName: PACKAGE_NAME,
      editId,
      track,
      requestBody: {
        track,
        releases: [{
          name: `v${vc}`,
          versionCodes: [String(vc)],
          status: track === 'production' ? 'completed' : 'completed',
          releaseNotes: [{
            language: 'en-US',
            text: releaseNotes.substring(0, 500),
          }],
        }],
      },
    });
    log('Track updated.');
  } catch (e) {
    err(`Track update failed: ${e.message}`);
    await androidpublisher.edits.delete({ packageName: PACKAGE_NAME, editId }).catch(() => {});
    process.exit(1);
  }

  // ── Step 4: Commit the edit ─────────────────────────────────────────────────
  log('Committing edit...');
  try {
    const commitRes = await androidpublisher.edits.commit({
      packageName: PACKAGE_NAME,
      editId,
    });
    log(`✅ Release committed! Edit: ${commitRes.data.id}`);
    log(`   Track: ${track}`);
    log(`   Version code: ${vc}`);
    log('');
    log('Next steps:');
    if (track === 'internal') {
      log('  • Go to Play Console → Testing → Internal testing to see the release');
      log('  • Share the internal test link with testers');
      log('  • When ready: re-run with --track production');
    } else if (track === 'production') {
      log('  • Google will review the release (1-3 days for first submission)');
      log('  • You will receive an email when approved');
    }
  } catch (e) {
    err(`Commit failed: ${e.message}`);
    process.exit(1);
  }
}

run().catch(e => {
  err(e.message || e);
  process.exit(1);
});
