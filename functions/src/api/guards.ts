/**
 * @fileoverview Join and Order Guard API.
 * 
 * This provides a callable function to check if a user can join an event or place an order.
 */

import { onCall } from "firebase-functions/v2/https";
import { db, auth } from "../utils/firebase";
import { logger } from "firebase-functions";
import { EventDoc, MembershipDoc, RsvpDoc, OrderDoc } from "../models/types";
import { ErrorCode } from "../models/types";

interface JoinGuardRequest {
    eventId: string;
    ticketTypeId?: string;
}

interface JoinGuardResponse {
    allowed: boolean;
    code?: string;
    message?: string;
}

/**
 * Checks if a user can join an event or place an order.
 * Validates against multiple conditions like status, window, eligibility, capacity, etc.
 */
export const joinOrderGuard = onCall({ enforceAppCheck: true }, async (request) => {
    const { eventId, ticketTypeId } = request.data as JoinGuardRequest;
    const userId = request.auth?.uid;

    if (!userId) {
        return { allowed: false, code: "unauthenticated", message: "User must be authenticated" };
    }

    if (!eventId) {
        return { allowed: false, code: "invalid_request", message: "Missing eventId" };
    }

    logger.info(`Checking join/order guard for user ${userId} on event ${eventId}`);

    try {
        // Get event
        const eventRef = db.collection("events").doc(eventId);
        const eventSnap = await eventRef.get();
        if (!eventSnap.exists) {
            return { allowed: false, code: ErrorCode.EVENT_UNAVAILABLE, message: "Event not found" };
        }

        const event = eventSnap.data() as EventDoc;

        // Check if event is active
        if (event.status !== "active") {
            return { allowed: false, code: ErrorCode.EVENT_UNAVAILABLE, message: "Event is not active" };
        }

        // Check RSVP window
        const now = new Date();
        if (event.rsvpOpen && (event.rsvpOpen as any).toDate() > now) {
            return { allowed: false, code: ErrorCode.OUTSIDE_WINDOW, message: "RSVP window not open yet" };
        }

        if (event.rsvpClose && (event.rsvpClose as any).toDate() < now) {
            return { allowed: false, code: ErrorCode.OUTSIDE_WINDOW, message: "RSVP window closed" };
        }

        // Check visibility/eligibility
        if (event.visibility === "campus" && event.allowedUniversities && event.allowedUniversities.length > 0) {
            const userSnap = await db.collection("users").doc(userId).get();
            if (!userSnap.exists) {
                return { allowed: false, code: ErrorCode.NOT_ELIGIBLE, message: "User profile not found" };
            }

            const user = userSnap.data();
            if (!user?.universityIds || !user.universityIds.some((id: string) =>
                event.allowedUniversities!.includes(id))) {
                return { allowed: false, code: ErrorCode.NOT_ELIGIBLE, message: "User not from allowed universities" };
            }
        }

        // Check if already joined/has ticket
        const existingRsvp = await db.collection("rsvps")
            .where("eventId", "==", eventId)
            .where("userId", "==", userId)
            .limit(1)
            .get();

        if (!existingRsvp.empty) {
            return { allowed: false, code: ErrorCode.ALREADY_JOINED, message: "User already RSVP'd to this event" };
        }

        const existingOrders = await db.collection("orders")
            .where("eventId", "==", eventId)
            .where("userId", "==", userId)
            .get();

        if (!existingOrders.empty) {
            const pendingOrder = existingOrders.docs.some(doc => {
                const order = doc.data() as OrderDoc;
                return order.status === "pending" || order.status === "pending_review" || order.status === "paid";
            });

            if (pendingOrder) {
                return { allowed: false, code: ErrorCode.ALREADY_JOINED, message: "User already has a pending or paid order" };
            }
        }

        // Check capacity
        if (ticketTypeId) {
            const ticketType = (event.ticketTypes || []).find(tt => tt.id === ticketTypeId);
            if (!ticketType) {
                return { allowed: false, code: "invalid_ticket_type", message: "Ticket type not found" };
            }

            if (ticketType.capacity && (ticketType.sold || 0) >= ticketType.capacity) {
                return { allowed: false, code: ErrorCode.SOLD_OUT, message: "Ticket type sold out" };
            }
        } else if (event.capacity && (event.ticketsSoldCount || 0) >= event.capacity) {
            return { allowed: false, code: ErrorCode.SOLD_OUT, message: "Event sold out" };
        }

        // Check membership for members-only events
        if (event.visibility === "members") {
            const membership = await db.collection("memberships")
                .where("clubId", "==", event.clubId)
                .where("userId", "==", userId)
                .where("status", "==", "approved")
                .limit(1)
                .get();

            if (membership.empty) {
                return { allowed: false, code: ErrorCode.NOT_ELIGIBLE, message: "User is not a member of this club" };
            }

            // Check dues status if required
            const memberData = membership.docs[0].data() as MembershipDoc;
            if (memberData.duesStatus === "required" || memberData.duesStatus === "late") {
                return { allowed: false, code: ErrorCode.DUES_REQUIRED, message: "User must pay dues to join this event" };
            }

            // Check if banned
            if (memberData.banned) {
                return { allowed: false, code: ErrorCode.BANNED, message: "User is banned from this club" };
            }
        }

        // All checks passed
        return { allowed: true };

    } catch (error) {
        logger.error(`Error in join/order guard for user ${userId}, event ${eventId}`, error);
        return {
            allowed: false,
            code: "server_error",
            message: "An unexpected error occurred. Please try again."
        };
    }
});
