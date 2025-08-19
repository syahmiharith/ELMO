/**
 * @fileoverview Order and ticket related Cloud Functions.
 * 
 * Handles ticket creation when an order is marked as paid.
 */

import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import { db } from "../utils/firebase";
import { FieldValue } from "firebase-admin/firestore";
import { OrderDoc, TicketDoc, EventDoc, TicketType } from "../models/types";
import { logger } from "firebase-functions";
import { FirestoreEvent, Change, QueryDocumentSnapshot } from "firebase-functions/v2/firestore";
import { createAuditLogInTransaction } from "../utils/audit";
interface OrderPathParams { orderId: string }

// Used by createAuditLogInTransaction
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface AuditLog {
    actorId: string;
    action: string;
    target: { collection: string; id: string };
    meta: { eventId: string; userId: string; ticketTypeId: string | null };
    ts: FirebaseFirestore.FieldValue;
}

/**
 * Triggered when an Order document's status is updated to 'paid'.
 * Validates the order and creates a corresponding Ticket document.
 */
export const onOrderStatusPaid = onDocumentUpdated(
    { document: "orders/{orderId}", retry: true },
    async (event: FirestoreEvent<Change<QueryDocumentSnapshot> | undefined, OrderPathParams>): Promise<void> => {
        const before = event.data?.before?.data() as OrderDoc | undefined;
        const after = event.data?.after?.data() as OrderDoc | undefined;
        if (!after || before?.status === "paid" || after.status !== "paid") return;

        const { eventId, userId, ticketTypeId } = after;
        if (!eventId || !userId) return;

        await db.runTransaction(async (tx) => {
            const existing = await tx.get(
                db.collection("tickets").where("orderId", "==", event.params.orderId as string).limit(1)
            );
            if (!existing.empty) {
                logger.info(`Ticket already exists for order ${event.params.orderId}`);
                return;
            }

            // Load event
            const evRef: FirebaseFirestore.DocumentReference<EventDoc> = db.collection("events").doc(eventId) as FirebaseFirestore.DocumentReference<EventDoc>;
            const evSnap: FirebaseFirestore.DocumentSnapshot<EventDoc> = await tx.get(evRef);
            if (!evSnap.exists) {
                logger.error(`Event ${eventId} not found`);
                throw new Error("event_not_found");
            }
            const ev: EventDoc = evSnap.data() as EventDoc;

            // Capacity check (root or per-type)
            const tt: TicketType | undefined = ticketTypeId ? (ev.ticketTypes || []).find((t: TicketType) => t.id === ticketTypeId) : undefined;
            const cap: number | null | undefined = tt ? tt.capacity : (ev.capacity ?? 0);
            const sold: number = tt ? (tt.sold ?? 0) : (ev.ticketsSoldCount ?? 0);
            if (cap && sold >= cap) {
                logger.warn(`Capacity reached for ${ticketTypeId ? `ticket type ${ticketTypeId}` : `event ${eventId}`}`);
                tx.update(db.collection("orders").doc(event.params.orderId as string), {
                    status: "rejected", rejectedReason: "capacity_reached", reviewedAt: FieldValue.serverTimestamp()
                } as Partial<OrderDoc>);
                throw new Error("capacity_reached");
            }

            // Create ticket
            const ticketRef: FirebaseFirestore.DocumentReference<TicketDoc> = db.collection("tickets").doc() as FirebaseFirestore.DocumentReference<TicketDoc>;
            tx.set(ticketRef, {
                orderId: event.params.orderId as string,
                eventId,
                userId,
                ticketTypeId: ticketTypeId ?? null,
                qrCode: `ticket_${ticketRef.id}`,
                status: "valid",
                issuedAt: FieldValue.serverTimestamp(),
            } as TicketDoc);

            // Increment sold
            if (tt) {
                const newTypes: TicketType[] = (ev.ticketTypes || []).map((t: TicketType) =>
                    t.id === ticketTypeId ? { ...t, sold: (t.sold ?? 0) + 1 } : t
                );
                tx.update(evRef, {
                    ticketTypes: newTypes,
                    updatedAt: FieldValue.serverTimestamp()
                } as FirebaseFirestore.UpdateData<EventDoc>);
            } else {
                tx.update(evRef, {
                    ticketsSoldCount: FieldValue.increment(1),
                    updatedAt: FieldValue.serverTimestamp()
                } as FirebaseFirestore.UpdateData<EventDoc>);
            }

            // Audit
            createAuditLogInTransaction(
                tx,
                "system_onOrderStatusPaid",
                "ticket_issued",
                "orders",
                event.params.orderId as string,
                { eventId, userId, ticketTypeId: ticketTypeId ?? null }
            );

            logger.info(`Successfully created ticket for order ${event.params.orderId}`);
        });
    });
