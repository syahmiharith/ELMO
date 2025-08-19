// Auth comes from custom claims:
// request.auth.token.superAdmin === true
// request.auth.token.officerOfClub[clubId] === true

export type Role = "superAdmin" | "clubManager" | "member";

export interface Membership {
    id: string;              // `${clubId}_${userId}` or a random id
    clubId: string;
    userId: string;
    role: "owner" | "officer" | "member";
    status: "pending" | "approved" | "rejected" | "archived";
    duesStatus: "paid" | "unpaid" | "waived";
    banned?: boolean;
    notes?: string;          // officer-only
    joinedAt: number;        // ms
    updatedAt: number;       // ms
}

export interface InterestTag {
    id: string;              // slug
    name: string;
    synonyms?: string[];
    lang: "en" | "ms" | "ko";
    active: boolean;
    createdBy?: "system" | string; // admin uid
    redirectTo?: string;     // for merges
    createdAt?: number; updatedAt?: number;
}

export interface User {
    id: string;              // uid
    email: string;

    // User-editable
    name: { display: string; given?: string; family?: string };
    photoUrl?: string;
    preferredLanguage?: string;
    timezone?: string;
    contact?: { phone?: string; phoneVerified?: boolean };
    pronouns?: string;
    visibility?: { level: "private" | "club" | "public" };
    interests?: string[];    // InterestTag IDs
    handles?: { discord?: string; telegram?: string; slack?: string; instagram?: string };

    // Admin-locked after verification
    universityIds?: string[];
    studentId?: string;
    enrollmentStatus?: "active" | "leave" | "alumni";
    major?: string; department?: string; campus?: string;
    graduationYear?: number;
    verificationStatus?: "unverified" | "pending" | "verified";

    // Hints / convenience
    savedClubs?: string[];
    memberships?: Membership[];

    // Client-only hint (not authoritative)
    roleHint?: Role;

    // System/admin-only
    approverForClubs?: string[];
    eligibilityFlags?: string[];
    riskFlags?: string[];
    notifications?: { events: boolean; finance: boolean; approvals: boolean };
    consents?: { tos: number; privacy: number };
    audit?: { createdAt: number; updatedAt: number; lastEditedBy: string };
}

export interface University {
    id: string;
    name: string;
    code?: string;
    createdAt?: number; updatedAt?: number;
}

export interface Club {
    id: string;
    name: string;
    description: string;
    logoUrl?: string;
    bannerUrl?: string;
    universityIds: string[]; // supports inter-uni clubs
    visibility: "public" | "campus" | "private";
    status: "pendingApproval" | "active" | "archived";
    isFeatured: boolean;
    isApproved: boolean; // Keep for now for existing logic, will refactor to use status
    interestTags?: string[];
    createdBy: string;
    audit: { createdAt: number; updatedAt: number; lastEditedBy: string };
    announcements?: ClubAnnouncement[];
    university: { id: string; name: string; }; // Keep for now for existing logic
}

export interface ClubAnnouncement {
    id: string;
    clubId: string;
    authorId: string;        // uid
    author: string; // Keep for existing components
    title: string;
    content: string; // Keep for existing components
    bodyHtml: string;        // sanitized
    pinned?: boolean;
    createdAt: number; updatedAt?: number;
    date: string; // Keep for existing components
}

export interface TicketType {
    id: string;
    name: string;
    price: number;           // in minor units if you ever add PSP
    capacity: number;
    perUserLimit?: number;   // default 1
}

export interface ClubEvent {
    id: string;
    clubId: string;
    name: string;
    title?: string;
    description: string; // sanitized
    descriptionHtml?: string;
    imageUrl: string;
    category?: string;

    status: "published" | "draft" | "canceled";
    start: number; end: number; timezone: string;

    visibility: "public" | "campus" | "private";
    allowedUniversities?: string[];

    rsvpOpen: number; rsvpClose: number;

    // Capacity: choose ONE model. If ticketTypes used, drop root capacity.
    ticketTypes?: TicketType[];         // paid/free types mixed allowed
    // If you keep root capacity for simple free events:
    capacity?: number;

    waitlistEnabled: boolean;
    requiresStudentVerification: boolean;
    requiresDuesPaid: boolean;

    paymentMode: "free" | "external";
    organizerPayLink?: string;          // required if external
    currency?: string;                  // for display

    policyCaps?: { perUserWeekFree?: number };

    location: string;                    // "Online" or venue text
    tldr?: string[];                     // ["2 hours","Online","Free"]
    audit?: { createdAt: number; updatedAt: number; lastEditedBy: string };

    // For existing components, to be refactored
    rsvps: string[];
    price: number;
}


export interface Rsvp {
    id: string;
    eventId: string;
    userId: string;
    status: "going" | "canceled";
    createdAt: number; updatedAt?: number;
}

export interface Order {
    id: string;
    eventId: string;
    userId: string;
    amount: number;
    currency: string;
    method: "external";
    status: "initiated" | "pending_review" | "paid" | "rejected";
    reference?: string;
    receiptUrl?: string;                 // Storage path
    createdAt: number;
    reviewedBy?: string; reviewedAt?: number;
}

export interface Ticket {
    id: string;
    orderId: string;
    eventId: string;
    userId: string;
    ticketTypeId?: string;
    qrCode: string;                      // data or Storage path
    status: "valid" | "used" | "void";
    issuedAt: number;
}

export interface ClubDocument {
    id: string;
    clubId?: string;
    name: string;
    storagePath?: string;                 // gs://...
    url: string; // For existing components
    sizeBytes?: number;
    size: string; // For existing components
    mimeType?: string;
    visibility: "public" | "member" | "officer" | "manager";
    uploadedBy?: string;
    uploadedAt: string;
}

export interface ApprovalRequest {
    id: string;
    type: "club" | "event" | "budget" | "membership";
    clubId?: string;
    clubName: string;
    requesterId?: string;
    requesterName: string;
    approverId?: string;
    status: "pending" | "approved" | "rejected";
    reason?: string;
    createdAt?: number; decidedAt?: number;
    date: string;
    userId?: string;
}


export interface EventDetail {
    descriptionHtml: string;
    agenda?: { time: string; activity: string }[];
    speakers?: { name: string; title: string; photoUrl: string }[];
    tags: string[];
}
