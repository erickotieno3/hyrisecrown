import { db } from '../server/db';
import { savingsChallenges, rewards } from '../shared/schema';

async function main() {
  console.log('Seeding savings challenges and rewards...');
  
  // Create savings challenges
  const [weeklyGrocerySaver] = await db.insert(savingsChallenges).values({
    title: "Weekly Grocery Saver",
    description: "Save 15% on your weekly grocery shopping by comparing prices across stores.",
    targetAmount: 25,
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    category: 'groceries',
    difficultyLevel: 'easy',
    isCustom: false,
    createdAt: new Date()
  }).returning();
  
  const [electronicsDealHunter] = await db.insert(savingsChallenges).values({
    title: "Electronics Deal Hunter",
    description: "Find the best deals on electronics across 5 different marketplaces.",
    targetAmount: 100,
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    category: 'electronics',
    difficultyLevel: 'medium',
    isCustom: false,
    createdAt: new Date()
  }).returning();
  
  const [monthlyBudgetMaster] = await db.insert(savingsChallenges).values({
    title: "Monthly Budget Master",
    description: "Save £200 on your monthly shopping by using price comparison tools.",
    targetAmount: 200,
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    category: 'general',
    difficultyLevel: 'hard',
    isCustom: false,
    createdAt: new Date()
  }).returning();
  
  // Create rewards for the challenges
  await db.insert(rewards).values({
    name: "Smart Shopper",
    description: "Earned for completing your first grocery savings challenge",
    image: "/rewards/smart-shopper-badge.svg",
    type: "badge",
    challengeId: weeklyGrocerySaver.id,
    createdAt: new Date()
  });
  
  await db.insert(rewards).values([
    {
      name: "Tech Wizard",
      description: "You've mastered finding the best tech deals",
      image: "/rewards/tech-wizard-badge.svg",
      type: "badge",
      challengeId: electronicsDealHunter.id,
      createdAt: new Date()
    },
    {
      name: "£5 Amazon Voucher",
      description: "A £5 Amazon voucher for your next purchase",
      image: "/rewards/amazon-voucher.svg",
      type: "voucher",
      challengeId: electronicsDealHunter.id,
      value: 5,
      code: "AMAZON5",
      createdAt: new Date()
    }
  ]);
  
  await db.insert(rewards).values([
    {
      name: "Budget Guru",
      description: "You've become a master of savings",
      image: "/rewards/budget-guru-badge.svg",
      type: "badge",
      challengeId: monthlyBudgetMaster.id,
      createdAt: new Date()
    },
    {
      name: "Premium Tier Free Month",
      description: "One month of premium features for free",
      image: "/rewards/premium-tier.svg",
      type: "special",
      challengeId: monthlyBudgetMaster.id,
      code: "PREMIUM1MONTH",
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      createdAt: new Date()
    }
  ]);
  
  console.log('✅ Savings challenges and rewards seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding challenges:', e);
    process.exit(1);
  })
  .finally(async () => {
    process.exit(0);
  });