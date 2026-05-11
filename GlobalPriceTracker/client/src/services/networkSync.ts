/**
 * Client-Side Network Synchronization Service
 * 
 * Handles real-time sync with server via WebSocket
 */

import { useEffect, useState, useCallback } from 'react';

interface SyncMessage {
  type: 'sync' | 'update' | 'subscribe' | 'unsubscribe' | 'heartbeat';
  id?: string;
  entity?: string;
  data?: any;
  timestamp?: number;
}

interface SyncState {
  isConnected: boolean;
  isOnline: boolean;
  clientId?: string;
  pendingUpdates: SyncMessage[];
  lastSync: number;
}

class NetworkSyncClient {
  private ws?: WebSocket;
  private clientId?: string;
  private messageHandlers: Map<string, Function> = new Map();
  private subscriptions: Set<string> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private state: SyncState = {
    isConnected: false,
    isOnline: navigator.onLine,
    pendingUpdates: [],
    lastSync: Date.now()
  };
  private offlineQueue: SyncMessage[] = [];

  /**
   * Initialize connection
   */
  public connect(serverUrl: string = 'ws://localhost:3000'): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(serverUrl);

        this.ws.onopen = () => {
          console.log('✅ WebSocket connected');
          this.state.isConnected = true;
          this.reconnectAttempts = 0;
          this.flushOfflineQueue();
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(JSON.parse(event.data));
        };

        this.ws.onclose = () => {
          console.log('❌ WebSocket disconnected');
          this.state.isConnected = false;
          this.attemptReconnect();
        };

        this.ws.onerror = (error) => {
          console.error('❌ WebSocket error:', error);
          reject(error);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Handle incoming messages
   */
  private handleMessage(message: any): void {
    this.state.lastSync = Date.now();

    switch (message.type) {
      case 'connected':
        this.clientId = message.clientId;
        console.log(`📱 Connected with client ID: ${this.clientId}`);
        this.emit('connected', message);
        break;

      case 'update':
        this.emit('update', message);
        break;

      case 'sync-response':
        this.emit('sync', message);
        break;

      case 'heartbeat':
        this.sendHeartbeat();
        break;

      case 'error':
        console.error('❌ Server error:', message.message);
        this.emit('error', message);
        break;

      default:
        if (this.messageHandlers.has(message.type)) {
          this.messageHandlers.get(message.type)!(message);
        }
    }
  }

  /**
   * Register message handler
   */
  public on(type: string, handler: Function): void {
    this.messageHandlers.set(type, handler);
  }

  /**
   * Emit event to handlers
   */
  private emit(type: string, data: any): void {
    const handler = this.messageHandlers.get(type);
    if (handler) {
      handler(data);
    }
  }

  /**
   * Subscribe to entity updates
   */
  public subscribe(entity: string): void {
    this.subscriptions.add(entity);
    this.send({
      type: 'subscribe',
      entity
    });
    console.log(`📡 Subscribed to ${entity}`);
  }

  /**
   * Unsubscribe from entity updates
   */
  public unsubscribe(entity: string): void {
    this.subscriptions.delete(entity);
    this.send({
      type: 'unsubscribe',
      entity
    });
    console.log(`📴 Unsubscribed from ${entity}`);
  }

  /**
   * Request sync for entity
   */
  public sync(entity: string): void {
    this.send({
      type: 'sync',
      entity
    });
    console.log(`🔄 Sync requested for ${entity}`);
  }

  /**
   * Send update to server
   */
  public update(entity: string, data: any): void {
    this.send({
      type: 'update',
      id: this.generateMessageId(),
      entity,
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Send heartbeat
   */
  private sendHeartbeat(): void {
    this.send({
      type: 'heartbeat'
    });
  }

  /**
   * Send message to server
   */
  private send(message: SyncMessage): void {
    if (this.state.isConnected && this.ws) {
      try {
        this.ws.send(JSON.stringify(message));
      } catch (error) {
        console.error('❌ Failed to send message:', error);
        this.offlineQueue.push(message);
      }
    } else {
      console.log('⚠️ Not connected, queuing message');
      this.offlineQueue.push(message);
    }
  }

  /**
   * Flush offline queue when reconnected
   */
  private flushOfflineQueue(): void {
    while (this.offlineQueue.length > 0) {
      const message = this.offlineQueue.shift()!;
      this.send(message);
    }
    console.log('✅ Offline queue flushed');
  }

  /**
   * Attempt reconnection with exponential backoff
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`🔄 Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(() => {
      this.connect().catch(err => {
        console.error('Reconnection failed:', err);
      });
    }, delay);
  }

  /**
   * Get current state
   */
  public getState(): SyncState {
    return { ...this.state };
  }

  /**
   * Check if connected
   */
  public isConnected(): boolean {
    return this.state.isConnected;
  }

  /**
   * Close connection
   */
  public disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.state.isConnected = false;
    }
  }

  /**
   * Generate unique message ID
   */
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Singleton instance
export const networkSyncClient = new NetworkSyncClient();

/**
 * React Hook for network synchronization
 */
export function useNetworkSync(entity?: string) {
  const [isConnected, setIsConnected] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<number>(Date.now());

  useEffect(() => {
    // Listen for connection status
    networkSyncClient.on('connected', () => {
      setIsConnected(true);
      setError(null);
    });

    networkSyncClient.on('update', (message: any) => {
      if (entity && message.entity === entity) {
        setData(message.data);
        setLastSync(Date.now());
      }
    });

    networkSyncClient.on('sync', (message: any) => {
      if (entity && message.entity === entity) {
        setData(message.data);
        setLastSync(Date.now());
      }
    });

    networkSyncClient.on('error', (message: any) => {
      setError(message.message || 'Unknown error');
    });

    // Subscribe to entity if specified
    if (entity && isConnected) {
      networkSyncClient.subscribe(entity);
    }

    // Cleanup
    return () => {
      if (entity) {
        networkSyncClient.unsubscribe(entity);
      }
    };
  }, [entity, isConnected]);

  // Request initial sync
  useEffect(() => {
    if (entity && isConnected) {
      networkSyncClient.sync(entity);
    }
  }, [entity, isConnected]);

  const syncEntity = useCallback((ent: string) => {
    networkSyncClient.sync(ent);
  }, []);

  const updateEntity = useCallback((ent: string, newData: any) => {
    networkSyncClient.update(ent, newData);
  }, []);

  return {
    isConnected,
    data,
    error,
    lastSync,
    syncEntity,
    updateEntity
  };
}

/**
 * React Hook for online status
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

export default networkSyncClient;
