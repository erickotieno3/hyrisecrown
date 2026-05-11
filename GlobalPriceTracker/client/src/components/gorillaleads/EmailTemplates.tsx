import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Copy, SaveIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

// Mock templates data
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
    body: "Hi {{firstName}},\n\nThank you for attending our demo session today. We hope you found it informative and valuable.\n\nAs promised, here are some resources that might help you get the most out of our platform:\n- Documentation: [link]\n- Pricing information: [link]\n- Case studies: [link]\n\nDo you have time this week to discuss your specific needs in more detail?\n\nBest regards,\nThe Tesco Price Comparison Team",
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

interface EmailTemplatesProps {
  initialTemplates?: typeof mockTemplates;
}

export function EmailTemplates({ initialTemplates = mockTemplates }: EmailTemplatesProps) {
  const { toast } = useToast();
  const [templates, setTemplates] = useState(initialTemplates);
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<typeof mockTemplates[0] | null>(null);
  
  // Template form state
  const [templateName, setTemplateName] = useState('');
  const [templateSubject, setTemplateSubject] = useState('');
  const [templateBody, setTemplateBody] = useState('');
  
  const handleEditTemplate = (template: typeof mockTemplates[0]) => {
    setCurrentTemplate(template);
    setTemplateName(template.name);
    setTemplateSubject(template.subject);
    setTemplateBody(template.body);
    setIsEditingTemplate(true);
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
  
  const handleDuplicateTemplate = (template: typeof mockTemplates[0]) => {
    const newTemplate = {
      ...template,
      id: (templates.length + 1).toString(),
      name: `${template.name} (Copy)`,
      createdAt: new Date().toISOString(),
    };
    
    setTemplates([...templates, newTemplate]);
    
    toast({
      title: "Template duplicated",
      description: "A copy of the template has been created.",
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
                  onClick={() => handleDuplicateTemplate(template)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
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
            <div className="text-muted-foreground">No email templates found</div>
          </div>
        )}
      </div>
      
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
                    Available variables: {"{{{firstName}}}"}, {"{{{lastName}}}"}, {"{{{email}}}"}, {"{{{company}}}"}
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