# Role-Based Authorization with Firebase Custom Claims

This document explains how we've implemented role-based authorization in our application using Firebase Custom Claims.

## What are Firebase Custom Claims?

Firebase Custom Claims are key-value pairs that are stored in a user's ID token when they log in. These claims are secure and can be used to control access to various features in your application.

Benefits:
- Claims are secure and can't be modified by users
- Available immediately after login without needing to fetch additional data
- Can be used in Firebase Security Rules

## How Custom Claims Work in Our App

Our application uses custom claims to define three role types:

1. **Super Admin**: Has unrestricted access to all features
2. **Club Manager**: Can manage specific clubs they are associated with
3. **Member**: Regular user with standard permissions

### Custom Claims Structure

```json
// Super Admin
{
  "superAdmin": true
}

// Club Manager
{
  "officerOfClub": {
    "club-id-1": true,
    "club-id-2": true
  }
}

// Regular Member
// No special claims needed
```

## Setting Custom Claims

Custom claims can only be set from the Firebase Admin SDK, typically in:
- Cloud Functions
- Server-side code
- Admin tools

For example, when a user is made a club manager, a Cloud Function would update their claims:

```javascript
exports.makeClubManager = functions.https.onCall(async (data, context) => {
  // Security checks
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be logged in');
  }
  
  // Only super admins can make club managers
  const adminUid = context.auth.uid;
  const adminUser = await admin.auth().getUser(adminUid);
  if (!adminUser.customClaims?.superAdmin) {
    throw new functions.https.HttpsError('permission-denied', 'Only super admins can assign club managers');
  }
  
  // Get the current custom claims
  const { uid, clubId } = data;
  const user = await admin.auth().getUser(uid);
  const customClaims = user.customClaims || {};
  
  // Update the claims
  const officerOfClub = customClaims.officerOfClub || {};
  officerOfClub[clubId] = true;
  
  // Set the new claims
  await admin.auth().setCustomUserClaims(uid, {
    ...customClaims,
    officerOfClub,
  });
  
  return { success: true };
});
```

## Using Custom Claims in Client Code

In the client code, we access the claims through the Firebase Auth token:

```typescript
import { getAuth, getIdTokenResult } from "firebase/auth";

// Get the current user's claims
const auth = getAuth();
const user = auth.currentUser;
if (user) {
  const tokenResult = await getIdTokenResult(user);
  const claims = tokenResult.claims;
  
  // Check for specific roles
  const isSuperAdmin = !!claims.superAdmin;
  const isClubManager = claims.officerOfClub && Object.keys(claims.officerOfClub).length > 0;
  const canManageClub = isSuperAdmin || (isClubManager && claims.officerOfClub[clubId]);
}
```

## Using Claims in Security Rules

Firebase custom claims can also be used in security rules for Firestore, Storage, and other Firebase services:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Club documents
    match /clubs/{clubId} {
      // Super admins can do anything
      allow read, write: if request.auth.token.superAdmin == true;
      
      // Club managers can update their clubs
      allow update: if request.auth.token.officerOfClub[clubId] == true;
      
      // Everyone can read
      allow read: if true;
    }
  }
}
```

## Important Considerations

1. **Token Refresh**: After setting custom claims, the user needs to get a new token:
   - The token automatically refreshes hourly
   - Force refresh with `getIdToken(true)`
   - Or sign the user out and back in

2. **Size Limit**: Custom claims are limited to 1000 bytes
   - Use compact keys
   - For large permission sets, consider a different approach

3. **Security**: Never set claims from client code, only from secure environments

## Migrating from Role Strings to Claims

When migrating from role strings to custom claims:

1. Set up claims for existing users
2. Update security rules
3. Update client code to check claims
4. Maintain backwards compatibility during migration

For detailed implementation, see the `admin-functions.ts` file for examples.
