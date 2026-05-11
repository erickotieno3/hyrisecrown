# Unlimited Revision & Splash Screen - Quick Start

Get the Revision Management Dashboard and Splash Screen running in 5 minutes.

## 🚀 Install Dependencies

```bash
npm install framer-motion recharts
```

## 🎬 Add Splash Screen

### Step 1: Update your main app entry

In `client/src/main.tsx` or `App.tsx`:

```tsx
import { SplashScreen, useSplashScreen } from '@/components/SplashScreen';

export default function App() {
  const { isVisible, progress, status, handleSplashComplete } = useSplashScreen();

  // Your app initialization logic
  useEffect(() => {
    initializeApp().then(handleSplashComplete);
  }, []);

  return (
    <>
      <SplashScreen
        isVisible={isVisible}
        loadingProgress={progress}
        statusMessage={status}
        appName="Global Price Tracker"
        appVersion="1.0.0"
      />
      {!isVisible && <Dashboard />}
    </>
  );
}
```

**That's it!** The splash screen will:
- Auto-progress from 0 to 100%
- Show status messages
- Automatically hide when done

## 📊 Add Revision Dashboard

### Step 1: Create the page

File: `client/src/pages/RevisionsPage.tsx`

```tsx
import { RevisionManagementDashboard } from '@/components/RevisionManagementDashboard';

export default function RevisionsPage() {
  return (
    <div className="container py-8">
      <RevisionManagementDashboard />
    </div>
  );
}
```

### Step 2: Add route

In your router configuration:

```tsx
{
  path: '/admin/revisions',
  element: <RevisionsPage />,
  requiresAdmin: true
}
```

### Step 3: Add navigation link

```tsx
<Link to="/admin/revisions">📊 Revisions</Link>
```

**That's it!** The dashboard provides:
- 📈 Charts and statistics
- 🔍 Search and filter
- 💾 Export to JSON/CSV
- 🧹 Cleanup management
- 👥 Top editors ranking

## 💡 Usage Examples

### Custom Splash Progress

```tsx
const [progress, setProgress] = useState(0);

// 10% after 1 second
setTimeout(() => setProgress(10), 1000);
// 50% after 2 seconds
setTimeout(() => setProgress(50), 2000);
// 100% after 3 seconds
setTimeout(() => setProgress(100), 3000);

return (
  <SplashScreen
    isVisible={progress < 100}
    loadingProgress={progress}
    statusMessage={progress < 50 ? 'Loading...' : 'Almost done...'}
  />
);
```

### Filter Dashboard by Entity

```tsx
// In RevisionsPage
const [entityType, setEntityType] = useState('product');

return (
  <div>
    <select onChange={(e) => setEntityType(e.target.value)}>
      <option value="product">Products</option>
      <option value="price">Prices</option>
      <option value="store">Stores</option>
    </select>
    
    <RevisionManagementDashboard />
  </div>
);
```

### Export Revisions

```tsx
// From dashboard, click "Export JSON" or "Export CSV" button
// Or programmatically:

const handleExport = async () => {
  window.open('/api/sync/export/product?format=json', '_blank');
};
```

## 🎨 Customize Splash Screen

### Change Colors

```tsx
// Default: blue to purple gradient
// In SplashScreen.tsx, change:
// from-blue-600 via-blue-700 to-purple-800

// Options:
// Green: from-green-600 via-green-700 to-teal-800
// Red: from-red-600 via-red-700 to-pink-800
// Indigo: from-indigo-600 via-indigo-700 to-purple-800
```

### Change Logo

```tsx
// Replace the SVG icon in SplashScreen.tsx
<svg className="w-14 h-14 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
  {/* Your SVG path here */}
</svg>
```

### Adjust Animation Speed

```tsx
// Make animations faster
transition={{ duration: 1, repeat: Infinity }}  // Was 2

// Make animations slower
transition={{ duration: 3, repeat: Infinity }}  // Was 2
```

## ✅ Verification Script

Check if everything is installed:

```bash
bash verify-network.sh
```

Should see all checks passing including:
- ✓ RevisionManagementDashboard
- ✓ SplashScreen
- ✓ framer-motion (if installed)
- ✓ recharts (if installed)

## 📊 Dashboard Features at a Glance

| Feature | Description |
|---------|-------------|
| **Overview Cards** | Total revisions, top editor, date range |
| **Bar Chart** | Revisions by entity type |
| **Pie Chart** | Create/Update/Delete distribution |
| **Search** | Filter by entity type or user |
| **Export** | Download JSON or CSV |
| **Top Editors** | Leaderboard of who changed what |
| **Recent List** | Last 50 revisions |
| **Cleanup** | Remove old revisions safely |
| **Best Practices** | Tips for revision management |

## 🎬 Splash Screen Features at a Glance

| Feature | Description |
|---------|-------------|
| **Progress Bar** | Smooth 0-100% animation |
| **Status Text** | Custom status messages |
| **Logo** | Bouncing app icon |
| **Loading Dots** | Animated progress indicator |
| **Auto-Hide** | Automatically hides at 100% |
| **Customizable** | Name, version, colors |
| **Performance** | Minimal CPU usage |
| **Hook Support** | Built-in `useSplashScreen()` |

## 🔥 Try It Now

```bash
# See splash screen when app loads
npm run dev

# Navigate to revisions dashboard
# http://localhost:3000/admin/revisions
```

## 📚 Full Documentation

For complete details, see: `REVISION_SPLASH_GUIDE.md`

---

**Status:** ✅ Ready to Use
**Dependencies:** framer-motion, recharts
**Files:** 4 components + 1 page
