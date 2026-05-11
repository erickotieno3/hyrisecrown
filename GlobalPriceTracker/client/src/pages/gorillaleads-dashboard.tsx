import React, { useState } from 'react';
import { Container } from '@/components/ui/container';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, BarChart3, Users, Mail, LucideIcon, MessageSquare, Settings, PlusCircle } from 'lucide-react';
import { Link } from 'wouter';
import { LeadCaptureForm } from '@/components/gorillaleads/LeadCaptureForm';
import { LeadManagementDashboard } from '@/components/gorillaleads/LeadManagementDashboard';
import { FollowUpCampaigns } from '@/components/gorillaleads/FollowUpCampaigns';

type StatCardProps = {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  trend?: number;
  trendLabel?: string;
};

function StatCard({ title, value, description, icon: Icon, trend, trendLabel }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        {trend !== undefined && (
          <div className="mt-2">
            <Badge variant={trend >= 0 ? 'outline' : 'destructive'} className="text-xs">
              {trend > 0 ? '+' : ''}{trend}% {trendLabel}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function GorillaLeadsDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  return (
    <Container className="py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Lead Generation Dashboard</h1>
            <p className="text-muted-foreground">
              Capture, track, and nurture leads with automated follow-ups
            </p>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Lead Form
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="lead-forms">Lead Capture</TabsTrigger>
          <TabsTrigger value="lead-management">Lead Management</TabsTrigger>
          <TabsTrigger value="automations">Follow-up Automations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Leads"
              value="247"
              description="Across all campaigns"
              icon={Users}
              trend={12}
              trendLabel="from last month"
            />
            <StatCard
              title="Conversion Rate"
              value="24.3%"
              description="Lead to customer"
              icon={BarChart3}
              trend={3.2}
              trendLabel="from last month"
            />
            <StatCard
              title="Active Campaigns"
              value="6"
              description="Running automations"
              icon={Mail}
              trend={0}
              trendLabel="unchanged"
            />
            <StatCard
              title="Engagement Rate"
              value="68%"
              description="Email open rate"
              icon={MessageSquare}
              trend={-2.3}
              trendLabel="from last month"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <Card className="overflow-hidden">
                <CardHeader>
                  <CardTitle>Lead Sources</CardTitle>
                  <CardDescription>
                    Where your leads are coming from
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80 flex items-center justify-center bg-gray-50 rounded">
                    <div className="text-center">
                      <BarChart3 className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                      <p className="text-muted-foreground">Lead sources chart will appear here</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Recent Leads</CardTitle>
                  <CardDescription>
                    Your most recently captured leads
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">Lead #{i}</p>
                          <p className="text-sm text-muted-foreground">example{i}@example.com</p>
                        </div>
                        <Badge>New</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Quick Lead Form</CardTitle>
                  <CardDescription>
                    Manual lead entry
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <LeadCaptureForm 
                    title="Add New Lead" 
                    description="Enter lead information manually"
                    darkMode={false}
                    formPosition="center"
                    leadSource="manual_entry"
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="lead-forms" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Lead Capture Forms</CardTitle>
              <CardDescription>
                Create and manage forms to capture leads from your website
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Form Preview</h3>
                  <LeadCaptureForm 
                    title="Get in Touch" 
                    description="Fill out the form below to learn more about our price comparison services"
                    darkMode={false}
                    formPosition="center"
                    leadSource="website"
                  />
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-4">Form Settings</h3>
                  <Card>
                    <CardContent className="p-6">
                      <div className="space-y-4 text-center">
                        <Settings className="h-16 w-16 mx-auto text-gray-300" />
                        <p className="text-muted-foreground">
                          Form settings and customization options would be here in a complete implementation
                        </p>
                        <Button variant="outline" className="mx-auto">
                          Customize Form
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Embed Your Form</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-4 rounded-md font-mono text-sm">
                    &lt;iframe src="https://hyrisecrown.com/embed/lead-form" width="100%" height="500px" frameborder="0"&gt;&lt;/iframe&gt;
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="lead-management" className="space-y-6">
          <LeadManagementDashboard />
        </TabsContent>
        
        <TabsContent value="automations" className="space-y-6">
          <FollowUpCampaigns />
        </TabsContent>
      </Tabs>
    </Container>
  );
}