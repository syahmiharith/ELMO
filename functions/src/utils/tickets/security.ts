/**
 * @fileoverview Ticket security utilities.
 * 
 * Provides functions for generating secure ticket codes, validating transactions,
 * and other security-related functionality for the ticketing system.
 */

import * as crypto from 'crypto';
import { securityConfig } from '../../config/function-config';

/**
 * Generates a cryptographically secure random code suitable for tickets.
 * Uses the character set defined in config to avoid ambiguous characters.
 * 
 * @param length Length of the code to generate (defaults to configured value)
 * @returns A secure random code
 */
export function generateSecureTicketCode(length = securityConfig.secureCodeCharSet.length): string {
    const allowedChars = securityConfig.secureCodeCharSet;
    const randomBytes = crypto.randomBytes(length);

    let result = '';
    for (let i = 0; i < length; i++) {
        // Map random bytes to our allowed character set
        const randomIndex = randomBytes[i] % allowedChars.length;
        result += allowedChars.charAt(randomIndex);
    }

    return result;
}

/**
 * Validates an external transaction ID against expected formats.
 * Uses regex patterns defined in configuration.
 * 
 * @param provider The payment provider (paypal, stripe, etc.)
 * @param txnId The transaction ID to validate
 * @returns True if valid, false otherwise
 */
export function validateTransactionId(provider: string, txnId: string): boolean {
    if (!txnId || typeof txnId !== 'string') return false;

    const patterns = securityConfig.transactionIdPatterns;
    const pattern = patterns[provider as keyof typeof patterns] || patterns.default;

    return pattern.test(txnId);
}

/**
 * Creates a hash of a file buffer for duplicate detection or verification.
 * 
 * @param buffer The file buffer to hash
 * @returns A hex string hash
 */
export function hashFileBuffer(buffer: Buffer): string {
    return crypto.createHash('sha256').update(buffer).digest('hex');
}

/**
 * Checks if a user has admin role based on their custom claims.
 * 
 * @param claims The user's custom claims object
 * @returns True if user has admin role
 */
export function isAdmin(claims: Record<string, any>): boolean {
    return claims && claims[securityConfig.adminRoleName] === true;
}

/**
 * Checks if a user has officer role for a specific event.
 * 
 * @param claims The user's custom claims object
 * @param eventId The event ID to check
 * @returns True if user has officer role for this event
 */
export function isEventOfficer(claims: Record<string, any>, eventId: string): boolean {
    if (!claims) return false;

    // First check for admin (admins can always check in)
    if (isAdmin(claims)) return true;

    // Check for specific event officer role
    const officerRole = `${securityConfig.officerRolePrefix}${eventId}`;
    return claims[officerRole] === true;
}

/**
 * Generates an idempotency key for API operations.
 * 
 * @returns A unique idempotency key
 */
export function generateIdempotencyKey(): string {
    return crypto.randomBytes(16).toString('hex');
}
