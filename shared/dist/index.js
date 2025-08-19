"use strict";
/**
 * @fileoverview Shared Type Definitions
 *
 * This file exports all shared types used across both frontend and backend.
 * These types ensure consistency between client and server implementations.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
// Re-export all shared types
__exportStar(require("./user"), exports);
__exportStar(require("./club"), exports);
__exportStar(require("./event"), exports);
__exportStar(require("./membership"), exports);
__exportStar(require("./order"), exports);
__exportStar(require("./common"), exports);
__exportStar(require("./error-codes"), exports);
