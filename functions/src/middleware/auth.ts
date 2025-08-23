/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-len */
/**
 * @fileoverview Authentication and authorization middleware
 */

import { CallableRequest } from 'firebase-functions/v2/https';
import { auth, db, collections } from '../utils/firebase';
import { HttpsError } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions/v2';

export interface AuthContext {
  uid: string;
  email?: string;
  role?: string;
  isAdmin?: boolean;
  isClubAdmin?: boolean;
  clubIds?: string[];
}

/**
 * Verify Firebase auth token and extract user info
 */
export async function verifyAuth(request: CallableRequest): Promise<AuthContext> {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { uid } = request.auth;
  
  try {
    // Get additional user claims if needed
    const userRecord = await auth.getUser(uid);
    const customClaims = userRecord.customClaims || {};
    
    return {
      uid,
      email: userRecord.email,
      role: customClaims.role as string,
      isAdmin: customClaims.isAdmin as boolean,
      isClubAdmin: customClaims.isClubAdmin as boolean,
      clubIds: customClaims.clubIds as string[] || [],
    };
  } catch (error) {
    logger.error('Failed to verify auth:', error);
    throw new HttpsError('unauthenticated', 'Invalid authentication token');
  }
}

/**
 * Check if user has admin role
 */
export function requireAdmin(authContext: AuthContext): void {
  if (!authContext.isAdmin) {
    throw new HttpsError('permission-denied', 'Admin access required');
  }
}

/**
 * Check if user is admin of specific club
 */
export async function requireClubAdmin(authContext: AuthContext, clubId: string): Promise<void> {
  if (authContext.isAdmin) {
    return; // Platform admins have access to all clubs
  }
  
  // Check if user is admin of the specific club
  const membershipQuery = await db.collection(collections.memberships)
    .where('userId', '==', authContext.uid)
    .where('clubId', '==', clubId)
    .where('status', '==', 'approved')
    .where('role', '==', 'Admin')
    .limit(1)
    .get();

  if (membershipQuery.empty) {
    throw new HttpsError('permission-denied', 'Club admin access required');
  }
}

/**
 * Check if user owns the resource or is admin
 */
export function requireOwnerOrAdmin(authContext: AuthContext, resourceOwnerId: string): void {
  if (authContext.uid !== resourceOwnerId && !authContext.isAdmin) {
    throw new HttpsError('permission-denied', 'Access denied: not owner or admin');
  }
}
