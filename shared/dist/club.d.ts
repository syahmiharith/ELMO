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
    authorId: string;
    author?: string;
    title: string;
    content?: string;
    bodyHtml: string;
    pinned?: boolean;
    createdAt: number;
    updatedAt?: number;
    date?: string;
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
    universityIds: string[];
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
    isApproved?: boolean;
    announcements?: ClubAnnouncement[];
    university?: {
        id: string;
        name: string;
    };
}
/**
 * Server-side document type for Firestore
 */
export interface ClubDoc extends ClubBase {
}
