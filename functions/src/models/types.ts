/**
 * @fileoverview Type definitions for the ClubNexus system.
 * Contains all shared interfaces for Firestore documents and function parameters.
 */

import { FieldValue } from "firebase-admin/firestore";

// User-related types
export interface UserDoc {
    displayName?: string;
    photoURL?: string;
    email?: string;
    universityIds?: string[];
    timezone?: string;
    preferredLanguage?: string;
    contact?: UserContact;
    visibility?: string;
    handles?: Record<string, string>;
    interests?: string[];
    consents?: Record<string, boolean>;
    verificationStatus?: string;
    audit?: AuditFields;
}

export interface UserContact {
    phone?: string;
    alternateEmail?: string;
}

// Club-related types
export interface ClubDoc {
    name: string;
    description?: string;
    logoUrl?: string;
    bannerUrl?: string;
    universityIds: string[];
    status: string;
    isFeatured?: boolean;
    audit?: AuditFields;
}

// Membership-related types
export interface MembershipDoc {
    userId: string;
    clubId: string;
    role?: string;
    status: string;
    duesStatus?: string;
    banned?: boolean;
    joinedAt?: FieldValue;
}

// Event-related types
export interface EventDoc {
    clubId: string;
    name: string;
    description?: string;
    location?: string;
    start: FieldValue | Date;
    end: FieldValue | Date;
    visibility: string;
    allowedUniversities?: string[];
    rsvpOpen?: FieldValue | Date;
    rsvpClose?: FieldValue | Date;
    capacity?: number | null;
    ticketsSoldCount?: number;
    ticketTypes?: TicketType[];
    paymentMode?: string;
    status: string;
    audit?: AuditFields;
}

export interface TicketType {
    id: string;
    name: string;
    description?: string;
    price?: number;
    currency?: string;
    capacity?: number | null;
    sold?: number;
}

// RSVP-related types
export interface RsvpDoc {
    eventId: string;
    userId: string;
    status: string;
    createdAt: FieldValue;
}

// Order-related types
export interface OrderDoc {
    eventId: string;
    userId: string;
    ticketTypeId?: string | null;
    amount?: number;
    currency?: string;
    method: string;
    status: string;
    reference?: string;
    receiptUrl?: string;
    createdAt: FieldValue;
    reviewedBy?: string;
    reviewedAt?: FieldValue;
    rejectedReason?: string;
}

// Ticket-related types
export interface TicketDoc {
    orderId: string;
    eventId: string;
    userId: string;
    ticketTypeId: string | null;
    qrCode: string;
    status: string;
    issuedAt: FieldValue;
}

// Approval request types
export interface ApprovalRequestDoc {
    type: string;
    clubId?: string;
    resourceId?: string;  // Generic ID of the resource being approved (club, event, etc.)
    requesterId: string;
    status: string;
    reason?: string;
    createdAt: FieldValue;
    decidedAt?: FieldValue;
}

// Audit log types
export interface AuditLog {
    actorId: string;
    action: string;
    target: {
        collection: string;
        id: string;
    };
    meta: Record<string, any>;
    ts: FieldValue;
}

// Club file metadata
export interface ClubFileDoc {
    clubId: string;
    name: string;
    type: string;
    size: number;
    uploadedBy: string;
    uploadedAt: FieldValue;
    visibility: string;
}

// Shared types
export interface AuditFields {
    createdAt?: FieldValue;
    updatedAt?: FieldValue;
    createdBy?: string;
    lastEditedBy?: string;
}

// Custom claims
export interface ClubClaims {
    superAdmin?: boolean;
    officerOfClub?: Record<string, boolean>;
    memberOfClub?: Record<string, boolean>;
    [key: string]: unknown;
}

// Error codes for the system
export enum ErrorCode {
    EVENT_UNAVAILABLE = "event_unavailable",
    OUTSIDE_WINDOW = "outside_window",
    NOT_ELIGIBLE = "not_eligible",
    ALREADY_JOINED = "already_joined",
    SOLD_OUT = "sold_out",
    WAITLIST_ONLY = "waitlist_only",
    PER_USER_LIMIT = "per_user_limit",
    POLICY_CAP_HIT = "policy_cap_hit",
    DUES_REQUIRED = "dues_required",
    BANNED = "banned",
    CAPACITY_REACHED = "capacity_reached",
}
