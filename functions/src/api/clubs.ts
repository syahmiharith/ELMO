/**
 * @fileoverview Club-related callable functions
 * This file contains Firebase callable functions for club management
 */

import { onCall, HttpsError } from "firebase-functions/v2/https";
import { auth, db } from "../utils/firebase";
import { logger } from "firebase-functions";
import { FieldValue } from "firebase-admin/firestore";
import { ClubDoc, AuditFields } from "../models/types";
import { createAuditLog } from "../utils/audit";

interface CreateClubRequest {
    name: string;
    description?: string;
    logoUrl?: string;
    bannerUrl?: string;
    universityIds: string[];
}

interface UpdateClubRequest {
    clubId: string;
    name?: string;
    description?: string;
    logoUrl?: string;
    bannerUrl?: string;
    universityIds?: string[];
    isFeatured?: boolean;
}

interface ArchiveClubRequest {
    clubId: string;
    reason?: string;
}

/**
 * Creates a new club
 * Authorization: superAdmin only
 */
export const createClub = onCall({ enforceAppCheck: true }, async (request) => {
    const { name, description, logoUrl, bannerUrl, universityIds } = request.data as CreateClubRequest;
    const userId = request.auth?.uid;

    // Verify authentication
    if (!userId) {
        throw new HttpsError("unauthenticated", "User must be authenticated");
    }

    // Verify authorization (superAdmin only)
    const userRecord = await auth.getUser(userId);
    if (!userRecord.customClaims?.superAdmin) {
        throw new HttpsError("permission-denied", "Only super admins can create clubs");
    }

    // Validate input
    if (!name || !universityIds || universityIds.length === 0) {
        throw new HttpsError("invalid-argument", "Club must have a name and at least one university");
    }

    try {
        // Create club document
        const clubRef = db.collection("clubs").doc();
        const timestamp = FieldValue.serverTimestamp();

        const clubData: ClubDoc = {
            name,
            description: description || "",
            logoUrl: logoUrl || undefined,
            bannerUrl: bannerUrl || undefined,
            universityIds,
            status: "pending", // Starts as pending, needs approval
            isFeatured: false,
            audit: {
                createdAt: timestamp,
                updatedAt: timestamp,
                createdBy: userId,
                lastEditedBy: userId
            }
        };

        await clubRef.set(clubData);

        // Create approval request
        await db.collection("approvalRequests").add({
            type: "club",
            resourceId: clubRef.id,
            requesterId: userId,
            status: "pending",
            createdAt: timestamp
        });

        // Log the activity
        await createAuditLog(
            userId,
            "club_created",
            "clubs",
            clubRef.id,
            { name, universityIds }
        );

        logger.info(`Club created: ${clubRef.id} by user ${userId}`);
        return { success: true, clubId: clubRef.id };
    } catch (error) {
        logger.error("Failed to create club", error);
        throw new HttpsError("internal", "Failed to create club");
    }
});

/**
 * Updates an existing club
 * Authorization: superAdmin or officerOfClub[clubId]
 */
export const updateClub = onCall({ enforceAppCheck: true }, async (request) => {
    const { clubId, ...updateData } = request.data as UpdateClubRequest;
    const userId = request.auth?.uid;

    // Verify authentication
    if (!userId) {
        throw new HttpsError("unauthenticated", "User must be authenticated");
    }

    // Verify the club exists
    const clubRef = db.collection("clubs").doc(clubId);
    const clubDoc = await clubRef.get();
    if (!clubDoc.exists) {
        throw new HttpsError("not-found", "Club not found");
    }

    // Verify authorization (superAdmin or club officer)
    const userRecord = await auth.getUser(userId);
    const isAdmin = userRecord.customClaims?.superAdmin === true;
    const isOfficer = userRecord.customClaims?.officerOfClub?.[clubId] === true;

    if (!isAdmin && !isOfficer) {
        throw new HttpsError("permission-denied", "Only club officers or super admins can update clubs");
    }

    // Restrict which fields can be updated by officers vs admins
    const allowedOfficerFields = ["name", "description", "logoUrl", "bannerUrl"];
    const officerUpdate = Object.keys(updateData).every(key => allowedOfficerFields.includes(key));

    if (!isAdmin && !officerUpdate) {
        throw new HttpsError(
            "permission-denied",
            "Club officers can only update basic club information"
        );
    }

    try {
        // Prepare update data
        const timestamp = FieldValue.serverTimestamp();
        const updateObject: Partial<ClubDoc> = {
            ...updateData,
            audit: {
                updatedAt: timestamp,
                lastEditedBy: userId
            } as AuditFields
        };

        await clubRef.update(updateObject);

        // Log the activity
        await createAuditLog(
            userId,
            "club_updated",
            "clubs",
            clubId,
            updateData
        );

        logger.info(`Club updated: ${clubId} by user ${userId}`);
        return { success: true };
    } catch (error) {
        logger.error(`Failed to update club ${clubId}`, error);
        throw new HttpsError("internal", "Failed to update club");
    }
});

/**
 * Archives a club (soft delete)
 * Authorization: superAdmin only
 */
export const archiveClub = onCall({ enforceAppCheck: true }, async (request) => {
    const { clubId, reason } = request.data as ArchiveClubRequest;
    const userId = request.auth?.uid;

    // Verify authentication
    if (!userId) {
        throw new HttpsError("unauthenticated", "User must be authenticated");
    }

    // Verify authorization (superAdmin only)
    const userRecord = await auth.getUser(userId);
    if (!userRecord.customClaims?.superAdmin) {
        throw new HttpsError("permission-denied", "Only super admins can archive clubs");
    }

    // Verify the club exists
    const clubRef = db.collection("clubs").doc(clubId);
    const clubDoc = await clubRef.get();
    if (!clubDoc.exists) {
        throw new HttpsError("not-found", "Club not found");
    }

    try {
        const timestamp = FieldValue.serverTimestamp();
        await clubRef.update({
            status: "archived",
            audit: {
                updatedAt: timestamp,
                lastEditedBy: userId,
                archivedAt: timestamp,
                archivedBy: userId,
                archiveReason: reason || "No reason provided"
            } as AuditFields
        });

        // Log the activity
        await createAuditLog(
            userId,
            "club_archived",
            "clubs",
            clubId,
            { reason }
        );

        logger.info(`Club archived: ${clubId} by user ${userId}`);
        return { success: true };
    } catch (error) {
        logger.error(`Failed to archive club ${clubId}`, error);
        throw new HttpsError("internal", "Failed to archive club");
    }
});
