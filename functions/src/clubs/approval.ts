/**
 * @fileoverview Club approval related Cloud Functions.
 * 
 * Handles club approval requests and updates club status accordingly.
 */

import { onDocumentUpdated, FirestoreEvent, Change } from "firebase-functions/v2/firestore";
import { db } from "../utils/firebase";
import { FieldValue } from "firebase-admin/firestore";
import { ApprovalRequestDoc } from "../models/types";
import { logger } from "firebase-functions";
import { QueryDocumentSnapshot } from "firebase-admin/firestore";

interface ClubAudit {
    updatedAt?: FirebaseFirestore.FieldValue;
    lastEditedBy?: string;
}

interface ClubDoc {
    status?: string;
    audit?: ClubAudit;
}

/**
 * Triggered when a club approval request is updated to 'approved'.
 * Sets the corresponding club's status to 'active'.
 */
export const onClubApproval = onDocumentUpdated("approvalRequests/{requestId}", async (event: FirestoreEvent<Change<QueryDocumentSnapshot> | undefined, { requestId: string }>): Promise<void> => {
    logger.info(`Processing approval request for: ${event.params.requestId}`);

    const before: ApprovalRequestDoc | undefined = event.data?.before.data() as ApprovalRequestDoc | undefined;
    const after: ApprovalRequestDoc | undefined = event.data?.after.data() as ApprovalRequestDoc | undefined;

    // Check if request was approved and is for a club
    if (!before || !after || before.status === 'approved' || after.status !== 'approved' || after.type !== 'club') {
        logger.info('Not a newly approved club request. Skipping.');
        return;
    }

    // Get the club ID - use resourceId first, fall back to clubId if needed
    const clubId = after.resourceId || after.clubId;
    if (!clubId) {
        logger.error('No club ID found in approval request');
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
