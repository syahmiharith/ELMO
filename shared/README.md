# ELMO Shared Types

This package contains shared TypeScript type definitions used by both the frontend and backend of the ELMO application.

## Purpose

The shared types library ensures consistency between the client and server implementations by providing a single source of truth for data structures used throughout the application.

## Structure

- **common.ts**: Common utility types and interfaces
- **user.ts**: User-related types
- **club.ts**: Club-related types
- **event.ts**: Event and RSVP types
- **membership.ts**: Membership-related types
- **order.ts**: Order, ticket, and file types
- **error-codes.ts**: Standardized error codes

## Usage

### In Frontend (Next.js)

```typescript
import { User, Club, ClubEvent } from '@elmo/shared-types';

interface ClubCardProps {
    club: Club;
}

export function ClubCard({ club }: ClubCardProps) {
    // ...
}
```

### In Backend (Firebase Functions)

```typescript
import { UserDoc, EventDoc, ErrorCode } from '@elmo/shared-types';

const user = snapshot.data() as UserDoc;
```

## Development

When making changes to types, ensure they remain compatible with both frontend and backend usage patterns.

### Building the package

```bash
npm run build
```

## Installation

For local development, you can use npm or yarn workspaces to link this package.
