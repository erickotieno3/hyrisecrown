/**
 * Seed Script for Savings Challenges
 * Run with: node scripts/seed-savings-challenges.js
 */

import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from 'ws';

// Configure neon to use WebSockets
neonConfig.webSocketConstructor = ws;

// Challenge data to seed
const challenges = [
  {
    title: "Weekly Grocery Saver",
    description: "Save 15% on your weekly grocery shopping by comparing prices across stores.",
    targetAmount: 25,
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    category: "groceries",
    difficultyLevel: "easy",
    isCustom: false,
  },
  {
    title: "Electronics Deal Hunter",
    description: "Find the best deals on electronics across 5 different marketplaces.",
    targetAmount: 100,
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    category: "electronics",
    difficultyLevel: "medium",
    isCustom: false,
  },
  {
    title: "Monthly Budget Master",
    description: "Save £200 on your monthly shopping by using price comparison tools.",
    targetAmount: 200,
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    category: "general",
    difficultyLevel: "hard",
    isCustom: false,
  }
];

// Reward data to seed
const rewards = [
  {
    challengeIndex: 0, // Will be replaced with actual challengeId
    name: "Smart Shopper",
    description: "Earned for completing your first grocery savings challenge",
    image: "/rewards/smart-shopper-badge.svg",
    type: "badge",
  },
  {
    challengeIndex: 1, // Will be replaced with actual challengeId
    name: "Tech Wizard",
    description: "You've mastered finding the best tech deals",
    image: "/rewards/tech-wizard-badge.svg",
    type: "badge",
  },
  {
    challengeIndex: 1, // Will be replaced with actual challengeId
    name: "£5 Amazon Voucher",
    description: "A £5 Amazon voucher for your next purchase",
    image: "/rewards/amazon-voucher.svg",
    type: "voucher",
    value: 5,
    code: "AMZN-TEST-2025",
  },
  {
    challengeIndex: 2, // Will be replaced with actual challengeId
    name: "Budget Guru",
    description: "You've become a master of savings",
    image: "/rewards/budget-guru-badge.svg",
    type: "badge",
  },
  {
    challengeIndex: 2, // Will be replaced with actual challengeId
    name: "Premium Tier Free Month",
    description: "One month of premium features for free",
    image: "/rewards/premium-tier.svg",
    type: "special",
    code: "PREMIUM-FREE-1M"
  }
];

// Main function to seed the database
async function seedDatabase() {
  console.log('Starting database seed for savings challenges...');
  
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable not set!');
    process.exit(1);
  }
  
  // Connect to database
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();
  
  try {
    console.log('Connected to database successfully.');
    
    // Check if challenges already exist
    const existingChallenges = await client.query('SELECT COUNT(*) FROM savings_challenges');
    const challengeCount = parseInt(existingChallenges.rows[0].count);
    
    if (challengeCount > 0) {
      console.log(`Database already has ${challengeCount} challenges. Skipping seed.`);
      console.log('To force re-seed, first delete existing data with:');
      console.log('DELETE FROM user_rewards; DELETE FROM user_challenges; DELETE FROM rewards; DELETE FROM savings_challenges;');
      return;
    }
    
    // Insert challenges
    console.log('Seeding challenges...');
    const challengeIds = [];
    
    for (const challenge of challenges) {
      const result = await client.query(
        `INSERT INTO savings_challenges 
         (title, description, target_amount, deadline, category, difficulty_level, is_custom) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) 
         RETURNING id`,
        [
          challenge.title,
          challenge.description,
          challenge.targetAmount,
          challenge.deadline,
          challenge.category,
          challenge.difficultyLevel,
          challenge.isCustom
        ]
      );
      
      challengeIds.push(result.rows[0].id);
      console.log(`Added challenge: ${challenge.title} (ID: ${result.rows[0].id})`);
    }
    
    // Insert rewards
    console.log('\nSeeding rewards...');
    
    for (const reward of rewards) {
      const challengeId = challengeIds[reward.challengeIndex];
      
      await client.query(
        `INSERT INTO rewards 
         (name, description, image, type, challenge_id, value, code) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          reward.name,
          reward.description,
          reward.image,
          reward.type,
          challengeId,
          reward.value || null,
          reward.code || null
        ]
      );
      
      console.log(`Added reward: ${reward.name} for challenge ID ${challengeId}`);
    }
    
    console.log('\nDatabase seed completed successfully!');
    console.log(`Added ${challengeIds.length} challenges and ${rewards.length} rewards.`);
    
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

seedDatabase();