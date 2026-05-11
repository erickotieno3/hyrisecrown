import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
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
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { 
  ChevronDown, 
  Filter, 
  MoreHorizontal, 
  RefreshCw, 
  Search, 
  Download, 
  Tag, 
  Mail, 
  Phone, 
  Edit, 
  Trash2,
  Calendar,
  CheckCircle,
  Clock,
  X
} from 'lucide-react';

// Mock data for leads
const mockLeads = [
  {
    id: '1',
    fullName: 'John Smith',
    email: 'john.smith@example.com',
    phoneNumber: '+1 234 567 8901',
    company: 'Smith & Co',
    interest: 'Price Comparison',
    source: 'Website',
    status: 'New',
    createdAt: '2025-05-19T10:30:00Z',
    lastActivity: '2025-05-19T10:30:00Z',
    tags: ['VIP', 'Retail'],
    notes: 'Interested in enterprise plan',
  },
  {
    id: '2',
    fullName: 'Jane Doe',
    email: 'jane.doe@example.com',
    phoneNumber: '+1 234 567 8902',
    company: 'Doe Enterprises',
    interest: 'Visual Search',
    source: 'Google Ads',
    status: 'Contacted',
    createdAt: '2025-05-18T14:15:00Z',
    lastActivity: '2025-05-19T09:45:00Z',
    tags: ['Ecommerce'],
    notes: 'Follow up about API integration',
  },
  {
    id: '3',
    fullName: 'Michael Johnson',
    email: 'michael@johnson.co',
    phoneNumber: '+1 234 567 8903',
    company: 'Johnson Retail',
    interest: 'Affiliate Program',
    source: 'Referral',
    status: 'Qualified',
    createdAt: '2025-05-17T11:00:00Z',
    lastActivity: '2025-05-19T11:30:00Z',
    tags: ['Retail', 'Premium'],
    notes: 'Looking for bulk pricing',
  },
  {
    id: '4',
    fullName: 'Sarah Williams',
    email: 'sarah@williams.org',
    phoneNumber: '+1 234 567 8904',
    company: 'Williams Shop',
    interest: 'Vendor Partnership',
    source: 'LinkedIn',
    status: 'Negotiation',
    createdAt: '2025-05-16T09:20:00Z',
    lastActivity: '2025-05-19T08:15:00Z',
    tags: ['SMB'],
    notes: 'Scheduled demo for next week',
  },
  {
    id: '5',
    fullName: 'Robert Brown',
    email: 'robert@browntech.com',
    phoneNumber: '+1 234 567 8905',
    company: 'Brown Technologies',
    interest: 'Price Comparison',
    source: 'Facebook',
    status: 'Closed Won',
    createdAt: '2025-05-15T16:45:00Z',
    lastActivity: '2025-05-18T14:30:00Z',
    tags: ['Enterprise', 'Tech'],
    notes: 'Contract signed on May 18',
  },
  {
    id: '6',
    fullName: 'Emily Davis',
    email: 'emily@davisgroup.net',
    phoneNumber: '+1 234 567 8906',
    company: 'Davis Group',
    interest: 'Visual Search',
    source: 'Twitter',
    status: 'Closed Lost',
    createdAt: '2025-05-14T13:10:00Z',
    lastActivity: '2025-05-17T10:00:00Z',
    tags: ['Competitor'],
    notes: 'Decided to go with a competitor',
  },
];

interface LeadManagementDashboardProps {
  initialLeads?: typeof mockLeads;
}

export function LeadManagementDashboard({ initialLeads = mockLeads }: LeadManagementDashboardProps) {
  const { toast } = useToast();
  const [leads, setLeads] = useState(initialLeads);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  
  // Filter leads based on search term, status, and source
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = lead.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lead.company?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || lead.status === statusFilter;
    const matchesSource = sourceFilter === 'All' || lead.source === sourceFilter;
    
    return matchesSearch && matchesStatus && matchesSource;
  });
  
  const statusOptions = ['All', 'New', 'Contacted', 'Qualified', 'Negotiation', 'Closed Won', 'Closed Lost'];
  const sourceOptions = ['All', 'Website', 'Google Ads', 'Referral', 'LinkedIn', 'Facebook', 'Twitter'];
  
  const handleSelectLead = (id: string) => {
    if (selectedLeads.includes(id)) {
      setSelectedLeads(selectedLeads.filter(leadId => leadId !== id));
    } else {
      setSelectedLeads([...selectedLeads, id]);
    }
  };
  
  const handleSelectAll = () => {
    if (selectedLeads.length === filteredLeads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(filteredLeads.map(lead => lead.id));
    }
  };
  
  const handleBulkAction = (action: string) => {
    if (selectedLeads.length === 0) {
      toast({
        title: "No leads selected",
        description: "Please select at least one lead to perform this action.",
        variant: "destructive",
      });
      return;
    }
    
    // Placeholder for bulk actions
    toast({
      title: `${action} - ${selectedLeads.length} leads`,
      description: `Action would be performed on selected leads in a real implementation.`,
    });
    
    // Clear selection after action
    setSelectedLeads([]);
  };
  
  const handleDeleteLead = (id: string) => {
    // In a real implementation, this would call an API to delete the lead
    setLeads(leads.filter(lead => lead.id !== id));
    
    toast({
      title: "Lead deleted",
      description: "The lead has been successfully removed from the system.",
    });
  };
  
  const handleStatusChange = (id: string, newStatus: string) => {
    // In a real implementation, this would update the lead's status via API
    setLeads(leads.map(lead => 
      lead.id === id ? { ...lead, status: newStatus, lastActivity: new Date().toISOString() } : lead
    ));
    
    toast({
      title: "Status updated",
      description: `Lead status has been changed to ${newStatus}.`,
    });
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New':
        return 'bg-blue-100 text-blue-800';
      case 'Contacted':
        return 'bg-purple-100 text-purple-800';
      case 'Qualified':
        return 'bg-amber-100 text-amber-800';
      case 'Negotiation':
        return 'bg-orange-100 text-orange-800';
      case 'Closed Won':
        return 'bg-green-100 text-green-800';
      case 'Closed Lost':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };
  
  const calculateLeadStats = () => {
    const totalLeads = leads.length;
    const newLeads = leads.filter(lead => lead.status === 'New').length;
    const closedWon = leads.filter(lead => lead.status === 'Closed Won').length;
    const conversionRate = totalLeads > 0 ? Math.round((closedWon / totalLeads) * 100) : 0;
    
    return { totalLeads, newLeads, closedWon, conversionRate };
  };
  
  const stats = calculateLeadStats();
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between space-y-4 md:space-y-0 md:space-x-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 w-full">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLeads}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">New Leads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.newLeads}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Deals Won</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.closedWon}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.conversionRate}%</div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between">
            <div>
              <CardTitle>Lead Management</CardTitle>
              <CardDescription>
                Manage all captured leads and follow-up activities
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2 mt-4 md:mt-0">
              <Button variant="outline" size="sm" onClick={() => handleBulkAction('Export')}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleBulkAction('Email')}>
                <Mail className="h-4 w-4 mr-2" />
                Email Selected
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row justify-between space-y-4 md:space-y-0">
              <div className="flex items-center space-x-2">
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search leads..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Status: {statusFilter}
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {statusOptions.map((status) => (
                      <DropdownMenuItem 
                        key={status}
                        onClick={() => setStatusFilter(status)}
                      >
                        {status}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      Source: {sourceFilter}
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Filter by Source</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {sourceOptions.map((source) => (
                      <DropdownMenuItem 
                        key={source}
                        onClick={() => setSourceFilter(source)}
                      >
                        {source}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <div className="text-sm text-muted-foreground">
                Showing {filteredLeads.length} of {leads.length} leads
              </div>
            </div>
            
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedLeads.length === filteredLeads.length && filteredLeads.length > 0}
                          onChange={handleSelectAll}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                      </div>
                    </TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Interest</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Date Added</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.length > 0 ? (
                    filteredLeads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              checked={selectedLeads.includes(lead.id)}
                              onChange={() => handleSelectLead(lead.id)}
                              className="h-4 w-4 rounded border-gray-300"
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{lead.fullName}</div>
                          <div className="text-sm text-muted-foreground">{lead.email}</div>
                        </TableCell>
                        <TableCell>{lead.company || '-'}</TableCell>
                        <TableCell>{lead.interest}</TableCell>
                        <TableCell>
                          <Badge className={`${getStatusColor(lead.status)}`}>
                            {lead.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{lead.source}</TableCell>
                        <TableCell>{formatDate(lead.createdAt)}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {lead.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => window.open(`mailto:${lead.email}`)}>
                                <Mail className="h-4 w-4 mr-2" />
                                Send Email
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => window.open(`tel:${lead.phoneNumber}`)}>
                                <Phone className="h-4 w-4 mr-2" />
                                Call
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Calendar className="h-4 w-4 mr-2" />
                                Schedule Meeting
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => handleStatusChange(lead.id, 'New')}>
                                <Clock className="h-4 w-4 mr-2" />
                                New
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusChange(lead.id, 'Contacted')}>
                                <Mail className="h-4 w-4 mr-2" />
                                Contacted
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusChange(lead.id, 'Qualified')}>
                                <Tag className="h-4 w-4 mr-2" />
                                Qualified
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusChange(lead.id, 'Negotiation')}>
                                <Edit className="h-4 w-4 mr-2" />
                                Negotiation
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusChange(lead.id, 'Closed Won')}>
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Closed Won
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusChange(lead.id, 'Closed Lost')}>
                                <X className="h-4 w-4 mr-2" />
                                Closed Lost
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => handleDeleteLead(lead.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        <div className="text-muted-foreground">
                          No leads found matching your criteria
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}