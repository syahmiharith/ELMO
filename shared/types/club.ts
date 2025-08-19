/**
 * @fileoverview Club Types
 * 
 * Defines interfaces and types related to clubs.
 */

import { AuditFields } from './common';

/**
 * Club announcement for members
 */
export interface ClubAnnouncement {
    id: string;
    clubId: string;
    authorId: string;        // uid
    author?: string;         // For display
    title: string;
    content?: string;        // Plain text
    bodyHtml: string;        // Sanitized HTML
    pinned?: boolean;
    createdAt: number;
    updatedAt?: number;
    date: string;            // For display - required for current usage
    clubName?: string;       // For display in aggregated lists
}

/**
 * Club document for both server and client
 */
export interface ClubBase {
    id: string;
    name: string;
    description: string;
    logoUrl?: string;
    bannerUrl?: string;
    universityIds: string[]; // Supports inter-uni clubs
    status: "pendingApproval" | "active" | "archived";
    isFeatured?: boolean;
    interestTags?: string[];
    createdBy?: string;
    audit?: AuditFields;
}

/**
 * Extended club interface for frontend with UI-specific fields
 */
export interface Club extends ClubBase {
    visibility: "public" | "campus" | "private";
    isApproved?: boolean;    // Legacy field for existing components
    announcements?: ClubAnnouncement[];
    university: { id: string; name: string; }; // For display in components
}

/**
 * Server-side document type for Firestore
 */
export interface ClubDoc extends ClubBase {
    // Server-specific fields
}
