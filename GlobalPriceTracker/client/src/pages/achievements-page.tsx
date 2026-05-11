import React, { useState } from 'react';
import { Link } from 'wouter';
import { BadgeGallery } from '@/components/social-sharing/badge-gallery';
import { AchievementBadgeProps } from '@/components/social-sharing/achievement-badge';
import { Container } from '@/components/ui/container';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, Award, Info, HelpCircle, Share2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Sample badges for demonstration
const sampleAchievements: AchievementBadgeProps[] = [
  {
    type: 'saving',
    title: 'First Saver',
    description: 'Saved money on your first purchase by comparing prices',
    value: '£5.50 saved',
    date: '2025-05-10',
    icon: 'dollar-sign'
  },
  {
    type: 'comparison',
    title: 'Comparison Master',
    description: 'Compared prices across 10 different stores',
    value: '10 comparisons',
    date: '2025-05-12',
    icon: 'trending-up'
  },
  {
    type: 'streak',
    title: 'Weekly Saver',
    description: 'Used price comparison for 4 weeks in a row',
    value: '4 week streak',
    date: '2025-05-14',
    icon: 'sparkles'
  },
  {
    type: 'bargain',
    title: 'Deal Hunter',
    description: 'Found a product with a 40% discount',
    value: '40% discount',
    date: '2025-05-15',
    icon: 'percent'
  },
  {
    type: 'milestone',
    title: 'Centurion',
    description: 'Saved over £100 using our price comparison',
    value: '£100+ saved',
    date: '2025-05-16',
    icon: 'award'
  },
  {
    type: 'saving',
    title: 'Shopping Guru',
    description: 'Saved on 5 different product categories',
    value: '5 categories',
    date: '2025-05-17',
    icon: 'badge-check'
  }
];

// Sample available (locked) badges
const availableBadges: AchievementBadgeProps[] = [
  {
    type: 'milestone',
    title: 'Money Maestro',
    description: 'Save over £500 using our price comparison',
    value: '£500 target',
    colorScheme: 'gold',
    icon: 'award'
  },
  {
    type: 'streak',
    title: 'Consistent Saver',
    description: 'Use price comparison for 12 weeks in a row',
    value: '12 week target',
    colorScheme: 'purple',
    icon: 'sparkles'
  },
  {
    type: 'comparison',
    title: 'Global Shopper',
    description: 'Compare prices across 5 different countries',
    value: '5 countries target',
    colorScheme: 'blue',
    icon: 'trending-up'
  }
];

export default function AchievementsPage() {
  const [activeTab, setActiveTab] = useState<string>('earned');
  const [infoDialogOpen, setInfoDialogOpen] = useState(false);
  
  return (
    <Container className="py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">Achievements & Badges</h1>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="rounded-full" 
                    onClick={() => setInfoDialogOpen(true)}
                  >
                    <HelpCircle className="h-5 w-5 text-muted-foreground" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Learn about achievements</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <p className="text-muted-foreground">
            Track your savings journey and share your milestones
          </p>
        </div>
        
        <Link href="/create-badge">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create New Badge
          </Button>
        </Link>
      </div>
      
      <Tabs defaultValue="earned" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="earned">Earned Badges</TabsTrigger>
          <TabsTrigger value="available">Available Badges</TabsTrigger>
        </TabsList>
        
        <TabsContent value="earned" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-1 md:col-span-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-100">
              <div className="flex flex-col md:flex-row items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Award className="h-8 w-8 text-blue-600" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-xl font-bold text-blue-800">Total Savings: £168.75</h3>
                  <p className="text-blue-600">
                    You've earned 6 badges by saving money through price comparison
                  </p>
                </div>
                <div className="flex flex-col gap-2 items-center md:items-end">
                  <div className="text-sm text-blue-700">
                    Next badge: £200 Savings Milestone
                  </div>
                  <div className="w-full md:w-48 h-2 bg-blue-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: '84%' }}></div>
                  </div>
                  <div className="text-xs text-blue-600">£31.25 more to go</div>
                </div>
              </div>
            </div>
          </div>
          
          <BadgeGallery 
            badges={sampleAchievements} 
            title="Your Achievement Badges"
            description="Showcase your savings journey and financial milestones"
          />
        </TabsContent>
        
        <TabsContent value="available" className="space-y-6">
          <div className="bg-amber-50 border border-amber-100 rounded-lg p-6">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="p-3 bg-amber-100 rounded-full">
                <Info className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <h3 className="font-semibold">Unlock More Badges</h3>
                <p className="text-sm text-muted-foreground">
                  Keep using our price comparison tools to unlock these badges
                </p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {availableBadges.map((badge, index) => (
              <div key={index} className="relative opacity-80 grayscale hover:opacity-100 transition-all duration-300">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="p-2 bg-black/70 rounded-lg text-white text-sm font-medium">
                    Locked
                  </div>
                </div>
                <div className="pointer-events-none">
                  {React.createElement(
                    // @ts-ignore
                    require('@/components/social-sharing/achievement-badge').AchievementBadge,
                    badge
                  )}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Info Dialog */}
      <Dialog open={infoDialogOpen} onOpenChange={setInfoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>About Achievements & Badges</DialogTitle>
            <DialogDescription>
              Track your savings journey and share your success
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <p>
              Our achievement badges system helps you track your progress and savings 
              milestones as you use our price comparison platform.
            </p>
            
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <span className="inline-flex p-1 bg-green-100 text-green-600 rounded-full">
                  <Award className="h-4 w-4" />
                </span>
                Types of Badges
              </h4>
              <ul className="ml-8 list-disc space-y-1 text-sm">
                <li><span className="font-medium">Savings Badges</span> - Earned when you save money on purchases</li>
                <li><span className="font-medium">Comparison Badges</span> - Rewarded for comparing products across stores</li>
                <li><span className="font-medium">Streak Badges</span> - Earned for consistent usage of our platform</li>
                <li><span className="font-medium">Bargain Badges</span> - Unlocked when finding significant discounts</li>
                <li><span className="font-medium">Milestone Badges</span> - Major achievements in your savings journey</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <span className="inline-flex p-1 bg-blue-100 text-blue-600 rounded-full">
                  <Share2 className="h-4 w-4" />
                </span>
                Sharing Your Achievements
              </h4>
              <p className="text-sm">
                Each badge can be shared on social media platforms like Facebook, Twitter, and Instagram.
                You can also download badge images to use on your own channels or websites.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setInfoDialogOpen(false)}>
              Got it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Container>
  );
}