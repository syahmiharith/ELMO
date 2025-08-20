/**
 * @fileoverview Payment processing utilities for the ticket system.
 * 
 * Provides functions for payment processing, verification, and management.
 * Leverages the configurations defined in function-config.ts.
 */

import { orderConfig } from '../../config/function-config';
import { validateTransactionId } from './security';
import { firestore } from 'firebase-admin';

/**
 * Validates payment provider is supported.
 * 
 * @param provider The payment provider to check
 * @returns Whether the provider is supported
 */
export function isValidPaymentProvider(provider: string): boolean {
    return orderConfig.paymentProviders.includes(provider);
}

/**
 * Gets the payment URL for a specific provider.
 * 
 * @param provider The payment provider
 * @returns URL for payments, or undefined if provider not supported
 */
export function getPaymentUrl(provider: string): string | undefined {
    if (!isValidPaymentProvider(provider)) {
        return undefined;
    }

    return orderConfig.paymentUrls[provider as keyof typeof orderConfig.paymentUrls];
}

/**
 * Verifies a payment transaction.
 * 
 * @param provider The payment provider (e.g., 'paypal', 'stripe')
 * @param transactionId The transaction ID from the provider
 * @param amount The payment amount
 * @param currency The payment currency
 * @returns Verification result
 */
export async function verifyPayment(
    provider: string,
    transactionId: string,
    amount: number,
    currency: string
): Promise<{
    verified: boolean;
    message?: string;
    details?: Record<string, any>;
}> {
    // Check provider is supported
    if (!isValidPaymentProvider(provider)) {
        return {
            verified: false,
            message: `Unsupported payment provider: ${provider}`
        };
    }

    // Check transaction ID format
    if (!validateTransactionId(provider, transactionId)) {
        return {
            verified: false,
            message: 'Invalid transaction ID format'
        };
    }

    // Check currency is supported (default to USD)
    if (currency.toUpperCase() !== orderConfig.defaultCurrency) {
        return {
            verified: false,
            message: `Unsupported currency: ${currency}`
        };
    }

    // In a real system, this would make API calls to the payment provider
    // For now, this is a mock implementation

    // Different handling based on provider
    switch (provider) {
        case 'paypal':
            return mockPayPalVerification(transactionId, amount);
        case 'stripe':
            return mockStripeVerification(transactionId, amount);
        case 'bank_transfer':
            return {
                verified: true,
                message: 'Bank transfer requires manual verification',
                details: {
                    requiresManualApproval: true,
                    transactionId
                }
            };
        default:
            return {
                verified: false,
                message: `No verification method for provider: ${provider}`
            };
    }
}

/**
 * Records a payment in the database.
 * 
 * @param db Firestore instance
 * @param orderId Order ID
 * @param paymentData Payment data
 * @returns The recorded payment data
 */
export async function recordPayment(
    db: firestore.Firestore,
    orderId: string,
    paymentData: {
        provider: string;
        transactionId: string;
        amount: number;
        currency: string;
        verified: boolean;
        verificationDetails?: any;
    }
): Promise<{ id: string; status: string }> {
    const paymentsRef = db.collection('payments');
    const paymentRef = paymentsRef.doc();

    const paymentRecord = {
        id: paymentRef.id,
        orderId,
        provider: paymentData.provider,
        transactionId: paymentData.transactionId,
        amount: paymentData.amount,
        currency: paymentData.currency,
        status: paymentData.verified ? 'verified' : 'pending',
        verificationDetails: paymentData.verificationDetails || {},
        requiresManualApproval:
            paymentData.provider === 'bank_transfer' ||
            !paymentData.verified,
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp()
    };

    await paymentRef.set(paymentRecord);

    return {
        id: paymentRef.id,
        status: paymentRecord.status
    };
}

/**
 * Mock implementation of PayPal verification.
 * In a real system, this would call PayPal's API.
 */
function mockPayPalVerification(
    transactionId: string,
    amount: number
): Promise<{
    verified: boolean;
    message?: string;
    details?: Record<string, any>;
}> {
    return Promise.resolve({
        verified: true,
        message: 'PayPal payment verified (mock)',
        details: {
            transactionId,
            amount,
            paymentSource: 'paypal',
            paymentTimestamp: new Date().toISOString()
        }
    });
}

/**
 * Mock implementation of Stripe verification.
 * In a real system, this would call Stripe's API.
 */
function mockStripeVerification(
    transactionId: string,
    amount: number
): Promise<{
    verified: boolean;
    message?: string;
    details?: Record<string, any>;
}> {
    return Promise.resolve({
        verified: true,
        message: 'Stripe payment verified (mock)',
        details: {
            transactionId,
            amount,
            paymentSource: 'stripe',
            paymentTimestamp: new Date().toISOString()
        }
    });
}
