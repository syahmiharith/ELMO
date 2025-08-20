/**
 * @file This file contains the core domain types for the NexusClub application.
 * These types are used throughout the frontend to ensure data consistency.
 */

// ==========
// ENUMS & LITERALS
// ==========

/** Status of a user's membership in a club. */
export type MembershipStatus = 'pending' | 'approved' | 'rejected';

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
  | 'pending';

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
  club: Pick<Club, 'id' | 'name'>;
  viewerRsvpStatus: RsvpStatus; // The current user's RSVP status
  rsvpCount: number;
}

/** Represents a financial transaction for an event, membership, etc. */
export interface Order {
  id: string;
  userId: string;
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
  event: Pick<Event, 'id' | 'name' | 'date' | 'location'>;
  qrCodeUrl: string;
  status: TicketStatus;
  issuedAt: string; // ISO 8601 date string
  redeemedAt?: string; // ISO 8601 date string
}

// ==========
// API QUERY & PAYLOAD TYPES
// ==========

/** Query parameters for listing clubs. */
export interface ClubQuery {
  search?: string;
  category?: string;
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
  imageUrl: string;
  status: EventStatus;
  rsvpFlow: RsvpFlow;
  price: number; // Required even if FREE
  rsvpCount: number;
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
