/**
 * WebSocket Server for Real-Time Network Integration
 * 
 * Features:
 * - Real-time price updates across all connected clients
 * - Multi-device synchronization
 * - Live collaboration features
 * - Offline/online detection
 * - Binary protocol support for efficiency
 */

import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { url } from 'inspector';

interface ClientConnection {
  id: string;
  ws: WebSocket;
  userId?: string;
  deviceId: string;
  connectedAt: Date;
  lastHeartbeat: Date;
  isOnline: boolean;
  subscriptions: Set<string>;
}

interface SyncMessage {
  type: 'sync' | 'update' | 'delete' | 'create' | 'heartbeat' | 'subscribe' | 'unsubscribe';
  id?: string;
  entity?: string;
  data?: any;
  timestamp?: number;
  clientId?: string;
  version?: number;
}

interface PriceUpdate {
  productId: number;
  storeId: number;
  oldPrice: number;
  newPrice: number;
  priceChange: number;
  percentChange: number;
  timestamp: number;
}

export class WebSocketNetworkServer {
  private wss: WebSocketServer;
  private clients: Map<string, ClientConnection> = new Map();
  private priceUpdateQueue: PriceUpdate[] = [];
  private readonly HEARTBEAT_INTERVAL = 30000; // 30 seconds
  private readonly MAX_QUEUE_SIZE = 10000;
  private syncLog: Map<string, any[]> = new Map(); // For audit trail

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server });
    this.setupWebSocketHandlers();
    this.startHeartbeat();
    console.log('✅ WebSocket Network Server initialized');
  }

  /**
   * Setup WebSocket event handlers
   */
  private setupWebSocketHandlers(): void {
    this.wss.on('connection', (ws: WebSocket) => {
      const clientId = this.generateClientId();
      
      console.log(`📱 Client connected: ${clientId}`);

      ws.on('message', (data: Buffer) => {
        try {
          const message: SyncMessage = JSON.parse(data.toString());
          this.handleMessage(clientId, message);
        } catch (error) {
          console.error(`❌ Message parse error from ${clientId}:`, error);
          ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
        }
      });

      ws.on('close', () => {
        this.handleClientDisconnect(clientId);
      });

      ws.on('error', (error) => {
        console.error(`❌ WebSocket error for ${clientId}:`, error);
      });

      // Send welcome message
      ws.send(JSON.stringify({
        type: 'connected',
        clientId,
        timestamp: Date.now()
      }));
    });
  }

  /**
   * Handle incoming messages
   */
  private handleMessage(clientId: string, message: SyncMessage): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    switch (message.type) {
      case 'sync':
        this.handleSync(clientId, message);
        break;
      case 'update':
        this.handleUpdate(clientId, message);
        break;
      case 'subscribe':
        this.handleSubscribe(clientId, message);
        break;
      case 'unsubscribe':
        this.handleUnsubscribe(clientId, message);
        break;
      case 'heartbeat':
        this.handleHeartbeat(clientId);
        break;
      default:
        console.warn(`⚠️ Unknown message type: ${message.type}`);
    }
  }

  /**
   * Handle sync request from client
   */
  private handleSync(clientId: string, message: SyncMessage): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    // Return current sync state
    const syncState = {
      type: 'sync-response',
      entity: message.entity,
      data: this.getSyncData(message.entity),
      timestamp: Date.now(),
      version: this.getSyncVersion(message.entity)
    };

    client.ws.send(JSON.stringify(syncState));
    console.log(`🔄 Sync response sent to ${clientId} for entity: ${message.entity}`);
  }

  /**
   * Handle update from client
   */
  private handleUpdate(clientId: string, message: SyncMessage): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    // Log update to sync log
    this.logSyncEvent(message.entity || 'unknown', {
      action: 'update',
      clientId,
      userId: client.userId,
      data: message.data,
      timestamp: Date.now()
    });

    // Broadcast to other clients subscribed to this entity
    const broadcastMessage = {
      type: 'update',
      entity: message.entity,
      data: message.data,
      sourceClientId: clientId,
      timestamp: Date.now(),
      version: (this.getSyncVersion(message.entity || 'unknown') || 0) + 1
    };

    this.broadcastToSubscribers(message.entity || 'unknown', broadcastMessage, clientId);

    // Acknowledge
    client.ws.send(JSON.stringify({
      type: 'update-ack',
      id: message.id,
      timestamp: Date.now()
    }));
  }

  /**
   * Handle subscription to entity updates
   */
  private handleSubscribe(clientId: string, message: SyncMessage): void {
    const client = this.clients.get(clientId);
    if (!client || !message.entity) return;

    client.subscriptions.add(message.entity);
    console.log(`📡 Client ${clientId} subscribed to ${message.entity}`);

    client.ws.send(JSON.stringify({
      type: 'subscribed',
      entity: message.entity,
      timestamp: Date.now()
    }));
  }

  /**
   * Handle unsubscribe from entity updates
   */
  private handleUnsubscribe(clientId: string, message: SyncMessage): void {
    const client = this.clients.get(clientId);
    if (!client || !message.entity) return;

    client.subscriptions.delete(message.entity);
    console.log(`📴 Client ${clientId} unsubscribed from ${message.entity}`);

    client.ws.send(JSON.stringify({
      type: 'unsubscribed',
      entity: message.entity,
      timestamp: Date.now()
    }));
  }

  /**
   * Handle heartbeat
   */
  private handleHeartbeat(clientId: string): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    client.lastHeartbeat = new Date();
    client.isOnline = true;

    client.ws.send(JSON.stringify({
      type: 'heartbeat-ack',
      timestamp: Date.now()
    }));
  }

  /**
   * Broadcast message to subscribers
   */
  private broadcastToSubscribers(
    entity: string,
    message: any,
    excludeClientId?: string
  ): void {
    let count = 0;
    this.clients.forEach((client, clientId) => {
      // Skip sender and offline clients
      if (clientId === excludeClientId || !client.isOnline) return;
      
      // Only send to clients subscribed to this entity
      if (client.subscriptions.has(entity) || client.subscriptions.has('*')) {
        client.ws.send(JSON.stringify(message));
        count++;
      }
    });

    if (count > 0) {
      console.log(`📤 Broadcast to ${count} clients for entity: ${entity}`);
    }
  }

  /**
   * Broadcast price updates in real-time
   */
  public broadcastPriceUpdate(update: PriceUpdate): void {
    const message = {
      type: 'price-update',
      data: update,
      timestamp: Date.now()
    };

    // Send to all connected clients
    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });

    console.log(
      `💰 Price update broadcasted: Product ${update.productId} ` +
      `£${update.oldPrice} → £${update.newPrice} (${update.percentChange}%)`
    );

    // Queue for offline clients
    this.queuePriceUpdate(update);
  }

  /**
   * Queue price update for offline clients
   */
  private queuePriceUpdate(update: PriceUpdate): void {
    if (this.priceUpdateQueue.length >= this.MAX_QUEUE_SIZE) {
      this.priceUpdateQueue.shift(); // Remove oldest
    }
    this.priceUpdateQueue.push(update);
  }

  /**
   * Get queued updates for reconnecting client
   */
  public getQueuedUpdates(since?: number): PriceUpdate[] {
    if (!since) return this.priceUpdateQueue;
    return this.priceUpdateQueue.filter(update => update.timestamp > since);
  }

  /**
   * Start heartbeat for client monitoring
   */
  private startHeartbeat(): void {
    setInterval(() => {
      const now = Date.now();
      this.clients.forEach((client, clientId) => {
        const timeSinceLastHeartbeat = now - client.lastHeartbeat.getTime();
        
        if (timeSinceLastHeartbeat > this.HEARTBEAT_INTERVAL * 2) {
          // Client is stale, mark offline
          client.isOnline = false;
          console.log(`⚠️ Client ${clientId} marked as offline`);
        } else if (client.isOnline) {
          // Send heartbeat ping
          try {
            client.ws.send(JSON.stringify({
              type: 'heartbeat',
              timestamp: Date.now()
            }));
          } catch (error) {
            console.error(`❌ Failed to send heartbeat to ${clientId}`);
          }
        }
      });
    }, this.HEARTBEAT_INTERVAL);
  }

  /**
   * Handle client disconnect
   */
  private handleClientDisconnect(clientId: string): void {
    const client = this.clients.get(clientId);
    if (client) {
      console.log(`📴 Client disconnected: ${clientId} (User: ${client.userId || 'anonymous'})`);
      this.clients.delete(clientId);
    }
  }

  /**
   * Get sync data for entity
   */
  private getSyncData(entity?: string): any {
    // This would fetch from database
    // For now, return mock structure
    return {
      entity,
      items: [],
      count: 0
    };
  }

  /**
   * Get sync version for entity
   */
  private getSyncVersion(entity: string): number {
    return this.syncLog.get(entity)?.length || 0;
  }

  /**
   * Log sync event for audit trail
   */
  private logSyncEvent(entity: string, event: any): void {
    if (!this.syncLog.has(entity)) {
      this.syncLog.set(entity, []);
    }
    const events = this.syncLog.get(entity)!;
    events.push({
      ...event,
      id: events.length + 1
    });

    // Keep only last 1000 events per entity
    if (events.length > 1000) {
      events.shift();
    }
  }

  /**
   * Get sync audit log
   */
  public getSyncLog(entity?: string, limit: number = 100): any[] {
    if (entity) {
      return (this.syncLog.get(entity) || []).slice(-limit);
    }

    // Return all logs
    const allLogs: any[] = [];
    this.syncLog.forEach((events, ent) => {
      allLogs.push(...events.map(e => ({ ...e, entity: ent })));
    });
    return allLogs.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
  }

  /**
   * Get active clients count
   */
  public getActiveClientsCount(): number {
    return Array.from(this.clients.values()).filter(c => c.isOnline).length;
  }

  /**
   * Get connection statistics
   */
  public getConnectionStats() {
    const totalClients = this.clients.size;
    const onlineClients = Array.from(this.clients.values()).filter(c => c.isOnline).length;
    
    return {
      totalConnections: totalClients,
      onlineConnections: onlineClients,
      offlineConnections: totalClients - onlineClients,
      queuedUpdates: this.priceUpdateQueue.length,
      totalSyncEvents: Array.from(this.syncLog.values()).reduce((sum, events) => sum + events.length, 0),
      uptime: process.uptime()
    };
  }

  /**
   * Generate unique client ID
   */
  private generateClientId(): string {
    const clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const connection: ClientConnection = {
      id: clientId,
      ws: null as any, // Will be set when connection is established
      deviceId: `device_${Math.random().toString(36).substr(2, 9)}`,
      connectedAt: new Date(),
      lastHeartbeat: new Date(),
      isOnline: true,
      subscriptions: new Set()
    };

    this.clients.set(clientId, connection);
    return clientId;
  }

  /**
   * Link client ID with user ID
   */
  public registerUser(clientId: string, userId: string): void {
    const client = this.clients.get(clientId);
    if (client) {
      client.userId = userId;
      console.log(`👤 Client ${clientId} registered as user ${userId}`);
    }
  }

  /**
   * Store client WebSocket connection after initial setup
   */
  public registerClientWs(clientId: string, ws: WebSocket): void {
    const client = this.clients.get(clientId);
    if (client) {
      client.ws = ws;
    }
  }
}

export default WebSocketNetworkServer;
