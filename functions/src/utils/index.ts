/**
 * @fileoverview Utils Module Index
 * 
 * Exports utility functions and helpers for use across the application.
 */

// Export Firebase utilities
export * from './firebase';

// Export Guard functions
export {
    performEligibilityCheck,
    checkEligibility,
    eventGuard,
    joinEventGuard,
    joinOrderGuard
} from './guards';

// Export other utility functions as needed
