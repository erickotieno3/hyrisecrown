/**
 * Savings Challenge Routes
 * 
 * This file contains routes for managing savings challenges and user rewards.
 */
import { Router, Request, Response, NextFunction } from 'express';
import { db } from './db';
import { eq, and, gte, sql, inArray } from 'drizzle-orm';

// Simplified for development - will be replaced with actual authentication in production
// This is a mock version for testing
const mockUser = {
  id: 1,
  username: 'test_user',
  email: 'test@example.com'
};

// Authentication check middleware - simplified version for development
const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  // For development testing, we'll attach a mock user
  req.user = mockUser;
  next();
};

// Define user types to suppress TypeScript errors
declare global {
  namespace Express {
    interface Request {
      isAuthenticated?: () => boolean;
      user?: {
        id: number;
        username: string;
        email: string;
        [key: string]: any;
      };
    }
  }
}
import { 
  savingsChallenges, 
  rewards,
  userChallenges,
  userRewards,
  insertUserChallengeSchema,
  insertUserRewardSchema
} from '../shared/schema';

export const savingsChallengeRouter = Router();

// Get all available challenges - Public endpoint
savingsChallengeRouter.get('/challenges', async (req: Request, res: Response) => {
  try {
    // Fetch all challenges from the database
    const allChallenges = await db.select().from(savingsChallenges);
    
    // If user is authenticated, fetch their progress
    if (req.user?.id) {
      const userChallengeData = await db.select().from(userChallenges)
        .where(eq(userChallenges.userId, req.user.id));
      
      // Map user progress to challenges
      const challengesWithProgress = allChallenges.map(challenge => {
        const userProgress = userChallengeData.find(
          uc => uc.challengeId === challenge.id
        );
        
        // Get rewards for this challenge
        const fetchRewards = async () => {
          const challengeRewards = await db.select().from(rewards)
            .where(eq(rewards.challengeId, challenge.id));
          
          // If user is authenticated, check which rewards are unlocked
          if (req.user?.id) {
            const unlockedRewards = await db.select().from(userRewards)
              .where(
                eq(userRewards.userId, req.user.id)
              );
            
            return challengeRewards.map(reward => ({
              ...reward,
              unlocked: unlockedRewards.some(ur => ur.rewardId === reward.id)
            }));
          }
          
          return challengeRewards.map(reward => ({
            ...reward,
            unlocked: false
          }));
        };
        
        return {
          ...challenge,
          currentAmount: userProgress?.currentAmount || 0,
          status: userProgress?.status || 'active',
          rewards: fetchRewards()
        };
      });
      
      res.json({ challenges: challengesWithProgress });
    } else {
      // Fetch rewards for each challenge
      const challengesWithRewards = await Promise.all(
        allChallenges.map(async (challenge) => {
          const challengeRewards = await db.select().from(rewards)
            .where(eq(rewards.challengeId, challenge.id));
          
          return {
            ...challenge,
            currentAmount: 0,
            status: 'active',
            rewards: challengeRewards.map(reward => ({
              ...reward,
              unlocked: false
            }))
          };
        })
      );
      
      res.json({ challenges: challengesWithRewards });
    }
  } catch (error) {
    console.error('Error fetching challenges:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch challenges'
    });
  }
});

// Get a specific challenge by ID
savingsChallengeRouter.get('/challenges/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const challengeId = parseInt(id);
    
    if (isNaN(challengeId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid challenge ID' 
      });
    }
    
    // Fetch challenge from database
    const [challenge] = await db.select().from(savingsChallenges)
      .where(eq(savingsChallenges.id, challengeId));
    
    if (!challenge) {
      return res.status(404).json({ 
        success: false, 
        message: 'Challenge not found' 
      });
    }
    
    // Fetch rewards for this challenge
    const challengeRewards = await db.select().from(rewards)
      .where(eq(rewards.challengeId, challengeId));
    
    let userProgress;
    let unlockedRewards: number[] = [];
    
    // If user is authenticated, get their progress
    if (req.user?.id) {
      const [userChallenge] = await db.select().from(userChallenges)
        .where(and(
          eq(userChallenges.userId, req.user.id),
          eq(userChallenges.challengeId, challengeId)
        ));
      
      userProgress = userChallenge;
      
      // Get unlocked rewards
      if (userChallenge) {
        const userRewardData = await db.select().from(userRewards)
          .where(
            eq(userRewards.userId, req.user.id)
          );
        
        unlockedRewards = userRewardData.map(ur => ur.rewardId);
      }
    }
    
    // Format response
    const challengeWithDetails = {
      ...challenge,
      currentAmount: userProgress?.currentAmount || 0,
      status: userProgress?.status || 'active',
      rewards: challengeRewards.map(reward => ({
        ...reward,
        unlocked: unlockedRewards.includes(reward.id)
      }))
    };
    
    res.json({ 
      success: true,
      challenge: challengeWithDetails
    });
  } catch (error) {
    console.error('Error fetching challenge:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch challenge details'
    });
  }
});

// Start a challenge for the user
savingsChallengeRouter.post('/challenges/:id/start', async (req: Request, res: Response) => {
  try {
    // Check if user is authenticated
    if (!req.user?.id) {
      return res.status(401).json({ 
        success: false, 
        message: 'You must be logged in to start a challenge' 
      });
    }
    
    const { id } = req.params;
    const challengeId = parseInt(id);
    
    if (isNaN(challengeId)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid challenge ID' 
      });
    }
    
    // Check if challenge exists
    const [challenge] = await db.select().from(savingsChallenges)
      .where(eq(savingsChallenges.id, challengeId));
    
    if (!challenge) {
      return res.status(404).json({ 
        success: false, 
        message: 'Challenge not found' 
      });
    }
    
    // Check if user already started this challenge
    const [existingUserChallenge] = await db.select().from(userChallenges)
      .where(and(
        eq(userChallenges.userId, req.user.id),
        eq(userChallenges.challengeId, challengeId)
      ));
    
    if (existingUserChallenge) {
      return res.status(400).json({ 
        success: false, 
        message: 'You have already started this challenge',
        userChallenge: existingUserChallenge
      });
    }
    
    // Create new user challenge
    const newUserChallenge = {
      userId: req.user.id,
      challengeId,
      currentAmount: 0,
      status: 'active',
      startedAt: new Date().toISOString(),
    };
    
    // Validate with schema
    const parsedData = insertUserChallengeSchema.safeParse(newUserChallenge);
    if (!parsedData.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid data',
        errors: parsedData.error.errors
      });
    }
    
    // Insert into database
    const [userChallenge] = await db.insert(userChallenges)
      .values(parsedData.data)
      .returning();
    
    res.status(201).json({ 
      success: true,
      message: 'Challenge started successfully',
      userChallenge
    });
  } catch (error) {
    console.error('Error starting challenge:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to start challenge'
    });
  }
});

// Update challenge progress
savingsChallengeRouter.post('/challenges/:id/progress', async (req: Request, res: Response) => {
  try {
    // Check if user is authenticated
    if (!req.user?.id) {
      return res.status(401).json({ 
        success: false, 
        message: 'You must be logged in to update challenge progress' 
      });
    }
    
    const { id } = req.params;
    const { amount } = req.body;
    const challengeId = parseInt(id);
    
    if (isNaN(challengeId) || typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid challenge ID or amount' 
      });
    }
    
    // Check if challenge exists
    const [challenge] = await db.select().from(savingsChallenges)
      .where(eq(savingsChallenges.id, challengeId));
    
    if (!challenge) {
      return res.status(404).json({ 
        success: false, 
        message: 'Challenge not found' 
      });
    }
    
    // Get user challenge or create if it doesn't exist
    let userChallenge = await db.select().from(userChallenges)
      .where(and(
        eq(userChallenges.userId, req.user.id),
        eq(userChallenges.challengeId, challengeId)
      ))
      .then(rows => rows[0]);
    
    if (!userChallenge) {
      // Start the challenge for the user
      const newUserChallenge = {
        userId: req.user.id,
        challengeId,
        currentAmount: 0,
        status: 'active',
        // startedAt is auto-generated with defaultNow()
      };
      
      userChallenge = await db.insert(userChallenges)
        .values([newUserChallenge])
        .returning()
        .then(rows => rows[0]);
    }
    
    // Check if challenge is already completed or failed
    if (userChallenge.status !== 'active') {
      return res.status(400).json({ 
        success: false, 
        message: `This challenge is already ${userChallenge.status}`,
        userChallenge
      });
    }
    
    // Calculate new amount
    const newAmount = userChallenge.currentAmount + amount;
    const isCompleted = newAmount >= challenge.targetAmount;
    
    // Update user challenge
    const status = isCompleted ? 'completed' : 'active';
    const completedAt = isCompleted ? new Date() : null;
    
    const [updatedUserChallenge] = await db.update(userChallenges)
      .set({ 
        currentAmount: newAmount,
        status,
        completedAt
      })
      .where(eq(userChallenges.id, userChallenge.id))
      .returning();
    
    // If challenge completed, unlock rewards
    let unlockedRewards: any[] = [];
    if (isCompleted) {
      // Get all rewards for this challenge
      const challengeRewards = await db.select().from(rewards)
        .where(eq(rewards.challengeId, challengeId));
      
      // For each reward, create a user reward record
      for (const reward of challengeRewards) {
        const userReward = {
          userId: req.user.id,
          rewardId: reward.id,
          challengeId
          // earnedAt is auto-generated with defaultNow()
        };
        
        // Validate with schema
        const parsedData = insertUserRewardSchema.safeParse(userReward);
        if (parsedData.success) {
          // Check if already exists
          const [existingReward] = await db.select().from(userRewards)
            .where(and(
              eq(userRewards.userId, req.user.id),
              eq(userRewards.rewardId, reward.id)
            ));
          
          if (!existingReward) {
            await db.insert(userRewards).values([parsedData.data]);
            // Get the newly created user reward to get its earned timestamp
            const [newUserReward] = await db.select().from(userRewards)
              .where(and(
                eq(userRewards.userId, req.user.id),
                eq(userRewards.rewardId, reward.id)
              ));
            
            unlockedRewards.push({
              ...reward,
              unlocked: true,
              earnedAt: newUserReward?.earnedAt
            });
          }
        }
      }
    }
    
    res.json({ 
      success: true,
      message: isCompleted ? 'Challenge completed!' : 'Progress updated',
      userChallenge: updatedUserChallenge,
      unlockedRewards: unlockedRewards.length > 0 ? unlockedRewards : undefined
    });
  } catch (error) {
    console.error('Error updating challenge progress:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update challenge progress'
    });
  }
});

// Get user's rewards
savingsChallengeRouter.get('/rewards', async (req: Request, res: Response) => {
  try {
    // Check if user is authenticated
    if (!req.user?.id) {
      return res.status(401).json({ 
        success: false, 
        message: 'You must be logged in to view your rewards' 
      });
    }
    
    // Get all user rewards
    const userRewardData = await db.select().from(userRewards)
      .where(eq(userRewards.userId, req.user.id));
    
    if (userRewardData.length === 0) {
      return res.json({ rewards: [] });
    }
    
    // Get reward details
    const rewardIds = userRewardData.map(ur => ur.rewardId);
    const rewardDetails = await db.select().from(rewards)
      .where(inArray(rewards.id, rewardIds));
    
    // Combine data
    const userRewardsWithDetails = rewardDetails.map(reward => {
      const userReward = userRewardData.find(ur => ur.rewardId === reward.id);
      return {
        ...reward,
        unlocked: true,
        earnedAt: userReward?.earnedAt
      };
    });
    
    res.json({ rewards: userRewardsWithDetails });
  } catch (error) {
    console.error('Error fetching user rewards:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch rewards'
    });
  }
});

// Create a custom savings challenge
savingsChallengeRouter.post('/challenges/custom', async (req: Request, res: Response) => {
  try {
    // Check if user is authenticated
    if (!req.user?.id) {
      return res.status(401).json({ 
        success: false, 
        message: 'You must be logged in to create a custom challenge' 
      });
    }
    
    const { title, description, targetAmount, deadline, category = 'custom' } = req.body;
    
    // Validate required fields
    if (!title || !description || !targetAmount || !deadline) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields'
      });
    }
    
    // Create custom challenge
    const newChallenge = {
      title,
      description,
      targetAmount,
      deadline: new Date(deadline),
      category,
      difficultyLevel: 'medium',
      isCustom: true,
      createdBy: req.user.id
    };
    
    // Insert challenge
    const [challenge] = await db.insert(savingsChallenges)
      .values([newChallenge])
      .returning();
    
    // Create a default reward for custom challenges
    const defaultReward = {
      name: 'Custom Challenge Badge',
      description: `Earned for completing ${title}`,
      image: '/rewards/early-adopter.svg', // Default image
      type: 'badge',
      challengeId: challenge.id
      // createdAt is auto-generated with defaultNow()
    };
    
    await db.insert(rewards).values([defaultReward]);
    
    res.status(201).json({ 
      success: true,
      message: 'Custom challenge created successfully',
      challenge
    });
  } catch (error) {
    console.error('Error creating custom challenge:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create custom challenge'
    });
  }
});