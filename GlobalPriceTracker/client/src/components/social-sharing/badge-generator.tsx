import React, { useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Award, Camera, Download, Facebook, Printer, Twitter, Instagram } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AchievementBadge, AchievementBadgeProps } from './achievement-badge';

interface BadgeGeneratorProps {
  initialValues?: Partial<AchievementBadgeProps>;
  onGenerate?: (badgeData: AchievementBadgeProps) => void;
}

export function BadgeGenerator({ initialValues, onGenerate }: BadgeGeneratorProps) {
  const [badgeData, setBadgeData] = useState<AchievementBadgeProps>({
    type: initialValues?.type || 'milestone',
    title: initialValues?.title || 'My Achievement',
    description: initialValues?.description || 'I achieved a financial milestone',
    value: initialValues?.value || '',
    date: initialValues?.date || new Date().toISOString().split('T')[0],
    colorScheme: initialValues?.colorScheme || 'gold',
    icon: initialValues?.icon || 'award'
  });
  
  const [showShareDialog, setShowShareDialog] = useState(false);
  const badgeRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  const handleInputChange = (field: keyof AchievementBadgeProps, value: string) => {
    setBadgeData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleGenerate = () => {
    if (onGenerate) {
      onGenerate(badgeData);
    }
    
    // Show share dialog with preview
    setShowShareDialog(true);
  };
  
  const captureAndShare = async (platform: 'facebook' | 'twitter' | 'instagram') => {
    try {
      // In a real implementation, we would:
      // 1. Use html2canvas or similar to convert the badge to an image
      // 2. Either use platform-specific sharing APIs or provide download links
      
      toast({
        title: `Sharing to ${platform}`,
        description: `Your achievement badge would be shared to ${platform}.`,
      });
      
      // Example of sharing text
      const shareText = `I just earned the "${badgeData.title}" badge: ${badgeData.description} #FinancialMilestone`;
      
      if (platform === 'twitter') {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, '_blank');
      } else {
        // In a real app, we would use the appropriate sharing mechanisms for each platform
        // For Facebook, Instagram, etc., this often involves their specific SDKs
        
        // Simulate successful sharing
        toast({
          title: "Badge Shared",
          description: `Your badge has been shared to ${platform}!`,
        });
      }
    } catch (error) {
      console.error(`Error sharing to ${platform}:`, error);
      toast({
        title: "Sharing Failed",
        description: `There was an error sharing to ${platform}. Please try again.`,
        variant: "destructive",
      });
    }
  };
  
  const downloadBadge = () => {
    // In a real implementation, we would generate and download the image
    toast({
      title: "Downloading Badge",
      description: "Your achievement badge is being downloaded.",
    });
  };
  
  const printBadge = () => {
    // In a real implementation, we would use window.print() or similar
    toast({
      title: "Printing Badge",
      description: "Your achievement badge is being prepared for printing.",
    });
  };
  
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Design Your Achievement Badge</h3>
          
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="badge-type">Badge Type</Label>
              <Select
                value={badgeData.type}
                onValueChange={(value) => handleInputChange('type', value)}
              >
                <SelectTrigger id="badge-type">
                  <SelectValue placeholder="Select badge type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="saving">Saving</SelectItem>
                  <SelectItem value="comparison">Comparison</SelectItem>
                  <SelectItem value="streak">Streak</SelectItem>
                  <SelectItem value="bargain">Bargain</SelectItem>
                  <SelectItem value="milestone">Milestone</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="badge-title">Title</Label>
              <Input
                id="badge-title"
                value={badgeData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter badge title"
                maxLength={30}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="badge-description">Description</Label>
              <Textarea
                id="badge-description"
                value={badgeData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your achievement"
                maxLength={100}
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="badge-value">Value (optional)</Label>
              <Input
                id="badge-value"
                value={badgeData.value as string}
                onChange={(e) => handleInputChange('value', e.target.value)}
                placeholder="e.g., £100 saved, 10% discount"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="badge-date">Achievement Date</Label>
              <Input
                id="badge-date"
                type="date"
                value={badgeData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="badge-color">Color Scheme</Label>
              <Select
                value={badgeData.colorScheme}
                onValueChange={(value) => handleInputChange('colorScheme', value)}
              >
                <SelectTrigger id="badge-color">
                  <SelectValue placeholder="Select color scheme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="blue">Blue</SelectItem>
                  <SelectItem value="green">Green</SelectItem>
                  <SelectItem value="gold">Gold</SelectItem>
                  <SelectItem value="purple">Purple</SelectItem>
                  <SelectItem value="teal">Teal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="badge-icon">Icon</Label>
              <Select
                value={badgeData.icon}
                onValueChange={(value) => handleInputChange('icon', value)}
              >
                <SelectTrigger id="badge-icon">
                  <SelectValue placeholder="Select icon" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="award">Award</SelectItem>
                  <SelectItem value="trending-up">Trending Up</SelectItem>
                  <SelectItem value="percent">Percent</SelectItem>
                  <SelectItem value="sparkles">Sparkles</SelectItem>
                  <SelectItem value="dollar-sign">Dollar Sign</SelectItem>
                  <SelectItem value="badge-check">Badge Check</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              type="button" 
              className="w-full mt-4"
              onClick={handleGenerate}
            >
              <Camera className="mr-2 h-4 w-4" />
              Generate Badge
            </Button>
          </div>
        </div>
        
        <div className="flex flex-col items-center justify-center">
          <h3 className="text-lg font-semibold mb-4">Badge Preview</h3>
          <div ref={badgeRef} className="max-w-xs">
            <AchievementBadge {...badgeData} />
          </div>
        </div>
      </div>
      
      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Your Achievement</DialogTitle>
            <DialogDescription>
              Share your achievement badge on social media or download it
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="mx-auto max-w-xs">
              <AchievementBadge {...badgeData} />
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <Button 
                variant="outline" 
                className="flex flex-col items-center justify-center p-4 h-auto"
                onClick={() => captureAndShare('facebook')}
              >
                <Facebook className="h-6 w-6 mb-1 text-blue-600" />
                <span className="text-xs">Facebook</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="flex flex-col items-center justify-center p-4 h-auto"
                onClick={() => captureAndShare('twitter')}
              >
                <Twitter className="h-6 w-6 mb-1 text-blue-400" />
                <span className="text-xs">Twitter</span>
              </Button>
              
              <Button 
                variant="outline" 
                className="flex flex-col items-center justify-center p-4 h-auto"
                onClick={() => captureAndShare('instagram')}
              >
                <Instagram className="h-6 w-6 mb-1 text-pink-600" />
                <span className="text-xs">Instagram</span>
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="secondary" 
                className="flex items-center justify-center"
                onClick={downloadBadge}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              
              <Button 
                variant="secondary" 
                className="flex items-center justify-center"
                onClick={printBadge}
              >
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
            </div>
          </div>
          
          <DialogFooter className="sm:justify-start">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => setShowShareDialog(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}