# ELMO Backend - Firebase Cloud Functions

This directory contains the backend implementation for the ELMO platform, a multi-university student-club management system.

## Directory Structure

The backend code is organized into the following directories:

```
functions/
├── src/
│   ├── api/          # HTTP and Callable API endpoints
│   ├── auth/         # Authentication and user-related functions
│   ├── clubs/        # Club management functions
│   ├── events/       # Event and ticket related functions
│   ├── models/       # Shared TypeScript interfaces and type definitions
│   ├── storage/      # Storage-related functions
│   ├── utils/        # Shared utilities
│   └── index.ts      # Main entry point that exports all functions
```

## Adding New Functions

When adding new functionality:

1. Place the code in the appropriate directory based on its functionality
2. Export the function in that module's main file
3. Re-export the function in `src/index.ts`

## Shared Types

All shared interfaces and types are in `src/models/types.ts`. Add any new types there to ensure consistency across the codebase.

## Firebase Setup

Firebase initialization is handled in `src/utils/firebase.ts`. This file exports the initialized Firestore, Auth, and Storage services.

## Utilities

Common utilities:
- `src/utils/audit.ts`: Functions for creating audit logs
- `src/utils/firebase.ts`: Firebase initialization and service exports

## Testing

To test your functions locally:
1. Run `npm run build:watch` to compile TypeScript
2. Run `firebase emulators:start` to start the Firebase emulators
3. Use the Firebase emulator UI to test your functions

## Deployment

To deploy:
```bash
npm run deploy
```

Or to deploy specific functions:
```bash
firebase deploy --only functions:functionName1,functions:functionName2
```

## Security Rules

Security rules for Firestore and Storage are managed separately in the project root:
- `firestore.rules`: Contains all Firestore security rules
- `storage.rules`: Contains all Storage security rules
