/**
 * @fileoverview Membership-related callable functions
 * This file contains Firebase callable functions for club membership management
 */

import { onCall, HttpsError } from "firebase-functions/v2/https";
import { auth, db } from "../utils/firebase";
import { logger } from "firebase-functions";
import { FieldValue } from "firebase-admin/firestore";
import { MembershipDoc } from "../models/types";
import { createAuditLog } from "../utils/audit";

interface MembershipRequest {
    clubId: string;
    message?: string;
}

interface MembershipActionRequest {
    membershipId: string;
    reason?: string;
}

/**
 * Requests to join a club
 * Authorization: Any authenticated user
 */
export const requestMembership = onCall({ enforceAppCheck: true }, async (request) => {
    const { clubId, message } = request.data as MembershipRequest;
    const userId = request.auth?.uid;

    // Verify authentication
    if (!userId) {
        throw new HttpsError("unauthenticated", "User must be authenticated");
    }

    try {
        // Check if club exists
        const clubRef = db.collection("clubs").doc(clubId);
        const clubDoc = await clubRef.get();
        if (!clubDoc.exists) {
            throw new HttpsError("not-found", "Club not found");
        }

        // Check if user already has a membership for this club
        const existingMemberships = await db.collection("memberships")
            .where("userId", "==", userId)
            .where("clubId", "==", clubId)
            .get();

        if (!existingMemberships.empty) {
            const membership = existingMemberships.docs[0].data() as MembershipDoc;

            // If existing membership is active or pending, don't create a new one
            if (membership.status === "approved" || membership.status === "pending") {
                throw new HttpsError(
                    "already-exists",
                    `You already have a ${membership.status} membership with this club`
                );
            }

            // If membership was previously canceled/rejected/archived, update it
            if (["canceled", "rejected", "archived"].includes(membership.status)) {
                const membershipRef = existingMemberships.docs[0].ref;
                await membershipRef.update({
                    status: "pending",
                    joinedAt: FieldValue.serverTimestamp(),
                    message: message || null
                });

                // Log the activity
                await createAuditLog(
                    userId,
                    "membership_requested",
                    "memberships",
                    membershipRef.id,
                    { clubId, previousStatus: membership.status }
                );

                logger.info(`Membership re-requested: ${membershipRef.id} for club ${clubId} by user ${userId}`);
                return { success: true, membershipId: membershipRef.id };
            }
        }

        // Create new membership request
        const membershipRef = db.collection("memberships").doc();
        const timestamp = FieldValue.serverTimestamp();

        const membershipData: MembershipDoc = {
            userId,
            clubId,
            status: "pending",
            role: "member", // Default role
            joinedAt: timestamp,
            message: message || null
        };

        await membershipRef.set(membershipData);

        // Log the activity
        await createAuditLog(
            userId,
            "membership_requested",
            "memberships",
            membershipRef.id,
            { clubId }
        );

        logger.info(`Membership requested: ${membershipRef.id} for club ${clubId} by user ${userId}`);
        return { success: true, membershipId: membershipRef.id };
    } catch (error) {
        logger.error(`Failed to request membership for club ${clubId}`, error);
        if (error instanceof HttpsError) {
            throw error;
        }
        throw new HttpsError("internal", "Failed to request membership");
    }
});

/**
 * Approves a membership request
 * Authorization: superAdmin or officerOfClub[clubId]
 */
export const approveMembership = onCall({ enforceAppCheck: true }, async (request) => {
    const { membershipId } = request.data as MembershipActionRequest;
    const userId = request.auth?.uid;

    // Verify authentication
    if (!userId) {
        throw new HttpsError("unauthenticated", "User must be authenticated");
    }

    try {
        // Get membership document
        const membershipRef = db.collection("memberships").doc(membershipId);
        const membershipDoc = await membershipRef.get();

        if (!membershipDoc.exists) {
            throw new HttpsError("not-found", "Membership request not found");
        }

        const membership = membershipDoc.data() as MembershipDoc;

        // Check if membership is pending
        if (membership.status !== "pending") {
            throw new HttpsError(
                "failed-precondition",
                `Cannot approve membership with status: ${membership.status}`
            );
        }

        // Verify authorization (superAdmin or club officer)
        const userRecord = await auth.getUser(userId);
        const isAdmin = userRecord.customClaims?.superAdmin === true;
        const isOfficer = userRecord.customClaims?.officerOfClub?.[membership.clubId] === true;

        if (!isAdmin && !isOfficer) {
            throw new HttpsError(
                "permission-denied",
                "Only club officers or super admins can approve memberships"
            );
        }

        // Update membership status
        await membershipRef.update({
            status: "approved",
            approvedAt: FieldValue.serverTimestamp(),
            approvedBy: userId
        });

        // The onMembershipChange trigger will handle the custom claims update

        // Log the activity
        await createAuditLog(
            userId,
            "membership_approved",
            "memberships",
            membershipId,
            { clubId: membership.clubId, memberId: membership.userId }
        );

        logger.info(`Membership approved: ${membershipId} by user ${userId}`);
        return { success: true };
    } catch (error) {
        logger.error(`Failed to approve membership ${membershipId}`, error);
        if (error instanceof HttpsError) {
            throw error;
        }
        throw new HttpsError("internal", "Failed to approve membership");
    }
});

/**
 * Rejects a membership request
 * Authorization: superAdmin or officerOfClub[clubId]
 */
export const rejectMembership = onCall({ enforceAppCheck: true }, async (request) => {
    const { membershipId, reason } = request.data as MembershipActionRequest;
    const userId = request.auth?.uid;

    // Verify authentication
    if (!userId) {
        throw new HttpsError("unauthenticated", "User must be authenticated");
    }

    try {
        // Get membership document
        const membershipRef = db.collection("memberships").doc(membershipId);
        const membershipDoc = await membershipRef.get();

        if (!membershipDoc.exists) {
            throw new HttpsError("not-found", "Membership request not found");
        }

        const membership = membershipDoc.data() as MembershipDoc;

        // Check if membership is pending
        if (membership.status !== "pending") {
            throw new HttpsError(
                "failed-precondition",
                `Cannot reject membership with status: ${membership.status}`
            );
        }

        // Verify authorization (superAdmin or club officer)
        const userRecord = await auth.getUser(userId);
        const isAdmin = userRecord.customClaims?.superAdmin === true;
        const isOfficer = userRecord.customClaims?.officerOfClub?.[membership.clubId] === true;

        if (!isAdmin && !isOfficer) {
            throw new HttpsError(
                "permission-denied",
                "Only club officers or super admins can reject memberships"
            );
        }

        // Update membership status
        await membershipRef.update({
            status: "rejected",
            rejectedAt: FieldValue.serverTimestamp(),
            rejectedBy: userId,
            rejectionReason: reason || null
        });

        // Log the activity
        await createAuditLog(
            userId,
            "membership_rejected",
            "memberships",
            membershipId,
            {
                clubId: membership.clubId,
                memberId: membership.userId,
                reason
            }
        );

        logger.info(`Membership rejected: ${membershipId} by user ${userId}`);
        return { success: true };
    } catch (error) {
        logger.error(`Failed to reject membership ${membershipId}`, error);
        if (error instanceof HttpsError) {
            throw error;
        }
        throw new HttpsError("internal", "Failed to reject membership");
    }
});

/**
 * Allows a user to leave a club
 * Authorization: The member themselves
 */
export const leaveClub = onCall({ enforceAppCheck: true }, async (request) => {
    const { clubId } = request.data as MembershipRequest;
    const userId = request.auth?.uid;

    // Verify authentication
    if (!userId) {
        throw new HttpsError("unauthenticated", "User must be authenticated");
    }

    try {
        // Find the user's membership for this club
        const memberships = await db.collection("memberships")
            .where("clubId", "==", clubId)
            .where("userId", "==", userId)
            .where("status", "==", "approved")
            .limit(1)
            .get();

        if (memberships.empty) {
            throw new HttpsError(
                "not-found",
                "You are not an active member of this club"
            );
        }

        const membershipRef = memberships.docs[0].ref;
        const membershipId = membershipRef.id;

        // Update membership status to archived
        await membershipRef.update({
            status: "archived",
            archivedAt: FieldValue.serverTimestamp()
        });

        // The onMembershipChange trigger will handle the custom claims update

        // Log the activity
        await createAuditLog(
            userId,
            "membership_left_club",
            "memberships",
            membershipId,
            { clubId }
        );

        logger.info(`User ${userId} left club ${clubId}, membership ${membershipId}`);
        return { success: true };
    } catch (error) {
        logger.error(`Failed to leave club ${clubId} for user ${userId}`, error);
        if (error instanceof HttpsError) {
            throw error;
        }
        throw new HttpsError("internal", "Failed to leave club");
    }
});
