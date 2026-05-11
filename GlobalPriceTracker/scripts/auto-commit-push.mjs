/**
 * Auto Commit & Push Service
 * Automatically commits changes to GitHub
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const execAsync = promisify(exec);

interface CommitResult {
  success: boolean;
  message: string;
  committedFiles: string[];
  commitHash?: string;
  timestamp: string;
}

class AutoCommitter {
  private repoRoot = path.join(__dirname, '..');
  private logFile = path.join(this.repoRoot, 'logs', 'auto-commit.log');

  constructor() {
    this.ensureLogDirectory();
  }

  /**
   * Ensure log directory exists
   */
  private ensureLogDirectory(): void {
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  /**
   * Get git status
   */
  async getStatus(): Promise<string> {
    try {
      const { stdout } = await execAsync('git status --short', { cwd: this.repoRoot });
      return stdout;
    } catch (error) {
      throw new Error(`Failed to get git status: ${error}`);
    }
  }

  /**
   * Get list of changed files
   */
  async getChangedFiles(): Promise<string[]> {
    try {
      const { stdout } = await execAsync('git diff --name-only --cached', { cwd: this.repoRoot });
      return stdout
        .split('\n')
        .filter(f => f.trim())
        .map(f => f.substring(3)); // Remove status prefix (M, A, D, etc.)
    } catch (error) {
      return [];
    }
  }

  /**
   * Check if there are changes to commit
   */
  async hasChanges(): Promise<boolean> {
    try {
      const status = await this.getStatus();
      return status.trim().length > 0;
    } catch {
      return false;
    }
  }

  /**
   * Stage all changes
   */
  async stageAll(): Promise<void> {
    try {
      await execAsync('git add -A', { cwd: this.repoRoot });
      console.log('✅ Staged all changes');
    } catch (error) {
      throw new Error(`Failed to stage changes: ${error}`);
    }
  }

  /**
   * Create commit message
   */
  private async createCommitMessage(): Promise<string> {
    const timestamp = new Date().toISOString().split('T')[0];
    const time = new Date().toLocaleTimeString();

    const changedFiles = await this.getChangedFiles();

    let message = `Auto-update: ${timestamp} ${time}

Changes:`;

    // Categorize changes
    const blogChanges = changedFiles.filter(f => f.includes('blog'));
    const priceChanges = changedFiles.filter(f => f.includes('data') || f.includes('products'));
    const codeChanges = changedFiles.filter(f => f.includes('src') || f.includes('client'));
    const otherChanges = changedFiles.filter(
      f => !blogChanges.includes(f) && !priceChanges.includes(f) && !codeChanges.includes(f)
    );

    if (blogChanges.length > 0) {
      message += `\n- 📝 Blog Posts: ${blogChanges.length} file(s)`;
    }
    if (priceChanges.length > 0) {
      message += `\n- 💰 Prices & Stock: ${priceChanges.length} file(s)`;
    }
    if (codeChanges.length > 0) {
      message += `\n- 💻 Code Updates: ${codeChanges.length} file(s)`;
    }
    if (otherChanges.length > 0) {
      message += `\n- 📦 Other Changes: ${otherChanges.length} file(s)`;
    }

    message += '\n\n[Auto-generated commit]';

    return message;
  }

  /**
   * Commit changes
   */
  async commit(): Promise<CommitResult> {
    const result: CommitResult = {
      success: false,
      message: '',
      committedFiles: [],
      timestamp: new Date().toISOString()
    };

    try {
      // Check if there are changes
      if (!(await this.hasChanges())) {
        result.message = 'No changes to commit';
        console.log('ℹ️ No changes to commit');
        return result;
      }

      // Stage all changes
      await this.stageAll();

      // Create commit message
      const commitMessage = await this.createCommitMessage();

      // Commit
      const { stdout: commitOutput } = await execAsync(
        `git commit -m "${commitMessage.replace(/"/g, '\\"')}"`,
        { cwd: this.repoRoot, maxBuffer: 10 * 1024 * 1024 }
      );

      // Get commit hash
      const { stdout: hashOutput } = await execAsync('git rev-parse HEAD', { cwd: this.repoRoot });
      result.commitHash = hashOutput.trim();

      result.committedFiles = await this.getChangedFiles();
      result.message = `Committed ${result.committedFiles.length} file(s)`;
      result.success = true;

      console.log(`✅ ${result.message}`);
      console.log(`📌 Commit: ${result.commitHash?.substring(0, 7)}`);

      return result;
    } catch (error) {
      result.message = `Commit failed: ${error}`;
      console.error(`❌ ${result.message}`);
      return result;
    }
  }

  /**
   * Push to remote
   */
  async push(): Promise<{ success: boolean; message: string }> {
    try {
      const { stdout } = await execAsync('git push origin main', { cwd: this.repoRoot });
      console.log('✅ Pushed to GitHub');
      return { success: true, message: 'Pushed to GitHub successfully' };
    } catch (error) {
      const message = `Push failed: ${error}`;
      console.error(`❌ ${message}`);
      return { success: false, message };
    }
  }

  /**
   * Commit and push
   */
  async commitAndPush(): Promise<{ commit: CommitResult; push: { success: boolean; message: string } }> {
    const commitResult = await this.commit();
    let pushResult = { success: false, message: 'Skipped (no commits)' };

    if (commitResult.success) {
      pushResult = await this.push();
    }

    return { commit: commitResult, push: pushResult };
  }

  /**
   * Log result
   */
  private logResult(result: any): void {
    const timestamp = new Date().toISOString();
    const logEntry = `\n${timestamp}\n${JSON.stringify(result, null, 2)}\n${'─'.repeat(80)}`;

    fs.appendFileSync(this.logFile, logEntry);
  }
}

/**
 * Main execution
 */
async function main() {
  try {
    console.log('🚀 Starting Auto-Commit & Push...\n');

    const committer = new AutoCommitter();
    const result = await committer.commitAndPush();

    if (result.push.success) {
      console.log('\n🎉 Auto-Commit & Push Complete!');
      process.exit(0);
    } else {
      console.log('\n⚠️ Commit successful but push failed. Check logs.');
      process.exit(0);
    }
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();
