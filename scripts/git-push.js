import { execSync } from 'child_process';

const TOKEN = process.env.GITHUB_TOKEN || process.env.REPLIT_AUTOSYNC;
if (!TOKEN) {
  console.error('ERROR: Set GITHUB_TOKEN in Replit Secrets first.');
  process.exit(1);
}

const REPO = 'erickotieno3/hyrisecrown';
const BRANCH = 'main';
const URL = `https://erickotieno3:${TOKEN}@github.com/${REPO}.git`;

function run(cmd) {
  console.log(`> ${cmd}`);
  try {
    return execSync(cmd, { encoding: 'utf8', cwd: '/home/runner/workspace' });
  } catch (e) {
    console.error(e.stderr || e.message);
    return '';
  }
}

console.log('=== Git Push Setup ===');
console.log(`Target: ${REPO}`);

console.log('\n=== Adding files ===');
run(`git add -A`);

console.log('\n=== Committing ===');
run(`git -c user.name="Erick Otieno" -c user.email="erickotienokjv@gmail.com" commit -m "Push from Replit: ${new Date().toISOString().slice(0,16)}"`);

console.log('\n=== Updating remote ===');
run(`git remote remove origin`);
run(`git remote add origin ${URL}`);

console.log('\n=== Pushing ===');
run(`git push origin HEAD:${BRANCH} --force`);

console.log(`\n✅ Done: https://github.com/${REPO}`);
