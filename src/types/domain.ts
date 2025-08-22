

/**
 * @file This file contains the core domain types for the NexusClub application.
 * These types are used throughout the frontend to ensure data consistency.
 */
import { z } from 'zod';

// ==========
// ENUMS & LITERALS
// ==========

/** The membership model of a club */
export type ClubMembershipType = 'open' | 'invite-only';

/** Status of a user's membership in a club. */
export type MembershipStatus = 'pending' | 'approved' | 'rejected';

/** Role of a user within a club. */
export type ClubRole = 'Admin' | 'Member';

/** The user's relationship to an event RSVP. */
export type RsvpStatus = 'attending' | 'interested' | 'none';

/** The method by which a user can RSVP to an event. */
export type RsvpFlow = 'FREE' | 'PAID' | 'WAITLIST';

/** The status of a financial order. */
export type OrderStatus =
  | 'awaiting_payment'
  | 'under_review'
  | 'paid'
  | 'rejected'
  | 'expired';

/** The status of a digital ticket. */
export type TicketStatus = 'issued' | 'redeemed';

/** The current status of an event. */
export type EventStatus =
  | 'scheduled'
  | 'canceled'
  | 'postponed'
  | 'completed'
  | 'hot'
  | 'available'
  | 'sold_out'
  | 'pending'
  | 'ppmk';

/** Permissions for a file shared within a club. */
export type FilePermission = 'member_only' | 'admin_only';


// ==========
// Feedback & Proposal Enums
// ==========
export type FeedbackCategory = 'bug' | 'abuse' | 'idea' | 'other';
export type FeedbackStatus = 'open' | 'acknowledged' | 'in_progress' | 'resolved' | 'rejected' | 'escalated';
export type FeedbackAudience = 'admin' | 'super_admin';

export type ProposalType = 'budget' | 'policy' | 'event' | 'asset' | 'other';
export type ProposalStatus = 'draft' | 'submitted' | 'under_review' | 'needs_changes' | 'approved' | 'rejected' | 'scheduled' | 'implemented';
export type ApprovalDecision = 'approve' | 'reject';


/** Status of a policy document. */
export type PolicyStatus = 'draft' | 'published' | 'archived';


/** Type of action recorded in the activity log. */
export type ActivityLogAction =
  | 'APPROVED_MEMBERSHIP'
  | 'REJECTED_MEMBERSHIP'
  | 'UPDATED_POLICY'
  | 'ARCHIVED_CLUB';

// ==========
// CORE DOMAIN OBJECTS
// ==========

/** Represents a student club or organization. */
export interface Club {
  id: string;
  name: string;
  description: string;
  category: string;
  imageUrl: string;
  memberCount: number;
  isFeatured: boolean;
  announcements?: Announcement[];
  membershipType: ClubMembershipType;
  featuredContent?: {
    title: string;
    content: string;
  };
}

/** Represents a user of the application. */
export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  universityName?: string;
  studentId?: string;
  address?: Address;
  isPersonalized?: boolean;
}

/** A user with their club-specific role */
export type ClubMember = User & { role: ClubRole };


/** Represents a physical address. */
export interface Address {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
}


/** Represents the relationship between a User and a Club. */
export interface Membership {
  clubId: string;
  userId: string;
  status: MembershipStatus;
  role: ClubRole;
  joinedAt: string; // ISO 8601 date string
}

/** Represents an event hosted by a club. */
export interface Event {
  id: string;
  name: string;
  description: string;
  date: string; // ISO 8601 date string
  location: string;
  imageUrl: string;
  status: EventStatus;
  highlights?: string[];
  rsvpFlow: RsvpFlow;
  price: number; // Price in cents for PAID events
  clubId: string;
  viewerRsvpStatus: RsvpStatus; // The current user's RSVP status
  rsvpCount: number;
}

/** Represents a financial transaction for an event, membership, etc. */
export interface Order {
  id: string;
  userId: string;
  clubId: string;
  eventId: string | null; // Can be null for general-purpose orders
  itemName: string;
  total: number; // Amount in cents
  status: OrderStatus;
  createdAt: string; // ISO 8601 date string
  receiptUrl?: string;
  reviewedBy?: string; // Admin user ID
}

/** Represents a digital ticket for an event. */
export interface Ticket {
  id: string;
  orderId: string;
  userId: string;
  event: Pick<Event, 'id' | 'name' | 'date' | 'location' | 'price'>;
  qrCodeUrl: string;
  status: TicketStatus;
  issuedAt: string; // ISO 8601 date string
  redeemedAt?: string; // ISO 8601 date string
}

/** Represents a file shared within a club. */
export interface ClubFile {
  id: string;
  clubId: string;
  name: string;
  url: string;
  permission: FilePermission;
  uploadedAt: string; // ISO 8601 date string
  uploaderId: string; // User ID of the uploader
}

/** Represents an announcement posted in a club. */
export interface Announcement {
    id: string;
    clubId: string;
    title: string;
    content: string;
    author: Pick<User, 'id' | 'name' | 'avatarUrl'>;
    createdAt: string; // ISO 8601 date string
}


/** Represents a piece of feedback submitted by a club member. */
export interface Feedback {
    id: string;
    clubId: string;
    authorId: string;
    anonymous: boolean;
    audience: FeedbackAudience;
    title: string;
    body: string;
    category: FeedbackCategory;
    status: FeedbackStatus;
    assignedTo?: string; // User ID of the admin assigned to this feedback
    createdAt: number; // Unix timestamp
    updatedAt: number; // Unix timestamp
    lastCommentAt?: number; // Unix timestamp
}

/** Represents a formal proposal submitted by a club admin. */
export interface Proposal {
    id: string;
    clubId: string;
    proposerId: string;
    type: ProposalType;
    summary: string;
    details: string;
    attachments: { name: string; url: string; mime: string }[];
    status: ProposalStatus;
    requiredApprovers: string[]; // List of roles or specific user IDs
    approvals: {
        approverId: string;
        role: string;
        decision: ApprovalDecision;
        reason?: string;
        timestamp: number; // Unix timestamp
    }[];
    effectiveAt?: number; // Unix timestamp
    createdAt: number; // Unix timestamp
    updatedAt: number; // Unix timestamp
    lastCommentAt?: number; // Unix timestamp
}

/** Represents a comment on a feedback item or proposal. */
export interface Comment {
    id: string;
    authorId: string;
    body: string;
    createdAt: number; // Unix timestamp
}

/** Represents an official university-wide policy. */
export interface Policy {
  id: string;
  title: string;
  content: string;
  status: PolicyStatus;
  authorId: string;
  category: string;
  scope: string;
  createdAt: string; // ISO 8601 date string
  updatedAt: string; // ISO 8601 date string
}


/** Represents an entry in the administrative activity log. */
export interface ActivityLogEntry {
  id: string;
  timestamp: string; // ISO 8601 date string
  actor: {
    id: string;
    name: string;
    role: string;
  };
  action: ActivityLogAction;
  target: {
    id: string;
    name: string;
    url: string;
  };
  details: Record<string, any>;
  status: 'SUCCESS' | 'FAILED';
}


// ==========
// API QUERY & PAYLOAD TYPES
// ==========

/** Query parameters for listing clubs. */
export interface ClubQuery {
  search?: string;
  category?: string;
  sortBy?: 'relevance' | 'popularity';
  page?: number;
  pageSize?: number;
}

/** Query parameters for listing events. */
export interface EventQuery {
  search?: string;
  clubId?: string;
  dateRange?: { start: string; end: string };
  sortBy?: 'relevance' | 'popularity';
  page?: number;
  pageSize?: number;
  price?: 'free' | 'paid' | 'all';
}

/** Payload for creating a new club. */
export interface CreateClubPayload {
  name: string;
  description: string;
  category: string;
  imageUrl: string;
}

/** Payload for updating an existing club. */
export type UpdateClubPayload = Partial<CreateClubPayload>;

/** Payload for creating a new event. */
export interface CreateEventPayload {
  name: string;
  description: string;
  date: string; // ISO 8601 date string
  location: string;
  locationDetails?: {
    type: 'external-link' | 'other';
    link?: string;
  };
  imageUrl: string;
  status: EventStatus;
  rsvpFlow: RsvpFlow;
  price: number; // Required even if FREE
  rsvpCount: number;
}

/** Payload for sending an RSVP. */
export interface RsvpPayload {
    eventId: string;
    quantity: number;
}


/** Payload for updating an existing event. */
export type UpdateEventPayload = Partial<CreateEventPayload>;

/** Payload for attaching a receipt to an order. */
export interface AttachReceiptPayload {
  orderId: string;
  receiptDataUri: string;
}

/** Payload for reviewing an order. */
export interface ReviewOrderPayload {
  orderId: string;
  isApproved: boolean;
  rejectionReason?: string;
}

/** Payload for updating a user's email address. */
export interface UpdateEmailPayload {
  newEmail: string;
}


/** Payload for updating a user's contact information. */
export interface UpdateContactInfoPayload {
    firstName?: string;
    lastName?: string;
    phone?: string;
    universityName?: string;
    studentId?: string;
    address?: Address;
}

/** Payload for uploading a new file to a club. */
export interface UploadFilePayload {
    name: string;
    fileDataUri: string;
    permission: FilePermission;
}

/** Response for downloading a club file. */
export interface DownloadClubFileResponse {
    downloadUrl: string;
}

/** Payload for creating a new feedback item. */
export type CreateFeedbackPayload = Omit<Feedback, 'id' | 'clubId' | 'authorId' | 'status' | 'createdAt' | 'updatedAt'>;

/** Payload for creating a new proposal. */
export type CreateProposalPayload = Omit<Proposal, 'id' | 'clubId' | 'proposerId' | 'status' | 'approvals' | 'createdAt' | 'updatedAt'>;

/** Payload for creating a new comment. */
export interface CreateCommentPayload {
    body: string;
}

/** Payload for creating a new announcement. */
export interface CreateAnnouncementPayload {
    title: string;
    content: string;
    author: Pick<User, 'id' | 'name' | 'avatarUrl'>;
}

/** Payload for creating a new policy. */
export interface CreatePolicyPayload {
    title: string;
    content: string;
    category: string;
    scope: string;
    authorId: string;
}

/** Payload for updating an existing policy. */
export type UpdatePolicyPayload = Partial<Omit<Policy, 'id' | 'authorId' | 'createdAt'>>;


// ==========
// Genkit Flow Schemas
// ==========
export const UploadImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo to be uploaded, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type UploadImageInput = z.infer<typeof UploadImageInputSchema>;

export const UploadImageOutputSchema = z.object({
  imageUrl: z.string().url().describe('The public URL of the uploaded image.'),
});
export type UploadImageOutput = z.infer<typeof UploadImageOutputSchema>;
