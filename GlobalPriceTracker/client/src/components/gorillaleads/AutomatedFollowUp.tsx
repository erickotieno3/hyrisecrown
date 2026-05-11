import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Clock, 
  Plus, 
  Trash2, 
  Mail, 
  SaveIcon, 
  Play, 
  Pause,
  ArrowRight,
  CalendarDays
} from 'lucide-react';
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

// Mock data for campaigns and templates
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

const mockTemplates = [
  {
    id: '1',
    name: 'Welcome Email',
    subject: 'Welcome to Tesco Price Comparison!',
    body: "Hi {{firstName}},\n\nThank you for your interest in Tesco Price Comparison. We're excited to help you save money on your shopping.\n\nWith our platform, you can:\n- Compare prices across multiple stores\n- Find the best deals automatically\n- Use our visual search to identify products\n- Get alerts when prices drop\n\nIf you have any questions, please don't hesitate to reach out.\n\nBest regards,\nThe Tesco Price Comparison Team",
    type: 'Email',
    createdAt: '2025-05-01T10:00:00Z',
  },
  {
    id: '2',
    name: 'Demo Follow-up',
    subject: 'Your Tesco Price Comparison Demo',
    body: 'Hi {{firstName}},\n\nThank you for attending our demo session today. We hope you found it informative and valuable.\n\nAs promised, here are some resources that might help you get the most out of our platform:\n- Documentation: [link]\n- Pricing information: [link]\n- Case studies: [link]\n\nDo you have time this week to discuss your specific needs in more detail?\n\nBest regards,\nThe Tesco Price Comparison Team',
    type: 'Email',
    createdAt: '2025-05-02T14:30:00Z',
  },
  {
    id: '3',
    name: 'Pricing Inquiry',
    subject: 'Tesco Price Comparison Pricing Information',
    body: "Hi {{firstName}},\n\nThank you for your interest in our pricing information.\n\nOur plans start at $99/month for basic access, with premium features available on our higher-tier plans.\n\nI've attached our full pricing sheet for your review. Would you like to schedule a call to discuss which plan would be best for your needs?\n\nBest regards,\nThe Tesco Price Comparison Team",
    type: 'Email',
    createdAt: '2025-05-03T11:45:00Z',
  },
];

interface AutomatedFollowUpProps {
  initialCampaigns?: typeof mockCampaigns;
  initialTemplates?: typeof mockTemplates;
}

export function AutomatedFollowUp({ 
  initialCampaigns = mockCampaigns, 
  initialTemplates = mockTemplates 
}: AutomatedFollowUpProps) {
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [templates, setTemplates] = useState(initialTemplates);
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<typeof mockTemplates[0] | null>(null);
  
  // New campaign form state
  const [newCampaignName, setNewCampaignName] = useState('');
  const [newCampaignSegment, setNewCampaignSegment] = useState('');
  const [campaignSteps, setCampaignSteps] = useState([
    { delay: '1', delayUnit: 'days', templateId: '1', enabled: true }
  ]);
  
  // New template form state
  const [templateName, setTemplateName] = useState('');
  const [templateSubject, setTemplateSubject] = useState('');
  const [templateBody, setTemplateBody] = useState('');
  
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
  
  const handleCreateTemplate = () => {
    if (!templateName) {
      toast({
        title: "Template name required",
        description: "Please provide a name for your template.",
        variant: "destructive",
      });
      return;
    }
    
    if (!templateSubject) {
      toast({
        title: "Subject line required",
        description: "Please provide a subject line for your email template.",
        variant: "destructive",
      });
      return;
    }
    
    if (!templateBody) {
      toast({
        title: "Template body required",
        description: "Please provide content for your email template.",
        variant: "destructive",
      });
      return;
    }
    
    // In a real implementation, this would call an API to save the template
    const newTemplate = {
      id: (templates.length + 1).toString(),
      name: templateName,
      subject: templateSubject,
      body: templateBody,
      type: 'Email',
      createdAt: new Date().toISOString(),
    };
    
    setTemplates([...templates, newTemplate]);
    setIsEditingTemplate(false);
    
    // Reset form
    setTemplateName('');
    setTemplateSubject('');
    setTemplateBody('');
    
    toast({
      title: "Template created",
      description: "Your email template has been created successfully.",
    });
  };
  
  const handleEditTemplate = (template: typeof mockTemplates[0]) => {
    setCurrentTemplate(template);
    setTemplateName(template.name);
    setTemplateSubject(template.subject);
    setTemplateBody(template.body);
    setIsEditingTemplate(true);
  };
  
  const handleUpdateTemplate = () => {
    if (!currentTemplate) return;
    
    // In a real implementation, this would call an API to update the template
    const updatedTemplates = templates.map(template => 
      template.id === currentTemplate.id
        ? { ...template, name: templateName, subject: templateSubject, body: templateBody }
        : template
    );
    
    setTemplates(updatedTemplates);
    setIsEditingTemplate(false);
    
    // Reset form
    setCurrentTemplate(null);
    setTemplateName('');
    setTemplateSubject('');
    setTemplateBody('');
    
    toast({
      title: "Template updated",
      description: "Your email template has been updated successfully.",
    });
  };
  
  const handleDeleteTemplate = (id: string) => {
    // In a real implementation, this would call an API to delete the template
    setTemplates(templates.filter(template => template.id !== id));
    
    toast({
      title: "Template deleted",
      description: "The email template has been deleted successfully.",
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
  
  const renderCampaignsList = () => (
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
  );
  
  const renderTemplatesList = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Email Templates</h2>
        <Button onClick={() => {
          setCurrentTemplate(null);
          setTemplateName('');
          setTemplateSubject('');
          setTemplateBody('');
          setIsEditingTemplate(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          New Template
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <Card key={template.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{template.name}</CardTitle>
              <CardDescription className="text-sm truncate">
                Subject: {template.subject}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-32 overflow-hidden text-sm text-gray-600 border rounded-md p-2">
                {template.body.substring(0, 200)}
                {template.body.length > 200 && '...'}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between pt-2">
              <div className="text-xs text-muted-foreground">
                Created: {formatDate(template.createdAt)}
              </div>
              <div className="flex space-x-1">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleEditTemplate(template)}
                >
                  <SaveIcon className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleDeleteTemplate(template.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
        
        {templates.length === 0 && (
          <div className="col-span-full text-center py-8 border rounded-md">
            <Mail className="h-12 w-12 mx-auto text-gray-300 mb-2" />
            <p className="text-muted-foreground">No email templates found</p>
          </div>
        )}
      </div>
    </div>
  );
  
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
          <Tabs defaultValue="campaigns" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
              <TabsTrigger value="templates">Email Templates</TabsTrigger>
            </TabsList>
            
            <TabsContent value="campaigns" className="space-y-6">
              {renderCampaignsList()}
            </TabsContent>
            
            <TabsContent value="templates" className="space-y-6">
              {renderTemplatesList()}
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
                <Select
                  value={newCampaignSegment}
                  onValueChange={(value) => setNewCampaignSegment(value)}
                >
                  <SelectTrigger id="targetSegment">
                    <SelectValue placeholder="Select a segment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="New Leads">New Leads</SelectItem>
                    <SelectItem value="Demo Requests">Demo Requests</SelectItem>
                    <SelectItem value="Inactive Leads">Inactive Leads</SelectItem>
                    <SelectItem value="Free Trial Users">Free Trial Users</SelectItem>
                    <SelectItem value="All Leads">All Leads</SelectItem>
                  </SelectContent>
                </Select>
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
                          <Select
                            value={step.delayUnit}
                            onValueChange={(value) => handleUpdateCampaignStep(index, 'delayUnit', value)}
                          >
                            <SelectTrigger className="w-24">
                              <SelectValue placeholder="Unit" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="hours">Hours</SelectItem>
                              <SelectItem value="days">Days</SelectItem>
                              <SelectItem value="weeks">Weeks</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="col-span-2">
                        <Select
                          value={step.templateId}
                          onValueChange={(value) => handleUpdateCampaignStep(index, 'templateId', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a template" />
                          </SelectTrigger>
                          <SelectContent>
                            {templates.map(template => (
                              <SelectItem key={template.id} value={template.id}>
                                {template.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
      
      {/* Create/Edit Template Dialog */}
      <Dialog open={isEditingTemplate} onOpenChange={setIsEditingTemplate}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>{currentTemplate ? 'Edit Email Template' : 'Create Email Template'}</DialogTitle>
            <DialogDescription>
              {currentTemplate 
                ? 'Update your email template content and settings'
                : 'Create a new email template for your follow-up campaigns'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="templateName">Template Name</Label>
                <Input
                  id="templateName"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="e.g., Welcome Email"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="templateSubject">Email Subject</Label>
                <Input
                  id="templateSubject"
                  value={templateSubject}
                  onChange={(e) => setTemplateSubject(e.target.value)}
                  placeholder="e.g., Welcome to Tesco Price Comparison!"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="templateBody">Email Body</Label>
                  <div className="text-xs text-muted-foreground">
                    Available variables: {{firstName}}, {{lastName}}, {{email}}, {{company}}
                  </div>
                </div>
                <Textarea
                  id="templateBody"
                  value={templateBody}
                  onChange={(e) => setTemplateBody(e.target.value)}
                  placeholder="Enter your email content..."
                  className="min-h-[200px] font-mono text-sm"
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditingTemplate(false)}>
              Cancel
            </Button>
            <Button onClick={currentTemplate ? handleUpdateTemplate : handleCreateTemplate}>
              {currentTemplate ? 'Update Template' : 'Create Template'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}