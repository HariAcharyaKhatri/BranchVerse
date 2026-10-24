# BranchVerse

> **"Your Choices. Your World. Your Story."**

BranchVerse is a mobile-first interactive AI storytelling and visual novel platform where players create custom heroes, explore branching worlds, make high-stakes tactical choices, and experience evolving narratives with authoritative game rules.

---

## Features

- **Mobile-First Visual Novel UI**: Native mobile experience with safe-area support, dark anime aesthetic, and visual novel background and character sprite integrations.
- **Advanced Story Engine**: Three-layer architecture (authoritative game engine, AI narrative director, player action pipeline) with canonical world fact tracking, inventory integrity, multi-objective quests, delayed consequences, and multi-ending evaluations.
- **100% Offline / Guest Mode**: Complete game loop works with zero external network dependencies and deterministic local narration.
- **Google-Only Authentication**: Firebase Authentication with Google Sign-In, mobile popup/redirect support, and session persistence.
- **Client-Side Vault**: Versioned IndexedDB persistence (`branchverse_db`) with full Markdown and JSON export/import.

---

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run unit tests
npm test

# Build for production
npm run build
```

---

## Firebase Authentication Setup (Google Sign-In)

BranchVerse uses Firebase Authentication on the **free Spark plan**. No paid billing or credit card is required.

### 1. Create or Select a Firebase Project
1. Open the [Firebase Console](https://console.firebase.google.com/).
2. Create a new project (e.g. `branchverse-app`) or select an existing one.

### 2. Enable Google Sign-In
1. In the Firebase Console left menu, navigate to **Build > Authentication**.
2. Click **Get Started** (if not already enabled).
3. Under the **Sign-in method** tab, click **Google**.
4. Toggle **Enable**.
5. Set your public-facing project support email and click **Save**.

### 3. Configure Authorized Domains
1. In Firebase Console, go to **Authentication > Settings > Authorized domains**.
2. **Local Development**: Verify that `localhost` is present in the list (it is added by default).
   > **Important:** Do *not* include protocols or port numbers (e.g. use `localhost`, not `http://localhost:5173`).
3. **Production Deployment**: When you deploy to a production host (e.g. Firebase Hosting, Vercel, Netlify, Cloudflare), click **Add domain** and enter your production domain (e.g. `your-app.web.app` or `yourdomain.com`).

### 4. Create Web App & Configure Environment Variables
1. In Firebase Console, click the **Project Settings** (gear icon) > **General**.
2. Scroll down to **Your apps**, click the Web icon (`</>`), and register your web app.
3. Copy the configuration keys into a new file named `.env.local` in the project root:

```env
VITE_FIREBASE_API_KEY="AIzaSy..."
VITE_FIREBASE_AUTH_DOMAIN="your-project-id.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your-project-id"
VITE_FIREBASE_STORAGE_BUCKET="your-project-id.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="123456789012"
VITE_FIREBASE_APP_ID="1:123456789012:web:abcdef123456"
```

> **Security Note:** Variables prefixed with `VITE_` are public client identifiers bundled for browser SDKs. Never put service account private keys or server secrets in frontend environment files.

If `.env.local` is omitted or variables are blank, BranchVerse automatically operates in **Guest / Demo Mode** without errors.

---

## License & Credits

- Game art assets: See [`CREDITS.md`](./CREDITS.md) for full CC0 and CC-BY 3.0/4.0 attributions from OpenGameArt.
