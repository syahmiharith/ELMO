/**
 * @fileoverview Firebase initialization and global configuration.
 * This file sets up the Firebase Admin SDK and exports commonly used services.
 */

import { setGlobalOptions } from "firebase-functions/v2";
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

// Initialize Firebase Admin SDK
const app = initializeApp();

// Set global options for Cloud Functions
setGlobalOptions({
    region: "asia-southeast1",
    maxInstances: 10,
    timeoutSeconds: 60,
    memory: "256MiB"
});

// Export commonly used services
export const db = getFirestore();
export const auth = getAuth();
export const storage = getStorage();

export default app;
