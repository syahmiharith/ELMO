/**
 * @fileoverview Common utility functions for API operations
 */

import { db, collections, getTimestamp } from './firebase';
import { HttpsError } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions/v2';

/**
 * Pagination utilities
 */
export interface PaginationOptions {
  cursor?: string;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  nextCursor?: string;
  hasMore: boolean;
}

export async function paginateQuery<T>(
  query: FirebaseFirestore.Query,
  options: PaginationOptions = {}
): Promise<PaginatedResult<T>> {
  const { cursor, limit = 20 } = options;
  const maxLimit = Math.min(limit, 100); // Enforce max limit of 100

  let paginatedQuery = query.limit(maxLimit + 1); // Fetch one extra to check if there's more

  if (cursor) {
    try {
      const cursorDoc = await db.doc(cursor).get();
      if (cursorDoc.exists) {
        paginatedQuery = paginatedQuery.startAfter(cursorDoc);
      }
    } catch (error) {
      logger.warn('Invalid cursor provided:', cursor);
    }
  }

  const snapshot = await paginatedQuery.get();
  const docs = snapshot.docs;
  const hasMore = docs.length > maxLimit;
  
  const data = docs.slice(0, maxLimit).map(doc => ({
    id: doc.id,
    ...doc.data()
  } as T));

  const nextCursor = hasMore && docs.length > 0 ? docs[maxLimit - 1].ref.path : undefined;

  return {
    data,
    nextCursor,
    hasMore
  };
}

/**
 * Document existence check
 */
export async function checkDocExists(collection: string, docId: string): Promise<void> {
  const doc = await db.collection(collection).doc(docId).get();
  if (!doc.exists) {
    throw new HttpsError('not-found', `Document not found: ${collection}/${docId}`);
  }
}

/**
 * Generate unique ID using Firebase
 */
export function generateId(): string {
  return db.collection('_temp').doc().id;
}

/**
 * Add audit fields to document data
 */
export function addAuditFields(userId: string, isUpdate = false): any {
  const timestamp = getTimestamp();
  
  if (isUpdate) {
    return {
      'audit.updatedAt': timestamp,
      'audit.updatedBy': userId,
    };
  } else {
    return {
      audit: {
        createdAt: timestamp,
        createdBy: userId,
        updatedAt: timestamp,
        updatedBy: userId,
      },
    };
  }
}

/**
 * Validate required fields
 */
export function validateRequiredFields(data: any, requiredFields: string[]): void {
  const missingFields = requiredFields.filter(field => !data[field]);
  if (missingFields.length > 0) {
    throw new HttpsError('invalid-argument', `Missing required fields: ${missingFields.join(', ')}`);
  }
}

/**
 * Sanitize string input
 */
export function sanitizeString(input: string, maxLength = 1000): string {
  if (typeof input !== 'string') {
    throw new HttpsError('invalid-argument', 'Input must be a string');
  }
  
  return input.trim().slice(0, maxLength);
}

/**
 * Rate limiting check (basic implementation)
 */
const rateLimitCache = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(key: string, maxRequests = 60, windowMinutes = 1): void {
  const now = Date.now();
  const windowMs = windowMinutes * 60 * 1000;
  const resetTime = now + windowMs;
  
  const current = rateLimitCache.get(key);
  
  if (!current || now > current.resetTime) {
    rateLimitCache.set(key, { count: 1, resetTime });
    return;
  }
  
  if (current.count >= maxRequests) {
    throw new HttpsError('resource-exhausted', 'Rate limit exceeded');
  }
  
  current.count++;
}

/**
 * Log activity for audit trail
 */
export async function logActivity(details: {
  type: string;
  userId: string;
  clubId?: string;
  eventId?: string;
  details?: Record<string, any>;
}): Promise<void> {
  try {
    await db.collection(collections.activityLog).add({
      type: details.type,
      userId: details.userId,
      clubId: details.clubId,
      eventId: details.eventId,
      details: details.details || {},
      timestamp: getTimestamp(),
    });
  } catch (error) {
    logger.error('Failed to log activity:', error);
    // Don't throw error to avoid breaking main operation
  }
}

/**
 * Validate field types and constraints
 */
export interface FieldValidation {
  value: any;
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'array';
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

export function validateFields(fields: Record<string, FieldValidation>): string[] {
  const errors: string[] = [];

  for (const [fieldName, validation] of Object.entries(fields)) {
    const { value, required, type, minLength, maxLength, min, max } = validation;

    // Check if required field is present
    if (required && (value === undefined || value === null || value === '')) {
      errors.push(`${fieldName} is required`);
      continue;
    }

    // Skip further validation if field is not provided and not required
    if (!required && (value === undefined || value === null)) {
      continue;
    }

    // Type validation
    if (type && typeof value !== type) {
      errors.push(`${fieldName} must be of type ${type}`);
      continue;
    }

    // String validations
    if (type === 'string' && typeof value === 'string') {
      if (minLength !== undefined && value.length < minLength) {
        errors.push(`${fieldName} must be at least ${minLength} characters long`);
      }
      if (maxLength !== undefined && value.length > maxLength) {
        errors.push(`${fieldName} must be no more than ${maxLength} characters long`);
      }
    }

    // Number validations
    if (type === 'number' && typeof value === 'number') {
      if (min !== undefined && value < min) {
        errors.push(`${fieldName} must be at least ${min}`);
      }
      if (max !== undefined && value > max) {
        errors.push(`${fieldName} must be no more than ${max}`);
      }
    }
  }

  return errors;
}
