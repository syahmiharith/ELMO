/**
 * @fileoverview Helper functions for writing audit logs and handling errors.
 */

import { db } from "../utils/firebase";
import { FieldValue } from "firebase-admin/firestore";
import { logger } from "firebase-functions";
import { AuditLog } from "../models/types";

/**
 * Creates an audit log entry
 * @param actorId The ID of the user or system component that performed the action
 * @param action The action that was performed
 * @param targetCollection The collection that was affected
 * @param targetId The ID of the document that was affected
 * @param meta Additional metadata about the action
 * @returns A Promise that resolves when the audit log is created
 */
export async function createAuditLog(
    actorId: string,
    action: string,
    targetCollection: string,
    targetId: string,
    meta: Record<string, any>
): Promise<void> {
    try {
        await db.collection("auditLogs").add({
            actorId,
            action,
            target: {
                collection: targetCollection,
                id: targetId
            },
            meta,
            ts: FieldValue.serverTimestamp()
        } as AuditLog);
    } catch (error) {
        logger.error("Failed to create audit log", {
            actorId,
            action,
            target: { collection: targetCollection, id: targetId },
            error
        });
    }
}

/**
 * Creates a transaction-compatible audit log operation
 * @param tx The Firestore transaction
 * @param actorId The ID of the user or system component that performed the action
 * @param action The action that was performed
 * @param targetCollection The collection that was affected
 * @param targetId The ID of the document that was affected
 * @param meta Additional metadata about the action
 */
export function createAuditLogInTransaction(
    tx: FirebaseFirestore.Transaction,
    actorId: string,
    action: string,
    targetCollection: string,
    targetId: string,
    meta: Record<string, any>
): void {
    const auditLogRef = db.collection("auditLogs").doc();
    tx.set(auditLogRef, {
        actorId,
        action,
        target: {
            collection: targetCollection,
            id: targetId
        },
        meta,
        ts: FieldValue.serverTimestamp()
    } as AuditLog);
}

/**
 * Logs an error with structured context
 * @param message Error message
 * @param context Additional context for the error
 */
export function logError(message: string, context: Record<string, any>): void {
    logger.error(message, context);
}
