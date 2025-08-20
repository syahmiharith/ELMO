/**
 * @fileoverview Ticket management utilities for the ticket system.
 * 
 * Provides functions for ticket creation, validation, check-in, and management.
 * Leverages the configurations defined in function-config.ts.
 */

import { ticketConfig } from '../../config/function-config';
import { generateSecureTicketCode } from './security';
import { generateTicketQRCode, getQRCodeStoragePath } from './qr-code';
import { firestore } from 'firebase-admin';
import { Storage } from '@google-cloud/storage';

// Ticket status types
export enum TicketStatus {
    ACTIVE = 'active',       // Valid and ready for use
    USED = 'used',           // Has been checked in
    CANCELLED = 'cancelled', // Cancelled by admin or user
    EXPIRED = 'expired',     // Past the event date
    REFUNDED = 'refunded'    // Refunded to customer
}

/**
 * Validates if a ticket can be checked in.
 * 
 * @param ticketData The ticket data
 * @param eventTime The event start time
 * @returns Validation result with message
 */
export function validateTicketCheckIn(
    ticketData: {
        status: string;
        secureCode: string;
        eventId: string;
    },
    eventTime: Date
): { valid: boolean; message?: string } {
    // Check ticket status
    if (ticketData.status !== TicketStatus.ACTIVE) {
        return { valid: false, message: `Ticket is ${ticketData.status}` };
    }

    // Check event time window
    const now = new Date();
    const beforeWindow = new Date(eventTime);
    const afterWindow = new Date(eventTime);

    beforeWindow.setHours(beforeWindow.getHours() - ticketConfig.checkInWindowHours.before);
    afterWindow.setHours(afterWindow.getHours() + ticketConfig.checkInWindowHours.after);

    if (now < beforeWindow) {
        const hours = Math.ceil((beforeWindow.getTime() - now.getTime()) / (1000 * 60 * 60));
        return {
            valid: false,
            message: `Check-in window not open yet. Opens in ${hours} hours.`
        };
    }

    if (now > afterWindow) {
        return { valid: false, message: 'Check-in window has closed.' };
    }

    return { valid: true };
}

/**
 * Creates a new ticket in the database.
 * 
 * @param db Firestore instance
 * @param storage Storage instance
 * @param bucketName Storage bucket name
 * @param eventId Event ID
 * @param ticketTypeId Ticket type ID
 * @param userId User ID
 * @param orderId Order ID
 * @returns The created ticket data
 */
export async function createTicket(
    db: firestore.Firestore,
    storage: Storage,
    bucketName: string,
    eventId: string,
    ticketTypeId: string,
    userId: string,
    orderId: string
): Promise<{
    id: string;
    secureCode: string;
    qrCodeUrl: string;
    status: TicketStatus;
}> {
    // Generate secure code for ticket
    const secureCode = generateSecureTicketCode(ticketConfig.codeLength);

    // Create ticket record in Firestore
    const ticketsRef = db.collection('tickets');
    const ticketRef = ticketsRef.doc();
    const ticketId = ticketRef.id;

    // Generate QR code
    const qrBuffer = await generateTicketQRCode(ticketId, secureCode, eventId);

    // Store QR code in Firebase Storage
    const storagePath = getQRCodeStoragePath(ticketId, eventId);
    const bucket = storage.bucket(bucketName);
    const file = bucket.file(storagePath);

    await file.save(qrBuffer, {
        metadata: {
            contentType: 'image/png',
            metadata: {
                ticketId,
                eventId,
                createdAt: new Date().toISOString()
            }
        }
    });

    // Get public URL for QR code
    const [url] = await file.getSignedUrl({
        action: 'read',
        expires: Date.now() + 315360000000 // ~10 years
    });

    // Create ticket record
    const ticketData = {
        id: ticketId,
        eventId,
        ticketTypeId,
        userId,
        orderId,
        secureCode,
        qrCodeUrl: url,
        qrCodePath: storagePath,
        status: TicketStatus.ACTIVE,
        checkedIn: false,
        checkedInAt: null,
        checkedInBy: null,
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp()
    };

    await ticketRef.set(ticketData);

    return {
        id: ticketId,
        secureCode,
        qrCodeUrl: url,
        status: TicketStatus.ACTIVE
    };
}

/**
 * Performs check-in for a ticket.
 * 
 * @param db Firestore instance
 * @param ticketId Ticket ID
 * @param secureCode Secure code for verification
 * @param checkerId ID of user performing check-in
 * @returns Success or failure with message
 */
export async function checkInTicket(
    db: firestore.Firestore,
    ticketId: string,
    secureCode: string,
    checkerId: string
): Promise<{ success: boolean; message: string }> {
    const ticketRef = db.collection('tickets').doc(ticketId);

    try {
        // Run in transaction to prevent double check-ins
        return await db.runTransaction(async (transaction) => {
            const ticketDoc = await transaction.get(ticketRef);

            if (!ticketDoc.exists) {
                return { success: false, message: 'Ticket not found' };
            }

            const ticketData = ticketDoc.data()!;

            // Verify secure code
            if (ticketData.secureCode !== secureCode) {
                return { success: false, message: 'Invalid ticket code' };
            }

            // Check if already checked in
            if (ticketData.checkedIn) {
                const checkinTime = ticketData.checkedInAt ?
                    ticketData.checkedInAt.toDate().toLocaleString() :
                    'unknown time';

                return {
                    success: false,
                    message: `Ticket already checked in at ${checkinTime}`
                };
            }

            // Get event time for validation
            const eventDoc = await transaction.get(
                db.collection('events').doc(ticketData.eventId)
            );

            if (!eventDoc.exists) {
                return { success: false, message: 'Event not found' };
            }

            const eventData = eventDoc.data()!;
            const eventTime = eventData.startTime.toDate();

            // Validate check-in
            const validation = validateTicketCheckIn({
                status: ticketData.status,
                secureCode: ticketData.secureCode,
                eventId: ticketData.eventId
            }, eventTime);
            if (!validation.valid) {
                return { success: false, message: validation.message || 'Invalid ticket' };
            }

            // Update ticket
            transaction.update(ticketRef, {
                checkedIn: true,
                checkedInAt: firestore.FieldValue.serverTimestamp(),
                checkedInBy: checkerId,
                status: TicketStatus.USED,
                updatedAt: firestore.FieldValue.serverTimestamp()
            });

            return { success: true, message: 'Check-in successful' };
        });
    } catch (error) {
        return {
            success: false,
            message: `Check-in failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
    }
}

/**
 * Cancels a ticket (admin or user-initiated).
 * 
 * @param db Firestore instance
 * @param ticketId Ticket ID
 * @param reason Reason for cancellation
 * @param adminId Optional admin ID if admin-initiated
 * @returns Success or failure with message
 */
export async function cancelTicket(
    db: firestore.Firestore,
    ticketId: string,
    reason: string,
    adminId?: string
): Promise<{ success: boolean; message: string }> {
    const ticketRef = db.collection('tickets').doc(ticketId);

    try {
        return await db.runTransaction(async (transaction) => {
            const ticketDoc = await transaction.get(ticketRef);

            if (!ticketDoc.exists) {
                return { success: false, message: 'Ticket not found' };
            }

            const ticketData = ticketDoc.data()!;

            // Check if ticket can be cancelled
            if (ticketData.status !== TicketStatus.ACTIVE) {
                return {
                    success: false,
                    message: `Cannot cancel ticket with status: ${ticketData.status}`
                };
            }

            // Update ticket
            transaction.update(ticketRef, {
                status: TicketStatus.CANCELLED,
                cancellationReason: reason,
                cancelledBy: adminId || 'user',
                cancelledAt: firestore.FieldValue.serverTimestamp(),
                updatedAt: firestore.FieldValue.serverTimestamp()
            });

            return { success: true, message: 'Ticket cancelled successfully' };
        });
    } catch (error) {
        return {
            success: false,
            message: `Cancellation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
    }
}
