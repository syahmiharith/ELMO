/**
 * @fileoverview Cloud Functions for the ClubNexus project.
 *
 * This file contains the server-side logic for critical operations such as
 * issuing tickets, managing user roles via custom claims, activating clubs
 * upon approval, and processing uploaded receipts.
 */

import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import { onObjectFinalized } from "firebase-functions/v2/storage";
import { logger } from "firebase-functions";

// Initialize Firebase Admin SDK
initializeApp();

const db = getFirestore();
const auth = getAuth();

/**
 * Triggered when an Order document's status is updated to 'paid'.
 * Validates the order and creates a corresponding Ticket document.
 */
interface Order {
    status?: string;
    eventId?: string;
    userId?: string;
    ticketTypeId?: string;
}

interface OrderEventParams {
    orderId: string;
}

interface OrderDocumentSnapshot<T> {
    data(): T;
}

interface OrderUpdateData<T> {
    before: OrderDocumentSnapshot<T>;
    after: OrderDocumentSnapshot<T>;
}

interface OrderUpdateEvent<T, P> {
    params: P;
    data?: OrderUpdateData<T>;
}

export const onOrderStatusPaid = onDocumentUpdated("orders/{orderId}", async (event: OrderUpdateEvent<Order, OrderEventParams>): Promise<void> => {
    logger.info(`Processing order update for: ${event.params.orderId}`);

    const before: any = event.data?.before.data();
    const after: any = event.data?.after.data();

    // Exit if status didn't change to 'paid'
    if (before?.status === "paid" || after?.status !== "paid") {
        logger.info(`Order status not changed to 'paid'. Exiting.`);
        return;
    }

    const { eventId, userId, ticketTypeId }: { eventId?: string; userId?: string; ticketTypeId?: string } = after;
    if (!eventId || !userId) {
        logger.error("Order is missing eventId or userId.", after);
        return;
    }

    // Create a new Ticket
    const ticketRef: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData> = db.collection("tickets").doc();
    try {
        await ticketRef.set({
            orderId: event.params.orderId,
            eventId,
            userId,
            ticketTypeId: ticketTypeId || null,
            qrCode: `ticket_${ticketRef.id}`, // Placeholder QR, can be generated
            status: "valid",
            issuedAt: FieldValue.serverTimestamp(),
        });

        // Optionally, increment a counter for tickets sold on the event
        const eventRef: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData> = db.collection("events").doc(eventId);
        await eventRef.update({
            ticketsSoldCount: FieldValue.increment(1)
        });

        logger.info(`Successfully issued ticket ${ticketRef.id} for order ${event.params.orderId}`);
    } catch (error: unknown) {
        logger.error(`Failed to issue ticket for order ${event.params.orderId}`, error);
    }
});

/**
 * Triggered when a Membership document is created or updated.
 * Sets custom claims for a user if they become an officer of a club.
 */
interface Membership {
    userId?: string;
    clubId?: string;
    role?: string;
    status?: string;
}

interface MembershipEventParams {
    membershipId: string;
}

interface MembershipDocumentSnapshot<T> {
    data(): T | undefined;
}

interface MembershipUpdateData<T> {
    before: MembershipDocumentSnapshot<T>;
    after: MembershipDocumentSnapshot<T>;
}

interface MembershipUpdateEvent<T, P> {
    params: P;
    data?: MembershipUpdateData<T>;
}

interface OfficerOfClubClaims {
    [clubId: string]: boolean;
}

interface CustomClaims {
    officerOfClub?: OfficerOfClubClaims;
    [key: string]: unknown;
}

export const onMembershipChange = onDocumentUpdated("memberships/{membershipId}", async (event: MembershipUpdateEvent<Membership, MembershipEventParams>): Promise<void> => {
    logger.info(`Processing membership update for: ${event.params.membershipId}`);

    const after: Membership | undefined = event.data?.after.data();
    if (!after) {
        logger.info("Membership document deleted, no action on claims.");
        return;
    }

    const { userId, clubId, role, status } = after;
    if (!userId || !clubId) {
        logger.error("Membership missing userId or clubId", after);
        return;
    }

    try {
        const userRecord = await auth.getUser(userId);
        const claims: CustomClaims = (userRecord.customClaims || {}) as CustomClaims;
        const officerOfClub: OfficerOfClubClaims = claims.officerOfClub || {};

        let needsUpdate: boolean = false;
        const isOfficer: boolean = role === "officer" && status === "approved";

        if (isOfficer && !officerOfClub[clubId]) {
            // Add claim if user is an approved officer and doesn't have the claim
            officerOfClub[clubId] = true;
            needsUpdate = true;
            logger.info(`Adding officer claim for user ${userId} for club ${clubId}.`);
        } else if (!isOfficer && officerOfClub[clubId]) {
            // Remove claim if user is no longer an approved officer
            delete officerOfClub[clubId];
            needsUpdate = true;
            logger.info(`Removing officer claim for user ${userId} for club ${clubId}.`);
        }

        if (needsUpdate) {
            await auth.setCustomUserClaims(userId, { ...claims, officerOfClub });
            logger.info(`Successfully updated custom claims for user ${userId}.`);
        } else {
            logger.info(`No custom claims change needed for user ${userId}.`);
        }
    } catch (error: unknown) {
        logger.error(`Failed to update custom claims for user ${userId}.`, error);
    }
});


/**
 * Triggered when a club approval request is updated to 'approved'.
 * Sets the corresponding club's status to 'active'.
 */
interface ApprovalRequest {
    status?: string;
    type?: string;
    clubId?: string;
}

interface ClubApprovalEventParams {
    requestId: string;
}

interface FirestoreDocumentSnapshot<T> {
    data(): T | undefined;
}

interface FirestoreUpdateData<T> {
    before: FirestoreDocumentSnapshot<T>;
    after: FirestoreDocumentSnapshot<T>;
}

interface FirestoreUpdateEvent<T, P> {
    params: P;
    data?: FirestoreUpdateData<T>;
}

export const onClubApproval = onDocumentUpdated("approvalRequests/{requestId}", async (event: FirestoreUpdateEvent<ApprovalRequest, ClubApprovalEventParams>): Promise<void> => {
    logger.info(`Processing approval request for: ${event.params.requestId}`);

    const before: ApprovalRequest = event.data?.before.data() as ApprovalRequest;
    const after: ApprovalRequest = event.data?.after.data() as ApprovalRequest;

    // Only proceed if the request was just approved and is for a club
    if (after?.status !== 'approved' || (before as ApprovalRequest | undefined)?.status === 'approved' || after?.type !== 'club') {
        logger.info("Request not a club approval. Exiting.");
        return;
    }

    const { clubId } = after;
    if (!clubId) {
        logger.error("Approval request is missing a clubId.", after);
        return;
    }

    const clubRef: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData> = db.collection("clubs").doc(clubId);
    try {
        await clubRef.update({
            status: "active",
            'audit.updatedAt': FieldValue.serverTimestamp(),
            'audit.lastEditedBy': 'system_onClubApproval',
        });
        logger.info(`Successfully activated club ${clubId}.`);
    } catch (error: unknown) {
        logger.error(`Failed to activate club ${clubId}.`, error);
    }
});

/**
 * Triggered when a new file is uploaded to the 'receipts/' path in Storage.
 * Performs basic validation on the uploaded file.
 */
interface StorageObjectMeta {
    name: string;
    contentType?: string;
    bucket?: string;
}

interface ReceiptUploadEvent {
    bucket: string;
    data: StorageObjectMeta;
}

export const onReceiptUpload = onObjectFinalized({ bucket: process.env.GCLOUD_STORAGE_BUCKET as string }, async (event: ReceiptUploadEvent): Promise<void> => {
    const fileBucket: string = event.bucket;
    const filePath: string = event.data.name;
    const contentType: string | undefined = event.data.contentType;

    if (!filePath.startsWith("receipts/")) {
        // Not a receipt, ignore.
        return;
    }

    logger.info(`Processing receipt upload: ${filePath}`);

    // Basic validation checks
    const allowedTypes: ReadonlyArray<string> = ["image/jpeg", "image/png", "application/pdf"];
    if (!contentType || !allowedTypes.includes(contentType)) {
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
