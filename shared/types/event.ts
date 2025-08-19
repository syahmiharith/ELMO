/**
 * @fileoverview Event Types
 * 
 * Defines interfaces and types related to events and RSVPs.
 */

import { AuditFields, FlexibleTimestamp } from './common';

/**
 * Ticket type definition for both client and server
 */
export interface TicketType {
    id: string;
    name: string;
    description?: string;
    price: number;           // In minor units if using a payment processor
    currency?: string;
    capacity?: number | null;
    sold?: number;
    perUserLimit?: number;   // Default 1
}

/**
 * Base event fields shared between client and server
 */
export interface EventBase {
    id: string;
    clubId: string;
    name: string;
    description: string;
    location?: string;
    visibility: "public" | "campus" | "members" | "private";
    allowedUniversities?: string[];
    capacity?: number | null;
    ticketsSoldCount?: number;
    ticketTypes?: TicketType[];
    paymentMode?: "free" | "external";
    status: "published" | "draft" | "canceled" | "active";
    category?: string;
    waitlistEnabled?: boolean;
    requiresStudentVerification?: boolean;
    requiresDuesPaid?: boolean;
    organizerPayLink?: string;
    currency?: string;
    policyCaps?: { perUserWeekFree?: number };
}

/**
 * Client-side event type with frontend-specific fields and number timestamps
 */
export interface ClubEvent extends EventBase {
    title?: string;          // Alternative to name
    descriptionHtml?: string; // Sanitized HTML
    imageUrl: string;
    start: number;           // Timestamp in ms
    end: number;             // Timestamp in ms
    timezone: string;
    rsvpOpen: number;        // Timestamp in ms
    rsvpClose: number;       // Timestamp in ms
    tldr?: string[];         // Quick info bullets ["2 hours","Online","Free"]
    audit?: {
        createdAt: number;
        updatedAt: number;
        lastEditedBy: string;
    };

    // For existing components, to be refactored
    rsvps: string[];
    price: number;
}

/**
 * Server-side document type for Firestore with FieldValue support
 */
export interface EventDoc extends EventBase {
    start: FlexibleTimestamp;
    end: FlexibleTimestamp;
    rsvpOpen?: FlexibleTimestamp;
    rsvpClose?: FlexibleTimestamp;
    audit?: AuditFields;
}

/**
 * RSVP base fields shared between client and server
 */
export interface RsvpBase {
    id?: string;
    eventId: string;
    userId: string;
    status: "going" | "canceled" | "confirmed";
}

/**
 * Client-side RSVP with number timestamps
 */
export interface Rsvp extends RsvpBase {
    createdAt: number;
    updatedAt?: number;
    canceledAt?: number;
}

/**
 * Server-side RSVP document for Firestore
 */
export interface RsvpDoc extends RsvpBase {
    createdAt: FlexibleTimestamp;
    canceledAt?: FlexibleTimestamp;
}

/**
 * Additional event details (rich content)
 */
export interface EventDetail {
    descriptionHtml: string;
    agenda?: { time: string; activity: string }[];
    speakers?: { name: string; title: string; photoUrl: string }[];
    tags: string[];
}
