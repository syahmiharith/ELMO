/**
 * @fileoverview Cloud Functions for the ClubNexus project.
 *
 * This file contains the server-side logic for critical operations such as
 * issuing tickets, managing user roles via custom claims, activating clubs
 * upon approval, and processing uploaded receipts.
 */

import { setGlobalOptions } from "firebase-functions/v2";
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import { onObjectFinalized } from "firebase-functions/v2/storage";
import { logger } from "firebase-functions";

// Initialize Firebase Admin SDK
initializeApp();
setGlobalOptions({ region: "asia-southeast1", maxInstances: 10, secrets: [], timeoutSeconds: 60, memory: "256MiB" });
const db = getFirestore();
const auth = getAuth();

/**
 * Triggered when an Order document's status is updated to 'paid'.
 * Validates the order and creates a corresponding Ticket document.
 */
interface OrderDoc {
    status?: string;
    eventId?: string;
    userId?: string;
    ticketTypeId?: string | null;
    rejectedReason?: string;
    reviewedAt?: FirebaseFirestore.FieldValue;
}

interface TicketType {
    id: string;
    capacity?: number | null;
    sold?: number;
}

interface EventDoc {
    capacity?: number | null;
    ticketsSoldCount?: number;
    ticketTypes?: TicketType[];
    updatedAt?: FirebaseFirestore.FieldValue;
}

interface TicketDoc {
    orderId: string;
    eventId: string;
    userId: string;
    ticketTypeId: string | null;
    qrCode: string;
    status: string;
    issuedAt: FirebaseFirestore.FieldValue;
}

interface AuditLog {
    actorId: string;
    action: string;
    target: { collection: string; id: string };
    meta: { eventId: string; userId: string; ticketTypeId: string | null };
    ts: FirebaseFirestore.FieldValue;
}

interface OrderPathParams { orderId: string }

interface OrderChange {
    before: FirebaseFirestore.DocumentSnapshot<OrderDoc>;
    after: FirebaseFirestore.DocumentSnapshot<OrderDoc>;
}

interface OrderUpdatedEvent {
    data?: OrderChange;
    params: OrderPathParams;
}

export const onOrderStatusPaid = onDocumentUpdated({ document: "orders/{orderId}", retry: true }, async (event: OrderUpdatedEvent): Promise<void> => {
    const before = event.data?.before.data() as OrderDoc | undefined;
    const after = event.data?.after.data() as OrderDoc | undefined;
    if (!after || before?.status === "paid" || after.status !== "paid") return;

    const { eventId, userId, ticketTypeId } = after;
    if (!eventId || !userId) return;

    await db.runTransaction(async (tx: FirebaseFirestore.Transaction): Promise<void> => {
        // Idempotency: 1 ticket per order
        const existing = await tx.get(
            db.collection("tickets").where("orderId", "==", event.params.orderId as string).limit(1)
        );
        if (!existing.empty) return;

        // Load event
        const evRef: FirebaseFirestore.DocumentReference<EventDoc> = db.collection("events").doc(eventId) as FirebaseFirestore.DocumentReference<EventDoc>;
        const evSnap: FirebaseFirestore.DocumentSnapshot<EventDoc> = await tx.get(evRef);
        if (!evSnap.exists) throw new Error("event_not_found");
        const ev: EventDoc = evSnap.data() as EventDoc;

        // Capacity check (root or per-type)
        const tt: TicketType | undefined = ticketTypeId ? (ev.ticketTypes || []).find((t: TicketType) => t.id === ticketTypeId) : undefined;
        const cap: number | null | undefined = tt ? tt.capacity : (ev.capacity ?? 0);
        const sold: number = tt ? (tt.sold ?? 0) : (ev.ticketsSoldCount ?? 0);
        if (cap && sold >= cap) {
            tx.update(db.collection("orders").doc(event.params.orderId as string), {
                status: "rejected", rejectedReason: "capacity_reached", reviewedAt: FieldValue.serverTimestamp()
            } as Partial<OrderDoc>);
            throw new Error("capacity_reached");
        }

        // Create ticket
        const ticketRef: FirebaseFirestore.DocumentReference<TicketDoc> = db.collection("tickets").doc() as FirebaseFirestore.DocumentReference<TicketDoc>;
        tx.set(ticketRef, {
            orderId: event.params.orderId as string, eventId, userId,
            ticketTypeId: ticketTypeId ?? null,
            qrCode: `ticket_${ticketRef.id}`, status: "valid", issuedAt: FieldValue.serverTimestamp(),
        } as TicketDoc);

        // Increment sold
        if (tt) {
            const newTypes: TicketType[] = (ev.ticketTypes || []).map((t: TicketType) =>
                t.id === ticketTypeId ? { ...t, sold: (t.sold ?? 0) + 1 } : t
            );
            tx.update(evRef, { ticketTypes: newTypes, updatedAt: FieldValue.serverTimestamp() } as FirebaseFirestore.UpdateData<EventDoc>);
        } else {
            tx.update(evRef, { ticketsSoldCount: FieldValue.increment(1), updatedAt: FieldValue.serverTimestamp() } as FirebaseFirestore.UpdateData<EventDoc>);
        }

        // Audit
        tx.set(db.collection("auditLogs").doc(), {
            actorId: "system_onOrderStatusPaid",
            action: "ticket_issued",
            target: { collection: "orders", id: event.params.orderId as string },
            meta: { eventId, userId, ticketTypeId: ticketTypeId ?? null },
            ts: FieldValue.serverTimestamp()
        } as AuditLog);
    });
});

/**
 * Triggered when a Membership document is created or updated.
 * Sets custom claims for a user if they become an officer of a club.
 */
interface MembershipDoc {
    userId?: string;
    clubId?: string;
    role?: string;
    status?: string;
}

interface MembershipPathParams { membershipId: string }

interface MembershipChange {
    before: FirebaseFirestore.DocumentSnapshot<MembershipDoc>;
    after: FirebaseFirestore.DocumentSnapshot<MembershipDoc>;
}

interface MembershipUpdatedEvent {
    data?: MembershipChange;
    params: MembershipPathParams;
}

interface ClubClaims {
    officerOfClub?: Record<string, boolean>;
    memberOfClub?: Record<string, boolean>;
    [key: string]: unknown;
}

interface ClaimsAuditLog {
    actorId: string;
    action: string;
    target: { collection: string; id: string };
    meta: { clubId?: string; role?: string; status?: string };
    ts: FirebaseFirestore.FieldValue;
}

export const onMembershipChange = onDocumentUpdated("memberships/{membershipId}", async (event: MembershipUpdatedEvent): Promise<void> => {
    const after: MembershipDoc | undefined = event.data?.after.data() as MembershipDoc | undefined;
    if (!after) return;
    const { userId, clubId, role, status } = after;
    if (!userId || !clubId) return;

    const user: import("firebase-admin/auth").UserRecord = await auth.getUser(userId);
    const claims = (user.customClaims || {}) as ClubClaims;
    const officerOfClub: Record<string, boolean> = { ...(claims.officerOfClub || {}) };
    const memberOfClub: Record<string, boolean> = { ...(claims.memberOfClub || {}) };

    const isApprovedMember: boolean = status === "approved";
    const isApprovedOfficer: boolean = isApprovedMember && role === "officer";
    let dirty: boolean = false;

    if (isApprovedOfficer && !officerOfClub[clubId]) { officerOfClub[clubId] = true; dirty = true; }
    if (!isApprovedOfficer && officerOfClub[clubId]) { delete officerOfClub[clubId]; dirty = true; }
    if (isApprovedMember && !memberOfClub[clubId]) { memberOfClub[clubId] = true; dirty = true; }
    if (!isApprovedMember && memberOfClub[clubId]) { delete memberOfClub[clubId]; dirty = true; }

    if (dirty) {
        await auth.setCustomUserClaims(userId, { ...claims, officerOfClub, memberOfClub } as ClubClaims);
        await db.collection("auditLogs").add({
            actorId: "system_onMembershipChange",
            action: "custom_claims_updated",
            target: { collection: "users", id: userId },
            meta: { clubId, role, status },
            ts: FieldValue.serverTimestamp()
        } as ClaimsAuditLog);
    }
});

/**
 * Triggered when a club approval request is updated to 'approved'.
 * Sets the corresponding club's status to 'active'.
 */
interface ApprovalRequestDoc {
    status?: string;
    type?: string;
    clubId?: string;
}

interface ApprovalRequestPathParams { requestId: string }

interface ApprovalRequestChange {
    before: FirebaseFirestore.DocumentSnapshot<ApprovalRequestDoc>;
    after: FirebaseFirestore.DocumentSnapshot<ApprovalRequestDoc>;
}

interface ApprovalRequestUpdatedEvent {
    data?: ApprovalRequestChange;
    params: ApprovalRequestPathParams;
}

interface ClubAudit {
    updatedAt?: FirebaseFirestore.FieldValue;
    lastEditedBy?: string;
}

interface ClubDoc {
    status?: string;
    audit?: ClubAudit;
}

export const onClubApproval = onDocumentUpdated("approvalRequests/{requestId}", async (event: ApprovalRequestUpdatedEvent): Promise<void> => {
    logger.info(`Processing approval request for: ${event.params.requestId}`);

    const before: ApprovalRequestDoc | undefined = event.data?.before.data() as ApprovalRequestDoc | undefined;
    const after: ApprovalRequestDoc | undefined = event.data?.after.data() as ApprovalRequestDoc | undefined;

    // Only proceed if the request was just approved and is for a club
    if (after?.status !== 'approved' || before?.status === 'approved' || after?.type !== 'club') {
        logger.info("Request not a club approval. Exiting.");
        return;
    }

    const { clubId } = after as ApprovalRequestDoc;
    if (!clubId) {
        logger.error("Approval request is missing a clubId.", after);
        return;
    }

    const clubRef: FirebaseFirestore.DocumentReference<ClubDoc> = db.collection("clubs").doc(clubId as string) as FirebaseFirestore.DocumentReference<ClubDoc>;
    try {
        await clubRef.update({
            status: "active",
            'audit.updatedAt': FieldValue.serverTimestamp(),
            'audit.lastEditedBy': 'system_onClubApproval',
        } as FirebaseFirestore.UpdateData<ClubDoc>);
        logger.info(`Successfully activated club ${clubId}.`);
    } catch (error) {
        logger.error(`Failed to activate club ${clubId}.`, error);
    }
});

/**
 * Triggered when a new file is uploaded to the 'receipts/' path in Storage.
 * Performs basic validation on the uploaded file.
 */
interface StorageObjectDataLite {
    name: string;
    contentType?: string | null;
}

interface ReceiptUploadEvent {
    bucket: string;
    data: StorageObjectDataLite;
}

type ReceiptContentType = "image/jpeg" | "image/png" | "application/pdf";

export const onReceiptUpload = onObjectFinalized({ bucket: process.env.GCLOUD_STORAGE_BUCKET }, async (event: ReceiptUploadEvent): Promise<void> => {
    const fileBucket: string = event.bucket;
    const filePath: string = event.data.name;
    const contentType: string | null | undefined = event.data.contentType;

    if (!filePath.startsWith("receipts/")) {
        // Not a receipt, ignore.
        return;
    }

    logger.info(`Processing receipt upload: ${filePath}`);

    // Basic validation checks
    const allowedTypes: ReadonlyArray<ReceiptContentType> = ["image/jpeg", "image/png", "application/pdf"];
    if (!contentType || !allowedTypes.includes(contentType as ReceiptContentType)) {
        logger.warn(`Invalid file type for receipt: ${contentType}. File: ${filePath}`);
        // Optional: Delete the file from storage
        // const bucket = getStorage().bucket(fileBucket);
        // await bucket.file(filePath).delete();
        // logger.info(`Deleted invalid receipt file: ${filePath}`);
        return;
    }

    logger.info(`Receipt ${filePath} passed basic validation.`);
    // In a real app, you might trigger an OCR process here
    // or update the corresponding Firestore order document.
});
