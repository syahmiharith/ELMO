/**
 * @fileoverview Order Types
 * 
 * Defines interfaces and types related to orders and tickets.
 */

import { FlexibleTimestamp } from './common';

/**
 * Common order status values
 */
export type OrderStatus = 'pending' | 'awaiting_review' | 'approved' | 'rejected' | 'canceled' | 'paid' | 'initiated' | 'pending_review';

/**
 * Base order fields shared between client and server
 */
export interface OrderBase {
    id: string;
    eventId: string;
    userId: string;
    clubId: string;
    ticketTypeId?: string | null;
    ticketTypeName?: string;
    quantity?: number;
    pricePerTicket?: number;
    totalPrice?: number;
    amount?: number;
    currency?: string;
    method?: string;
    status: string;
    notes?: string;
    reference?: string;
    receiptUrl?: string;
    ticketIds?: string[];
}

/**
 * Client-side order with number timestamps
 */
export interface Order extends OrderBase {
    createdAt: number;
    reviewedBy?: string;
    reviewedAt?: number;
    updatedAt?: number;
}

/**
 * Server-side document type for Firestore
 */
export interface OrderDoc extends OrderBase {
    createdAt: FlexibleTimestamp;
    updatedAt?: FlexibleTimestamp;
    reviewedBy?: string;
    reviewedAt?: FlexibleTimestamp;
    rejectedReason?: string;
}

/**
 * Base ticket fields shared between client and server
 */
export interface TicketBase {
    id: string;
    orderId: string;
    eventId: string;
    clubId: string;
    userId: string;
    ticketTypeId: string | null;
    ticketTypeName?: string;
    qrCode?: string;
    status: string;
}

/**
 * Client-side ticket with number timestamps
 */
export interface Ticket extends TicketBase {
    issuedAt: number;
    createdAt?: number;
    checkedInAt?: number;
    checkedInBy?: string;
}

/**
 * Server-side document type for Firestore
 */
export interface TicketDoc extends TicketBase {
    issuedAt?: FlexibleTimestamp;
    createdAt?: FlexibleTimestamp;
    checkedInAt?: FlexibleTimestamp;
    checkedInBy?: string;
}

/**
 * Approval request for administrative workflows
 */
export interface ApprovalRequestBase {
    id: string;
    type: "club" | "event" | "budget" | "membership";
    clubId?: string;
    resourceId?: string;     // Generic ID of the resource being approved
    requesterId: string;
    status: "pending" | "approved" | "rejected";
    reason?: string;
}

/**
 * Client-side approval request
 */
export interface ApprovalRequest extends ApprovalRequestBase {
    clubName?: string;
    requesterName?: string;
    approverId?: string;
    createdAt?: number;
    decidedAt?: number;
    date?: string;
    userId?: string;
}

/**
 * Server-side document type for Firestore
 */
export interface ApprovalRequestDoc extends ApprovalRequestBase {
    createdAt: FlexibleTimestamp;
    decidedAt?: FlexibleTimestamp;
}

/**
 * Club file metadata
 */
export interface ClubFileBase {
    id: string;
    clubId: string;
    name: string;
    type: string;
    size: number;
    visibility: "public" | "member" | "officer" | "manager";
}

/**
 * Client-side club document
 */
export interface ClubDocument {
    id: string;
    clubId: string;
    name: string;
    type?: string; // Make optional for backward compatibility
    url: string;
    size: string; // For existing components (formatted size)
    sizeBytes?: number; // Actual size in bytes
    visibility: "public" | "member" | "officer" | "manager";
    uploadedBy?: string;
    uploadedAt: string;
}

/**
 * Server-side document type for Firestore
 */
export interface ClubFileDoc extends ClubFileBase {
    storagePath?: string;
    mimeType?: string;
    uploadedBy: string;
    uploadedAt: FlexibleTimestamp;
}
