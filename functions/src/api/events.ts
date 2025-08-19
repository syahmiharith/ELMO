/**
 * @fileoverview Event-related callable functions
 * This file contains Firebase callable functions for event management
 */

import { onCall, HttpsError } from "firebase-functions/v2/https";
import { auth, db } from "../utils/firebase";
import { logger } from "firebase-functions";
import { FieldValue } from "firebase-admin/firestore";
import { EventDoc, RsvpDoc, TicketType } from "../models/types";
import { createAuditLog } from "../utils/audit";

interface CreateEventRequest {
    clubId: string;
    name: string;
    description?: string;
    location?: string;
    start: string; // ISO date string
    end: string; // ISO date string
    visibility: 'public' | 'campus' | 'members';
    allowedUniversities?: string[];
    rsvpOpen?: string; // ISO date string
    rsvpClose?: string; // ISO date string
    capacity?: number;
    ticketTypes?: TicketType[];
    paymentMode?: string;
}

interface UpdateEventRequest {
    eventId: string;
    name?: string;
    description?: string;
    location?: string;
    start?: string; // ISO date string
    end?: string; // ISO date string
    visibility?: 'public' | 'campus' | 'members';
    allowedUniversities?: string[];
    rsvpOpen?: string; // ISO date string
    rsvpClose?: string; // ISO date string
    capacity?: number;
    ticketTypes?: TicketType[];
    paymentMode?: string;
}

interface CancelEventRequest {
    eventId: string;
    reason: string;
}

interface RsvpRequest {
    eventId: string;
}

/**
 * Creates a new event
 * Authorization: superAdmin or officerOfClub[clubId]
 */
export const createEvent = onCall({ enforceAppCheck: true }, async (request) => {
    const eventData = request.data as CreateEventRequest;
    const userId = request.auth?.uid;

    // Verify authentication
    if (!userId) {
        throw new HttpsError("unauthenticated", "User must be authenticated");
    }

    // Verify the club exists
    const clubRef = db.collection("clubs").doc(eventData.clubId);
    const clubDoc = await clubRef.get();
    if (!clubDoc.exists) {
        throw new HttpsError("not-found", "Club not found");
    }

    // Verify authorization (superAdmin or club officer)
    const userRecord = await auth.getUser(userId);
    const isAdmin = userRecord.customClaims?.superAdmin === true;
    const isOfficer = userRecord.customClaims?.officerOfClub?.[eventData.clubId] === true;

    if (!isAdmin && !isOfficer) {
        throw new HttpsError("permission-denied", "Only club officers or super admins can create events");
    }

    // Validate input
    if (!eventData.name || !eventData.start || !eventData.end) {
        throw new HttpsError("invalid-argument", "Event must have a name, start, and end time");
    }

    try {
        // Convert date strings to Firestore timestamps
        const startDate = new Date(eventData.start);
        const endDate = new Date(eventData.end);
        const rsvpOpenDate = eventData.rsvpOpen ? new Date(eventData.rsvpOpen) : undefined;
        const rsvpCloseDate = eventData.rsvpClose ? new Date(eventData.rsvpClose) : undefined;

        // Create event document
        const eventRef = db.collection("events").doc();
        const timestamp = FieldValue.serverTimestamp();

        // Prepare ticket types if provided
        let ticketTypes = eventData.ticketTypes || [];
        // Ensure each ticket type has an ID
        ticketTypes = ticketTypes.map(tt => ({
            ...tt,
            id: tt.id || db.collection("_").doc().id, // Generate ID if not provided
            sold: 0
        }));

        const eventDoc: EventDoc = {
            clubId: eventData.clubId,
            name: eventData.name,
            description: eventData.description || "",
            location: eventData.location || "",
            start: startDate,
            end: endDate,
            visibility: eventData.visibility,
            allowedUniversities: eventData.allowedUniversities || [],
            rsvpOpen: rsvpOpenDate,
            rsvpClose: rsvpCloseDate,
            capacity: eventData.capacity || null,
            ticketsSoldCount: 0,
            ticketTypes: ticketTypes.length > 0 ? ticketTypes : undefined,
            paymentMode: eventData.paymentMode || "free",
            status: "active",
            audit: {
                createdAt: timestamp,
                updatedAt: timestamp,
                createdBy: userId,
                lastEditedBy: userId
            }
        };

        await eventRef.set(eventDoc);

        // Log the activity
        await createAuditLog(
            userId,
            "event_created",
            "events",
            eventRef.id,
            {
                clubId: eventData.clubId,
                name: eventData.name,
                start: eventData.start,
                end: eventData.end
            }
        );

        logger.info(`Event created: ${eventRef.id} for club ${eventData.clubId} by user ${userId}`);
        return { success: true, eventId: eventRef.id };
    } catch (error) {
        logger.error(`Failed to create event for club ${eventData.clubId}`, error);
        throw new HttpsError("internal", "Failed to create event");
    }
});

/**
 * Updates an existing event
 * Authorization: superAdmin or officerOfClub[clubId]
 */
export const updateEvent = onCall({ enforceAppCheck: true }, async (request) => {
    const { eventId, ...updateData } = request.data as UpdateEventRequest;
    const userId = request.auth?.uid;

    // Verify authentication
    if (!userId) {
        throw new HttpsError("unauthenticated", "User must be authenticated");
    }

    // Verify the event exists
    const eventRef = db.collection("events").doc(eventId);
    const eventDoc = await eventRef.get();
    if (!eventDoc.exists) {
        throw new HttpsError("not-found", "Event not found");
    }

    const event = eventDoc.data() as EventDoc;

    // Verify authorization (superAdmin or club officer)
    const userRecord = await auth.getUser(userId);
    const isAdmin = userRecord.customClaims?.superAdmin === true;
    const isOfficer = userRecord.customClaims?.officerOfClub?.[event.clubId] === true;

    if (!isAdmin && !isOfficer) {
        throw new HttpsError("permission-denied", "Only club officers or super admins can update events");
    }

    try {
        // Process date fields
        const updatedEvent: Record<string, any> = {};

        if (updateData.name) updatedEvent.name = updateData.name;
        if (updateData.description !== undefined) updatedEvent.description = updateData.description;
        if (updateData.location !== undefined) updatedEvent.location = updateData.location;
        if (updateData.start) updatedEvent.start = new Date(updateData.start);
        if (updateData.end) updatedEvent.end = new Date(updateData.end);
        if (updateData.visibility) updatedEvent.visibility = updateData.visibility;
        if (updateData.allowedUniversities) updatedEvent.allowedUniversities = updateData.allowedUniversities;
        if (updateData.rsvpOpen) updatedEvent.rsvpOpen = new Date(updateData.rsvpOpen);
        if (updateData.rsvpClose) updatedEvent.rsvpClose = new Date(updateData.rsvpClose);
        if (updateData.capacity !== undefined) updatedEvent.capacity = updateData.capacity;
        if (updateData.paymentMode) updatedEvent.paymentMode = updateData.paymentMode;

        // Handle ticket types with special care
        if (updateData.ticketTypes) {
            // Preserve existing sales data
            const currentTicketTypes = event.ticketTypes || [];

            // Map to preserve sold counts for existing ticket types
            const updatedTicketTypes = updateData.ticketTypes.map(tt => {
                const existingType = currentTicketTypes.find(t => t.id === tt.id);
                return {
                    ...tt,
                    id: tt.id || db.collection("_").doc().id, // Generate ID if not provided
                    sold: existingType ? existingType.sold : 0
                };
            });

            updatedEvent.ticketTypes = updatedTicketTypes;
        }

        // Add audit fields
        updatedEvent["audit.updatedAt"] = FieldValue.serverTimestamp();
        updatedEvent["audit.lastEditedBy"] = userId;

        await eventRef.update(updatedEvent);

        // Log the activity
        await createAuditLog(
            userId,
            "event_updated",
            "events",
            eventId,
            {
                clubId: event.clubId,
                updates: updateData
            }
        );

        logger.info(`Event updated: ${eventId} by user ${userId}`);
        return { success: true };
    } catch (error) {
        logger.error(`Failed to update event ${eventId}`, error);
        throw new HttpsError("internal", "Failed to update event");
    }
});

/**
 * Cancels an event
 * Authorization: superAdmin or officerOfClub[clubId]
 */
export const cancelEvent = onCall({ enforceAppCheck: true }, async (request) => {
    const { eventId, reason } = request.data as CancelEventRequest;
    const userId = request.auth?.uid;

    // Verify authentication
    if (!userId) {
        throw new HttpsError("unauthenticated", "User must be authenticated");
    }

    // Verify the event exists
    const eventRef = db.collection("events").doc(eventId);
    const eventDoc = await eventRef.get();
    if (!eventDoc.exists) {
        throw new HttpsError("not-found", "Event not found");
    }

    const event = eventDoc.data() as EventDoc;

    // Verify authorization (superAdmin or club officer)
    const userRecord = await auth.getUser(userId);
    const isAdmin = userRecord.customClaims?.superAdmin === true;
    const isOfficer = userRecord.customClaims?.officerOfClub?.[event.clubId] === true;

    if (!isAdmin && !isOfficer) {
        throw new HttpsError("permission-denied", "Only club officers or super admins can cancel events");
    }

    // Verify event can be canceled
    if (event.status === "canceled") {
        throw new HttpsError("already-exists", "Event is already canceled");
    }

    try {
        const timestamp = FieldValue.serverTimestamp();

        await eventRef.update({
            status: "canceled",
            "audit.updatedAt": timestamp,
            "audit.lastEditedBy": userId,
            "audit.canceledAt": timestamp,
            "audit.canceledBy": userId,
            "audit.cancelReason": reason
        });

        // Log the activity
        await createAuditLog(
            userId,
            "event_canceled",
            "events",
            eventId,
            { reason }
        );

        logger.info(`Event canceled: ${eventId} by user ${userId}`);
        return { success: true };
    } catch (error) {
        logger.error(`Failed to cancel event ${eventId}`, error);
        throw new HttpsError("internal", "Failed to cancel event");
    }
});

/**
 * RSVPs to an event
 * Authorization: Any authenticated user (with checks for eligibility)
 */
export const rsvpEvent = onCall({ enforceAppCheck: true }, async (request) => {
    const { eventId } = request.data as RsvpRequest;
    const userId = request.auth?.uid;

    // Verify authentication
    if (!userId) {
        throw new HttpsError("unauthenticated", "User must be authenticated");
    }

    try {
        // Check eligibility manually since we can't directly call another callable function
        // Get event details
        const eventRef = db.collection("events").doc(eventId);
        const eventDoc = await eventRef.get();

        if (!eventDoc.exists) {
            throw new HttpsError("not-found", "Event not found");
        }

        const event = eventDoc.data() as EventDoc;

        // Check if event is active
        if (event.status !== "active") {
            throw new HttpsError("failed-precondition", "Event is not active");
        }

        // Check RSVP window
        const now = new Date();
        if (event.rsvpOpen && (event.rsvpOpen as any).toDate && (event.rsvpOpen as any).toDate() > now) {
            throw new HttpsError("failed-precondition", "RSVP window has not opened yet");
        }

        if (event.rsvpClose && (event.rsvpClose as any).toDate && (event.rsvpClose as any).toDate() < now) {
            throw new HttpsError("failed-precondition", "RSVP window has closed");
        }

        // Check if user has already RSVP'd
        const existingRsvp = await db.collection("rsvps")
            .where("eventId", "==", eventId)
            .where("userId", "==", userId)
            .where("status", "==", "confirmed")
            .limit(1)
            .get();

        if (!existingRsvp.empty) {
            throw new HttpsError("failed-precondition", "You have already RSVP'd to this event");
        }

        // Create RSVP
        const rsvpRef = db.collection("rsvps").doc();
        const timestamp = FieldValue.serverTimestamp();

        const rsvpData: RsvpDoc = {
            eventId,
            userId,
            status: "confirmed",
            createdAt: timestamp
        };

        await rsvpRef.set(rsvpData);

        // Log the activity
        await createAuditLog(
            userId,
            "event_rsvp_created",
            "rsvps",
            rsvpRef.id,
            { eventId }
        );

        logger.info(`RSVP created: ${rsvpRef.id} for event ${eventId} by user ${userId}`);
        return { success: true, rsvpId: rsvpRef.id };
    } catch (error) {
        logger.error(`Failed to RSVP to event ${eventId} for user ${userId}`, error);
        if (error instanceof HttpsError) {
            throw error;
        }
        throw new HttpsError("internal", "Failed to RSVP to event");
    }
});

/**
 * Cancels an RSVP to an event
 * Authorization: The user who created the RSVP
 */
export const cancelRsvp = onCall({ enforceAppCheck: true }, async (request) => {
    const { eventId } = request.data as RsvpRequest;
    const userId = request.auth?.uid;

    // Verify authentication
    if (!userId) {
        throw new HttpsError("unauthenticated", "User must be authenticated");
    }

    try {
        // Find the user's RSVP for this event
        const rsvps = await db.collection("rsvps")
            .where("eventId", "==", eventId)
            .where("userId", "==", userId)
            .where("status", "==", "confirmed")
            .limit(1)
            .get();

        if (rsvps.empty) {
            throw new HttpsError(
                "not-found",
                "No active RSVP found for this event"
            );
        }

        const rsvpRef = rsvps.docs[0].ref;
        const rsvpId = rsvpRef.id;

        // Update RSVP status
        await rsvpRef.update({
            status: "canceled",
            canceledAt: FieldValue.serverTimestamp()
        });

        // Log the activity
        await createAuditLog(
            userId,
            "event_rsvp_canceled",
            "rsvps",
            rsvpId,
            { eventId }
        );

        logger.info(`RSVP canceled: ${rsvpId} for event ${eventId} by user ${userId}`);
        return { success: true };
    } catch (error) {
        logger.error(`Failed to cancel RSVP for event ${eventId} for user ${userId}`, error);
        if (error instanceof HttpsError) {
            throw error;
        }
        throw new HttpsError("internal", "Failed to cancel RSVP");
    }
});
