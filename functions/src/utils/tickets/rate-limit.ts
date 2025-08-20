/**
 * @fileoverview Rate limiting utilities for ticket system APIs.
 * 
 * Provides functions for controlling request rates to prevent abuse.
 * Leverages the configurations defined in function-config.ts.
 */

import { rateLimitConfig } from '../../config/function-config';
import { firestore } from 'firebase-admin';

// Interface for rate limit records
interface RateLimitRecord {
    userId: string;
    ipAddress: string;
    actionType: string;
    count: number;
    firstRequest: firestore.Timestamp;
    lastRequest: firestore.Timestamp;
    blocked?: boolean;
    blockUntil?: firestore.Timestamp;
}

/**
 * Checks if a request should be rate limited.
 * 
 * @param db Firestore instance
 * @param userId User ID (if authenticated)
 * @param ipAddress IP address of request
 * @param actionType Type of action (from rateLimitConfig)
 * @returns Whether the request is allowed or blocked
 */
export async function checkRateLimit(
    db: firestore.Firestore,
    userId: string | null,
    ipAddress: string,
    actionType: keyof typeof rateLimitConfig
): Promise<{ allowed: boolean; reason?: string; resetTime?: Date }> {
    // Get configuration for this action type
    const config = rateLimitConfig[actionType];
    if (!config) {
        return { allowed: true }; // No rate limit configured
    }

    const now = new Date();
    const nowTimestamp = firestore.Timestamp.fromDate(now);

    // Use both IP and user ID if available to prevent circumvention
    const limitsRef = db.collection('rateLimits');

    try {
        // Run in transaction to ensure atomic updates
        return await db.runTransaction(async (transaction) => {
            let query = limitsRef
                .where('actionType', '==', actionType)
                .limit(1);

            // Query by user ID if available, otherwise by IP
            if (userId) {
                query = query.where('userId', '==', userId);
            } else {
                query = query.where('ipAddress', '==', ipAddress);
            }

            const limitDocsQuery = await transaction.get(query);

            // If record exists, check and update it
            if (!limitDocsQuery.empty) {
                const limitDoc = limitDocsQuery.docs[0];
                const limitData = limitDoc.data() as RateLimitRecord;

                // Check if currently blocked
                if (limitData.blocked && limitData.blockUntil) {
                    if (now < limitData.blockUntil.toDate()) {
                        return {
                            allowed: false,
                            reason: 'Rate limit exceeded',
                            resetTime: limitData.blockUntil.toDate()
                        };
                    } else {
                        // Block period has expired, reset record
                        transaction.update(limitDoc.ref, {
                            count: 1,
                            firstRequest: nowTimestamp,
                            lastRequest: nowTimestamp,
                            blocked: false,
                            blockUntil: null
                        });
                        return { allowed: true };
                    }
                }

                // Check if we're in a new period
                const periodStart = new Date(now);
                periodStart.setSeconds(periodStart.getSeconds() - config.periodSeconds);

                if (limitData.firstRequest.toDate() < periodStart) {
                    // New period, reset count
                    transaction.update(limitDoc.ref, {
                        count: 1,
                        firstRequest: nowTimestamp,
                        lastRequest: nowTimestamp
                    });
                    return { allowed: true };
                }

                // Check if max calls exceeded
                if (limitData.count >= config.maxCalls) {
                    // Block the user/IP
                    const blockUntil = new Date(now);
                    blockUntil.setSeconds(blockUntil.getSeconds() + config.blockSeconds);

                    transaction.update(limitDoc.ref, {
                        blocked: true,
                        blockUntil: firestore.Timestamp.fromDate(blockUntil),
                        lastRequest: nowTimestamp
                    });

                    return {
                        allowed: false,
                        reason: 'Rate limit exceeded',
                        resetTime: blockUntil
                    };
                }

                // Increment count and allow
                transaction.update(limitDoc.ref, {
                    count: firestore.FieldValue.increment(1),
                    lastRequest: nowTimestamp
                });

                return { allowed: true };
            } else {
                // Create new rate limit record
                const newRecord: RateLimitRecord = {
                    userId: userId || '',
                    ipAddress,
                    actionType,
                    count: 1,
                    firstRequest: nowTimestamp,
                    lastRequest: nowTimestamp
                };

                transaction.set(limitsRef.doc(), newRecord);
                return { allowed: true };
            }
        });
    } catch (error) {
        console.error('Rate limit check error:', error);
        // Default to allowing on error
        return { allowed: true };
    }
}

/**
 * Resets rate limit for a user or IP (admin function).
 * 
 * @param db Firestore instance
 * @param userId User ID to reset
 * @param ipAddress IP address to reset
 * @param actionType Specific action to reset or all
 * @returns Success or failure
 */
export async function resetRateLimit(
    db: firestore.Firestore,
    userId?: string,
    ipAddress?: string,
    actionType?: string
): Promise<{ success: boolean; message: string }> {
    if (!userId && !ipAddress) {
        return { success: false, message: 'Either userId or ipAddress must be provided' };
    }

    try {
        const limitsRef = db.collection('rateLimits');
        let query: firestore.Query = limitsRef;

        // Apply filters
        if (userId) {
            query = query.where('userId', '==', userId);
        }

        if (ipAddress) {
            query = query.where('ipAddress', '==', ipAddress);
        }

        if (actionType) {
            query = query.where('actionType', '==', actionType);
        }

        const snapshot = await query.get();

        if (snapshot.empty) {
            return { success: true, message: 'No rate limits found to reset' };
        }

        // Delete all matching records
        const batch = db.batch();
        snapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });

        await batch.commit();

        return {
            success: true,
            message: `Reset ${snapshot.size} rate limit ${snapshot.size === 1 ? 'record' : 'records'}`
        };
    } catch (error) {
        return {
            success: false,
            message: `Failed to reset rate limits: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
    }
}
