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
export const onOrderStatusPaid = onDocumentUpdated("orders/{orderId}", async (event) => {
    logger.info(`Processing order update for: ${event.params.orderId}`);

    const before = event.data?.before.data();
    const after = event.data?.after.data();

    // Exit if status didn't change to 'paid'
    if (before?.status === "paid" || after?.status !== "paid") {
        logger.info(`Order status not changed to 'paid'. Exiting.`);
        return;
    }

    const { eventId, userId, ticketTypeId } = after;
    if (!eventId || !userId) {
        logger.error("Order is missing eventId or userId.", after);
        return;
    }

    // Create a new Ticket
    const ticketRef = db.collection("tickets").doc();
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
        const eventRef = db.collection("events").doc(eventId);
        await eventRef.update({
            ticketsSoldCount: FieldValue.increment(1)
        });

        logger.info(`Successfully issued ticket ${ticketRef.id} for order ${event.params.orderId}`);
    } catch (error) {
        logger.error(`Failed to issue ticket for order ${event.params.orderId}`, error);
    }
});

/**
 * Triggered when a Membership document is created or updated.
 * Sets custom claims for a user if they become an officer of a club.
 */
export const onMembershipChange = onDocumentUpdated("memberships/{membershipId}", async (event) => {
    logger.info(`Processing membership update for: ${event.params.membershipId}`);

    const after = event.data?.after.data();
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
        const claims = userRecord.customClaims || {};
        const officerOfClub = claims.officerOfClub || {};

        let needsUpdate = false;
        const isOfficer = role === "officer" && status === "approved";

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
    } catch (error) {
        logger.error(`Failed to update custom claims for user ${userId}.`, error);
    }
});


/**
 * Triggered when a club approval request is updated to 'approved'.
 * Sets the corresponding club's status to 'active'.
 */
export const onClubApproval = onDocumentUpdated("approvalRequests/{requestId}", async (event) => {
    logger.info(`Processing approval request for: ${event.params.requestId}`);

    const before = event.data?.before.data();
    const after = event.data?.after.data();

    // Only proceed if the request was just approved and is for a club
    if (after?.status !== 'approved' || before?.status === 'approved' || after?.type !== 'club') {
        logger.info("Request not a club approval. Exiting.");
        return;
    }

    const { clubId } = after;
    if (!clubId) {
        logger.error("Approval request is missing a clubId.", after);
        return;
    }

    const clubRef = db.collection("clubs").doc(clubId);
    try {
        await clubRef.update({
            status: "active",
            'audit.updatedAt': FieldValue.serverTimestamp(),
            'audit.lastEditedBy': 'system_onClubApproval',
        });
        logger.info(`Successfully activated club ${clubId}.`);
    } catch (error) {
        logger.error(`Failed to activate club ${clubId}.`, error);
    }
});

/**
 * Triggered when a new file is uploaded to the 'receipts/' path in Storage.
 * Performs basic validation on the uploaded file.
 */
export const onReceiptUpload = onObjectFinalized({ bucket: process.env.GCLOUD_STORAGE_BUCKET }, async (event) => {
    const fileBucket = event.bucket;
    const filePath = event.data.name;
    const contentType = event.data.contentType;

    if (!filePath.startsWith("receipts/")) {
        // Not a receipt, ignore.
        return;
    }

    logger.info(`Processing receipt upload: ${filePath}`);

    // Basic validation checks
    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
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
