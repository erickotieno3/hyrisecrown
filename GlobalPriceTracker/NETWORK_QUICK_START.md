# Network Integration Quick Start Guide

Get started with real-time synchronization and unlimited revision history in 5 minutes.

## 🚀 Quick Setup

### 1. Verify Installation
```bash
bash verify-network.sh
```

Expected: ✅ All 29 checks passing

### 2. Start Development Server
```bash
npm run dev
```

The WebSocket server starts automatically at your configured port.

### 3. Use in React Components
```tsx
import { NetworkStatus } from '@/components/NetworkStatus';
import { RevisionHistory } from '@/components/RevisionHistory';

export function ProductPage() {
  return (
    <div className="space-y-4">
      {/* Real-time status indicator */}
      <NetworkStatus entity="prices" />
      
      {/* Full revision history */}
      <RevisionHistory 
        entityType="product" 
        entityId={productId}
      />
    </div>
  );
}
```

---

## 🔌 API Quick Reference

### Get Real-Time Updates
```bash
# Fetch revision history
curl http://localhost:3000/api/sync/revisions/product/123

# Search revisions (last 7 days)
curl "http://localhost:3000/api/sync/search?entityType=product&startTime=$(date -d '7 days ago' +%s)000"

# Get statistics
curl http://localhost:3000/api/sync/stats

# Generate report
curl http://localhost:3000/api/sync/report > report.md
```

### Restore a Version
```bash
curl -X POST http://localhost:3000/api/sync/restore/product/123/5 \
  -H "Content-Type: application/json" \
  -d '{"reason": "Restored incorrect price"}'
```

### Export Data
```bash
# JSON export
curl http://localhost:3000/api/sync/export/product?format=json > revisions.json

# CSV export
curl http://localhost:3000/api/sync/export/product?format=csv > revisions.csv
```

---

## ⚡ React Hooks

### useNetworkSync
```tsx
const { isConnected, data, error, syncEntity, updateEntity } = useNetworkSync('prices');

return (
  <div>
    {isConnected ? '🟢 Connected' : '🔴 Offline'}
    {error && <div className="error">{error}</div>}
    <button onClick={() => syncEntity('products')}>Sync Now</button>
  </div>
);
```

### useOnlineStatus
```tsx
const isOnline = useOnlineStatus();

return <span>{isOnline ? 'Online' : 'Offline'}</span>;
```

---

## 📝 Track Changes in Your Code

### When updating data:
```typescript
// Before: old code
await updateProduct(productId, newData);

// After: with revision tracking
import { revisionSystem } from '@/services/revisionSystem';

const oldData = await getProduct(productId);
await updateProduct(productId, newData);

// Track the change
await revisionSystem.trackRevision(
  'product',
  productId,
  'update',
  oldData,
  newData,
  { 
    userId: currentUser.id,
    username: currentUser.name 
  }
);

// Broadcast to other clients
if (wsNetworkServer) {
  wsNetworkServer.broadcastPriceUpdate({
    productId,
    oldPrice: oldData.price,
    newPrice: newData.price,
    percentChange: ((newData.price - oldData.price) / oldData.price) * 100,
    timestamp: Date.now()
  });
}
```

---

## 🎯 Common Tasks

### Show Network Status
```tsx
import { NetworkStatus } from '@/components/NetworkStatus';

<NetworkStatus entity="products" showDetails={true} />
```

### Show Revision History
```tsx
import { RevisionHistory } from '@/components/RevisionHistory';

<RevisionHistory 
  entityType="product" 
  entityId="123"
  onRestore={(version) => {
    console.log('Restored to version', version);
    // Refresh data
  }}
/>
```

### Check Connection Status
```tsx
const { isConnected, lastSync } = useNetworkSync();

const timeAgo = Math.round((Date.now() - lastSync) / 1000);
console.log(`Connected: ${isConnected}, Last sync: ${timeAgo}s ago`);
```

### Get Sync Statistics
```typescript
const stats = await fetch('/api/sync/stats').then(r => r.json());

console.log(`
  Total Revisions: ${stats.stats.totalRevisions}
  Top Editor: ${stats.stats.topEditors[0].username}
  Date Range: ${new Date(stats.stats.dateRange.start).toLocaleDateString()}
`);
```

### Search User Changes
```bash
# Get all changes by specific user in last 30 days
curl "http://localhost:3000/api/sync/search?userId=user_123&startTime=$(date -d '30 days ago' +%s)000&limit=100"
```

---

## 🔍 Debug Mode

Enable verbose logging:
```typescript
// In your component or service
const client = networkSyncClient;

client.on('update', (msg) => console.log('Update:', msg));
client.on('connected', (msg) => console.log('Connected:', msg));
client.on('error', (msg) => console.error('Error:', msg));
```

Check server logs:
```bash
# WebSocket events
tail -f logs/websocket.log

# Sync operations
grep "sync" logs/*.log
```

---

## 📊 Monitoring

### Check Network Stats
```bash
curl http://localhost:3000/api/sync/network/stats | jq '.'
```

Output:
```json
{
  "totalConnections": 42,
  "onlineConnections": 38,
  "offlineConnections": 4,
  "queuedUpdates": 127
}
```

### Check Revisions
```bash
# Count revisions for a product
curl "http://localhost:3000/api/sync/revisions/product/123" | jq '.totalRevisions'

# See last 10 changes
curl "http://localhost:3000/api/sync/revisions/product/123?limit=10" | jq '.revisions[] | {version, changesSummary, username}'
```

---

## 🐛 Troubleshooting

### No connection?
```bash
# Check WebSocket server
curl http://localhost:3000/health

# Check console
echo "Look for 'WebSocket Network Server initialized'"
```

### Missing revisions?
```bash
# Verify trackRevision is being called
grep -r "trackRevision" server/

# Check if changes are being saved
curl "http://localhost:3000/api/sync/revisions/product/123" | jq '.totalRevisions'
```

### High memory usage?
```bash
# Clean old revisions (keep last 100)
curl -X POST http://localhost:3000/api/sync/cleanup \
  -H "Content-Type: application/json" \
  -d '{"keepVersions": 100}'
```

---

## 📚 Full Documentation

For complete details, see:
- **NETWORK_REVISION_GUIDE.md** - Complete API reference
- **server/websocket-server.ts** - WebSocket implementation
- **server/unlimited-revisions.ts** - Revision system
- **client/src/services/networkSync.ts** - Client service

---

## ✅ Checklist for Implementation

- [ ] Install and verify with `bash verify-network.sh`
- [ ] Add `<NetworkStatus />` to app
- [ ] Add `<RevisionHistory />` to detail pages
- [ ] Track changes with `trackRevision()`
- [ ] Test offline → online transition
- [ ] Set up monitoring/alerts
- [ ] Configure WebSocket Secure (WSS) for production
- [ ] Enable revision cleanup cron job
- [ ] Document retention policy
- [ ] Train team on new features

---

## 🎓 Example: Price Change Tracking

Complete example of a price update with automatic tracking:

```typescript
// server/product-routes.ts
import { revisionSystem } from './unlimited-revisions';
import { wsNetworkServer } from './websocket-server';

router.put('/products/:id', async (req, res) => {
  const productId = req.params.id;
  const newData = req.body;
  
  try {
    // Get old data
    const oldData = await db.query.products
      .findFirst({ where: eq(products.id, parseInt(productId)) });
    
    // Update in database
    await db.update(products)
      .set(newData)
      .where(eq(products.id, parseInt(productId)));
    
    // Track revision
    const revision = await revisionSystem.trackRevision(
      'product',
      productId,
      'update',
      oldData,
      newData,
      {
        userId: req.user?.id,
        username: req.user?.username,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      }
    );
    
    // Broadcast to clients
    if (oldData.price !== newData.price) {
      wsNetworkServer.broadcastPriceUpdate({
        productId: parseInt(productId),
        storeId: newData.storeId,
        oldPrice: oldData.price,
        newPrice: newData.price,
        priceChange: newData.price - oldData.price,
        percentChange: ((newData.price - oldData.price) / oldData.price) * 100,
        timestamp: Date.now()
      });
    }
    
    res.json({
      success: true,
      revision: {
        id: revision.id,
        version: revision.version,
        changesSummary: revision.changesSummary
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

Then in React:
```tsx
// client/components/EditProduct.tsx
import { useNetworkSync } from '@/services/networkSync';
import { NetworkStatus } from '@/components/NetworkStatus';
import { RevisionHistory } from '@/components/RevisionHistory';

export function EditProduct({ productId }) {
  const { updateEntity } = useNetworkSync(`product_${productId}`);
  
  const handleSave = async (formData) => {
    const response = await fetch(`/api/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(formData)
    });
    
    if (response.ok) {
      // Notify other clients
      updateEntity(`product_${productId}`, formData);
      
      // Show success
      toast.success('Product updated');
    }
  };
  
  return (
    <div className="space-y-6">
      <NetworkStatus entity={`product_${productId}`} />
      
      {/* Form here */}
      <button onClick={() => handleSave(formData)}>Save</button>
      
      <RevisionHistory 
        entityType="product" 
        entityId={productId}
        onRestore={(version) => {
          // Refresh with old version
          location.reload();
        }}
      />
    </div>
  );
}
```

---

## 🚀 Deploy to Production

1. **Enable WSS (WebSocket Secure)**
   ```typescript
   // In server initialization
   const wsServer = new WebSocketNetworkServer(httpServer, {
     cert: fs.readFileSync('/path/to/cert.pem'),
     key: fs.readFileSync('/path/to/key.pem')
   });
   ```

2. **Set up monitoring**
   ```bash
   # Monitor connections and queue size
   curl -s http://localhost:3000/api/sync/network/stats | watch -n5
   ```

3. **Schedule cleanup**
   ```bash
   # crontab: Daily cleanup of old revisions
   0 2 * * * curl -X POST http://localhost:3000/api/sync/cleanup -d '{"keepVersions":100}'
   ```

4. **Backup revisions**
   ```bash
   # Daily export
   0 3 * * * curl http://localhost:3000/api/sync/export/product?format=json > /backups/revisions-$(date +%Y%m%d).json
   ```

---

**Status:** ✅ Ready to Use

Need help? Check `NETWORK_REVISION_GUIDE.md` for complete documentation.
