import React, { useState } from 'react';
import { Container } from '@/components/ui/container';
import { BadgeGenerator } from '@/components/social-sharing/badge-generator';
import { AchievementBadgeProps } from '@/components/social-sharing/achievement-badge';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Award, ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function CreateBadgePage() {
  const { toast } = useToast();
  const [badgeCreated, setBadgeCreated] = useState(false);
  
  const handleBadgeGenerate = (badgeData: AchievementBadgeProps) => {
    // In a real application, we would save the badge to the user's account
    toast({
      title: "Badge Created",
      description: "Your custom achievement badge has been created successfully!",
    });
    
    setBadgeCreated(true);
    
    // Here you would typically make an API call to save the badge
  };
  
  return (
    <Container className="py-8">
      <div className="flex items-center gap-2 mb-8">
        <Link href="/achievements">
          <Button variant="ghost" size="icon" className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Create Achievement Badge</h1>
          <p className="text-muted-foreground">
            Design a custom badge to showcase your financial milestone
          </p>
        </div>
      </div>
      
      {badgeCreated && (
        <Alert className="mb-6 bg-green-50 border-green-200">
          <Award className="h-5 w-5 text-green-600" />
          <AlertTitle className="text-green-800">Badge Created Successfully!</AlertTitle>
          <AlertDescription className="text-green-700">
            Your achievement badge has been created and added to your collection. You can now share it on social media or return to view all your badges.
          </AlertDescription>
          <div className="mt-3">
            <Link href="/achievements">
              <Button className="bg-green-600 hover:bg-green-700">
                View All Badges
              </Button>
            </Link>
          </div>
        </Alert>
      )}
      
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <BadgeGenerator onGenerate={handleBadgeGenerate} />
      </div>
      
      <div className="mt-8 bg-blue-50 border border-blue-100 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">Tips for Creating Engaging Badges</h3>
        <ul className="list-disc pl-5 space-y-2 text-blue-700">
          <li>Be specific about your achievement (e.g., "Saved £50 on Groceries" rather than just "Saved Money")</li>
          <li>Use clear, concise descriptions that highlight the value of your achievement</li>
          <li>Choose colors and icons that match the nature of your achievement</li>
          <li>Include specific metrics when possible (amounts saved, percentage discounts, etc.)</li>
          <li>Consider how your badge will look when shared on social media</li>
        </ul>
      </div>
    </Container>
  );
}