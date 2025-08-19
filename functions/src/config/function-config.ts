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
