/**
 * Network Status Component
 * 
 * Displays real-time network status, sync state, and revision info
 */

import React, { useEffect, useState } from 'react';
import { useNetworkSync, useOnlineStatus, networkSyncClient } from '../services/networkSync';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Check, WifiOff, Zap } from 'lucide-react';

interface NetworkStatusComponentProps {
  entity?: string;
  showDetails?: boolean;
}

export function NetworkStatus({ entity = 'prices', showDetails = true }: NetworkStatusComponentProps) {
  const { isConnected, data, error, lastSync, syncEntity } = useNetworkSync(entity);
  const isOnline = useOnlineStatus();
  const [clientStats, setClientStats] = useState<any>(null);

  useEffect(() => {
    // Fetch network stats periodically
    const interval = setInterval(async () => {
      try {
        const response = await fetch('/api/sync/network/stats');
        const result = await response.json();
        if (result.success) {
          setClientStats(result);
        }
      } catch (error) {
        console.error('Failed to fetch network stats:', error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    if (!isOnline) return 'destructive';
    if (isConnected) return 'default';
    return 'secondary';
  };

  const getStatusText = () => {
    if (!isOnline) return 'Offline';
    if (isConnected) return 'Connected';
    return 'Connecting...';
  };

  const getStatusIcon = () => {
    if (!isOnline) return <WifiOff className="w-4 h-4" />;
    if (isConnected) return <Check className="w-4 h-4" />;
    return <Zap className="w-4 h-4" />;
  };

  const lastSyncTime = new Date(lastSync).toLocaleTimeString();
  const timeAgo = Math.round((Date.now() - lastSync) / 1000);

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Network Status</CardTitle>
          <Badge variant={getStatusColor()}>
            {getStatusIcon()}
            <span className="ml-1">{getStatusText()}</span>
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Connection Status */}
        <div className="text-xs space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Status</span>
            <span className="font-medium">
              {isOnline ? (isConnected ? 'Real-time Sync' : 'Offline Mode') : 'No Internet'}
            </span>
          </div>

          {/* Last Sync Time */}
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Last Sync</span>
            <span className="font-medium">{timeAgo}s ago</span>
          </div>

          {/* Error State */}
          {error && (
            <div className="flex gap-2 items-start text-destructive bg-destructive/10 p-2 rounded">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span className="text-xs">{error}</span>
            </div>
          )}

          {/* Entity Data */}
          {data && (
            <div className="bg-muted p-2 rounded text-xs font-mono">
              <div className="text-muted-foreground mb-1">Latest: {entity}</div>
              <div className="max-h-32 overflow-y-auto">
                {typeof data === 'object' 
                  ? JSON.stringify(data, null, 2).substring(0, 200)
                  : String(data).substring(0, 200)
                }
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => syncEntity(entity)}
            disabled={!isConnected}
          >
            Sync Now
          </Button>
          {showDetails && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.location.href = `/api/sync/stats?entityType=${entity}`}
            >
              Details
            </Button>
          )}
        </div>

        {/* Connection Stats */}
        {showDetails && clientStats && (
          <div className="border-t pt-3 text-xs space-y-1">
            <div className="font-semibold text-muted-foreground">Network Stats</div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="text-muted-foreground">Active Clients</div>
                <div className="font-semibold">{clientStats.onlineConnections || 0}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Queued Updates</div>
                <div className="font-semibold">{clientStats.queuedUpdates || 0}</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default NetworkStatus;
