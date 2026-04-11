/**
 * Auto-Sync: Replit ↔ GitHub
 * - Polls for file changes in Replit → auto commits & pushes to GitHub
 * - Polls GitHub for new commits → pulls changes into Replit
 */

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, relative, dirname } from 'path';
import { mkdirSync } from 'fs';

const TOKEN = process.env.GITHUB_TOKEN;
const OWNER = 'erickotieno3';
const REPO = 'hyrisecrown';
const BRANCH = 'main';
const ROOT = '/home/runner/workspace';
const STATE_FILE = '/tmp/auto-sync-state.json';

const IGNORE = [
  'node_modules', '.git', '.cache', 'dist', 'build', '.replit',
  'replit.nix', '.config', 'logs', '__pycache__', '.npm',
  'scripts/auto-sync.mjs', 'scripts/github-api-push.mjs',
  '.local', '.upm', '.ssh'
];

const CHECK_CHANGES_MS = 30000;   // check for local file changes every 30s
const POLL_GITHUB_MS = 60000;     // check GitHub for remote commits every 60s
const PUSH_DEBOUNCE_MS = 20000;   // wait 20s after detecting changes before pushing

const headers = {
  'Authorization': `token ${TOKEN}`,
  'Accept': 'application/vnd.github.v3+json',
  'Content-Type': 'application/json',
  'User-Agent': 'HyriseCrown-AutoSync'
};

let pendingPush = null;
let lastKnownCommit = null;
let isSyncing = false;
let lastSnapshot = new Map(); // path -> mtime

function log(msg) {
  const ts = new Date().toISOString().replace('T', ' ').slice(0, 19);
  console.log(`[${ts}] ${msg}`);
}

async function api(path, method = 'GET', body = null) {
  const res = await fetch(`https://api.github.com${path}`, {
    method,
    headers,
    ...(body ? { body: JSON.stringify(body) } : {})
  });
  if (res.status === 204) return null;
  const data = await res.json();
  if (!res.ok) throw new Error(`GitHub API ${path}: ${data.message}`);
  return data;
}

function getAllFiles(dir, base = dir) {
  const files = [];
  try {
    for (const item of readdirSync(dir)) {
      if (IGNORE.some(ig => item === ig) || item.startsWith('.')) continue;
      const full = join(dir, item);
      const rel = relative(base, full);
      try {
        const stat = statSync(full);
        if (stat.isDirectory()) {
          files.push(...getAllFiles(full, base));
        } else if (stat.size < 1024 * 1024) {
          files.push({ path: rel, mtime: stat.mtimeMs });
        }
      } catch (e) {}
    }
  } catch (e) {}
  return files;
}

function snapshotFiles() {
  const snap = new Map();
  for (const f of getAllFiles(ROOT)) {
    snap.set(f.path, f.mtime);
  }
  return snap;
}

function detectChanges(oldSnap, newSnap) {
  const changed = [];
  for (const [path, mtime] of newSnap) {
    if (!oldSnap.has(path) || oldSnap.get(path) !== mtime) {
      changed.push(path);
    }
  }
  return changed;
}

async function createBlob(content) {
  const data = await api(`/repos/${OWNER}/${REPO}/git/blobs`, 'POST', {
    content: Buffer.from(content).toString('base64'),
    encoding: 'base64'
  });
  return data.sha;
}

async function pushToGitHub(changedFiles) {
  if (isSyncing) return;
  isSyncing = true;
  try {
    const summary = changedFiles.length <= 3
      ? changedFiles.join(', ')
      : `${changedFiles.slice(0, 3).join(', ')} +${changedFiles.length - 3} more`;
    log(`Pushing to GitHub... (${changedFiles.length} file(s) changed: ${summary})`);

    const ref = await api(`/repos/${OWNER}/${REPO}/git/ref/heads/${BRANCH}`);
    const baseSha = ref.object.sha;
    const commit = await api(`/repos/${OWNER}/${REPO}/git/commits/${baseSha}`);
    const baseTreeSha = commit.tree.sha;

    const allFiles = getAllFiles(ROOT);
    const treeItems = [];
    let done = 0;

    for (const f of allFiles) {
      try {
        const content = readFileSync(join(ROOT, f.path));
        const sha = await createBlob(content);
        treeItems.push({ path: f.path, mode: '100644', type: 'blob', sha });
        done++;
      } catch (e) {}
    }

    const tree = await api(`/repos/${OWNER}/${REPO}/git/trees`, 'POST', {
      tree: treeItems,
      base_tree: baseTreeSha
    });

    const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
    const newCommit = await api(`/repos/${OWNER}/${REPO}/git/commits`, 'POST', {
      message: `Auto-sync ${now}: ${summary}`,
      tree: tree.sha,
      parents: [baseSha],
      author: { name: 'Erick Otieno', email: 'erickotienokjv@gmail.com' }
    });

    await api(`/repos/${OWNER}/${REPO}/git/refs/heads/${BRANCH}`, 'PATCH', {
      sha: newCommit.sha,
      force: true
    });

    lastKnownCommit = newCommit.sha;
    log(`✅ Pushed ${done} files — commit ${newCommit.sha.slice(0, 7)}`);
    saveState();
  } catch (e) {
    log(`❌ Push failed: ${e.message}`);
  } finally {
    isSyncing = false;
  }
}

async function pullFromGitHub() {
  if (isSyncing) return;
  try {
    const ref = await api(`/repos/${OWNER}/${REPO}/git/ref/heads/${BRANCH}`);
    const latestSha = ref.object.sha;

    if (latestSha === lastKnownCommit) return;

    if (lastKnownCommit) {
      try {
        const comparison = await api(`/repos/${OWNER}/${REPO}/compare/${lastKnownCommit}...${latestSha}`);
        const changedFiles = comparison.files || [];

        if (changedFiles.length === 0) {
          lastKnownCommit = latestSha;
          saveState();
          return;
        }

        log(`📥 Pulling ${changedFiles.length} changed file(s) from GitHub (commit ${latestSha.slice(0, 7)})...`);
        isSyncing = true;

        for (const file of changedFiles) {
          try {
            if (file.status === 'removed') continue;
            const fileData = await api(`/repos/${OWNER}/${REPO}/contents/${file.filename}?ref=${latestSha}`);
            if (fileData && fileData.content) {
              const content = Buffer.from(fileData.content, 'base64');
              const localPath = join(ROOT, file.filename);
              const dir = dirname(localPath);
              if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
              writeFileSync(localPath, content);
              log(`  ↓ ${file.filename}`);
            }
          } catch (e) {
            log(`  ⚠ Could not pull ${file.filename}: ${e.message}`);
          }
        }

        log(`✅ Pulled changes from GitHub`);
        lastKnownCommit = latestSha;
        // Refresh snapshot so we don't re-push what we just pulled
        lastSnapshot = snapshotFiles();
        saveState();
      } catch (e) {
        log(`⚠ Compare failed: ${e.message}`);
        lastKnownCommit = latestSha;
        saveState();
      } finally {
        isSyncing = false;
      }
    } else {
      lastKnownCommit = latestSha;
      saveState();
    }
  } catch (e) {
    // silently ignore network errors
  }
}

function saveState() {
  try {
    writeFileSync(STATE_FILE, JSON.stringify({ lastKnownCommit }));
  } catch (e) {}
}

function loadState() {
  try {
    if (existsSync(STATE_FILE)) {
      const data = JSON.parse(readFileSync(STATE_FILE, 'utf8'));
      lastKnownCommit = data.lastKnownCommit || null;
      log(`Resumed from last commit: ${lastKnownCommit ? lastKnownCommit.slice(0, 7) : 'none'}`);
    }
  } catch (e) {}
}

function schedulePush(changedFiles) {
  if (pendingPush) clearTimeout(pendingPush);
  pendingPush = setTimeout(() => {
    pendingPush = null;
    pushToGitHub(changedFiles);
  }, PUSH_DEBOUNCE_MS);
}

async function checkLocalChanges() {
  if (isSyncing) return;
  const newSnap = snapshotFiles();
  const changed = detectChanges(lastSnapshot, newSnap);
  if (changed.length > 0) {
    log(`📝 ${changed.length} file(s) changed locally — will push in ${PUSH_DEBOUNCE_MS / 1000}s`);
    lastSnapshot = newSnap;
    schedulePush(changed);
  }
}

async function main() {
  if (!TOKEN) {
    log('❌ GITHUB_TOKEN not set. Set it in Replit Secrets.');
    process.exit(1);
  }

  log(`🚀 Auto-sync started — Replit ↔ github.com/${OWNER}/${REPO}`);
  loadState();

  // Get current GitHub commit
  if (!lastKnownCommit) {
    try {
      const ref = await api(`/repos/${OWNER}/${REPO}/git/ref/heads/${BRANCH}`);
      lastKnownCommit = ref.object.sha;
      log(`Current GitHub commit: ${lastKnownCommit.slice(0, 7)}`);
      saveState();
    } catch (e) {
      log(`⚠ Could not get current commit: ${e.message}`);
    }
  }

  // Take initial snapshot of local files
  lastSnapshot = snapshotFiles();
  log(`📸 Snapshot taken: ${lastSnapshot.size} files tracked`);

  // Poll local files for changes
  setInterval(checkLocalChanges, CHECK_CHANGES_MS);

  // Poll GitHub for remote commits
  setInterval(pullFromGitHub, POLL_GITHUB_MS);

  log(`✅ Auto-sync running — checks every ${CHECK_CHANGES_MS / 1000}s local, ${POLL_GITHUB_MS / 1000}s GitHub`);
}

main().catch(err => {
  console.error('Fatal error:', err.message);
  process.exit(1);
});
