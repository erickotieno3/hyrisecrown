/**
 * Unlimited Revision Management Dashboard
 * 
 * Complete admin panel for managing and monitoring revision history
 */

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, Trash2, Settings, TrendingUp, Users, FileText, Clock, AlertCircle } from 'lucide-react';

interface RevisionStats {
  totalRevisions: number;
  entityTypes: Record<string, number>;
  actionCounts: Record<string, number>;
  topEditors: Array<{ userId: string; username: string; count: number }>;
  dateRange: { start: number; end: number };
}

interface CleanupSettings {
  entityType?: string;
  keepVersions: number;
  autoCleanup: boolean;
  cleanupInterval: number;
}

export function RevisionManagementDashboard() {
  const [stats, setStats] = useState<RevisionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedEntity, setSelectedEntity] = useState<string>('');
  const [searchUser, setSearchUser] = useState('');
  const [revisions, setRevisions] = useState<any[]>([]);
  const [cleanupSettings, setCleanupSettings] = useState<CleanupSettings>({
    keepVersions: 100,
    autoCleanup: false,
    cleanupInterval: 86400000 // 24 hours
  });
  const [lastCleanup, setLastCleanup] = useState<number | null>(null);

  useEffect(() => {
    fetchStats();
    fetchRevisions();
  }, [selectedEntity, searchUser]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/sync/stats${selectedEntity ? `?entityType=${selectedEntity}` : ''}`);
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRevisions = async () => {
    try {
      let url = '/api/sync/search?limit=50';
      if (selectedEntity) url += `&entityType=${selectedEntity}`;
      if (searchUser) url += `&userId=${searchUser}`;

      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setRevisions(data.revisions);
      }
    } catch (error) {
      console.error('Failed to fetch revisions:', error);
    }
  };

  const handleExport = async (format: 'json' | 'csv') => {
    try {
      const url = `/api/sync/export/${selectedEntity || 'all'}?format=${format}`;
      window.open(url, '_blank');
    } catch (error) {
      console.error('Failed to export:', error);
    }
  };

  const handleCleanup = async () => {
    try {
      const response = await fetch('/api/sync/cleanup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType: selectedEntity || undefined,
          keepVersions: cleanupSettings.keepVersions
        })
      });
      const data = await response.json();
      if (data.success) {
        setLastCleanup(Date.now());
        fetchStats();
      }
    } catch (error) {
      console.error('Failed to cleanup:', error);
    }
  };

  const getChartData = () => {
    if (!stats) return [];
    return Object.entries(stats.entityTypes).map(([type, count]) => ({
      name: type,
      revisions: count
    }));
  };

  const getActionChartData = () => {
    if (!stats) return [];
    return Object.entries(stats.actionCounts).map(([action, count]) => ({
      name: action.toUpperCase(),
      count
    }));
  };

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Revision Management</h1>
        <p className="text-muted-foreground">Monitor and manage unlimited revision history</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revisions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalRevisions || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.entityTypes 
                ? Object.keys(stats.entityTypes).length 
                : 0} entity types
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Top Editor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.topEditors[0]?.username || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats?.topEditors[0]?.count || 0} changes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Activity Range</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold">
              {stats && new Date(stats.dateRange.start).toLocaleDateString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              to {stats && new Date(stats.dateRange.end).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Last Cleanup</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold">
              {lastCleanup ? new Date(lastCleanup).toLocaleTimeString() : 'Never'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {lastCleanup ? `${Math.floor((Date.now() - lastCleanup) / 60000)} min ago` : 'No cleanup'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Revisions by Entity Type */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Revisions by Entity Type</CardTitle>
          </CardHeader>
          <CardContent>
            {getChartData().length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getChartData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="revisions" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Action Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {getActionChartData().length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={getActionChartData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {getActionChartData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filters & Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Search & Filter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Entity Type</label>
              <Input
                placeholder="e.g., product, price"
                value={selectedEntity}
                onChange={(e) => setSelectedEntity(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">User ID</label>
              <Input
                placeholder="Search by user"
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={fetchStats} variant="outline">
              Search
            </Button>
            <Button onClick={() => handleExport('json')} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              JSON
            </Button>
            <Button onClick={() => handleExport('csv')} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Top Editors */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Top Editors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {stats?.topEditors.map((editor, index) => (
              <div key={index} className="flex items-center justify-between p-2 border rounded">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{index + 1}</Badge>
                  <span className="font-medium">{editor.username}</span>
                </div>
                <span className="text-sm text-muted-foreground">{editor.count} revisions</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Revisions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Recent Revisions</CardTitle>
          <CardDescription>Last 50 revisions matching filters</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {revisions.map((rev) => (
              <div key={rev.id} className="flex items-start justify-between p-3 border rounded hover:bg-muted/50">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge className="text-xs">{rev.action}</Badge>
                    <span className="text-sm font-mono">{rev.entityType}#{rev.entityId}</span>
                    <span className="text-xs text-muted-foreground">v{rev.version}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {rev.username} • {new Date(rev.timestamp).toLocaleString()}
                  </div>
                  <div className="text-xs font-mono bg-muted/50 mt-1 p-1 rounded">
                    {rev.changesSummary}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cleanup Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Cleanup Settings
          </CardTitle>
          <CardDescription>Manage old revision cleanup</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Keep Last N Versions Per Entity</label>
            <Input
              type="number"
              min="10"
              max="1000"
              value={cleanupSettings.keepVersions}
              onChange={(e) => setCleanupSettings({
                ...cleanupSettings,
                keepVersions: parseInt(e.target.value)
              })}
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Older revisions will be removed during cleanup
            </p>
          </div>

          <div className="flex gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="gap-2">
                  <Trash2 className="w-4 h-4" />
                  Run Cleanup Now
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogTitle>Confirm Cleanup</AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove all revisions older than {cleanupSettings.keepVersions} versions
                  {selectedEntity && ` for entity type "${selectedEntity}"`}.
                  This action cannot be undone.
                </AlertDialogDescription>
                <div className="flex gap-2">
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleCleanup}>
                    Cleanup
                  </AlertDialogAction>
                </div>
              </AlertDialogContent>
            </AlertDialog>

            <Button variant="outline" onClick={fetchStats}>
              Refresh Stats
            </Button>
          </div>

          {lastCleanup && (
            <div className="p-3 bg-green-50 border border-green-200 rounded flex items-start gap-2">
              <Clock className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-green-700">
                Last cleanup: {new Date(lastCleanup).toLocaleString()}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-blue-900 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Data Retention
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-800">
            <ul className="space-y-1 list-disc list-inside">
              <li>Unlimited revisions per entity</li>
              <li>Maximum 10,000 stored per entity</li>
              <li>Automatic cleanup available</li>
              <li>Compression after 100 revisions</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-amber-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-amber-900 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Best Practices
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-amber-800">
            <ul className="space-y-1 list-disc list-inside">
              <li>Export revisions regularly</li>
              <li>Run cleanup monthly</li>
              <li>Monitor top editors</li>
              <li>Use search to audit changes</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default RevisionManagementDashboard;
