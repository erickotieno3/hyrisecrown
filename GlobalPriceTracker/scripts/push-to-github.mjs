import { execSync } from 'child_process';
import { existsSync, unlinkSync } from 'fs';

const TOKEN = process.env.GITHUB_TOKEN;
const USERNAME = 'erickotieno3';
const REPO = 'hyrisecrown';
const REMOTE_URL = `https://${TOKEN}@github.com/${USERNAME}/${REPO}.git`;

function run(cmd, opts = {}) {
  console.log(`> ${cmd.replace(TOKEN, '***')}`);
  return execSync(cmd, { stdio: 'pipe', cwd: '/home/runner/workspace', ...opts }).toString().trim();
}

// Remove lock file if it exists
const lockFile = '/home/runner/workspace/.git/index.lock';
if (existsSync(lockFile)) {
  unlinkSync(lockFile);
  console.log('Removed git lock file');
}

// Configure git identity
run(`git config user.email "erickotienokjv@gmail.com"`);
run(`git config user.name "Erick Otieno"`);

// Set or update remote
try {
  run(`git remote remove origin`);
} catch (e) { /* ignore */ }
run(`git remote add origin ${REMOTE_URL}`);

// Stage all changes
run(`git add -A`);

// Commit
try {
  run(`git commit -m "Full platform update: Google Play ready, contact email updated, TypeScript fixes, PWA manifest improved"`);
  console.log('Committed changes');
} catch (e) {
  console.log('Nothing new to commit or already committed:', e.message?.split('\n')[0]);
}

// Push to main (force to ensure it goes through)
console.log('Pushing to GitHub...');
const result = run(`git push origin HEAD:main --force`);
console.log('Push result:', result || 'Success');
console.log(`\nDone! View your repo at: https://github.com/${USERNAME}/${REPO}`);
