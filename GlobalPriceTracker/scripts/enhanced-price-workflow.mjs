#!/usr/bin/env node

/**
 * Enhanced Price Update & Notification Workflow
 * Fetches real-time prices from supermarket chains and sends push notifications
 * Integrates: real-time fetcher → notification service → auto-commits
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class EnhancedPriceWorkflow {
  constructor() {
    this.startTime = new Date();
    this.results = {
      fetchedProducts: 0,
      priceChanges: 0,
      notificationsSent: 0,
      commitsPushed: 0,
      errors: []
    };
  }

  /**
   * Run a script via npm
   */
  async runScript(scriptPath, args = []) {
    return new Promise((resolve, reject) => {
      console.log(`\n▶️  Running: ${path.basename(scriptPath)}\n`);

      const proc = spawn('node', [scriptPath, ...args], {
        cwd: path.dirname(__dirname),
        stdio: 'inherit'
      });

      proc.on('close', (code) => {
        if (code === 0) {
          console.log(`✅ ${path.basename(scriptPath)} completed\n`);
          resolve(code);
        } else {
          console.error(`❌ ${path.basename(scriptPath)} failed with code ${code}\n`);
          reject(new Error(`Script failed: ${scriptPath}`));
        }
      });

      proc.on('error', (error) => {
        console.error(`❌ Error running script: ${error.message}`);
        reject(error);
      });
    });
  }

  /**
   * Load JSON file from data directory
   */
  loadDataFile(filename) {
    const filepath = path.join(__dirname, '..', 'data', filename);
    try {
      if (fs.existsSync(filepath)) {
        return JSON.parse(fs.readFileSync(filepath, 'utf-8'));
      }
    } catch (error) {
      console.error(`Error loading ${filename}:`, error.message);
    }
    return null;
  }

  /**
   * Step 1: Fetch real-time prices
   */
  async stepFetchPrices() {
    console.log('\n═══════════════════════════════════════════════════');
    console.log('  STEP 1: Fetching Real-Time Prices');
    console.log('═══════════════════════════════════════════════════\n');

    try {
      await this.runScript(path.join(__dirname, 'real-time-price-fetcher.mjs'));
      
      // Load fetch summary
      const summary = this.loadDataFile('price-fetch-summary.json');
      if (summary) {
        this.results.fetchedProducts = summary.totalProductsFetched;
        console.log(`📊 Fetched: ${summary.totalProductsFetched} products from ${summary.storesMonitored.length} stores\n`);
      }
    } catch (error) {
      console.error('❌ Price fetching failed:', error.message);
      this.results.errors.push('fetch_failed');
      // Continue with other steps
    }
  }

  /**
   * Step 2: Send push notifications
   */
  async stepSendNotifications() {
    console.log('\n═══════════════════════════════════════════════════');
    console.log('  STEP 2: Sending Push Notifications');
    console.log('═══════════════════════════════════════════════════\n');

    try {
      await this.runScript(path.join(__dirname, 'push-notification-service.mjs'));
      
      // Load notification summary
      const summary = this.loadDataFile('notification-summary.json');
      if (summary) {
        this.results.notificationsSent = summary.notificationsSent;
        console.log(`📢 Notifications: ${summary.notificationsSent} sent to ${summary.totalSubscriptions} users\n`);
      }
    } catch (error) {
      console.error('❌ Notification sending failed:', error.message);
      this.results.errors.push('notifications_failed');
      // Continue with other steps
    }
  }

  /**
   * Step 3: Auto commit and push
   */
  async stepAutoCommit() {
    console.log('\n═══════════════════════════════════════════════════');
    console.log('  STEP 3: Auto Commit & Push to GitHub');
    console.log('═══════════════════════════════════════════════════\n');

    try {
      await this.runScript(path.join(__dirname, 'auto-commit-push.mjs'));
      this.results.commitsPushed = 1;
    } catch (error) {
      console.error('❌ Auto commit failed:', error.message);
      this.results.errors.push('commit_failed');
    }
  }

  /**
   * Generate comprehensive summary
   */
  generateSummary() {
    const duration = Math.round((new Date() - this.startTime) / 1000);
    
    return {
      timestamp: new Date().toISOString(),
      duration: `${duration}s`,
      status: this.results.errors.length === 0 ? 'success' : 'partial_success',
      results: {
        productsMonitored: this.results.fetchedProducts,
        priceChanges: this.results.priceChanges,
        notificationsSent: this.results.notificationsSent,
        commitsPushed: this.results.commitsPushed
      },
      errors: this.results.errors.length > 0 ? this.results.errors : 'none',
      nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      dataFiles: {
        prices: 'data/real-time-prices.json',
        priceComparison: 'data/price-comparison.json',
        notifications: 'data/notification-summary.json',
        summary: 'data/enhanced-workflow-summary.json'
      }
    };
  }

  /**
   * Save summary to file
   */
  saveSummary() {
    const summary = this.generateSummary();
    const dataDir = path.join(__dirname, '..', 'data');
    const summaryFile = path.join(dataDir, 'enhanced-workflow-summary.json');

    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    fs.writeFileSync(summaryFile, JSON.stringify(summary, null, 2));
    return summary;
  }

  /**
   * Run complete workflow
   */
  async run() {
    console.log('\n╔═══════════════════════════════════════════════════╗');
    console.log('║  ENHANCED PRICE UPDATE & NOTIFICATION WORKFLOW  ║');
    console.log('║  Real-time prices + Push alerts + Auto-commit   ║');
    console.log('╚═══════════════════════════════════════════════════╝\n');

    try {
      // Step 1: Fetch prices
      await this.stepFetchPrices();

      // Step 2: Send notifications
      await this.stepSendNotifications();

      // Step 3: Auto commit
      await this.stepAutoCommit();

      // Summary
      const summary = this.saveSummary();

      console.log('\n╔═══════════════════════════════════════════════════╗');
      console.log('║  ✅ WORKFLOW COMPLETED                          ║');
      console.log('╚═══════════════════════════════════════════════════╝\n');

      console.log(`📊 Summary:`);
      console.log(`   Products Fetched: ${summary.results.productsMonitored}`);
      console.log(`   Notifications Sent: ${summary.results.notificationsSent}`);
      console.log(`   Commits Pushed: ${summary.results.commitsPushed}`);
      console.log(`   Duration: ${summary.duration}`);
      console.log(`   Status: ${summary.status}`);

      if (summary.errors !== 'none') {
        console.log(`\n⚠️  Errors encountered:`);
        summary.errors.forEach(err => console.log(`   - ${err}`));
      }

      console.log(`\n📁 Data files saved:`);
      Object.entries(summary.dataFiles).forEach(([key, file]) => {
        console.log(`   - ${file}`);
      });

      console.log(`\n✨ Next run: ${summary.nextRun}\n`);

      process.exit(summary.errors !== 'none' ? 1 : 0);
    } catch (error) {
      console.error('\n❌ Workflow failed:', error.message);
      
      const summary = this.saveSummary();
      console.log('\nWorkflow summary saved despite errors.');
      
      process.exit(1);
    }
  }
}

// Run the workflow
const workflow = new EnhancedPriceWorkflow();
await workflow.run();
