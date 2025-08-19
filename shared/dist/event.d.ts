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
    price: number;
    currency?: string;
    capacity?: number | null;
    sold?: number;
    perUserLimit?: number;
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
    policyCaps?: {
        perUserWeekFree?: number;
    };
}
/**
 * Client-side event type with frontend-specific fields and number timestamps
 */
export interface ClubEvent extends EventBase {
    title?: string;
    descriptionHtml?: string;
    imageUrl: string;
    start: number;
    end: number;
    timezone: string;
    rsvpOpen: number;
    rsvpClose: number;
    tldr?: string[];
    audit?: {
        createdAt: number;
        updatedAt: number;
        lastEditedBy: string;
    };
    rsvps?: string[];
    price?: number;
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
    agenda?: {
        time: string;
        activity: string;
    }[];
    speakers?: {
        name: string;
        title: string;
        photoUrl: string;
    }[];
    tags: string[];
}
