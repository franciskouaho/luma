# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Luma is a React Native mobile app for TikTok content creators. It helps users analyze their TikTok profile, generate content ideas using AI, create video scripts, and organize their content library. The app is built with Expo and uses Firebase for backend services.

**Target Platform:** iOS and Android (React Native with Expo)
**Language:** TypeScript
**Package Manager:** Bun (though npm/yarn also work)

## Tech Stack Architecture

### Frontend (Mobile App)
- **Framework:** React Native with Expo (~54.0)
- **Router:** Expo Router (file-based routing in `app/` directory)
- **State Management:** Zustand for global state (see `src/store/ideasStore.ts`)
- **Authentication:** React Native Firebase with Google Sign-In and Apple Sign-In
- **Styling:** React Native StyleSheet with a centralized theme system

### Backend (Firebase)
- **Authentication:** Firebase Auth (Google OAuth & Apple Sign-In)
- **Database:** Cloud Firestore with security rules
- **Cloud Functions:** Node.js 18 with TypeScript (in `functions/` directory)
- **AI Integration:** Mock Llama AI implementation (ready for production API integration)

### Design System
Located in `src/theme/colors.ts`:
- **Primary Colors:** Rose Vif (#FC2652), Noir Profond (#1E1E1E), Orange (#FF9800)
- **Gradient:** Turquoise → Blue → Magenta (135deg, #00ACC1, #5E7CE2, #D946A6)
- **Typography:** Inter font family
- **Border Radius:** Buttons use 24px, Cards use 12px
- All UI should follow this established design system

## Development Commands

### Mobile App

```bash
# Install dependencies
bun install

# Start development server (requires development build, NOT Expo Go)
npx expo start --dev-client

# Build and run on iOS (requires macOS)
npx expo run:ios
bun ios

# Build and run on Android
npx expo run:android
bun android

# Lint the code
bun lint
npx expo lint
```

### Firebase Cloud Functions

```bash
# Navigate to functions directory
cd functions

# Install dependencies
bun install  # or npm install

# Build TypeScript
bun run build

# Deploy to Firebase
bun run deploy
firebase deploy --only functions

# Run local emulator
bun run serve
firebase emulators:start --only functions

# View function logs
bun run logs
firebase functions:log
```

### Firebase Emulators

```bash
# Start all emulators (from project root)
firebase emulators:start

# Emulator ports (configured in firebase.json):
# - Auth: 9099
# - Functions: 5001
# - Firestore: 8080
# - Hosting: 5000
# - UI: 4000
```

## Key Architectural Patterns

### File-Based Routing (Expo Router)

The app uses Expo Router with file-based routing in the `app/` directory:

- `app/index.tsx` - Auth check and redirect (splash screen)
- `app/_layout.tsx` - Root stack navigator
- `app/auth/login.tsx` - Login screen with Google/Apple auth
- `app/(tabs)/` - Tab-based navigation for authenticated users
  - `index.tsx` - Home/Dashboard
  - `generate.tsx` - Generate content ideas
  - `ideas.tsx` - Saved ideas list
  - `profile.tsx` - User profile
- `app/analytics.tsx` - Profile analytics (modal/screen)

Routes are typed and accessed via `expo-router` hooks like `useRouter()`.

### Firebase Integration

**IMPORTANT:** This project uses **React Native Firebase** (v23), NOT the Firebase Web SDK.

Import Firebase services like this:
```typescript
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import functions from '@react-native-firebase/functions';
```

**DO NOT** use Web SDK imports like:
```typescript
// ❌ WRONG - Don't use these
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
```

Firebase is initialized automatically from `google-services.json` (Android) and `GoogleService-Info.plist` (iOS). See `src/lib/firebase.ts` for exported instances.

### State Management with Zustand

The app uses Zustand for state management (see `src/store/ideasStore.ts`):
- Store handles Firestore CRUD operations for ideas
- Includes loading and error states
- Actions: `fetchIdeas`, `addIdea`, `toggleFavorite`, `deleteIdea`, `clearIdeas`

Pattern:
```typescript
const { ideas, loading, fetchIdeas } = useIdeasStore();
```

### Cloud Functions Architecture

Located in `functions/src/`:
- `index.ts` - Main entry point, exports callable functions
- `llama.ts` - AI integration (currently mocked, ready for production API)

Both functions require authentication and use `functions.https.onCall()` pattern:
1. `generateIdeas` - Takes niche, targetAudience, contentType, tone → returns TikTok ideas
2. `analyzeProfile` - Takes username → returns profile insights (mocked data)

### Authentication Flow

1. User lands on `app/index.tsx` which checks auth state
2. If not authenticated → redirect to `app/auth/login.tsx`
3. Login screen offers Google Sign-In and Apple Sign-In (iOS only)
4. Google Sign-In configured with Web Client ID: `939156653935-3o5g8lt8mjl2sa1nb6lk1sqm6tjrhv8m.apps.googleusercontent.com`
5. After successful auth → redirect to `app/(tabs)` (main app)
6. Auth state managed by Firebase Auth with `onAuthStateChanged` listener

### Firestore Security Rules

Located in `firestore.rules`:
- Users can only read/write their own ideas (`userId` field must match `auth.uid`)
- All operations require authentication
- Helper functions: `isAuthenticated()`, `isOwner(userId)`
- Ideas collection uses strict ownership validation

### TypeScript Types

All types defined in `src/types/tiktok.ts`:
- `User` - User profile data
- `TikTokIdea` - Generated content idea structure
- `TikTokProfile` - TikTok profile metadata
- `AnalyticsInsight` - Profile analysis results
- `GenerateIdeaRequest` / `GenerateIdeaResponse` - Cloud Function types

## Common Development Patterns

### Adding a New Screen

1. Create file in `app/` directory (e.g., `app/new-screen.tsx`)
2. If it needs auth, add route check in `app/_layout.tsx`
3. Use theme colors from `src/theme/colors.ts`
4. Follow existing StyleSheet patterns for consistency
5. Use Expo Router's `useRouter()` for navigation

### Calling Cloud Functions

```typescript
import { generateIdeas } from '../src/lib/functions';

const result = await generateIdeas({
  niche: 'fitness',
  targetAudience: 'young adults',
  contentType: 'tutorial',
  tone: 'motivational'
});
```

### Working with Firestore via Zustand

```typescript
const { ideas, loading, addIdea, fetchIdeas } = useIdeasStore();

// Fetch user's ideas
useEffect(() => {
  if (user) {
    fetchIdeas(user.uid);
  }
}, [user]);

// Add new idea
await addIdea({
  userId: user.uid,
  title: 'My Idea',
  description: '...',
  // ... other fields
});
```

## Important Notes

### Expo Development Builds Required

**React Native Firebase requires native modules.** You CANNOT use Expo Go.

Must create development builds:
```bash
npx expo run:ios    # For iOS
npx expo run:android # For Android

# Or use EAS Build
npx eas build --profile development --platform ios
```

### AI Integration Status

The Llama AI integration in `functions/src/llama.ts` is currently **mocked** with sample data.

To integrate real AI:
1. Sign up for Together AI, Replicate, or similar service
2. Get API key and set as environment variable in Firebase Functions config
3. Update `generateIdeasWithLlama()` to call real API
4. Use `buildPrompt()` function to structure prompts
5. Parse API response into `TikTokIdea[]` format

### Firebase Configuration

Firebase config files are **gitignored** but required:
- `google-services.json` (Android)
- `GoogleService-Info.plist` (iOS)
- `.env.local` (environment variables)

These are referenced in `app.json` under `ios.googleServicesFile` and `android.googleServicesFile`.

### Design Language

UI is in **French** for French-speaking TikTok creators. All user-facing text should be in French. Code comments and documentation can be in English or French.

## Testing Approach

Currently no test setup. When adding tests:
- Use Jest for unit tests
- Use React Native Testing Library for component tests
- Test Cloud Functions with `firebase-functions-test`
- Consider E2E tests with Detox or Maestro

## Deployment

### Mobile App
- Use EAS Build for app store builds
- Configure `eas.json` for build profiles
- Update version in `app.json`

### Firebase Functions
```bash
cd functions
bun run deploy
```

### Firestore Rules & Indexes
```bash
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```
