/**
 * GitHub API Push Script
 * Pushes all project files to GitHub using the REST API (no git commands needed)
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, relative } from 'path';

const TOKEN = process.env.GITHUB_TOKEN;
const OWNER = 'erickotieno3';
const REPO = 'hyrisecrown';
const BRANCH = 'main';
const ROOT = '/home/runner/workspace';

const IGNORE = [
  'node_modules', '.git', '.cache', 'dist', 'build', '.replit',
  'replit.nix', '.config', 'logs', '__pycache__', '.npm',
  'scripts/github-api-push.mjs'
];

const headers = {
  'Authorization': `token ${TOKEN}`,
  'Accept': 'application/vnd.github.v3+json',
  'Content-Type': 'application/json',
  'User-Agent': 'HyriseCrown-Push'
};

async function api(path, method = 'GET', body = null) {
  const res = await fetch(`https://api.github.com${path}`, {
    method,
    headers,
    ...(body ? { body: JSON.stringify(body) } : {})
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`API ${path}: ${data.message}`);
  return data;
}

function getAllFiles(dir, base = dir) {
  const files = [];
  try {
    for (const item of readdirSync(dir)) {
      if (IGNORE.some(ig => item === ig || item.startsWith('.'))) continue;
      const full = join(dir, item);
      const rel = relative(base, full);
      try {
        const stat = statSync(full);
        if (stat.isDirectory()) {
          files.push(...getAllFiles(full, base));
        } else if (stat.size < 1024 * 1024) { // skip files > 1MB
          files.push(rel);
        }
      } catch (e) { /* skip unreadable */ }
    }
  } catch (e) { /* skip unreadable dirs */ }
  return files;
}

async function createBlob(content) {
  const data = await api(`/repos/${OWNER}/${REPO}/git/blobs`, 'POST', {
    content: Buffer.from(content).toString('base64'),
    encoding: 'base64'
  });
  return data.sha;
}

async function run() {
  console.log(`Pushing to github.com/${OWNER}/${REPO}...`);

  // Get current branch SHA
  let baseTreeSha, baseSha;
  try {
    const ref = await api(`/repos/${OWNER}/${REPO}/git/ref/heads/${BRANCH}`);
    baseSha = ref.object.sha;
    const commit = await api(`/repos/${OWNER}/${REPO}/git/commits/${baseSha}`);
    baseTreeSha = commit.tree.sha;
    console.log(`Current branch: ${BRANCH} @ ${baseSha.slice(0,7)}`);
  } catch (e) {
    // Branch doesn't exist — try creating from default
    console.log('Branch not found, will create it');
    baseTreeSha = null;
    baseSha = null;
  }

  // Gather all files
  const files = getAllFiles(ROOT);
  console.log(`Preparing ${files.length} files...`);

  // Create blobs in batches
  const treeItems = [];
  let done = 0;
  for (const file of files) {
    try {
      const content = readFileSync(join(ROOT, file));
      const sha = await createBlob(content);
      treeItems.push({ path: file, mode: '100644', type: 'blob', sha });
      done++;
      if (done % 20 === 0) console.log(`  ${done}/${files.length} files uploaded...`);
    } catch (e) {
      // skip binary/unreadable files
    }
  }
  console.log(`Uploaded ${done} files. Creating tree...`);

  // Create tree
  const treeBody = { tree: treeItems };
  if (baseTreeSha) treeBody.base_tree = baseTreeSha;
  const tree = await api(`/repos/${OWNER}/${REPO}/git/trees`, 'POST', treeBody);

  // Create commit
  const commitBody = {
    message: 'Full platform update: Google Play ready, contact email updated, PWA manifest, TypeScript fixes, Android TWA config',
    tree: tree.sha,
    author: { name: 'Erick Otieno', email: 'erickotienokjv@gmail.com' }
  };
  if (baseSha) commitBody.parents = [baseSha];
  const commit = await api(`/repos/${OWNER}/${REPO}/git/commits`, 'POST', commitBody);
  console.log(`Created commit: ${commit.sha.slice(0,7)}`);

  // Update branch ref
  try {
    await api(`/repos/${OWNER}/${REPO}/git/refs/heads/${BRANCH}`, 'PATCH', {
      sha: commit.sha,
      force: true
    });
  } catch (e) {
    // Create ref if it doesn't exist
    await api(`/repos/${OWNER}/${REPO}/git/refs`, 'POST', {
      ref: `refs/heads/${BRANCH}`,
      sha: commit.sha
    });
  }

  console.log(`\n✅ Successfully pushed to github.com/${OWNER}/${REPO}/tree/${BRANCH}`);
}

run().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
