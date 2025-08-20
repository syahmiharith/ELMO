/**
 * @fileoverview Configuration for Firebase Functions
 * Contains shared options for functions like memory, timeouts, CORS, etc.
 */

import * as corsModule from "cors";

// Shared runtime options for all functions
export const functionRuntimeOptions = {
    memory: "256MB",
    timeoutSeconds: 60,
    minInstances: 0,
    maxInstances: 10,
    // Firebase v1 functions are regional by default
    region: "us-central1",
};

// CORS configuration for HTTP functions
export const corsOptions = {
    origin: true, // Allow requests from any origin
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    credentials: true,
    maxAge: 86400 // 24 hours
};

// Create a CORS middleware instance
export const corsMiddleware = corsModule.default(corsOptions);

/**
 * Ticket System Configuration
 */

// Order settings
export const orderConfig = {
    // Time until an order expires if payment is not received (in minutes)
    expirationTimeMinutes: 30,

    // Maximum number of tickets per order
    maxTicketsPerOrder: 10,

    // Default currency
    defaultCurrency: "USD",

    // Payment providers supported
    paymentProviders: ["paypal", "bank_transfer", "stripe"],

    // Configure payment provider URLs (placeholders - would be environment variables in production)
    paymentUrls: {
        paypal: "https://www.paypal.com/paypalme/yourorganization",
        stripe: "https://buy.stripe.com/yourlink"
    }
};

// Receipt upload settings
export const receiptConfig = {
    // Maximum file size in bytes (5MB)
    maxFileSizeBytes: 5 * 1024 * 1024,

    // Allowed file types
    allowedFileTypes: ["image/jpeg", "image/png", "image/webp", "application/pdf"],

    // Storage path for receipts
    storagePath: "receipts/{orderId}/{fileName}",

    // Retention period in days
    retentionDays: 90
};

// Ticket settings
export const ticketConfig = {
    // Length of the ticket code
    codeLength: 12,

    // QR code settings
    qrCode: {
        errorCorrectionLevel: "H", // High
        margin: 1,
        width: 300,
        color: {
            dark: "#000000",
            light: "#FFFFFF"
        }
    },

    // Storage path for QR codes
    qrStoragePath: "tickets/qr",

    // Check-in window (how many hours before/after event start time)
    checkInWindowHours: {
        before: 2,
        after: 8
    }
};

// Rate limiting settings
export const rateLimitConfig = {
    createOrder: {
        maxCalls: 20,       // Maximum number of calls
        periodSeconds: 60,  // In this time period (seconds)
        blockSeconds: 300   // Block for this duration if exceeded
    },
    uploadReceipt: {
        maxCalls: 10,
        periodSeconds: 60,
        blockSeconds: 600
    },
    checkInTicket: {
        maxCalls: 120,      // Higher limit for event check-in
        periodSeconds: 60,
        blockSeconds: 300
    },
    genericApi: {
        maxCalls: 50,
        periodSeconds: 60,
        blockSeconds: 300
    }
};

// Security settings
export const securityConfig = {
    // Validation patterns for external transaction IDs
    transactionIdPatterns: {
        paypal: /^[0-9A-Z]{17}$/i,                   // PayPal transaction IDs
        stripe: /^(ch|py|pi|seti)_[a-zA-Z0-9]{24}$/, // Stripe charge/payment IDs
        bank_transfer: /^[0-9]{6,20}$/,              // Simple bank transfer reference
        default: /^[a-zA-Z0-9_\-]{6,50}$/            // Generic fallback pattern
    },

    // Character set for secure codes (avoiding ambiguous characters)
    secureCodeCharSet: "ABCDEFGHJKLMNPQRSTUVWXYZ23456789",

    // Admin role name in custom claims
    adminRoleName: "admin",

    // Event officer role prefix in custom claims
    officerRolePrefix: "officer_"
};
