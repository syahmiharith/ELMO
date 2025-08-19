/**
 * @fileoverview Main entry point for Cloud Functions.
 * 
 * This file exports all the Cloud Functions that should be deployed.
 * The actual implementation of each function is in its respective module.
 */

// Re-export all functions from their respective modules
// Firebase initialization is now handled in utils/firebase.ts
import "./utils/firebase";
import { logger } from "firebase-functions";

// Auth functions
export { onMembershipChange } from "./auth/membership";

// Club functions
export { onClubApproval } from "./clubs/approval";

// Event functions
export { onOrderStatusPaid } from "./events/tickets";

// Storage functions
export { onReceiptUpload } from "./storage/receipts";

// API functions - Guards
// Using the unified eligibility checking function and aliases for backward compatibility
export { checkEligibility, performEligibilityCheck, eventGuard, joinEventGuard, joinOrderGuard } from "./utils/guards";

// Club management API
import { createClub, updateClub, archiveClub } from "./api/clubs";
export { createClub, updateClub, archiveClub };

// Membership API
import {
    requestMembership,
    approveMembership,
    rejectMembership,
    leaveClub
} from "./api/memberships";
export {
    requestMembership,
    approveMembership,
    rejectMembership,
    leaveClub
};

// Event API
import {
    createEvent,
    updateEvent,
    cancelEvent,
    rsvpEvent,
    cancelRsvp
} from "./api/events";
export {
    createEvent,
    updateEvent,
    cancelEvent,
    rsvpEvent,
    cancelRsvp
};

// Order API
import {
    createOrder,
    attachReceipt,
    reviewOrder
} from "./api/orders";
export {
    createOrder,
    attachReceipt,
    reviewOrder
};

// Ticket API
import {
    getTicket,
    checkInTicket
} from "./api/tickets";
export {
    getTicket,
    checkInTicket
};

logger.info("Firebase Cloud Functions initialized successfully");
