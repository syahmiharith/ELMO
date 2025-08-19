/**
 * @fileoverview Main entry point for Cloud Functions.
 * 
 * This file exports all the Cloud Functions that should be deployed.
 * The actual implementation of each function is in its respective module.
 */

// Re-export all functions from their respective modules
// Firebase initialization is now handled in utils/firebase.ts
import "./utils/firebase";

// Auth functions
export { onMembershipChange } from "./auth/membership";

// Club functions
export { onClubApproval } from "./clubs/approval";

// Event functions
export { onOrderStatusPaid } from "./events/tickets";

// Storage functions
export { onReceiptUpload } from "./storage/receipts";

// API functions
export { joinOrderGuard } from "./api/guards";
