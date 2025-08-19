/**
 * @fileoverview Membership Types
 *
 * Defines interfaces and types related to club memberships.
 */
import { FlexibleTimestamp } from './common';
/**
 * Base membership information shared between server and client
 */
export interface MembershipBase {
    id?: string;
    clubId: string;
    userId: string;
    role?: "owner" | "officer" | "member";
    status: "pending" | "approved" | "rejected" | "archived";
    duesStatus?: "paid" | "unpaid" | "waived" | "required" | "late";
    banned?: boolean;
    notes?: string;
}
/**
 * Client-side membership type with timestamps as numbers
 */
export interface Membership extends MembershipBase {
    joinedAt: number;
    updatedAt?: number;
    approvedAt?: number;
    approvedBy?: string;
    rejectedAt?: number;
    rejectedBy?: string;
    rejectionReason?: string;
    archivedAt?: number;
}
/**
 * Server-side document type for Firestore with FieldValue support
 */
export interface MembershipDoc extends MembershipBase {
    joinedAt?: FlexibleTimestamp;
    approvedAt?: FlexibleTimestamp;
    approvedBy?: string;
    rejectedAt?: FlexibleTimestamp;
    rejectedBy?: string;
    rejectionReason?: string | null;
    archivedAt?: FlexibleTimestamp;
}
/**
 * Custom claims structure for Firebase Auth
 */
export interface ClubClaims {
    superAdmin?: boolean;
    officerOfClub?: Record<string, boolean>;
    memberOfClub?: Record<string, boolean>;
    [key: string]: unknown;
}
