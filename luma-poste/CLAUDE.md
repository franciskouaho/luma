# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LumaPost is a TikTok cross-posting and scheduling platform that allows users to upload videos, schedule posts to TikTok Business accounts, and manage content across multiple workspaces. The application handles OAuth authentication with TikTok, encrypted token storage, and automated publishing via Firebase Cloud Functions.

## Tech Stack

- **Frontend**: Next.js 15 (App Router) + TypeScript + Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui patterns
- **Backend**: Firebase (Auth, Firestore, Storage, Cloud Functions Gen2)
- **Scheduling**: Cloud Scheduler (cron job checks every minute for scheduled posts)
- **Package Manager**: Yarn 4.3.1 (required)
- **Node Version**: 18-20 (specified in package.json engines)

## Development Commands

```bash
# Development
yarn dev              # Start dev server with Turbopack

# Build & Deploy
yarn build            # Build for production
yarn start            # Start production server (uses $PORT env var)

# Linting & Testing
yarn lint             # Run ESLint
yarn test             # Run Jest tests
yarn test:watch       # Run tests in watch mode
yarn test:coverage    # Generate coverage report
yarn test:ci          # Run tests in CI mode
```

Run single test file:
```bash
yarn test path/to/test.test.ts
```

## Architecture

### Firebase Dual-Client Pattern

The codebase uses **two separate Firebase clients** - this is critical to understand:

1. **Client-Side** (`src/lib/firebaseClient.ts`):
   - Uses Firebase Client SDK (`firebase/app`, `firebase/firestore`, `firebase/auth`)
   - For frontend components and hooks
   - Imports: `import { db, auth, storage } from '@/lib/firebaseClient'`

2. **Server-Side** (`src/lib/firebase.ts`):
   - Uses Firebase Admin SDK (`firebase-admin`)
   - For API routes and server components
   - Imports: `import { adminDb, adminAuth, adminStorage } from '@/lib/firebase'`
   - Requires service account credentials (FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL)

**Never mix these two imports.** Client SDK cannot be used in API routes, Admin SDK cannot be used in client components.

### Firestore Data Model

Core entities in Firestore (see `src/lib/firestore.ts`):

- **Video**: Uploaded video metadata (`videos` collection)
  - Fields: `userId`, `workspaceId`, `title`, `storageKey`, `thumbnailKey`, `duration`, `size`, `status`
  - Status values: `uploaded`, `processing`, `ready`, `error`, `failed`

- **Schedule**: Scheduled post configuration (`schedules` collection)
  - Fields: `userId`, `workspaceId`, `videoId`, `accountId`, `caption`, `scheduledAt`, `status`, `publishId`, `tiktokUrl`
  - Status values: `scheduled`, `queued`, `published`, `failed`, `draft`
  - Contains engagement metrics: `views`, `likes`, `comments`, `shares`

- **TikTokAccount**: Connected TikTok Business accounts (`accounts` collection)
  - Fields: `userId`, `workspaceId`, `tiktokUserId`, `username`, `displayName`, `avatarUrl`
  - Encrypted tokens: `accessTokenEnc`, `refreshTokenEnc` (AES-256-GCM encrypted)
  - OAuth info: `expiresAt`, `scopes`, `isActive`

- **Workspace**: Multi-user workspace/team (`workspaces` collection)
  - Fields: `name`, `description`, `ownerId`, `settings`
  - Settings: `allowMemberInvites`, `requireApprovalForPosts`, `allowMemberAccountConnections`

- **WorkspaceMember**: Team member in a workspace (`workspaceMembers` collection)
  - Fields: `workspaceId`, `userId`, `email`, `displayName`, `role`, `status`
  - Roles: `owner`, `admin`, `editor`, `viewer`
  - Status: `active`, `pending`, `suspended`

### Custom Hooks Pattern

All data fetching uses custom hooks in `src/hooks/`:
- `use-auth.ts` - Firebase Auth state management
- `use-videos.ts` - Video CRUD operations
- `use-schedules.ts` - Schedule management
- `use-connected-accounts.ts` / `use-tiktok-accounts.ts` - TikTok account linking
- `use-workspaces.ts` - Workspace management
- `use-workspace-stats.ts` - Analytics and stats per workspace
- `use-workspace-permissions.ts` - Role-based access control

These hooks provide React-like patterns with loading/error states and handle API calls to Next.js routes.

### API Routes Structure

Main endpoints:

**Videos**:
- `POST /api/videos` - Create video metadata after upload
- `GET /api/videos?userId={uid}` - List user videos
- `PUT /api/videos/{id}` - Update video
- `DELETE /api/videos/{id}` - Delete video

**Schedules**:
- `POST /api/schedules` - Create scheduled post
- `GET /api/schedules?userId={uid}` - List schedules
- `PUT /api/schedules/{id}` - Update schedule
- `DELETE /api/schedules/{id}` - Delete schedule

**Publishing**:
- `POST /api/publish/now` - Publish immediately to TikTok
- `POST /api/cloud-tasks` - Schedule Cloud Task for delayed publishing

**TikTok OAuth**:
- `GET /api/auth/tiktok/authorize` - Initiate OAuth flow
- `GET /api/auth/tiktok/callback` - Handle OAuth callback
- `GET /api/tiktok/creator-info` - Get TikTok creator info and posting limits
- `POST /api/webhooks/tiktok` - Handle TikTok webhooks (status updates)

**Storage**:
- `POST /api/upload/sign` - Generate signed URL for Cloud Storage upload

**Workspaces**:
- `GET /api/workspaces` - List user workspaces
- `POST /api/workspaces` - Create workspace
- `GET /api/workspaces/{id}/members` - List workspace members
- `POST /api/workspaces/{id}/members` - Add member
- `DELETE /api/workspaces/{id}/members/{memberId}` - Remove member
- `GET /api/workspaces/{id}/stats` - Get workspace analytics

All API routes:
1. Use **server-side Firebase** (`src/lib/firebase.ts`)
2. Authenticate via Firebase Auth (check `request.auth` or verify ID token)
3. Return JSON responses
4. Follow pattern in `src/lib/firestore.ts` for database operations

### Publishing Flow

1. **User uploads video** → Frontend calls `/api/upload/sign` → Gets signed URL → Uploads to Cloud Storage
2. **Create video record** → Frontend calls `POST /api/videos` with metadata
3. **Schedule post** → Frontend calls `POST /api/schedules` with `scheduledAt` timestamp
4. **Cloud Scheduler** → Firebase Function `checkScheduledPosts` runs every minute (cron: `every 1 minutes`)
5. **Function checks** → Queries schedules where `scheduledAt <= now` and `status == 'scheduled'`
6. **Publish** → Function calls `/api/publish/now` → Calls TikTok API → Updates schedule status to `queued` or `published`
7. **Webhooks** → TikTok sends status updates to `/api/webhooks/tiktok` → Updates final status and engagement metrics

### Security & Encryption

- **Token Encryption**: TikTok OAuth tokens encrypted with AES-256-GCM before storing in Firestore
  - Encryption key stored in `ENCRYPTION_KEY` environment variable
  - Encryption service: `src/lib/encryption.ts`

- **Firestore Rules**: Row-level security based on `userId` and `workspaceId`
  - Rules defined in `firestore.rules`

- **Storage Rules**: Cloud Storage access controlled by signed URLs
  - Rules defined in `storage.rules`

- **OAuth Flow**: State parameter includes userId to prevent CSRF

### Workspace System

The app supports multi-user workspaces with role-based permissions:

- **Context**: `src/contexts/workspace-context.tsx` manages selected workspace
- **Permission Guard**: `src/components/workspace/permission-guard.tsx` restricts actions by role
- **Storage**: Selected workspace ID stored in localStorage
- **Filtering**: All queries filtered by `workspaceId` when a workspace is selected

## Path Aliases

TypeScript paths configured in `tsconfig.json`:
```typescript
"@/*" → "./src/*"
```

Note: Components, hooks, and lib are all under `src/`.

## Testing

- **Framework**: Jest + React Testing Library
- **Config**: `jest.config.js` with Next.js integration
- **Setup**: `jest.setup.js`
- **Coverage**: 70% threshold for branches/functions/lines/statements
- **Path aliases**: Mapped in moduleNameMapper to match tsconfig

Test files are colocated with source in `__tests__/` directories:
- `src/app/api/__tests__/videos.test.ts`
- `src/hooks/__tests__/use-videos.test.ts`
- `src/components/__tests__/ui/button.test.tsx`

## Environment Variables

Required for development (`.env.local` or `.env`):

```bash
# Firebase Client (NEXT_PUBLIC_* for browser access)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin (server-side only)
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=         # Service account private key (JSON escaped)
FIREBASE_CLIENT_EMAIL=        # Service account email

# App URL (for Cloud Tasks callbacks)
NEXT_PUBLIC_APP_URL=          # Frontend URL
APP_URL=                      # Backend/Functions URL (may be same)

# TikTok OAuth & API
TIKTOK_CLIENT_KEY=            # TikTok Business app client key
TIKTOK_CLIENT_SECRET=         # TikTok Business app secret
TIKTOK_REDIRECT_URI=          # OAuth callback URL

# Encryption
ENCRYPTION_KEY=               # AES-256 encryption key (32 bytes, base64)

# Storage
STORAGE_BUCKET=               # Cloud Storage bucket name
```

## Firebase Functions

Cloud Functions are in `functions/` directory (yarn workspace):

**Available Functions** (`functions/index.js`):
- `healthCheck` (HTTP) - Health check endpoint
- `publishVideoNow` (Callable) - Publish video immediately
- `checkScheduledPosts` (Scheduled) - Runs every minute to check for scheduled posts
- `schedulePublishTask` (Callable) - Schedule a publish task
- `processSchedule` (Callable) - Process a schedule manually

All functions run in `europe-west1` region.

Deploy functions:
```bash
firebase deploy --only functions
```

Deploy specific function:
```bash
firebase deploy --only functions:checkScheduledPosts
```

## TikTok Integration

The app integrates with TikTok Business API (`src/lib/tiktok-api.ts`):

**Key features**:
- OAuth 2.0 authentication flow
- Token refresh automation
- Content publishing API (upload + publish two-step flow)
- Creator info API (posting limits, privacy settings)
- Post settings: privacy level, comments, duet, stitch, commercial content

**Important TikTok API notes**:
- Uses two-step publish: 1) Upload video bytes 2) Publish with metadata
- Requires TikTok Business account (not regular TikTok)
- Rate limits apply - implement exponential backoff
- Webhooks available for post status updates

## Key Architectural Decisions

1. **Yarn Workspaces**: The `functions/` directory is a separate workspace for Firebase Functions

2. **Scheduled Publishing**: Uses Cloud Scheduler (cron every 1 minute) instead of Cloud Tasks for simplicity
   - Function queries Firestore for due schedules
   - Updates status to prevent duplicate processing
   - Calls `/api/publish/now` endpoint to trigger TikTok publish

3. **Direct Upload to Storage**: Videos uploaded directly from browser to Cloud Storage via signed URLs
   - Reduces server load and bandwidth costs
   - Metadata stored in Firestore after upload

4. **Token Encryption**: All TikTok OAuth tokens encrypted at rest using AES-256-GCM
   - Prevents token leakage if Firestore is compromised
   - Tokens decrypted only when needed for API calls

5. **Multi-tenancy via Workspaces**: Users can create/join workspaces for team collaboration
   - Role-based access control (owner/admin/editor/viewer)
   - Resources (videos, schedules, accounts) scoped to workspace
   - Personal workspace created automatically for each user

## Common Patterns

### Creating a new API route with Firebase:
```typescript
import { adminAuth, adminDb } from '@/lib/firebase';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // 1. Verify auth (various methods shown)
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    if (!token) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // 2. Parse request
    const body = await req.json();

    // 3. Use Firestore
    const docRef = await adminDb.collection('videos').add({
      userId,
      ...body,
      createdAt: FieldValue.serverTimestamp(),
    });

    // 4. Return JSON
    return Response.json({ id: docRef.id, ...body });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

### Creating a new custom hook:
```typescript
'use client';
import { useState, useEffect } from 'react';

export function useMyData(userId: string | null) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/my-endpoint?userId=${userId}`);
      if (!response.ok) throw new Error('Fetch failed');

      const result = await response.json();
      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userId]);

  return { data, loading, error, refetch: fetchData };
}
```

## Important Notes

- **Language**: The app UI is primarily in French (button labels, error messages, etc.)
- **Region**: All Firebase services run in `europe-west1` for GDPR compliance
- **Workspace Pattern**: `functions/` is a separate yarn workspace - run `yarn install` in root to install all dependencies
- **Port**: Production server uses `$PORT` env var (for Railway/cloud deployment)
