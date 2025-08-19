/**
 * @fileoverview Ticket management callable functions
 * This file contains Firebase callable functions for ticket retrieval and check-in
 */

import { onCall, HttpsError } from "firebase-functions/v2/https";
import { auth, db } from "../utils/firebase";
import { logger } from "firebase-functions";
import { FieldValue } from "firebase-admin/firestore";
import { EventDoc } from "../models/types";
import { createAuditLog } from "../utils/audit";
import * as crypto from "crypto-js";

interface GetTicketRequest {
    ticketId: string;
}

interface CheckInTicketRequest {
    ticketId: string;
    eventId: string;
    verificationCode?: string;
}

/**
 * Get ticket details including QR code data
 * Authorization: ticket owner, event organizer, or superAdmin
 */
export const getTicket = onCall({ enforceAppCheck: true }, async (request) => {
    const { ticketId } = request.data as GetTicketRequest;
    const userId = request.auth?.uid;

    // Verify authentication
    if (!userId) {
        throw new HttpsError("unauthenticated", "User must be authenticated");
    }

    try {
        // Get the ticket document
        const ticketRef = db.collection("tickets").doc(ticketId);
        const ticketDoc = await ticketRef.get();

        if (!ticketDoc.exists) {
            throw new HttpsError("not-found", "Ticket not found");
        }

        const ticketData = ticketDoc.data();
        if (!ticketData) {
            throw new HttpsError("internal", "Ticket data is missing");
        }

        // Get the related event
        const eventRef = db.collection("events").doc(ticketData.eventId);
        const eventDoc = await eventRef.get();

        if (!eventDoc.exists) {
            throw new HttpsError("not-found", "Related event not found");
        }

        const eventData = eventDoc.data() as EventDoc;

        // Verify authorization
        const userRecord = await auth.getUser(userId);
        const isAdmin = userRecord.customClaims?.superAdmin === true;
        const isOrganizer = userRecord.customClaims?.officerOfClub?.[eventData.clubId] === true;
        const isOwner = ticketData.userId === userId;

        if (!isAdmin && !isOrganizer && !isOwner) {
            throw new HttpsError(
                "permission-denied",
                "Only ticket owner, event organizers, or super admins can view ticket details"
            );
        }

        // Generate verification code/QR data
        // Include ticket ID, event ID, and user ID in the signed data
        const ticketInfo = {
            ticketId,
            eventId: ticketData.eventId,
            userId: ticketData.userId,
            timestamp: Date.now()
        };

        // Create a signature/hash for verification
        const secretKey = process.env.TICKET_SECRET || "default-ticket-secret-key";
        const signature = crypto.HmacSHA256(JSON.stringify(ticketInfo), secretKey).toString();

        // Combine the ticket info and signature
        const qrData = {
            ...ticketInfo,
            signature
        };

        // Log the activity
        await createAuditLog(
            userId,
            "ticket_viewed",
            "tickets",
            ticketId,
            { ticketId, eventId: ticketData.eventId }
        );

        logger.info(`Ticket retrieved: ${ticketId} by user ${userId}`);

        return {
            success: true,
            ticket: {
                ...ticketData,
                id: ticketId,
                qrData: JSON.stringify(qrData)
            },
            event: {
                ...eventData,
                id: ticketData.eventId
            }
        };
    } catch (error) {
        if (error instanceof HttpsError) {
            throw error;
        }
        logger.error(`Failed to retrieve ticket ${ticketId}`, error);
        throw new HttpsError("internal", "Failed to retrieve ticket details");
    }
});

/**
 * Check in a ticket at an event
 * Authorization: event organizer or superAdmin
 */
export const checkInTicket = onCall({ enforceAppCheck: true }, async (request) => {
    const { ticketId, eventId, verificationCode } = request.data as CheckInTicketRequest;
    const userId = request.auth?.uid;

    // Verify authentication
    if (!userId) {
        throw new HttpsError("unauthenticated", "User must be authenticated");
    }

    try {
        // Get the ticket document
        const ticketRef = db.collection("tickets").doc(ticketId);
        const ticketDoc = await ticketRef.get();

        if (!ticketDoc.exists) {
            throw new HttpsError("not-found", "Ticket not found");
        }

        const ticketData = ticketDoc.data();
        if (!ticketData) {
            throw new HttpsError("internal", "Ticket data is missing");
        }

        // Verify ticket is for the specified event
        if (ticketData.eventId !== eventId) {
            throw new HttpsError("invalid-argument", "Ticket is not valid for this event");
        }

        // Get the event document
        const eventRef = db.collection("events").doc(eventId);
        const eventDoc = await eventRef.get();

        if (!eventDoc.exists) {
            throw new HttpsError("not-found", "Event not found");
        }

        const event = eventDoc.data() as EventDoc;

        // Check if the event is active
        if (event.status !== 'active') {
            throw new HttpsError("failed-precondition", "Event is not active");
        }

        // Check if the event has already passed
        const now = new Date();
        if (event.end && event.end instanceof Date && event.end < now) {
            throw new HttpsError("failed-precondition", "Event has already ended");
        }

        // Verify authorization (only event organizers or superadmins can check in)
        const userRecord = await auth.getUser(userId);
        const isAdmin = userRecord.customClaims?.superAdmin === true;
        const isOrganizer = userRecord.customClaims?.officerOfClub?.[event.clubId] === true;

        if (!isAdmin && !isOrganizer) {
            throw new HttpsError(
                "permission-denied",
                "Only event organizers or super admins can check in attendees"
            );
        }

        // Verify ticket status
        if (ticketData.status !== "confirmed") {
            throw new HttpsError(
                "failed-precondition",
                `Ticket cannot be checked in (current status: ${ticketData.status})`
            );
        }

        // Check if ticket was already used
        if (ticketData.checkedIn) {
            throw new HttpsError(
                "already-exists",
                `Ticket was already checked in at ${ticketData.checkedInAt?.toDate?.()}`
            );
        }

        // If verification code is provided, verify it
        if (verificationCode) {
            // Implement verification logic here if needed
            // This would validate the QR code signature
        }

        // Update the ticket with check-in information
        const timestamp = FieldValue.serverTimestamp();
        await ticketRef.update({
            checkedIn: true,
            checkedInAt: timestamp,
            checkedInBy: userId
        });

        // Log the activity
        await createAuditLog(
            userId,
            "ticket_checked_in",
            "tickets",
            ticketId,
            {
                ticketId,
                eventId,
                attendeeId: ticketData.userId
            }
        );

        logger.info(`Ticket checked in: ${ticketId} for event ${eventId} by user ${userId}`);

        return {
            success: true,
            ticketId,
            attendeeId: ticketData.userId,
            checkedInAt: new Date()
        };
    } catch (error) {
        if (error instanceof HttpsError) {
            throw error;
        }
        logger.error(`Failed to check in ticket ${ticketId}`, error);
        throw new HttpsError("internal", "Failed to check in ticket");
    }
});
