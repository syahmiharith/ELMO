/**
 * @fileoverview Order and payment related callable functions
 * This file contains Firebase callable functions for order management and payment processing
 */

import { onCall, HttpsError } from "firebase-functions/v2/https";
import { auth, db, storage } from "../utils/firebase";
import { logger } from "firebase-functions";
import { FieldValue } from "firebase-admin/firestore";
import { OrderDoc, OrderStatus, EventDoc, TicketDoc } from "../models/types";
import { createAuditLog } from "../utils/audit";

interface CreateOrderRequest {
    eventId: string;
    ticketTypeId: string;
    quantity: number;
}

interface AttachReceiptRequest {
    orderId: string;
    receiptBase64: string;
    receiptType: string; // mime type
}

interface ReviewOrderRequest {
    orderId: string;
    status: OrderStatus;
    notes?: string;
}

interface GetTicketRequest {
    ticketId: string;
}

interface CheckInTicketRequest {
    ticketId: string;
}

/**
 * Creates a new order for event tickets
 * Authorization: Any authenticated user (with checks for eligibility)
 */
export const createOrder = onCall({ enforceAppCheck: true }, async (request) => {
    const { eventId, ticketTypeId, quantity } = request.data as CreateOrderRequest;
    const userId = request.auth?.uid;

    // Verify authentication
    if (!userId) {
        throw new HttpsError("unauthenticated", "User must be authenticated");
    }

    // Validate input
    if (!eventId || !ticketTypeId || !quantity || quantity < 1) {
        throw new HttpsError("invalid-argument", "Invalid order request");
    }

    try {
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

        // Check if event requires payment
        if (event.paymentMode === "free") {
            throw new HttpsError("failed-precondition", "Free events don't require orders");
        }

        // Find the requested ticket type
        const ticketType = event.ticketTypes?.find(t => t.id === ticketTypeId);
        if (!ticketType) {
            throw new HttpsError("not-found", "Ticket type not found");
        }

        // Check if tickets are available
        if (ticketType.capacity && (ticketType.sold || 0) + quantity > ticketType.capacity) {
            throw new HttpsError(
                "resource-exhausted",
                "Not enough tickets available",
                { available: ticketType.capacity - (ticketType.sold || 0) }
            );
        }

        // Check if user is eligible to purchase
        // For example, university restrictions, club membership, etc.
        if (event.visibility === "members") {
            // Check if user is a member of the club
            const memberships = await db.collection("memberships")
                .where("clubId", "==", event.clubId)
                .where("userId", "==", userId)
                .where("status", "==", "active")
                .limit(1)
                .get();

            if (memberships.empty) {
                throw new HttpsError("permission-denied", "Only club members can purchase tickets");
            }
        } else if (event.visibility === "campus" && event.allowedUniversities?.length) {
            // Check if user is from allowed university
            const userDoc = await db.collection("users").doc(userId).get();
            if (!userDoc.exists) {
                throw new HttpsError("not-found", "User profile not found");
            }

            const userUniversity = userDoc.data()?.universityIds;
            if (!userUniversity || !userUniversity.some((uni: string) => event.allowedUniversities?.includes(uni))) {
                throw new HttpsError("permission-denied", "You are not eligible to purchase tickets");
            }
        }

        // Calculate total price
        const totalPrice = (ticketType.price || 0) * quantity;

        // Create the order
        const orderRef = db.collection("orders").doc();
        const timestamp = FieldValue.serverTimestamp();

        const orderData: OrderDoc = {
            userId,
            eventId,
            clubId: event.clubId,
            ticketTypeId,
            ticketTypeName: ticketType.name,
            quantity,
            pricePerTicket: ticketType.price || 0,
            totalPrice,
            status: "pending",
            notes: "",
            createdAt: timestamp,
            updatedAt: timestamp
        };

        await orderRef.set(orderData);

        // Log the activity
        await createAuditLog(
            userId,
            "order_created",
            "orders",
            orderRef.id,
            {
                eventId,
                ticketTypeId,
                quantity,
                totalPrice
            }
        );

        logger.info(`Order created: ${orderRef.id} for event ${eventId} by user ${userId}`);
        return {
            success: true,
            orderId: orderRef.id,
            paymentDetails: {
                amount: totalPrice,
                currency: "USD", // Should come from system settings
                eventName: event.name,
                ticketType: ticketType.name,
                quantity
            }
        };
    } catch (error) {
        logger.error(`Failed to create order for event ${eventId}`, error);
        if (error instanceof HttpsError) {
            throw error;
        }
        throw new HttpsError("internal", "Failed to create order");
    }
});

/**
 * Attaches a receipt to an order
 * Authorization: The user who created the order
 */
export const attachReceipt = onCall({ enforceAppCheck: true }, async (request) => {
    const { orderId, receiptBase64, receiptType } = request.data as AttachReceiptRequest;
    const userId = request.auth?.uid;

    // Verify authentication
    if (!userId) {
        throw new HttpsError("unauthenticated", "User must be authenticated");
    }

    try {
        // Verify the order exists and belongs to this user
        const orderRef = db.collection("orders").doc(orderId);
        const orderDoc = await orderRef.get();

        if (!orderDoc.exists) {
            throw new HttpsError("not-found", "Order not found");
        }

        const order = orderDoc.data() as OrderDoc;

        // Check ownership
        if (order.userId !== userId) {
            throw new HttpsError("permission-denied", "You can only attach receipts to your own orders");
        }

        // Check order status
        if (order.status !== "pending") {
            throw new HttpsError("failed-precondition", "Cannot attach receipt to an order that is not pending");
        }

        // Decode base64 and upload to storage
        const buffer = Buffer.from(receiptBase64, 'base64');
        const fileExtension = receiptType.split('/')[1] || 'jpg';
        const filePath = `receipts/${orderId}.${fileExtension}`;

        const fileRef = storage.bucket().file(filePath);
        await fileRef.save(buffer, {
            metadata: {
                contentType: receiptType
            }
        });

        // Update order with receipt URL and change status to awaiting review
        await orderRef.update({
            receiptUrl: `gs://${storage.bucket().name}/${filePath}`,
            status: "awaiting_review",
            updatedAt: FieldValue.serverTimestamp()
        });

        // Log the activity
        await createAuditLog(
            userId,
            "receipt_attached",
            "orders",
            orderId,
            { receiptUploaded: true }
        );

        logger.info(`Receipt attached to order ${orderId} by user ${userId}`);
        return { success: true };
    } catch (error) {
        logger.error(`Failed to attach receipt to order ${request.data?.orderId}`, error);
        if (error instanceof HttpsError) {
            throw error;
        }
        throw new HttpsError("internal", "Failed to attach receipt");
    }
});

/**
 * Reviews an order and updates its status
 * Authorization: superAdmin or officerOfClub[clubId]
 */
export const reviewOrder = onCall({ enforceAppCheck: true }, async (request) => {
    const { orderId, status, notes } = request.data as ReviewOrderRequest;
    const userId = request.auth?.uid;

    // Verify authentication
    if (!userId) {
        throw new HttpsError("unauthenticated", "User must be authenticated");
    }

    try {
        // Verify the order exists
        const orderRef = db.collection("orders").doc(orderId);
        const orderDoc = await orderRef.get();

        if (!orderDoc.exists) {
            throw new HttpsError("not-found", "Order not found");
        }

        const order = orderDoc.data() as OrderDoc;

        // Verify authorization (superAdmin or club officer)
        const userRecord = await auth.getUser(userId);
        const isAdmin = userRecord.customClaims?.superAdmin === true;
        const isOfficer = userRecord.customClaims?.officerOfClub?.[order.clubId] === true;

        if (!isAdmin && !isOfficer) {
            throw new HttpsError("permission-denied", "Only club officers or super admins can review orders");
        }

        // Check current order status
        if (order.status !== "awaiting_review") {
            throw new HttpsError("failed-precondition", "Can only review orders with 'awaiting_review' status");
        }

        // Validate status transition
        if (status !== "approved" && status !== "rejected") {
            throw new HttpsError("invalid-argument", "Status must be 'approved' or 'rejected'");
        }

        // Update order status
        const updateData: Record<string, any> = {
            status,
            reviewedBy: userId,
            reviewedAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp()
        };

        if (notes) {
            updateData.notes = notes;
        }

        await orderRef.update(updateData);

        // If approved, create tickets
        if (status === "approved") {
            const eventRef = db.collection("events").doc(order.eventId);
            const eventDoc = await eventRef.get();

            if (!eventDoc.exists) {
                throw new HttpsError("not-found", "Event not found");
            }

            const event = eventDoc.data() as EventDoc;
            const ticketType = event.ticketTypes?.find(t => t.id === order.ticketTypeId);

            if (!ticketType) {
                throw new HttpsError("not-found", "Ticket type not found");
            }

            // Create tickets in a batch
            const batch = db.batch();
            const tickets: string[] = [];

            for (let i = 0; i < (order.quantity || 0); i++) {
                const ticketRef = db.collection("tickets").doc();
                tickets.push(ticketRef.id);

                const ticketData: TicketDoc = {
                    orderId,
                    eventId: order.eventId,
                    clubId: order.clubId,
                    userId: order.userId,
                    ticketTypeId: order.ticketTypeId || null,
                    ticketTypeName: order.ticketTypeName,
                    status: "valid",
                    createdAt: FieldValue.serverTimestamp()
                };

                batch.set(ticketRef, ticketData);
            }

            // Update ticket count in event
            batch.update(eventRef, {
                ticketsSoldCount: FieldValue.increment(order.quantity || 0),
                [`ticketTypes.${event.ticketTypes?.findIndex(t => t.id === order.ticketTypeId)}.sold`]:
                    FieldValue.increment(order.quantity || 0)
            });

            await batch.commit();

            // Update order with ticket IDs
            await orderRef.update({
                ticketIds: tickets
            });
        }

        // Log the activity
        await createAuditLog(
            userId,
            `order_${status}`,
            "orders",
            orderId,
            {
                notes: notes || "",
                customerUserId: order.userId
            }
        );

        logger.info(`Order ${orderId} ${status} by user ${userId}`);
        return {
            success: true,
            status,
            ticketIds: status === "approved" ? await orderRef.get().then(doc => doc.data()?.ticketIds || []) : []
        };
    } catch (error) {
        logger.error(`Failed to review order ${request.data?.orderId}`, error);
        if (error instanceof HttpsError) {
            throw error;
        }
        throw new HttpsError("internal", "Failed to review order");
    }
});

/**
 * Gets ticket details (including QR code data)
 * Authorization: The ticket owner or event organizer
 */
export const getTicket = onCall({ enforceAppCheck: true }, async (request) => {
    const { ticketId } = request.data as GetTicketRequest;
    const userId = request.auth?.uid;

    // Verify authentication
    if (!userId) {
        throw new HttpsError("unauthenticated", "User must be authenticated");
    }

    try {
        // Verify the ticket exists
        const ticketRef = db.collection("tickets").doc(ticketId);
        const ticketDoc = await ticketRef.get();

        if (!ticketDoc.exists) {
            throw new HttpsError("not-found", "Ticket not found");
        }

        const ticket = ticketDoc.data() as TicketDoc;

        // Verify authorization (ticket owner or event organizer)
        const isOwner = ticket.userId === userId;

        if (!isOwner) {
            const userRecord = await auth.getUser(userId);
            const isAdmin = userRecord.customClaims?.superAdmin === true;
            const isOfficer = userRecord.customClaims?.officerOfClub?.[ticket.clubId] === true;

            if (!isAdmin && !isOfficer) {
                throw new HttpsError("permission-denied", "You don't have permission to view this ticket");
            }
        }

        // Get event details for ticket context
        const eventRef = db.collection("events").doc(ticket.eventId);
        const eventDoc = await eventRef.get();

        if (!eventDoc.exists) {
            throw new HttpsError("not-found", "Event not found");
        }

        const event = eventDoc.data() as EventDoc;

        // Create QR code data (includes ticket ID and security hash)
        // In a real implementation, use a proper signed JWT or similar mechanism
        const securityToken = Buffer.from(`${ticketId}|${ticket.userId}|${Date.now()}`).toString('base64');

        return {
            ticket,
            event: {
                name: event.name,
                location: event.location,
                start: event.start,
                end: event.end
            },
            qrData: {
                ticketId,
                token: securityToken
            }
        };
    } catch (error) {
        logger.error(`Failed to get ticket ${request.data?.ticketId}`, error);
        if (error instanceof HttpsError) {
            throw error;
        }
        throw new HttpsError("internal", "Failed to get ticket");
    }
});

/**
 * Checks in a ticket at an event
 * Authorization: superAdmin or officerOfClub[clubId]
 */
export const checkInTicket = onCall({ enforceAppCheck: true }, async (request) => {
    const { ticketId } = request.data as CheckInTicketRequest;
    const userId = request.auth?.uid;

    // Verify authentication
    if (!userId) {
        throw new HttpsError("unauthenticated", "User must be authenticated");
    }

    try {
        // Verify the ticket exists
        const ticketRef = db.collection("tickets").doc(ticketId);
        const ticketDoc = await ticketRef.get();

        if (!ticketDoc.exists) {
            throw new HttpsError("not-found", "Ticket not found");
        }

        const ticket = ticketDoc.data() as TicketDoc;

        // Verify authorization (superAdmin or club officer)
        const userRecord = await auth.getUser(userId);
        const isAdmin = userRecord.customClaims?.superAdmin === true;
        const isOfficer = userRecord.customClaims?.officerOfClub?.[ticket.clubId] === true;

        if (!isAdmin && !isOfficer) {
            throw new HttpsError("permission-denied", "Only club officers or super admins can check in tickets");
        }

        // Check ticket status
        if (ticket.status !== "valid") {
            throw new HttpsError(
                "failed-precondition",
                `Ticket is ${ticket.status}`,
                { status: ticket.status }
            );
        }

        // Get event to check if it's active and not in the past
        const eventRef = db.collection("events").doc(ticket.eventId);
        const eventDoc = await eventRef.get();

        if (!eventDoc.exists) {
            throw new HttpsError("not-found", "Event not found");
        }

        const event = eventDoc.data() as EventDoc;

        // Check if event is active
        if (event.status !== "active") {
            throw new HttpsError("failed-precondition", "Event is not active");
        }

        // Check if event is in the past
        const now = new Date();
        if (event.end && (event.end as any).toDate && (event.end as any).toDate() < now) {
            throw new HttpsError("failed-precondition", "Event has already ended");
        }

        // Mark ticket as used
        await ticketRef.update({
            status: "used",
            checkedInAt: FieldValue.serverTimestamp(),
            checkedInBy: userId
        });

        // Log the activity
        await createAuditLog(
            userId,
            "ticket_checked_in",
            "tickets",
            ticketId,
            {
                eventId: ticket.eventId,
                clubId: ticket.clubId,
                attendeeUserId: ticket.userId
            }
        );

        logger.info(`Ticket ${ticketId} checked in by user ${userId}`);
        return {
            success: true,
            attendeeId: ticket.userId,
            ticketType: ticket.ticketTypeName
        };
    } catch (error) {
        logger.error(`Failed to check in ticket ${request.data?.ticketId}`, error);
        if (error instanceof HttpsError) {
            throw error;
        }
        throw new HttpsError("internal", "Failed to check in ticket");
    }
});
