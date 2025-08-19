"use strict";
/**
 * @fileoverview Error Codes
 *
 * Defines standard error codes used across both frontend and backend.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorCode = void 0;
/**
 * Standard error codes for the system
 * Used for consistent error handling between client and server
 */
var ErrorCode;
(function (ErrorCode) {
    // General errors
    ErrorCode["SERVER_ERROR"] = "server_error";
    ErrorCode["INVALID_REQUEST"] = "invalid_request";
    ErrorCode["UNAUTHORIZED"] = "unauthorized";
    ErrorCode["FORBIDDEN"] = "forbidden";
    ErrorCode["NOT_FOUND"] = "not_found";
    // Event-specific errors
    ErrorCode["EVENT_UNAVAILABLE"] = "event_unavailable";
    ErrorCode["OUTSIDE_WINDOW"] = "outside_window";
    ErrorCode["NOT_ELIGIBLE"] = "not_eligible";
    ErrorCode["ALREADY_JOINED"] = "already_joined";
    ErrorCode["SOLD_OUT"] = "sold_out";
    ErrorCode["WAITLIST_ONLY"] = "waitlist_only";
    ErrorCode["PER_USER_LIMIT"] = "per_user_limit";
    ErrorCode["POLICY_CAP_HIT"] = "policy_cap_hit";
    ErrorCode["DUES_REQUIRED"] = "dues_required";
    ErrorCode["BANNED"] = "banned";
    ErrorCode["CAPACITY_REACHED"] = "capacity_reached";
})(ErrorCode || (exports.ErrorCode = ErrorCode = {}));
