import React, { useState } from 'react';
import { AchievementBadge, AchievementBadgeProps } from './achievement-badge';
import { Button } from '@/components/ui/button';
import { 
  Filter, 
  SortAsc, 
  SortDesc, 
  Award, 
  Check, 
  X, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';

export interface BadgeGalleryProps {
  badges: AchievementBadgeProps[];
  title?: string;
  description?: string;
}

type SortOption = 'newest' | 'oldest' | 'a-z' | 'z-a';
type FilterOption = 'all' | 'saving' | 'comparison' | 'streak' | 'bargain' | 'milestone';

export function BadgeGallery({
  badges,
  title = "Your Achievement Badges",
  description = "Showcase your savings and comparison milestones"
}: BadgeGalleryProps) {
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [selectedBadge, setSelectedBadge] = useState<AchievementBadgeProps | null>(null);
  
  // Filter badges
  const filteredBadges = badges.filter(badge => {
    if (filterBy === 'all') return true;
    return badge.type === filterBy;
  });
  
  // Sort badges
  const sortedBadges = [...filteredBadges].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.date || '').getTime() - new Date(a.date || '').getTime();
      case 'oldest':
        return new Date(a.date || '').getTime() - new Date(b.date || '').getTime();
      case 'a-z':
        return a.title.localeCompare(b.title);
      case 'z-a':
        return b.title.localeCompare(a.title);
      default:
        return 0;
    }
  });
  
  const handleSortChange = (option: SortOption) => {
    setSortBy(option);
  };
  
  const handleFilterChange = (option: FilterOption) => {
    setFilterBy(option);
  };
  
  const handleBadgeClick = (badge: AchievementBadgeProps) => {
    setSelectedBadge(badge);
  };
  
  const handleCloseDialog = () => {
    setSelectedBadge(null);
  };
  
  const handlePrevBadge = () => {
    if (!selectedBadge) return;
    
    const currentIndex = sortedBadges.findIndex(badge => 
      badge.title === selectedBadge.title && 
      badge.description === selectedBadge.description
    );
    
    if (currentIndex > 0) {
      setSelectedBadge(sortedBadges[currentIndex - 1]);
    }
  };
  
  const handleNextBadge = () => {
    if (!selectedBadge) return;
    
    const currentIndex = sortedBadges.findIndex(badge => 
      badge.title === selectedBadge.title && 
      badge.description === selectedBadge.description
    );
    
    if (currentIndex < sortedBadges.length - 1) {
      setSelectedBadge(sortedBadges[currentIndex + 1]);
    }
  };
  
  const getFilterLabel = (filter: FilterOption) => {
    switch (filter) {
      case 'all': return 'All Badges';
      case 'saving': return 'Savings';
      case 'comparison': return 'Comparisons';
      case 'streak': return 'Streaks';
      case 'bargain': return 'Bargains';
      case 'milestone': return 'Milestones';
      default: return 'All Badges';
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="text-muted-foreground">{description}</p>
      </div>
      
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                {getFilterLabel(filterBy)}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Filter Badges</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleFilterChange('all')}>
                <span className="flex items-center gap-2">
                  All Badges {filterBy === 'all' && <Check className="h-4 w-4" />}
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFilterChange('saving')}>
                <span className="flex items-center gap-2">
                  Savings {filterBy === 'saving' && <Check className="h-4 w-4" />}
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFilterChange('comparison')}>
                <span className="flex items-center gap-2">
                  Comparisons {filterBy === 'comparison' && <Check className="h-4 w-4" />}
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFilterChange('streak')}>
                <span className="flex items-center gap-2">
                  Streaks {filterBy === 'streak' && <Check className="h-4 w-4" />}
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFilterChange('bargain')}>
                <span className="flex items-center gap-2">
                  Bargains {filterBy === 'bargain' && <Check className="h-4 w-4" />}
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleFilterChange('milestone')}>
                <span className="flex items-center gap-2">
                  Milestones {filterBy === 'milestone' && <Check className="h-4 w-4" />}
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                {sortBy === 'newest' || sortBy === 'oldest' ? (
                  sortBy === 'newest' ? <SortDesc className="h-4 w-4" /> : <SortAsc className="h-4 w-4" />
                ) : (
                  sortBy === 'a-z' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
                )}
                Sort: {sortBy === 'newest' ? 'Newest' : sortBy === 'oldest' ? 'Oldest' : sortBy === 'a-z' ? 'A-Z' : 'Z-A'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>Sort Badges</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleSortChange('newest')}>
                <span className="flex items-center gap-2">
                  Newest First {sortBy === 'newest' && <Check className="h-4 w-4" />}
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange('oldest')}>
                <span className="flex items-center gap-2">
                  Oldest First {sortBy === 'oldest' && <Check className="h-4 w-4" />}
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange('a-z')}>
                <span className="flex items-center gap-2">
                  A-Z {sortBy === 'a-z' && <Check className="h-4 w-4" />}
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange('z-a')}>
                <span className="flex items-center gap-2">
                  Z-A {sortBy === 'z-a' && <Check className="h-4 w-4" />}
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="text-sm text-muted-foreground">
          {sortedBadges.length} {sortedBadges.length === 1 ? 'badge' : 'badges'} found
        </div>
      </div>
      
      {sortedBadges.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {sortedBadges.map((badge, index) => (
            <div 
              key={`${badge.title}-${index}`} 
              className="cursor-pointer transform transition-transform hover:scale-105"
              onClick={() => handleBadgeClick(badge)}
            >
              <AchievementBadge {...badge} />
            </div>
          ))}
        </div>
      ) : (
        <div className="border border-dashed rounded-lg p-8 text-center space-y-4">
          <Award className="h-12 w-12 mx-auto text-muted-foreground" />
          <h3 className="font-semibold text-lg">No badges found</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            {filterBy !== 'all' 
              ? `You don't have any ${getFilterLabel(filterBy).toLowerCase()} badges yet.`
              : 'You haven\'t earned any achievement badges yet. Keep using the platform to earn your first badge!'
            }
          </p>
        </div>
      )}
      
      {/* Badge Detail Dialog */}
      <Dialog open={!!selectedBadge} onOpenChange={(open) => !open && setSelectedBadge(null)}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Achievement Badge Details</DialogTitle>
            <DialogDescription>
              View and share your achievement badge
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 max-w-xs mx-auto">
            {selectedBadge && <AchievementBadge {...selectedBadge} />}
          </div>
          
          <DialogFooter className="flex justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="icon" 
                disabled={!selectedBadge || sortedBadges.indexOf(selectedBadge) === 0}
                onClick={handlePrevBadge}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                {selectedBadge ? sortedBadges.indexOf(selectedBadge) + 1 : 0} of {sortedBadges.length}
              </span>
              <Button 
                variant="outline" 
                size="icon" 
                disabled={!selectedBadge || sortedBadges.indexOf(selectedBadge) === sortedBadges.length - 1}
                onClick={handleNextBadge}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="ghost" onClick={handleCloseDialog}>
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}