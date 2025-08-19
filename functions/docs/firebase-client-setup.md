# Firebase Client SDK Setup for v1 Functions

This document provides guidance on how to properly set up the Firebase client SDK to work with the v1 callable functions implemented in the backend.

## 1. Firebase Client SDK Installation

First, make sure you have the latest Firebase client SDK installed:

```bash
npm install firebase
# or
yarn add firebase
```

For proper type support, also install the types:

```bash
npm install -D @types/firebase
# or
yarn add -D @types/firebase
```

## 2. Firebase Client Initialization

Create a Firebase client helper to initialize and export all the Firebase services:

```typescript
// src/lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { getFunctions, httpsCallable, Functions, HttpsCallable } from 'firebase/functions';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, Storage } from 'firebase/storage';
import { initializeAppCheck, ReCaptchaV3Provider, AppCheck } from 'firebase/app-check';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const functions = getFunctions(app, 'us-central1'); // Specify the region
const firestore = getFirestore(app);
const storage = getStorage(app);

// Set up AppCheck if you're using it
// const appCheck = initializeAppCheck(app, {
//   provider: new ReCaptchaV3Provider('YOUR_RECAPTCHA_SITE_KEY'),
//   isTokenAutoRefreshEnabled: true
// });

// Export the Firebase services
export { auth, functions, firestore, storage };

// Helper function to create callable functions with type safety
export function createCallable<T, R>(name: string): (data: T) => Promise<R> {
  const callable = httpsCallable<T, R>(functions, name);
  return async (data: T) => {
    const result = await callable(data);
    return result.data;
  };
}
```

## 3. Creating Type-Safe API Wrappers

Create type-safe wrappers for your Firebase callable functions:

```typescript
// src/lib/api.ts
import { createCallable } from './firebase';

// Define request and response types
interface CreateClubRequest {
  name: string;
  description?: string;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  universityIds: string[];
}

interface CreateClubResponse {
  success: boolean;
  clubId: string;
}

// Create typesafe callable functions
export const api = {
  // Club APIs
  createClub: createCallable<CreateClubRequest, CreateClubResponse>('createClub'),
  updateClub: createCallable<UpdateClubRequest, { success: boolean }>('updateClub'),
  archiveClub: createCallable<ArchiveClubRequest, { success: boolean }>('archiveClub'),
  
  // Membership APIs
  requestMembership: createCallable<RequestMembershipRequest, { success: boolean, membershipId: string }>('requestMembership'),
  approveMembership: createCallable<ApproveMembershipRequest, { success: boolean }>('approveMembership'),
  
  // Event APIs
  createEvent: createCallable<CreateEventRequest, { success: boolean, eventId: string }>('createEvent'),
  rsvpEvent: createCallable<RsvpEventRequest, { success: boolean, rsvpId: string }>('rsvpEvent'),
  
  // Order APIs
  createOrder: createCallable<CreateOrderRequest, { success: boolean, orderId: string }>('createOrder'),
  
  // Ticket APIs
  getTicket: createCallable<GetTicketRequest, GetTicketResponse>('getTicket'),
  checkInTicket: createCallable<CheckInTicketRequest, CheckInTicketResponse>('checkInTicket'),
  
  // Guard APIs
  checkEligibility: createCallable<CheckEligibilityRequest, CheckEligibilityResponse>('checkEligibility')
};
```

## 4. Using Firebase Functions in Components

Example of using a Firebase function in a React component:

```tsx
// src/components/clubs/create-club-form.tsx
import React, { useState } from 'react';
import { api } from '@/lib/api';

export function CreateClubForm() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [universityIds, setUniversityIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const result = await api.createClub({
        name,
        description,
        universityIds
      });
      
      if (result.success) {
        // Handle success (e.g., redirect or show success message)
        console.log(`Club created with ID: ${result.clubId}`);
      }
    } catch (err: any) {
      // Handle error
      setError(err.message || 'Failed to create club');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      {error && <div className="error">{error}</div>}
      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Club'}
      </button>
    </form>
  );
}
```

## 5. Handling Firebase Function Errors

Firebase functions can throw specific error codes that you can handle in your client:

```typescript
import { FirebaseError } from 'firebase/app';

try {
  await api.createClub(/* ... */);
} catch (error) {
  if (error instanceof FirebaseError) {
    // Handle specific Firebase error codes
    switch (error.code) {
      case 'functions/unauthenticated':
        // User is not authenticated
        break;
      case 'functions/permission-denied':
        // User does not have permission
        break;
      case 'functions/invalid-argument':
        // Invalid input data
        break;
      case 'functions/not-found':
        // Resource not found
        break;
      default:
        // Other errors
        break;
    }
  } else {
    // Handle non-Firebase errors
  }
}
```

## 6. Optimizing Firebase Client Performance

For better performance, consider these optimizations:

### Connection Reuse

Firebase Functions will reuse connections when possible:

```typescript
// In your firebase.ts file
import { connectFunctionsEmulator, httpsCallable } from 'firebase/functions';

// Enable persistent connections
const functions = getFunctions(app);
// If using emulator during development
if (process.env.NODE_ENV === 'development') {
  connectFunctionsEmulator(functions, 'localhost', 5001);
}
```

### Lazy Loading

For better initial load performance, lazy load Firebase modules:

```typescript
// src/lib/firebase.ts
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  // Your config
};

export const app = initializeApp(firebaseConfig);

// Lazy load other Firebase services
export const getFirebaseAuth = async () => {
  const { getAuth } = await import('firebase/auth');
  return getAuth(app);
};

export const getFirebaseFunctions = async () => {
  const { getFunctions } = await import('firebase/functions');
  return getFunctions(app, 'us-central1');
};

export const createCallable = async (name: string) => {
  const functions = await getFirebaseFunctions();
  const { httpsCallable } = await import('firebase/functions');
  return httpsCallable(functions, name);
};
```

## 7. Next.js Specific Setup

For Next.js projects, handle Firebase initialization carefully:

```typescript
// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from 'firebase/app';

const firebaseConfig = {
  // Your config
};

// Initialize Firebase only once
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Other services...
```

## 8. Environment Variables in Next.js

Set up your environment variables in `.env.local`:

```
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
```

## Conclusion

By following this setup, you'll have a type-safe, optimized Firebase client SDK that works well with the v1 callable functions implemented in the backend. The use of CORS and optimized connection handling will minimize cold starts and improve overall performance.
