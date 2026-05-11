import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Target, Star, Gift, TrendingUp, Sparkles, Calendar, Check, Clock, Award } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { 
  fetchChallenges, 
  fetchUserRewards, 
  updateChallengeProgress, 
  createCustomChallenge, 
  SavingsChallenge, 
  Reward 
} from '@/lib/savings-challenge-api';

// Fallback challenges in case API fails
const fallbackChallenges: SavingsChallenge[] = [
  {
    id: 1,
    title: "Weekly Grocery Saver",
    description: "Save 15% on your weekly grocery shopping by comparing prices across stores.",
    targetAmount: 25,
    currentAmount: 0,
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    category: 'groceries',
    difficultyLevel: 'easy',
    createdAt: new Date().toISOString(),
    isCustom: false,
    rewards: [
      {
        id: 101,
        name: "Smart Shopper",
        description: "Earned for completing your first grocery savings challenge",
        image: "/rewards/smart-shopper-badge.svg",
        type: 'badge',
        challengeId: 1,
        createdAt: new Date().toISOString(),
        unlocked: false
      }
    ]
  },
  {
    id: 2,
    title: "Electronics Deal Hunter",
    description: "Find the best deals on electronics across 5 different marketplaces.",
    targetAmount: 100,
    currentAmount: 0,
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    category: 'electronics',
    difficultyLevel: 'medium',
    createdAt: new Date().toISOString(),
    isCustom: false,
    rewards: [
      {
        id: 102,
        name: "Tech Wizard",
        description: "You've mastered finding the best tech deals",
        image: "/rewards/tech-wizard-badge.svg",
        type: 'badge',
        challengeId: 2,
        createdAt: new Date().toISOString(),
        unlocked: false
      },
      {
        id: 103,
        name: "£5 Amazon Voucher",
        description: "A £5 Amazon voucher for your next purchase",
        image: "/rewards/amazon-voucher.svg",
        type: 'voucher',
        challengeId: 2,
        createdAt: new Date().toISOString(),
        unlocked: false
      }
    ]
  },
  {
    id: 3,
    title: "Monthly Budget Master",
    description: "Save £200 on your monthly shopping by using price comparison tools.",
    targetAmount: 200,
    currentAmount: 50,
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'active',
    category: 'general',
    difficultyLevel: 'hard',
    createdAt: new Date().toISOString(),
    isCustom: false,
    rewards: [
      {
        id: 104,
        name: "Budget Guru",
        description: "You've become a master of savings",
        image: "/rewards/budget-guru-badge.svg",
        type: 'badge',
        challengeId: 3,
        createdAt: new Date().toISOString(),
        unlocked: false
      },
      {
        id: 105,
        name: "Premium Tier Free Month",
        description: "One month of premium features for free",
        image: "/rewards/premium-tier.svg",
        type: 'special',
        challengeId: 3,
        createdAt: new Date().toISOString(),
        unlocked: false
      }
    ]
  }
];

const SavingsChallengePage: React.FC = () => {
  const [challenges, setChallenges] = useState<SavingsChallenge[]>([]);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [userBadges, setUserBadges] = useState<Reward[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  // Fetch challenges and badges from the API
  useEffect(() => {
    const fetchChallengesAndBadges = async () => {
      setIsLoading(true);
      try {
        // Fetch challenges from API
        const challengeData = await fetchChallenges();
        if (challengeData.length > 0) {
          setChallenges(challengeData);
        } else {
          // Use fallback data if API returns empty
          setChallenges(fallbackChallenges);
        }
        
        // Fetch user rewards
        const rewardsData = await fetchUserRewards();
        if (rewardsData.length > 0) {
          setUserBadges(rewardsData);
        } else {
          // Add a default badge for new users if no rewards found
          setUserBadges([
            {
              id: 201,
              name: "Early Adopter",
              description: "One of the first to try the savings challenge feature",
              image: "/rewards/early-adopter.svg",
              unlocked: true,
              type: 'badge',
              challengeId: 0,
              createdAt: new Date().toISOString()
            }
          ]);
        }
      } catch (error) {
        console.error("Error fetching challenges:", error);
        // Use fallback data on error
        setChallenges(fallbackChallenges);
        setUserBadges([
          {
            id: 201,
            name: "Early Adopter",
            description: "One of the first to try the savings challenge feature",
            image: "/rewards/early-adopter.svg",
            unlocked: true,
            type: 'badge',
            challengeId: 0,
            createdAt: new Date().toISOString()
          }
        ]);
        
        toast({
          title: "Error loading challenges",
          description: "Using sample data instead. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchChallengesAndBadges();
  }, [toast]);

  // Function to update a challenge progress
  const handleProgressUpdate = async (challengeId: number, amount: number) => {
    try {
      // Call the API to update the challenge progress
      const result = await updateChallengeProgress(challengeId, amount);
      
      if (result.success) {
        // Find the challenge that was updated
        const updatedChallenges = challenges.map(challenge => {
          if (challenge.id === challengeId) {
            // If user challenge was returned from API, use its values
            if (result.userChallenge) {
              return {
                ...challenge,
                currentAmount: result.userChallenge.currentAmount,
                status: result.userChallenge.status,
              };
            }
            // Otherwise calculate the new values locally
            const newAmount = Math.min(challenge.targetAmount, (challenge.currentAmount || 0) + amount);
            const isCompleted = newAmount >= challenge.targetAmount;
            
            return {
              ...challenge,
              currentAmount: newAmount,
              status: isCompleted ? 'completed' : challenge.status,
            };
          }
          return challenge;
        });
        
        setChallenges(updatedChallenges);
        
        // If challenge completed and rewards were unlocked
        if (result.unlockedRewards && result.unlockedRewards.length > 0) {
          // Add new rewards to user badges
          const newRewards = result.unlockedRewards || [];
          setUserBadges(prevBadges => [...prevBadges, ...newRewards]);
          
          toast({
            title: "Challenge Completed! 🎉",
            description: `You've earned ${newRewards.length} new reward(s)!`,
            variant: "default",
          });
        } else {
          toast({
            title: "Progress Updated",
            description: result.message,
            variant: "default",
          });
        }
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error("Error updating challenge:", error);
      toast({
        title: "Error updating progress",
        description: error instanceof Error ? error.message : "Please try again later",
        variant: "destructive",
      });
    }
  };

  // Filter challenges based on active tab
  const filteredChallenges = challenges.filter(challenge => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return challenge.status === 'active';
    if (activeTab === 'completed') return challenge.status === 'completed';
    if (activeTab === 'failed') return challenge.status === 'failed';
    return true;
  });

  // Helper to format dates
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-GB', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    }).format(date);
  };

  // Calculate days remaining for a challenge
  const getDaysRemaining = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  // Helper to get icon by challenge difficulty
  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return <Badge variant="outline" className="bg-green-50 text-green-700">Easy</Badge>;
      case 'medium':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700">Medium</Badge>;
      case 'hard':
        return <Badge variant="outline" className="bg-red-50 text-red-700">Hard</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Helmet>
        <title>Savings Challenge | Tesco Price Comparison</title>
        <meta name="description" content="Take part in interactive savings challenges and earn digital rewards." />
      </Helmet>

      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Savings Challenge</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Set savings goals, track your progress, and earn digital rewards for making smart shopping decisions.
          </p>
        </div>

        {/* Hero challenge card */}
        <Card className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white mb-12 shadow-xl">
          <CardContent className="p-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-4">Become a Saving Master</h2>
                <p className="mb-6 text-blue-100">
                  Join our interactive challenges to maximize your savings while shopping. The more you save, the more rewards you earn!
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button 
                    variant="secondary" 
                    className="gap-2"
                    onClick={() => {
                      toast({
                        title: "Custom Challenge Creation",
                        description: "This feature will be available soon!",
                        variant: "default",
                      });
                    }}
                  >
                    <Target className="h-4 w-4" />
                    Create Custom Challenge
                  </Button>
                  <Button 
                    variant="outline" 
                    className="bg-white/10 border-white/30 hover:bg-white/20 gap-2"
                    onClick={() => {
                      toast({
                        title: "Leaderboard Coming Soon",
                        description: "The leaderboard feature is under development.",
                        variant: "default",
                      });
                    }}
                  >
                    <Trophy className="h-4 w-4" />
                    View Leaderboard
                  </Button>
                </div>
              </div>
              <div className="flex justify-center md:justify-end">
                <div className="bg-white/20 rounded-xl p-6 backdrop-blur-sm">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="font-bold text-xl">Monthly Progress</h3>
                      <p className="text-blue-100">Savings this month</p>
                    </div>
                    <div className="bg-white/20 h-16 w-16 rounded-full flex items-center justify-center">
                      <Sparkles className="h-8 w-8" />
                    </div>
                  </div>
                  <div className="mb-4">
                    <div className="flex justify-between mb-2">
                      <span>£50 saved</span>
                      <span>Target: £200</span>
                    </div>
                    <Progress value={25} className="h-3 bg-white/30" />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      21 days left
                    </span>
                    <span className="flex items-center gap-1">
                      <Award className="h-4 w-4" />
                      2 rewards available
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Badges and rewards section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Award className="h-6 w-6 text-yellow-500" />
            Your Rewards & Badges
          </h2>
          
          {userBadges.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {userBadges.map(badge => (
                <Card key={badge.id} className="text-center overflow-hidden border-2 border-indigo-100">
                  <CardHeader className="p-4 pb-0">
                    <div className="mx-auto bg-indigo-50 rounded-full w-16 h-16 flex items-center justify-center mb-2">
                      <Star className="h-8 w-8 text-indigo-600" />
                    </div>
                    <CardTitle className="text-sm font-bold">{badge.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-xs text-gray-600">{badge.description}</p>
                  </CardContent>
                </Card>
              ))}
              {/* Empty badge placeholders */}
              {Array.from({ length: Math.max(0, 5 - userBadges.length) }).map((_, index) => (
                <Card key={`empty-${index}`} className="text-center border border-dashed border-gray-200 bg-gray-50">
                  <CardHeader className="p-4 pb-0">
                    <div className="mx-auto bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mb-2">
                      <Star className="h-8 w-8 text-gray-300" />
                    </div>
                    <CardTitle className="text-sm font-bold text-gray-400">Locked Badge</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-xs text-gray-400">Complete challenges to unlock</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-gray-50 border border-dashed border-gray-200">
              <CardContent className="p-8 text-center">
                <div className="mx-auto bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                  <Award className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-medium text-gray-600 mb-2">No Rewards Yet</h3>
                <p className="text-gray-500 mb-4">Complete challenges to earn badges and special rewards</p>
                <Button variant="outline">Browse Challenges</Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Challenges list section */}
        <div>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Trophy className="h-6 w-6 text-amber-500" />
            Savings Challenges
          </h2>
          
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="all">All Challenges</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="failed">Failed</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab}>
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin h-8 w-8 border-4 border-blue-600 rounded-full border-t-transparent mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading challenges...</p>
                </div>
              ) : filteredChallenges.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredChallenges.map(challenge => (
                    <Card key={challenge.id} className={
                      challenge.status === 'completed' ? 'border-green-300 bg-green-50' : 
                      challenge.status === 'failed' ? 'border-red-300 bg-red-50' : 
                      'border-gray-200'
                    }>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start mb-2">
                          <CardTitle className="text-lg">{challenge.title}</CardTitle>
                          {getDifficultyIcon(challenge.difficultyLevel)}
                        </div>
                        <CardDescription>{challenge.description}</CardDescription>
                      </CardHeader>
                      
                      <CardContent className="pb-2">
                        {/* Challenge progress */}
                        <div className="mb-4">
                          <div className="flex justify-between mb-1 text-sm">
                            <span>Progress: £{challenge.currentAmount || 0}</span>
                            <span>Target: £{challenge.targetAmount}</span>
                          </div>
                          <Progress 
                            value={((challenge.currentAmount || 0) / challenge.targetAmount) * 100} 
                            className={
                              challenge.status === 'completed' ? 'h-2 bg-green-100' : 
                              challenge.status === 'failed' ? 'h-2 bg-red-100' : 
                              'h-2'
                            } 
                          />
                        </div>
                        
                        {/* Challenge details */}
                        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span>{getDaysRemaining(challenge.deadline)} days left</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Gift className="h-4 w-4 text-gray-500" />
                            <span>{challenge.rewards ? challenge.rewards.length : 0} rewards</span>
                          </div>
                        </div>
                        
                        {/* Challenge rewards preview */}
                        {challenge.rewards && challenge.rewards.length > 0 && (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium mb-2">Rewards:</h4>
                            <div className="flex gap-2">
                              {challenge.rewards.map(reward => (
                                <div key={reward.id} className={`
                                  w-10 h-10 rounded-full flex items-center justify-center
                                  ${reward.unlocked 
                                    ? 'bg-green-100 text-green-600 border border-green-300' 
                                    : 'bg-gray-100 text-gray-400 border border-gray-200'
                                  }
                                `}>
                                  {reward.type === 'badge' && <Award className="h-5 w-5" />}
                                  {reward.type === 'voucher' && <Gift className="h-5 w-5" />}
                                  {reward.type === 'discount' && <TrendingUp className="h-5 w-5" />}
                                  {reward.type === 'special' && <Sparkles className="h-5 w-5" />}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Challenge status badge */}
                        {challenge.status === 'completed' && (
                          <Badge className="bg-green-600 mb-2">
                            <Check className="h-3 w-3 mr-1" /> Completed
                          </Badge>
                        )}
                        {challenge.status === 'failed' && (
                          <Badge variant="destructive" className="mb-2">Failed</Badge>
                        )}
                      </CardContent>
                      
                      <CardFooter>
                        {challenge.status === 'active' && (
                          <div className="w-full grid grid-cols-2 gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="w-full"
                              onClick={() => handleProgressUpdate(challenge.id, 5)}
                            >
                              Add £5
                            </Button>
                            <Button 
                              variant="default" 
                              size="sm"
                              className="w-full"
                              onClick={() => handleProgressUpdate(challenge.id, 10)}
                            >
                              Add £10
                            </Button>
                          </div>
                        )}
                        {challenge.status === 'completed' && (
                          <Button variant="outline" className="w-full" size="sm">
                            View Details
                          </Button>
                        )}
                        {challenge.status === 'failed' && (
                          <Button variant="outline" className="w-full" size="sm">
                            Try Again
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="border border-dashed">
                  <CardContent className="p-8 text-center">
                    <div className="mx-auto bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                      <Target className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-medium text-gray-600 mb-2">No Challenges Found</h3>
                    <p className="text-gray-500 mb-4">There are no challenges in this category. Try another filter or create a new challenge.</p>
                    <Button>Create Challenge</Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default SavingsChallengePage;