/**
 * @fileoverview Common shared types
 * 
 * Contains common interfaces and types used across the application.
 */

import { FieldValue, Timestamp } from 'firebase-admin/firestore';

/**
 * Flexible timestamp type that works for both client and server
 * Can be FieldValue on server, Date on client, or number (timestamp)
 */
export type FlexibleTimestamp = FieldValue | Timestamp | Date | number;

/**
 * Audit fields for tracking document changes
 */
export interface AuditFields {
    createdAt?: FlexibleTimestamp;
    updatedAt?: FlexibleTimestamp;
    createdBy?: string;
    lastEditedBy?: string;
    canceledAt?: FlexibleTimestamp;
    canceledBy?: string;
    cancelReason?: string;
}

/**
 * University information
 */
export interface University {
    id: string;
    name: string;
    code?: string;
    createdAt?: number;
    updatedAt?: number;
}

/**
 * Interest tag for categorization
 */
export interface InterestTag {
    id: string;              // slug
    name: string;
    synonyms?: string[];
    lang: "en" | "ms" | "ko";
    active: boolean;
    createdBy?: "system" | string; // admin uid
    redirectTo?: string;     // for merges
    createdAt?: number;
    updatedAt?: number;
}
