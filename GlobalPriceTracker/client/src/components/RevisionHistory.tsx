/**
 * Revision History Component
 * 
 * Display and manage revision history with diffs and rollback capabilities
 */

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ArrowUpRight, ArrowDownLeft, Trash2, RotateCcw } from 'lucide-react';

interface RevisionEntry {
  id: string;
  version: number;
  action: 'create' | 'update' | 'delete';
  username?: string;
  timestamp: number;
  changesSummary: string;
}

interface RevisionHistoryComponentProps {
  entityType: string;
  entityId: string;
  onRestore?: (version: number) => void;
}

export function RevisionHistory({ entityType, entityId, onRestore }: RevisionHistoryComponentProps) {
  const [revisions, setRevisions] = useState<RevisionEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRevision, setSelectedRevision] = useState<number | null>(null);
  const [diff, setDiff] = useState<any>(null);

  useEffect(() => {
    fetchRevisions();
  }, [entityType, entityId]);

  const fetchRevisions = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/sync/revisions/${entityType}/${entityId}?limit=50`
      );
      const data = await response.json();
      if (data.success) {
        setRevisions(data.revisions);
      }
    } catch (error) {
      console.error('Failed to fetch revisions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDiff = async (fromVersion: number, toVersion: number) => {
    try {
      const response = await fetch(
        `/api/sync/revisions/${entityType}/${entityId}/diff/${fromVersion}/${toVersion}`
      );
      const data = await response.json();
      if (data.success) {
        setDiff(data.differences);
      }
    } catch (error) {
      console.error('Failed to fetch diff:', error);
    }
  };

  const handleRestore = async (version: number) => {
    try {
      const response = await fetch(
        `/api/sync/restore/${entityType}/${entityId}/${version}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason: 'User restore' })
        }
      );
      const data = await response.json();
      if (data.success) {
        onRestore?.(version);
        fetchRevisions();
      }
    } catch (error) {
      console.error('Failed to restore revision:', error);
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create': return 'bg-green-100 text-green-800';
      case 'update': return 'bg-blue-100 text-blue-800';
      case 'delete': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create': return <ArrowDownLeft className="w-3 h-3" />;
      case 'update': return null;
      case 'delete': return <ArrowUpRight className="w-3 h-3" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">Loading revision history...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Revision History</CardTitle>
          <Badge variant="secondary">{revisions.length} versions</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-2">
        {revisions.length === 0 ? (
          <div className="text-center text-muted-foreground text-sm py-6">
            No revisions yet
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {revisions.map((revision, index) => (
              <div key={revision.id} className="border rounded p-3 hover:bg-muted/50 transition">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={`${getActionColor(revision.action)} text-xs`}>
                        {getActionIcon(revision.action)}
                        <span className="ml-1 capitalize">{revision.action}</span>
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        v{revision.version}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mb-1">
                      {new Date(revision.timestamp).toLocaleString()}
                    </div>
                    <div className="text-xs font-mono bg-muted/50 p-1 rounded">
                      {revision.changesSummary}
                    </div>
                    {revision.username && (
                      <div className="text-xs text-muted-foreground mt-1">
                        by {revision.username}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-1 flex-shrink-0">
                    {index > 0 && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            title="Restore to this version"
                          >
                            <RotateCcw className="w-3 h-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogTitle>Restore Revision?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to restore to version {revision.version}?
                            This will create a new revision with the restored content.
                          </AlertDialogDescription>
                          <div className="flex gap-2">
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleRestore(revision.version)}
                            >
                              Restore
                            </AlertDialogAction>
                          </div>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}

                    {index < revisions.length - 1 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => fetchDiff(
                          revisions[index + 1].version,
                          revision.version
                        )}
                        title="View diff from previous version"
                      >
                        Diff
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Diff Display */}
        {diff && (
          <div className="border-t pt-3 mt-3">
            <div className="text-xs font-semibold mb-2">Changes</div>
            <div className="space-y-1 max-h-40 overflow-y-auto bg-muted/50 p-2 rounded text-xs font-mono">
              {Array.isArray(diff) ? (
                diff.map((change: any, i: number) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-muted-foreground min-w-16">{change.field}:</span>
                    <span className="text-red-600">{JSON.stringify(change.oldValue)}</span>
                    <span className="text-muted-foreground">→</span>
                    <span className="text-green-600">{JSON.stringify(change.newValue)}</span>
                  </div>
                ))
              ) : (
                <pre>{JSON.stringify(diff, null, 2)}</pre>
              )}
            </div>
          </div>
        )}

        {/* Info Footer */}
        <div className="text-xs text-muted-foreground pt-2 border-t">
          💡 Tip: Click "Diff" to see changes between versions. Use "Restore" to revert to any version.
        </div>
      </CardContent>
    </Card>
  );
}

export default RevisionHistory;
