# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Monorepo Overview

This is a **monorepo** containing three related projects for TikTok content creators and video processing:

1. **luma/** - React Native mobile app (iOS/Android) for TikTok content idea generation and analytics
2. **luma-poste/** - Next.js web app for TikTok cross-posting, scheduling, and workspace management
3. **watermark/** - Python FastAPI service for AI-powered video watermark removal

**Shared Infrastructure**: All three projects share a single Firebase backend (Firestore, Auth, Storage, Functions) in the `europe-west1` region.

## Quick Start by Project

### Mobile App (luma/)
```bash
cd luma
bun install
npx expo start --dev-client
npx expo run:ios    # macOS only
npx expo run:android
```

### Web App (luma-poste/)
```bash
cd luma-poste
yarn install
yarn dev            # Dev server on localhost:3000
yarn test           # Run Jest tests
yarn build          # Production build
```

### Watermark Service (watermark/)
```bash
cd watermark
uv sync
source .venv/bin/activate
uv run python start_server.py --host 0.0.0.0 --port 8000
```

## Project-Specific Documentation

Each subdirectory contains its own detailed CLAUDE.md:

- **luma/CLAUDE.md** - Mobile app architecture, Expo Router, React Native Firebase patterns, Zustand state management
- **luma-poste/CLAUDE.md** - Next.js App Router, Firebase dual-client pattern, TikTok OAuth, workspace system, scheduling architecture
- **watermark/README.md** - FastAPI service setup, Docker deployment, GPU acceleration, CLI usage

**When working in a specific project, refer to its local documentation for detailed guidance.**

## Shared Firebase Architecture

All projects use the same Firebase project with consistent patterns:

### Firebase Services
- **Auth**: Google Sign-In and Apple Sign-In (mobile), web-based OAuth (web app)
- **Firestore**: Shared database with collections for users, ideas (mobile), videos, schedules, accounts, workspaces (web)
- **Storage**: Cloud Storage for video uploads and thumbnails
- **Functions**: Separate function directories for each project (luma/functions/, luma-poste/functions/)

### Firebase Project Structure
```
Firebase Project (europe-west1)
├── Authentication (shared)
├── Firestore (shared)
│   ├── users/
│   ├── ideas/          # Mobile app only
│   ├── videos/         # Web app only
│   ├── schedules/      # Web app only
│   ├── accounts/       # Web app only
│   └── workspaces/     # Web app only
├── Storage (shared)
│   ├── videos/
│   └── thumbnails/
└── Functions
    ├── luma/ (mobile)
    └── luma-poste/ (web)
```

### Firestore Security Rules
Located in both `luma/firestore.rules` and `luma-poste/firestore.rules`:
- All operations require authentication
- Row-level security: users can only access their own data (via `userId` match)
- Workspace-scoped resources use `workspaceId` for access control
- Helper functions enforce ownership validation

### Firebase Configuration Files

**IMPORTANT**: Firebase config files are gitignored but required for development:

Mobile app (luma/):
- `google-services.json` (Android)
- `GoogleService-Info.plist` (iOS)
- `.env.local` (environment variables)

Web app (luma-poste/):
- `.env.local` with Firebase Admin SDK credentials (FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL)
- Client SDK config (NEXT_PUBLIC_FIREBASE_* variables)

## Deployment Commands

### Mobile App Deployment
```bash
cd luma

# Deploy Cloud Functions
cd functions
bun run deploy

# Deploy Firestore rules
firebase deploy --only firestore:rules,firestore:indexes

# Build mobile app (requires EAS CLI)
npx eas build --profile production --platform ios
npx eas build --profile production --platform android
```

### Web App Deployment
```bash
cd luma-poste

# Deploy Cloud Functions
firebase deploy --only functions

# Deploy Firestore rules
firebase deploy --only firestore:rules

# Build and deploy Next.js (Railway, Vercel, etc.)
yarn build
yarn start
```

### Watermark Service Deployment
```bash
cd watermark

# Docker build
docker build -t sorawatermarkcleaner .

# Docker run
docker run --rm -p 8000:8000 \
  -v "$(pwd)/outputs:/app/outputs" \
  -v "$(pwd)/resources:/app/resources" \
  sorawatermarkcleaner
```

## Cross-Project Integration Points

### Mobile ↔ Web Integration
- **Shared Firebase Auth**: Users can sign in on mobile and web with same credentials
- **Deep Linking**: Mobile app can link to web app for advanced features (e.g., workspace management, scheduling)
- **Data Isolation**: Mobile app uses `ideas` collection, web app uses separate collections (videos, schedules)

### Web ↔ Watermark Service Integration
- Web app (`luma-poste`) calls watermark service API for video processing
- Integration point: `luma-poste/src/app/dashboard/ai-tools/page.tsx`
- Endpoints: `/submit_remove_task`, `/get_results`, `/download/{id}`
- Configure via `NEXT_PUBLIC_WATERMARK_API_URL` in `luma-poste/.env.local`

### TikTok API Integration
Both mobile and web apps integrate with TikTok but differently:
- **Mobile (luma)**: Generates content ideas, analyzes profiles (mocked, ready for API integration)
- **Web (luma-poste)**: Full OAuth flow, posts videos to TikTok Business API, handles webhooks

## Technology Stack Summary

### Mobile App (luma/)
- **Frontend**: React Native 0.81, Expo 54, Expo Router
- **State**: Zustand
- **Auth**: React Native Firebase v23 (NOT Web SDK)
- **Package Manager**: Bun
- **Language**: TypeScript, UI in French

### Web App (luma-poste/)
- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS 4
- **UI**: Radix UI + shadcn/ui patterns
- **Backend**: Firebase Admin SDK (server-side), Firebase Client SDK (client-side)
- **Package Manager**: Yarn 4.3.1 (required)
- **Node Version**: 18-20
- **Language**: TypeScript, UI in French
- **Testing**: Jest + React Testing Library

### Watermark Service (watermark/)
- **Framework**: FastAPI + Uvicorn
- **ML/AI**: PyTorch, Ultralytics YOLO, Diffusers, Transformers
- **Video Processing**: OpenCV, FFmpeg
- **Package Manager**: uv
- **Python Version**: 3.12+
- **Language**: Python, documentation in French

## Common Development Patterns

### Working Across Projects

When making changes that affect multiple projects:

1. **Firebase Rules Changes**: Update rules in both `luma/firestore.rules` and `luma-poste/firestore.rules`, then deploy from appropriate directory
2. **Shared Data Models**: Keep TypeScript types in sync if using shared Firestore collections
3. **Environment Variables**: Each project has its own `.env.local` - update all relevant files
4. **API Changes**: If changing TikTok API integration, consider impact on both mobile and web apps

### Git Workflow

This is a single Git repository with three independent projects:

```bash
# Work on mobile app
cd luma
git add .
git commit -m "fix(mobile): login flow"

# Work on web app
cd ../luma-poste
git add .
git commit -m "feat(web): workspace permissions"

# Commit from root affects all
cd ..
git add .
git commit -m "chore: update firebase rules across projects"
```

### Firebase Emulators (Development)

Run emulators from either project directory:

```bash
cd luma  # or cd luma-poste
firebase emulators:start

# Emulator UI: http://localhost:4000
# Auth: localhost:9099
# Firestore: localhost:8080
# Functions: localhost:5001
```

Configure apps to use emulators in development mode.

## Important Notes

### Package Managers
- **luma/**: Uses Bun (but npm/yarn also work)
- **luma-poste/**: REQUIRES Yarn 4.3.1 (yarn workspaces for functions/)
- **watermark/**: Uses uv (Python package manager)

Never mix package managers within a single project.

### Language & Localization
All user-facing UI is in **French** (for French-speaking TikTok creators). Code, comments, and internal documentation can be English or French.

### Firebase SDK Differences

**Mobile app (luma/)** uses React Native Firebase:
```typescript
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
```

**Web app (luma-poste/)** uses dual Firebase clients:
- Client-side: `import { db, auth } from '@/lib/firebaseClient'` (Firebase JS SDK)
- Server-side: `import { adminDb, adminAuth } from '@/lib/firebase'` (Firebase Admin SDK)

NEVER mix these imports.

### Development Build Requirements

The mobile app (luma/) uses React Native Firebase which requires native modules:
- **CANNOT use Expo Go**
- Must create development builds with `npx expo run:ios` or `npx expo run:android`
- Or use EAS Build for cloud builds

### CORS Configuration

The watermark service needs CORS configured for web app access:
```bash
export SORA_ALLOWED_ORIGINS=http://localhost:3000,https://production-domain.com
```

## Testing Strategy

- **Mobile (luma/)**: No test setup currently. Recommend Jest + React Native Testing Library
- **Web (luma-poste/)**: Jest + RTL configured, 70% coverage threshold, run with `yarn test`
- **Watermark (watermark/)**: No test setup currently. Recommend pytest for Python

## Troubleshooting

### "Firebase not initialized" errors
- Check that config files exist (google-services.json, GoogleService-Info.plist, .env.local)
- Verify environment variables are loaded
- For web app, ensure using correct SDK (Admin vs Client)

### Build failures in mobile app
- Clean build: `npx expo start -c`
- Rebuild iOS: `cd ios && pod install && cd ..`
- Check that React Native Firebase is correctly installed

### Package installation issues
- Mobile: Clear cache with `bun install --force`
- Web: Use Yarn 4.3.1, run `yarn install` from root
- Python: Ensure uv is installed, run `uv sync`

### Firebase Functions deployment errors
- Check Node version matches package.json engines
- Verify Firebase CLI is logged in: `firebase login`
- Check region is set to `europe-west1`
