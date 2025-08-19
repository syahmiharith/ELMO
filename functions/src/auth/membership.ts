/**
 * @fileoverview Membership related Cloud Functions.
 * 
 * Handles user membership changes and updates custom claims accordingly.
 */

import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import { auth, db } from "../utils/firebase";
import { FieldValue } from "firebase-admin/firestore";
import { ClubClaims, MembershipDoc } from "../models/types";
import { logger } from "firebase-functions";
import { Change, FirestoreEvent } from "firebase-functions/v2/firestore";
import { QueryDocumentSnapshot } from "firebase-admin/firestore";

interface ClaimsAuditLog {
    actorId: string;
    action: string;
    target: { collection: string; id: string };
    meta: { clubId?: string; role?: string; status?: string };
    ts: FirebaseFirestore.FieldValue;
}

/**
 * Triggered when a Membership document is created or updated.
 * Sets custom claims for a user if they become an officer of a club.
 */
export const onMembershipChange = onDocumentUpdated(
    "memberships/{membershipId}",
    async (event: FirestoreEvent<Change<QueryDocumentSnapshot> | undefined, { membershipId: string }>): Promise<void> => {
        const after: MembershipDoc | undefined = event.data?.after.data() as MembershipDoc | undefined;
        if (!after) return;
        const { userId, clubId, role, status } = after;

        try {
            // Get current user claims
            const userRecord = await auth.getUser(userId);
            const claims = userRecord.customClaims as ClubClaims || {};
            const officerOfClub = claims.officerOfClub || {};
            const memberOfClub = claims.memberOfClub || {};

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

                logger.info(`Updated custom claims for user ${userId}`, {
                    isOfficer: isApprovedOfficer,
                    isMember: isApprovedMember
                });
            } else {
                logger.info(`No claim changes needed for user ${userId}`);
            }
        } catch (error) {
            logger.error(`Failed to update claims for user ${userId}`, error);
        }
    });
