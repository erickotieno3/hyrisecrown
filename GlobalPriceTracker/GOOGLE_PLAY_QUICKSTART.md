# 🚀 Google Play Deployment Checklist

## Quick Start (3 Steps to Deploy)

### ✅ Step 1: Get Your Service Account Key (5 minutes)

1. Go to https://play.google.com/console (sign in as erickotienokjv@gmail.com)
2. Click **Setup → API Access**
3. Click **"Link to a Google Cloud project"** → Create new if needed
4. Click **"Create new service account"** (follow the prompts)
5. Grant **"Release manager"** role
6. Create and download JSON key file
7. **Save this JSON key - you'll need it in the next step**

---

### ✅ Step 2: Add Key to GitHub Secrets (2 minutes)

1. Open GitHub: https://github.com/erickotieno3/GlobalPriceTracker
2. Go to **Settings → Secrets and variables → Actions**
3. Click **"New repository secret"**
4. **Name:** `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON`
5. **Value:** Paste the entire JSON file contents
6. Click **"Add secret"**
7. Also add these secrets (if not already present):
   - `EAS_USERNAME`: Your Expo account email
   - `EAS_PASSWORD`: Your Expo account password
   - (Create Expo account at https://expo.dev/signup if needed)

---

### ✅ Step 3: Trigger Deployment (2 minutes)

**Option A: Automatic (Recommended)**
- Just push any changes to the `main` branch
- Or go to **Actions → Google Play Deploy → Run workflow**
- The app will build and submit automatically!

**Option B: Manual (if you prefer)**
```bash
cd /workspaces/GlobalPriceTracker/android-app
npm install
eas build --platform android --profile production && \
eas submit --platform android --latest
```

---

## What Happens Next?

✅ **Build starts**: GitHub Actions creates your Android App Bundle  
✅ **Building**: Takes 10-15 minutes on EAS servers  
✅ **Submit**: Automatically submits to Google Play  
✅ **Pending Review**: Your app appears as "Draft" in Google Play Console  

---

## Important: Complete Your App Listing (Before Release)

Once your app appears in Google Play Console, you MUST fill in:

- ✏️ Store listing details (description, screenshots, etc.)
- 📸 App icon (512×512 PNG)
- 📱 Screenshots (2-8 images)
- 🎨 Feature graphic (1024×500 PNG)
- 📋 Content rating (complete the form)
- 🔗 Privacy policy URL
- ⚙️ Permissions review

See [GOOGLE_PLAY_DEPLOYMENT.md](GOOGLE_PLAY_DEPLOYMENT.md) for the pre-filled content.

---

## Status Check

To see your deployment status:
1. GitHub Actions: https://github.com/erickotieno3/GlobalPriceTracker/actions
2. Google Play Console: https://play.google.com/console/

---

## Need Help?

- **Build Issues?** → Check [android-app/SETUP_INSTRUCTIONS.md](android-app/SETUP_INSTRUCTIONS.md)
- **Store Listing?** → See [GOOGLE_PLAY_DEPLOYMENT.md](GOOGLE_PLAY_DEPLOYMENT.md)
- **Errors?** → Check GitHub Actions logs in the Actions tab

---

**Your app will go live on Google Play within 24-48 hours after completing the store listing!** 🎉
