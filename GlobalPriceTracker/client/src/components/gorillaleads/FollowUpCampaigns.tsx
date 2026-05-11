import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Clock, Plus, Trash2, Play, Pause } from 'lucide-react';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { EmailTemplates } from './EmailTemplates';

// Mock data for campaigns
const mockCampaigns = [
  {
    id: '1',
    name: 'Welcome Series',
    status: 'Active',
    steps: 3,
    targetSegment: 'New Leads',
    leadsEnrolled: 42,
    completionRate: 68,
    createdAt: '2025-05-10T10:00:00Z',
  },
  {
    id: '2',
    name: 'Re-engagement',
    status: 'Paused',
    steps: 5,
    targetSegment: 'Inactive Leads',
    leadsEnrolled: 27,
    completionRate: 34,
    createdAt: '2025-05-05T14:30:00Z',
  },
  {
    id: '3',
    name: 'Demo Follow-up',
    status: 'Active',
    steps: 4,
    targetSegment: 'Demo Requests',
    leadsEnrolled: 18,
    completionRate: 75,
    createdAt: '2025-05-12T09:15:00Z',
  },
];

interface FollowUpCampaignsProps {
  initialCampaigns?: typeof mockCampaigns;
}

export function FollowUpCampaigns({ initialCampaigns = mockCampaigns }: FollowUpCampaignsProps) {
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);
  const [activeTab, setActiveTab] = useState('campaigns');
  
  // New campaign form state
  const [newCampaignName, setNewCampaignName] = useState('');
  const [newCampaignSegment, setNewCampaignSegment] = useState('');
  const [campaignSteps, setCampaignSteps] = useState([
    { delay: '1', delayUnit: 'days', templateId: '1', enabled: true }
  ]);
  
  const handleAddCampaignStep = () => {
    setCampaignSteps([
      ...campaignSteps,
      { delay: '2', delayUnit: 'days', templateId: '1', enabled: true }
    ]);
  };
  
  const handleRemoveCampaignStep = (index: number) => {
    setCampaignSteps(campaignSteps.filter((_, i) => i !== index));
  };
  
  const handleUpdateCampaignStep = (index: number, field: string, value: string | boolean) => {
    const updatedSteps = [...campaignSteps];
    updatedSteps[index] = { ...updatedSteps[index], [field]: value };
    setCampaignSteps(updatedSteps);
  };
  
  const handleSaveCampaign = () => {
    if (!newCampaignName) {
      toast({
        title: "Campaign name required",
        description: "Please provide a name for your campaign.",
        variant: "destructive",
      });
      return;
    }
    
    if (!newCampaignSegment) {
      toast({
        title: "Target segment required",
        description: "Please select a target segment for your campaign.",
        variant: "destructive",
      });
      return;
    }
    
    // In a real implementation, this would call an API to save the campaign
    const newCampaign = {
      id: (campaigns.length + 1).toString(),
      name: newCampaignName,
      status: 'Active',
      steps: campaignSteps.length,
      targetSegment: newCampaignSegment,
      leadsEnrolled: 0,
      completionRate: 0,
      createdAt: new Date().toISOString(),
    };
    
    setCampaigns([...campaigns, newCampaign]);
    setIsCreatingCampaign(false);
    
    // Reset form
    setNewCampaignName('');
    setNewCampaignSegment('');
    setCampaignSteps([
      { delay: '1', delayUnit: 'days', templateId: '1', enabled: true }
    ]);
    
    toast({
      title: "Campaign created",
      description: "Your follow-up campaign has been created successfully.",
    });
  };
  
  const handleCampaignStatusToggle = (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Active' ? 'Paused' : 'Active';
    
    // In a real implementation, this would call an API to update the campaign status
    const updatedCampaigns = campaigns.map(campaign => 
      campaign.id === id ? { ...campaign, status: newStatus } : campaign
    );
    
    setCampaigns(updatedCampaigns);
    
    toast({
      title: `Campaign ${newStatus.toLowerCase()}`,
      description: `The campaign has been ${newStatus.toLowerCase()} successfully.`,
    });
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Automated Follow-up Campaigns</CardTitle>
          <CardDescription>
            Create and manage automated follow-up sequences for your leads
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="campaigns" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
              <TabsTrigger value="templates">Email Templates</TabsTrigger>
            </TabsList>
            
            <TabsContent value="campaigns" className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold">Active Campaigns</h2>
                  <Button onClick={() => setIsCreatingCampaign(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Campaign
                  </Button>
                </div>
                
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Campaign Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Steps</TableHead>
                        <TableHead>Target Segment</TableHead>
                        <TableHead>Leads Enrolled</TableHead>
                        <TableHead>Completion Rate</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {campaigns.length > 0 ? (
                        campaigns.map((campaign) => (
                          <TableRow key={campaign.id}>
                            <TableCell className="font-medium">{campaign.name}</TableCell>
                            <TableCell>
                              <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                campaign.status === 'Active' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {campaign.status}
                              </div>
                            </TableCell>
                            <TableCell>{campaign.steps}</TableCell>
                            <TableCell>{campaign.targetSegment}</TableCell>
                            <TableCell>{campaign.leadsEnrolled}</TableCell>
                            <TableCell>{campaign.completionRate}%</TableCell>
                            <TableCell>{formatDate(campaign.createdAt)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-1">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => handleCampaignStatusToggle(campaign.id, campaign.status)}
                                >
                                  {campaign.status === 'Active' ? (
                                    <Pause className="h-4 w-4" />
                                  ) : (
                                    <Play className="h-4 w-4" />
                                  )}
                                </Button>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8">
                            <div className="text-muted-foreground">
                              No campaigns found
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="templates" className="space-y-6">
              <EmailTemplates />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Create Campaign Dialog */}
      <Dialog open={isCreatingCampaign} onOpenChange={setIsCreatingCampaign}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create Follow-up Campaign</DialogTitle>
            <DialogDescription>
              Set up an automated email sequence to nurture your leads
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="campaignName">Campaign Name</Label>
                <Input
                  id="campaignName"
                  value={newCampaignName}
                  onChange={(e) => setNewCampaignName(e.target.value)}
                  placeholder="e.g., Welcome Series"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="targetSegment">Target Segment</Label>
                <select
                  id="targetSegment"
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={newCampaignSegment}
                  onChange={(e) => setNewCampaignSegment(e.target.value)}
                >
                  <option value="">Select a segment</option>
                  <option value="New Leads">New Leads</option>
                  <option value="Demo Requests">Demo Requests</option>
                  <option value="Inactive Leads">Inactive Leads</option>
                  <option value="Free Trial Users">Free Trial Users</option>
                  <option value="All Leads">All Leads</option>
                </select>
              </div>
              
              <div className="space-y-2 pt-2">
                <Label>Campaign Steps</Label>
                
                {campaignSteps.map((step, index) => (
                  <div key={index} className="flex items-center space-x-2 border rounded-md p-3">
                    <div className="flex-grow grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="flex items-center space-x-2">
                        <Label className="text-sm">Send after</Label>
                        <div className="flex items-center space-x-1">
                          <Input
                            className="w-16"
                            value={step.delay}
                            onChange={(e) => handleUpdateCampaignStep(index, 'delay', e.target.value)}
                          />
                          <select
                            className="w-24 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={step.delayUnit}
                            onChange={(e) => handleUpdateCampaignStep(index, 'delayUnit', e.target.value)}
                          >
                            <option value="hours">Hours</option>
                            <option value="days">Days</option>
                            <option value="weeks">Weeks</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="col-span-2">
                        <select
                          className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={step.templateId}
                          onChange={(e) => handleUpdateCampaignStep(index, 'templateId', e.target.value)}
                        >
                          <option value="1">Welcome Email</option>
                          <option value="2">Demo Follow-up</option>
                          <option value="3">Pricing Inquiry</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={step.enabled}
                        onCheckedChange={(checked) => handleUpdateCampaignStep(index, 'enabled', checked)}
                      />
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveCampaignStep(index)}
                        disabled={campaignSteps.length === 1}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={handleAddCampaignStep}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Step
                </Button>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreatingCampaign(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveCampaign}>
              Create Campaign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}