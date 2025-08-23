/**
 * @fileoverview Firebase Admin SDK initialization and utilities
 */

import * as admin from 'firebase-admin';
import { logger } from 'firebase-functions/v2';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp();
}

// Export commonly used instances
export const auth = admin.auth();
export const db = admin.firestore();
export const storage = admin.storage();

// Firestore collections
export const collections = {
  users: 'users',
  clubs: 'clubs',
  events: 'events',
  memberships: 'memberships',
  orders: 'orders',
  tickets: 'tickets',
  feedback: 'feedback',
  feedbackVotes: 'feedback-votes',
  proposals: 'proposals',
  comments: 'comments',
  replies: 'replies',
  activityLog: 'activity-log',
  policies: 'policies',
  policyAcceptances: 'policy-acceptances',
  files: 'files',
  announcements: 'announcements',
} as const;

// Helper functions
export const getTimestamp = () => admin.firestore.Timestamp.now();
export const getFieldValue = () => admin.firestore.FieldValue;

export { logger };
export default admin;
