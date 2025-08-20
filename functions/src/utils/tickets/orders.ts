/**
 * @fileoverview Order utilities for the ticket system.
 * 
 * Provides functions for order creation, validation, and management.
 * Leverages the configurations defined in function-config.ts.
 */

import { orderConfig } from '../../config/function-config';
import { generateSecureTicketCode, validateTransactionId } from './security';
import { firestore } from 'firebase-admin';

// Order status types
export enum OrderStatus {
    PENDING = 'pending',      // Created but awaiting payment
    PAID = 'paid',            // Payment received
    COMPLETED = 'completed',  // Tickets issued
    EXPIRED = 'expired',      // Payment window expired
    CANCELLED = 'cancelled',  // Cancelled by user or admin
    REFUNDED = 'refunded'     // Refunded after payment
}

// Payment method types
export enum PaymentMethod {
    PAYPAL = 'paypal',
    BANK_TRANSFER = 'bank_transfer',
    STRIPE = 'stripe'
}

/**
 * Validates an order structure.
 * 
 * @param orderData The order data to validate
 * @returns Object with validation result and errors if any
 */
export function validateOrderData(orderData: any): {
    valid: boolean;
    errors: string[]
} {
    const errors: string[] = [];

    // Check required fields
    if (!orderData.userId) errors.push('Missing user ID');
    if (!orderData.eventId) errors.push('Missing event ID');
    if (!orderData.tickets || !Array.isArray(orderData.tickets) || orderData.tickets.length === 0) {
        errors.push('Missing or invalid tickets array');
    }

    // Check ticket quantity
    if (orderData.tickets && orderData.tickets.length > orderConfig.maxTicketsPerOrder) {
        errors.push(`Order exceeds maximum ${orderConfig.maxTicketsPerOrder} tickets per order`);
    }

    // Check payment method
    if (orderData.paymentMethod &&
        !orderConfig.paymentProviders.includes(orderData.paymentMethod)) {
        errors.push(`Invalid payment method: ${orderData.paymentMethod}`);
    }

    // Check each ticket
    if (orderData.tickets && Array.isArray(orderData.tickets)) {
        orderData.tickets.forEach((ticket: any, index: number) => {
            if (!ticket.ticketTypeId) {
                errors.push(`Ticket at index ${index} is missing ticketTypeId`);
            }
            if (ticket.quantity <= 0 || !Number.isInteger(ticket.quantity)) {
                errors.push(`Ticket at index ${index} has invalid quantity`);
            }
        });
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Calculates the expiration time for an order.
 * 
 * @param createdAt When the order was created
 * @returns Date when the order will expire
 */
export function calculateOrderExpiration(createdAt: Date): Date {
    const expirationDate = new Date(createdAt);
    expirationDate.setMinutes(
        expirationDate.getMinutes() + orderConfig.expirationTimeMinutes
    );
    return expirationDate;
}

/**
 * Checks if an order is expired.
 * 
 * @param expirationTime The order's expiration time
 * @returns True if the order is expired
 */
export function isOrderExpired(expirationTime: Date): boolean {
    return new Date() > expirationTime;
}

/**
 * Calculates the total amount for an order based on ticket types and quantities.
 * 
 * @param tickets Array of ticket type IDs and quantities
 * @param ticketTypes Map of ticket type data with prices
 * @returns Total amount as a number
 */
export function calculateOrderTotal(
    tickets: Array<{ ticketTypeId: string; quantity: number }>,
    ticketTypes: Map<string, { price: number; name: string }>
): number {
    return tickets.reduce((total, ticket) => {
        const ticketType = ticketTypes.get(ticket.ticketTypeId);
        if (!ticketType) return total;

        return total + (ticketType.price * ticket.quantity);
    }, 0);
}

/**
 * Validates payment data for an order.
 * 
 * @param provider The payment provider
 * @param transactionId The transaction ID to validate
 * @param amount The payment amount to verify
 * @param expectedAmount The expected amount for the order
 * @returns Valid or not, with error message
 */
export function validatePayment(
    provider: string,
    transactionId: string,
    amount: number,
    expectedAmount: number
): { valid: boolean; message?: string } {
    // Validate transaction ID format
    if (!validateTransactionId(provider, transactionId)) {
        return { valid: false, message: 'Invalid transaction ID format' };
    }

    // Validate amount (with small tolerance for currency conversion)
    const tolerance = 0.01; // 1% tolerance
    const difference = Math.abs(amount - expectedAmount) / expectedAmount;

    if (difference > tolerance) {
        return {
            valid: false,
            message: `Payment amount ${amount} does not match expected amount ${expectedAmount}`
        };
    }

    return { valid: true };
}

/**
 * Generates an order reference code.
 * 
 * @param orderId The Firestore order ID
 * @returns A formatted reference code
 */
export function generateOrderReference(orderId: string): string {
    // Use a prefix and the last 8 characters of the order ID
    return `ORD-${orderId.substring(orderId.length - 8).toUpperCase()}`;
}

/**
 * Updates an order status and handles related changes.
 * 
 * @param orderId The order ID
 * @param newStatus The new status to set
 * @param db Firestore instance
 * @param additionalData Any additional data to update
 * @returns Promise that resolves when the update is complete
 */
export async function updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    db: firestore.Firestore,
    additionalData: Record<string, any> = {}
): Promise<void> {
    const orderRef = db.collection('orders').doc(orderId);

    const updateData = {
        status: newStatus,
        updatedAt: firestore.FieldValue.serverTimestamp(),
        ...additionalData
    };

    await orderRef.update(updateData);
}
