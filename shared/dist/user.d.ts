/**
 * @fileoverview User Types
 *
 * Defines interfaces and types related to users.
 */
import { AuditFields } from './common';
/**
 * User roles in the system
 */
export type Role = "superAdmin" | "clubManager" | "member";
/**
 * User contact information
 */
export interface UserContact {
    phone?: string;
    alternateEmail?: string;
    phoneVerified?: boolean;
}
/**
 * User document with common fields for both frontend and backend
 */
export interface UserBase {
    id: string;
    displayName?: string;
    photoURL?: string;
    email?: string;
    universityIds?: string[];
    timezone?: string;
    preferredLanguage?: string;
    contact?: UserContact;
    visibility?: {
        level: "private" | "club" | "public";
    };
    handles?: Record<string, string>;
    interests?: string[];
    consents?: Record<string, boolean>;
    verificationStatus?: "unverified" | "pending" | "verified";
    enrollmentStatus?: "active" | "leave" | "alumni";
    studentId?: string;
    major?: string;
    department?: string;
    campus?: string;
    graduationYear?: number;
    pronouns?: string;
    audit?: AuditFields;
}
/**
 * Extended user interface for frontend use with client-specific fields
 */
export interface User extends UserBase {
    name?: {
        display: string;
        given?: string;
        family?: string;
    };
    savedClubs?: string[];
    roleHint?: Role;
    approverForClubs?: string[];
    eligibilityFlags?: string[];
    riskFlags?: string[];
    notifications?: {
        events: boolean;
        finance: boolean;
        approvals: boolean;
    };
}
/**
 * Server-side document type for Firestore
 */
export interface UserDoc extends UserBase {
}
