import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Share2, Download, Award, TrendingUp, Percent, Sparkles, DollarSign, BadgeCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export interface AchievementBadgeProps {
  type: 'saving' | 'comparison' | 'streak' | 'bargain' | 'milestone';
  title: string;
  description: string;
  value?: string | number;
  date?: string;
  colorScheme?: 'blue' | 'green' | 'gold' | 'purple' | 'teal';
  icon?: 'award' | 'trending-up' | 'percent' | 'sparkles' | 'dollar-sign' | 'badge-check';
  onShare?: () => void;
}

const iconMap: Record<string, React.ComponentType<any>> = {
  'award': Award,
  'trending-up': TrendingUp,
  'percent': Percent,
  'sparkles': Sparkles,
  'dollar-sign': DollarSign,
  'badge-check': BadgeCheck
};

const typeToIcon: Record<string, string> = {
  'saving': 'dollar-sign',
  'comparison': 'trending-up',
  'streak': 'sparkles',
  'bargain': 'percent',
  'milestone': 'award'
};

const typeToColor: Record<string, string> = {
  'saving': 'green',
  'comparison': 'blue',
  'streak': 'purple',
  'bargain': 'teal',
  'milestone': 'gold'
};

const colorSchemeStyles: Record<string, {
  background: string;
  icon: string;
  title: string;
  description: string;
  value: string;
  button: string;
}> = {
  'blue': {
    background: 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200',
    icon: 'bg-blue-200 text-blue-600',
    title: 'text-blue-800',
    description: 'text-blue-600',
    value: 'bg-blue-500 text-white',
    button: 'bg-blue-600 hover:bg-blue-700 text-white'
  },
  'green': {
    background: 'bg-gradient-to-br from-green-50 to-green-100 border-green-200',
    icon: 'bg-green-200 text-green-600',
    title: 'text-green-800',
    description: 'text-green-600',
    value: 'bg-green-500 text-white',
    button: 'bg-green-600 hover:bg-green-700 text-white'
  },
  'gold': {
    background: 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200',
    icon: 'bg-amber-200 text-amber-600',
    title: 'text-amber-800',
    description: 'text-amber-600',
    value: 'bg-amber-500 text-white',
    button: 'bg-amber-600 hover:bg-amber-700 text-white'
  },
  'purple': {
    background: 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200',
    icon: 'bg-purple-200 text-purple-600',
    title: 'text-purple-800',
    description: 'text-purple-600',
    value: 'bg-purple-500 text-white',
    button: 'bg-purple-600 hover:bg-purple-700 text-white'
  },
  'teal': {
    background: 'bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200',
    icon: 'bg-teal-200 text-teal-600',
    title: 'text-teal-800',
    description: 'text-teal-600',
    value: 'bg-teal-500 text-white',
    button: 'bg-teal-600 hover:bg-teal-700 text-white'
  }
};

export function AchievementBadge({
  type,
  title,
  description,
  value,
  date,
  colorScheme,
  icon,
  onShare
}: AchievementBadgeProps) {
  const { toast } = useToast();
  
  // Determine icon and color scheme based on type if not provided
  const finalIcon = icon || typeToIcon[type] as 'award' | 'trending-up' | 'percent' | 'sparkles' | 'dollar-sign' | 'badge-check';
  const finalColorScheme = colorScheme || typeToColor[type] as 'blue' | 'green' | 'gold' | 'purple' | 'teal';
  const styles = colorSchemeStyles[finalColorScheme];
  
  const IconComponent = iconMap[finalIcon];
  
  const handleShare = async () => {
    if (onShare) {
      onShare();
      return;
    }
    
    try {
      // Generate the badge as an image (this would be replaced with actual canvas-to-image implementation)
      // For now, we'll just show a toast
      toast({
        title: "Sharing Achievement",
        description: "Your achievement badge has been prepared for sharing!",
      });
      
      // In a real implementation, we would:
      // 1. Convert the badge to an image
      // 2. Either use the Web Share API or open modal with social sharing options
      if (navigator.share) {
        await navigator.share({
          title: title,
          text: `I just earned the "${title}" badge on Tesco Price Comparison: ${description}`,
          // url: 'https://hyrisecrown.com/share/badge/123' // Would be a real sharing URL
        });
      } else {
        // Fallback for browsers that don't support the Web Share API
        const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
          `I just earned the "${title}" badge on Tesco Price Comparison: ${description} #TescoCompare #SaveMoney`
        )}`;
        window.open(shareUrl, '_blank');
      }
    } catch (error) {
      console.error('Error sharing badge:', error);
      toast({
        title: "Sharing Failed",
        description: "There was an error sharing your achievement. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleDownload = () => {
    // This would be implemented to download the badge as an image
    // For now, we'll just show a toast
    toast({
      title: "Downloading Badge",
      description: "Your achievement badge is being downloaded!",
    });
  };
  
  return (
    <Card className={`overflow-hidden border shadow-md ${styles.background}`}>
      <CardContent className="p-0">
        <div className="flex flex-col items-center text-center p-6">
          <div className={`p-3 rounded-full ${styles.icon} mb-4 inline-flex`}>
            <IconComponent size={28} />
          </div>
          
          <h3 className={`font-bold text-xl mb-2 ${styles.title}`}>{title}</h3>
          
          <p className={`mb-3 text-sm ${styles.description}`}>{description}</p>
          
          {value && (
            <div className={`py-1 px-3 rounded-full text-sm font-semibold ${styles.value} mb-4`}>
              {value}
            </div>
          )}
          
          {date && (
            <div className="text-xs text-gray-500 mb-4">
              Achieved on {date}
            </div>
          )}
          
          <div className="flex gap-2 mt-2 w-full">
            <Button 
              className={`flex-1 ${styles.button}`} 
              size="sm"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4 mr-1" />
              Share
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="flex-1"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}