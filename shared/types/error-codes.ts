/**
 * @fileoverview Error Codes
 * 
 * Defines standard error codes used across both frontend and backend.
 */

/**
 * Standard error codes for the system
 * Used for consistent error handling between client and server
 */
export enum ErrorCode {
    // General errors
    SERVER_ERROR = "server_error",
    INVALID_REQUEST = "invalid_request",
    UNAUTHORIZED = "unauthorized",
    FORBIDDEN = "forbidden",
    NOT_FOUND = "not_found",

    // Event-specific errors
    EVENT_UNAVAILABLE = "event_unavailable",
    OUTSIDE_WINDOW = "outside_window",
    NOT_ELIGIBLE = "not_eligible",
    ALREADY_JOINED = "already_joined",
    SOLD_OUT = "sold_out",
    WAITLIST_ONLY = "waitlist_only",
    PER_USER_LIMIT = "per_user_limit",
    POLICY_CAP_HIT = "policy_cap_hit",
    DUES_REQUIRED = "dues_required",
    BANNED = "banned",
    CAPACITY_REACHED = "capacity_reached",
}
