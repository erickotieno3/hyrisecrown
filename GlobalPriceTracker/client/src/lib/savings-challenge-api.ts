import { apiRequest } from "./queryClient";

// Types from shared schema (can be imported if necessary)
export interface SavingsChallenge {
  id: number;
  title: string;
  description: string;
  targetAmount: number;
  deadline: string;
  category: string;
  difficultyLevel: string;
  createdAt: string;
  isCustom: boolean;
  createdBy?: number;
  currentAmount?: number;
  status?: 'active' | 'completed' | 'failed';
  rewards?: Reward[];
}

export interface Reward {
  id: number;
  name: string;
  description: string;
  image: string;
  type: 'badge' | 'voucher' | 'discount' | 'special';
  challengeId: number;
  value?: number;
  code?: string;
  expiresAt?: string;
  createdAt: string;
  earnedAt?: string;
  unlocked?: boolean;
}

export interface UserChallenge {
  id: number;
  userId: number;
  challengeId: number;
  currentAmount: number;
  status: 'active' | 'completed' | 'failed';
  startedAt: string;
  completedAt?: string;
}

/**
 * Fetch all available savings challenges
 */
export async function fetchChallenges(): Promise<SavingsChallenge[]> {
  try {
    const response = await apiRequest("GET", "/api/savings-challenge/challenges");
    const data = await response.json();
    return data.challenges || [];
  } catch (error) {
    console.error("Error fetching challenges:", error);
    return [];
  }
}

/**
 * Fetch a specific challenge by ID
 */
export async function fetchChallenge(id: number): Promise<SavingsChallenge | null> {
  try {
    const response = await apiRequest("GET", `/api/savings-challenge/challenges/${id}`);
    const data = await response.json();
    return data.challenge || null;
  } catch (error) {
    console.error(`Error fetching challenge (ID: ${id}):`, error);
    return null;
  }
}

/**
 * Start a challenge for the user
 */
export async function startChallenge(id: number): Promise<{ success: boolean; message: string; userChallenge?: UserChallenge }> {
  try {
    const response = await apiRequest("POST", `/api/savings-challenge/challenges/${id}/start`);
    const data = await response.json();
    return {
      success: response.ok,
      message: data.message || "Challenge started",
      userChallenge: data.userChallenge
    };
  } catch (error) {
    console.error(`Error starting challenge (ID: ${id}):`, error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to start challenge"
    };
  }
}

/**
 * Update challenge progress
 */
export async function updateChallengeProgress(id: number, amount: number): Promise<{
  success: boolean;
  message: string;
  userChallenge?: UserChallenge;
  unlockedRewards?: Reward[];
}> {
  try {
    const response = await apiRequest("POST", `/api/savings-challenge/challenges/${id}/progress`, { amount });
    const data = await response.json();
    
    return {
      success: response.ok,
      message: data.message || "Progress updated",
      userChallenge: data.userChallenge,
      unlockedRewards: data.unlockedRewards
    };
  } catch (error) {
    console.error(`Error updating challenge progress (ID: ${id}):`, error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to update progress"
    };
  }
}

/**
 * Get user's rewards
 */
export async function fetchUserRewards(): Promise<Reward[]> {
  try {
    const response = await apiRequest("GET", "/api/savings-challenge/rewards");
    const data = await response.json();
    return data.rewards || [];
  } catch (error) {
    console.error("Error fetching user rewards:", error);
    return [];
  }
}

/**
 * Create a custom savings challenge
 */
export async function createCustomChallenge(challengeData: {
  title: string;
  description: string;
  targetAmount: number;
  deadline: string;
  category?: string;
}): Promise<{ success: boolean; message: string; challenge?: SavingsChallenge }> {
  try {
    const response = await apiRequest("POST", "/api/savings-challenge/challenges/custom", challengeData);
    const data = await response.json();
    
    return {
      success: response.ok,
      message: data.message || "Custom challenge created",
      challenge: data.challenge
    };
  } catch (error) {
    console.error("Error creating custom challenge:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to create challenge"
    };
  }
}