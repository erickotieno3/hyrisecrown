import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative } from 'path';

const TOKEN = process.env.GITHUB_TOKEN;
const OWNER = 'erickotieno3';
const REPO = 'hyrisecrown';
const BRANCH = 'main';
const ROOT = '/home/runner/workspace';
const IGNORE = ['node_modules', '.git', '.cache', 'dist', 'build', '.replit', '.local', '.upm'];

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function getAllFiles(dir, base = dir) {
  const files = [];
  for (const item of readdirSync(dir)) {
    if (IGNORE.some(ig => item === ig || item.startsWith('.'))) continue;
    const full = join(dir, item);
    const stat = statSync(full);
    if (stat.isDirectory()) files.push(...getAllFiles(full, base));
    else if (stat.size < 1024 * 1024) files.push({ path: relative(base, full), content: readFileSync(full) });
  }
  return files;
}

async function api(path, method = 'GET', body = null) {
  const res = await fetch(`https://api.github.com${path}`, {
    method, headers: {
      'Authorization': `token ${TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      'User-Agent': 'HyriseCrown-Push'
    },
    ...(body ? { body: JSON.stringify(body) } : {})
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`${path}: ${data.message}`);
  return data;
}

async function push() {
  const allFiles = getAllFiles(ROOT);
  console.log(`Pushing ${allFiles.length} files...`);
  const ref = await api(`/repos/${OWNER}/${REPO}/git/ref/heads/${BRANCH}`);
  const baseSha = ref.object.sha;
  const commit = await api(`/repos/${OWNER}/${REPO}/git/commits/${baseSha}`);
  const baseTreeSha = commit.tree.sha;

  const treeItems = [];
  const BATCH_SIZE = 40;
  const DELAY_MS = 2000;

  for (let i = 0; i < allFiles.length; i += BATCH_SIZE) {
    const batch = allFiles.slice(i, i + BATCH_SIZE);
    console.log(`  Batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(allFiles.length / BATCH_SIZE)}: ${batch.length} files`);

    for (const f of batch) {
      const blob = await api(`/repos/${OWNER}/${REPO}/git/blobs`, 'POST', {
        content: Buffer.from(f.content).toString('base64'), encoding: 'base64'
      });
      treeItems.push({ path: f.path, mode: '100644', type: 'blob', sha: blob.sha });
      await sleep(300); // 300ms delay between each blob to avoid rate limits
    }

    if (i + BATCH_SIZE < allFiles.length) {
      console.log(`    Waiting ${DELAY_MS}ms before next batch...`);
      await sleep(DELAY_MS);
    }
  }

  console.log(`Creating tree with ${treeItems.length} items...`);
  const tree = await api(`/repos/${OWNER}/${REPO}/git/trees`, 'POST', { tree: treeItems, base_tree: baseTreeSha });

  const newCommit = await api(`/repos/${OWNER}/${REPO}/git/commits`, 'POST', {
    message: `Manual push: ${new Date().toISOString().slice(0, 16)}`,
    tree: tree.sha, parents: [baseSha],
    author: { name: 'Erick Otieno', email: 'erickotienokjv@gmail.com' }
  });

  await api(`/repos/${OWNER}/${REPO}/git/refs/heads/${BRANCH}`, 'PATCH', { sha: newCommit.sha, force: true });
  console.log(`✅ Pushed! Commit: ${newCommit.sha.slice(0, 7)}`);
}

push().catch(err => console.error('❌ Failed:', err.message));
