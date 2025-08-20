/**
 * @fileoverview QR code generation and validation utilities for tickets.
 * 
 * Provides functions to generate, validate, and manage QR codes for tickets.
 * These utilities leverage the configurations defined in function-config.ts.
 */

// Note: You'll need to run "npm install qrcode" and "@types/qrcode" in the functions directory
import * as QRCode from 'qrcode';
import { ticketConfig } from '../../config/function-config';
import { hashFileBuffer } from './security';

/**
 * Generates QR code data as a Buffer for a given ticket.
 * 
 * @param ticketId Ticket ID to encode in the QR code
 * @param secureCode Secure verification code for the ticket
 * @param eventId ID of the event this ticket is for
 * @returns Promise resolving to Buffer containing QR code image data
 */
export async function generateTicketQRCode(
    ticketId: string,
    secureCode: string,
    eventId: string
): Promise<Buffer> {
    // Create the data to encode in the QR code
    const qrData = JSON.stringify({
        tid: ticketId,
        eid: eventId,
        code: secureCode,
        v: '1.0' // Version of QR code format
    });

    // Generate QR code with configured options
    const qrBuffer = await QRCode.toBuffer(qrData, {
        errorCorrectionLevel: ticketConfig.qrCode.errorCorrectionLevel as 'L' | 'M' | 'Q' | 'H',
        margin: ticketConfig.qrCode.margin,
        width: ticketConfig.qrCode.width,
        color: ticketConfig.qrCode.color,
        type: 'png'
    });

    return qrBuffer;
}

/**
 * Extracts and validates data from a QR code.
 * 
 * @param qrData The string data extracted from a QR code scan
 * @returns Parsed ticket data or null if invalid
 */
export function parseTicketQRCode(qrData: string): {
    ticketId: string;
    eventId: string;
    secureCode: string;
    version: string;
} | null {
    try {
        const data = JSON.parse(qrData);

        // Validate required fields
        if (!data.tid || !data.eid || !data.code) {
            return null;
        }

        return {
            ticketId: data.tid,
            eventId: data.eid,
            secureCode: data.code,
            version: data.v || '1.0'
        };
    } catch (error) {
        return null;
    }
}

/**
 * Generates a storage path for a ticket QR code.
 * 
 * @param ticketId The ticket ID
 * @param eventId The event ID
 * @returns Full storage path for the QR code
 */
export function getQRCodeStoragePath(ticketId: string, eventId: string): string {
    return `${ticketConfig.qrStoragePath}/${eventId}/${ticketId}.png`;
}

/**
 * Validates a QR code image hash against a stored hash.
 * 
 * @param qrBuffer The QR code buffer to validate
 * @param storedHash The previously stored hash
 * @returns True if valid, false otherwise
 */
export function validateQRCodeHash(qrBuffer: Buffer, storedHash: string): boolean {
    const computedHash = hashFileBuffer(qrBuffer);
    return computedHash === storedHash;
}

/**
 * Creates a data URL for a QR code buffer (useful for embedding in PDFs).
 * 
 * @param qrBuffer The QR code buffer
 * @returns Data URL string
 */
export function qrCodeToDataUrl(qrBuffer: Buffer): string {
    return `data:image/png;base64,${qrBuffer.toString('base64')}`;
}
