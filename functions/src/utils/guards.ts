/**
 * @fileoverview Event and Order Eligibility Guards
 * 
 * This file contains utilities for checking if a user can join events or place orders.
 * It provides HTTP and callable functions to validate eligibility based on various criteria.
 */

import { logger } from "firebase-functions";
import { Request } from "firebase-functions/v1/https";
import { Response } from "express";
import { onRequest } from "firebase-functions/v1/https";
import { auth, db } from "./firebase";
import { EventDoc, MembershipDoc, OrderDoc } from "../models/types";
import { ErrorCode } from "../models/types";
import { corsMiddleware } from "../config/function-config";

interface CheckEligibilityRequest {
    eventId: string;
    ticketTypeId?: string;
    contextType?: 'rsvp' | 'order'; // Specify whether checking for RSVP or order eligibility
}

interface GuardResult {
    allowed: boolean;
    message?: string;
    code?: string;
}

/**
 * Core eligibility check logic shared between HTTP and programmatic functions
 * This centralizes all eligibility checking rules to avoid duplication
 */
async function checkEligibilityCore(
    userId: string,
    eventId: string,
    ticketTypeId?: string,
    contextType: 'rsvp' | 'order' = 'rsvp'
): Promise<GuardResult> {
    try {
        // Get event
        const eventRef = db.collection("events").doc(eventId);
        const eventSnap = await eventRef.get();
        if (!eventSnap.exists) {
            return {
                allowed: false,
                code: ErrorCode.EVENT_UNAVAILABLE,
                message: "Event not found"
            };
        }

        const event = eventSnap.data() as EventDoc;

        // Check if event is active
        if (event.status !== "active") {
            return {
                allowed: false,
                code: ErrorCode.EVENT_UNAVAILABLE,
                message: "Event is not active"
            };
        }

        // Check if event is in the past
        const now = new Date();
        if (event.end && (event.end as any).toDate && (event.end as any).toDate() < now) {
            return {
                allowed: false,
                code: ErrorCode.OUTSIDE_WINDOW,
                message: "Event has already ended"
            };
        }

        // Check RSVP window
        if (event.rsvpOpen && (event.rsvpOpen as any).toDate && (event.rsvpOpen as any).toDate() > now) {
            return {
                allowed: false,
                code: ErrorCode.OUTSIDE_WINDOW,
                message: "RSVP window has not opened yet"
            };
        }

        if (event.rsvpClose && (event.rsvpClose as any).toDate && (event.rsvpClose as any).toDate() < now) {
            return {
                allowed: false,
                code: ErrorCode.OUTSIDE_WINDOW,
                message: "RSVP window has closed"
            };
        }

        // Check visibility/eligibility
        if (event.visibility === "campus" && event.allowedUniversities && event.allowedUniversities.length > 0) {
            const userSnap = await db.collection("users").doc(userId).get();
            if (!userSnap.exists) {
                return {
                    allowed: false,
                    code: ErrorCode.NOT_ELIGIBLE,
                    message: "User profile not found"
                };
            }

            const user = userSnap.data();
            if (!user?.universityIds || !user.universityIds.some((id: string) =>
                event.allowedUniversities!.includes(id))) {
                return {
                    allowed: false,
                    code: ErrorCode.NOT_ELIGIBLE,
                    message: "User not from allowed universities"
                };
            }
        }

        // Check if already joined/has ticket
        const existingRsvp = await db.collection("rsvps")
            .where("eventId", "==", eventId)
            .where("userId", "==", userId)
            .where("status", "==", "confirmed")
            .limit(1)
            .get();

        if (!existingRsvp.empty) {
            return {
                allowed: false,
                code: ErrorCode.ALREADY_JOINED,
                message: "You have already RSVP'd to this event"
            };
        }

        // Check for existing orders
        const existingOrders = await db.collection("orders")
            .where("eventId", "==", eventId)
            .where("userId", "==", userId)
            .get();

        if (!existingOrders.empty) {
            const pendingOrder = existingOrders.docs.some(doc => {
                const order = doc.data() as OrderDoc;
                return order.status === "pending" ||
                    order.status === "awaiting_review" ||
                    order.status === "approved" ||
                    order.status === "paid";
            });

            if (pendingOrder) {
                return {
                    allowed: false,
                    code: ErrorCode.ALREADY_JOINED,
                    message: "You already have a pending or approved order for this event"
                };
            }
        }

        // Check capacity for the specific request type
        if ((contextType === 'order' || event.paymentMode !== 'free') && ticketTypeId) {
            // For ticket orders, check ticket type capacity
            const ticketType = (event.ticketTypes || []).find(tt => tt.id === ticketTypeId);
            if (!ticketType) {
                return {
                    allowed: false,
                    code: "invalid_ticket_type",
                    message: "Ticket type not found"
                };
            }

            if (ticketType.capacity && (ticketType.sold || 0) >= ticketType.capacity) {
                return {
                    allowed: false,
                    code: ErrorCode.SOLD_OUT,
                    message: "Ticket type sold out"
                };
            }
        } else if (event.capacity !== null && event.capacity !== undefined) {
            // For RSVPs or general capacity checks
            const confirmedCount = await db.collection("rsvps")
                .where("eventId", "==", eventId)
                .where("status", "==", "confirmed")
                .count()
                .get();

            // Include tickets sold in the count
            const totalAttendees = confirmedCount.data().count + (event.ticketsSoldCount || 0);

            if (totalAttendees >= event.capacity) {
                return {
                    allowed: false,
                    code: ErrorCode.CAPACITY_REACHED,
                    message: "Event has reached capacity"
                };
            }
        }

        // Check membership for members-only events
        if (event.visibility === "members") {
            // First check user claims for efficiency
            const userRecord = await auth.getUser(userId);
            const isMember = userRecord.customClaims?.memberOfClub?.[event.clubId] === true;

            if (!isMember) {
                // If not in claims, check database (claims might be outdated)
                const membership = await db.collection("memberships")
                    .where("clubId", "==", event.clubId)
                    .where("userId", "==", userId)
                    .where("status", "==", "active")
                    .limit(1)
                    .get();

                if (membership.empty) {
                    return {
                        allowed: false,
                        code: ErrorCode.NOT_ELIGIBLE,
                        message: "You are not a member of this club"
                    };
                }

                // Check dues status if required
                const memberData = membership.docs[0].data() as MembershipDoc;
                if (memberData.duesStatus === "required" || memberData.duesStatus === "late") {
                    return {
                        allowed: false,
                        code: ErrorCode.DUES_REQUIRED,
                        message: "You must pay club dues before joining this event"
                    };
                }

                // Check if banned
                if (memberData.banned) {
                    return {
                        allowed: false,
                        code: ErrorCode.BANNED,
                        message: "You are banned from this club"
                    };
                }
            }
        }

        // All checks passed
        return {
            allowed: true,
            message: "You are eligible to join this event"
        };

    } catch (error) {
        logger.error(`Error in eligibility check for user ${userId}, event ${eventId}`, error);
        return {
            allowed: false,
            code: "server_error",
            message: "An unexpected error occurred"
        };
    }
}

/**
 * Unified guard for checking if a user can join an event or place an order.
 * This combines and enhances both the previous joinOrderGuard and joinEventGuard implementations.
 * 
 * Authorization: Any authenticated user
 * 
 * @param request - The request object containing eventId and optional parameters
 * @returns A GuardResult object indicating whether the user is allowed to proceed
 */
export const checkEligibility = onRequest(async (request: Request, response: Response) => {
    // Apply CORS middleware
    await new Promise<void>((resolve) => corsMiddleware(request, response, () => resolve()));

    // Only allow POST requests
    if (request.method !== 'POST') {
        response.status(405).json({
            allowed: false,
            code: 'method_not_allowed',
            message: 'Only POST requests are allowed'
        });
        return;
    }

    try {
        // Verify authentication
        const authHeader = request.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            response.status(401).json({
                allowed: false,
                code: ErrorCode.NOT_ELIGIBLE,
                message: "Authentication required"
            });
            return;
        }

        const idToken = authHeader.split('Bearer ')[1];
        const decodedToken = await auth.verifyIdToken(idToken);
        const userId = decodedToken.uid;

        const { eventId, ticketTypeId, contextType = 'rsvp' } = request.body as CheckEligibilityRequest;

        if (!eventId) {
            response.status(400).json({
                allowed: false,
                code: "invalid_request",
                message: "Missing eventId"
            });
            return;
        }

        logger.info(`Checking ${contextType} eligibility for user ${userId} on event ${eventId}`);

        // Use the shared core logic
        const result = await checkEligibilityCore(userId, eventId, ticketTypeId, contextType);

        // Return appropriate HTTP status based on the result
        if (result.allowed) {
            response.status(200).json(result);
        } else {
            // For client errors, we use 400 instead of 200 with error flag
            // This is better for HTTP semantics
            response.status(400).json(result);
        }

    } catch (error) {
        logger.error(`Error in eligibility check API: ${error}`);
        response.status(500).json({
            allowed: false,
            code: "server_error",
            message: "An unexpected error occurred. Please try again."
        });
    }
});

/**
 * Helper function for internal use by other Cloud Functions
 * This function performs the same checks as the HTTP function but can be used directly in code
 */
export async function performEligibilityCheck(
    userId: string,
    eventId: string,
    ticketTypeId?: string,
    contextType: 'rsvp' | 'order' = 'rsvp'
): Promise<GuardResult> {
    // Use the shared core logic
    return checkEligibilityCore(userId, eventId, ticketTypeId, contextType);
}

// Backward compatibility aliases
export const eventGuard = checkEligibility;
export const joinEventGuard = checkEligibility;
export const joinOrderGuard = checkEligibility;
