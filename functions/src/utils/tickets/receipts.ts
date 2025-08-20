/**
 * @fileoverview Receipt processing utilities for the ticket system.
 * 
 * Provides functions for receipt validation, storage, and management.
 * Leverages the configurations defined in function-config.ts.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { receiptConfig } from '../../config/function-config';
import { hashFileBuffer } from './security';
import { Storage } from '@google-cloud/storage';

/**
 * Validates a receipt file based on type and size.
 * 
 * @param file The file object from the upload
 * @returns Valid or not, with error message
 */
export function validateReceiptFile(file: {
    originalname: string;
    mimetype: string;
    size: number;
    buffer?: Buffer;
    path?: string;
}): { valid: boolean; message?: string } {
    // Check file type
    if (!receiptConfig.allowedFileTypes.includes(file.mimetype)) {
        return {
            valid: false,
            message: `Invalid file type. Allowed types: ${receiptConfig.allowedFileTypes.join(', ')}`
        };
    }

    // Check file size
    if (file.size > receiptConfig.maxFileSizeBytes) {
        const maxSizeMB = receiptConfig.maxFileSizeBytes / (1024 * 1024);
        return {
            valid: false,
            message: `File too large. Maximum size: ${maxSizeMB}MB`
        };
    }

    return { valid: true };
}

/**
 * Generates a unique filename for a receipt.
 * 
 * @param orderId The order ID this receipt is for
 * @param originalFilename The original filename
 * @returns A unique filename
 */
export function generateReceiptFilename(orderId: string, originalFilename: string): string {
    const timestamp = Date.now();
    const extension = path.extname(originalFilename) || '.dat';
    return `receipt_${orderId}_${timestamp}${extension}`;
}

/**
 * Gets the storage path for a receipt.
 * 
 * @param orderId The order ID
 * @param filename The filename
 * @returns Storage path
 */
export function getReceiptStoragePath(orderId: string, filename: string): string {
    return receiptConfig.storagePath
        .replace('{orderId}', orderId)
        .replace('{fileName}', filename);
}

/**
 * Uploads a receipt file to storage.
 * 
 * @param storage Firebase Storage instance
 * @param bucketName The storage bucket name
 * @param filePath Local path to the file
 * @param destination Destination path in storage
 * @returns Promise with upload result
 */
export async function uploadReceiptFile(
    storage: Storage,
    bucketName: string,
    filePath: string,
    destination: string
): Promise<{
    path: string;
    contentType: string;
    size: number;
    hash: string;
}> {
    const bucket = storage.bucket(bucketName);

    // Read file buffer to calculate hash
    const fileBuffer = fs.readFileSync(filePath);
    const fileHash = hashFileBuffer(fileBuffer);

    const fileStats = fs.statSync(filePath);
    const contentType = path.extname(filePath) === '.pdf' ? 'application/pdf' : 'image/jpeg';

    // Upload with metadata
    await bucket.upload(filePath, {
        destination: destination,
        metadata: {
            contentType: contentType,
            metadata: {
                hash: fileHash,
                uploadTime: new Date().toISOString()
            }
        }
    });

    return {
        path: destination,
        contentType: contentType,
        size: fileStats.size,
        hash: fileHash
    };
}

/**
 * Creates a temporary file from a buffer.
 * 
 * @param buffer File buffer
 * @param extension File extension
 * @returns Path to the temporary file
 */
export function createTempFileFromBuffer(buffer: Buffer, extension: string): string {
    const tempDir = os.tmpdir();
    const tempFilePath = path.join(tempDir, `receipt_${Date.now()}${extension}`);
    fs.writeFileSync(tempFilePath, buffer);
    return tempFilePath;
}

/**
 * Validates a receipt file against potential fraud indicators.
 * This is a basic implementation - in production, you might use
 * more sophisticated methods including image analysis.
 * 
 * @param file The receipt file object
 * @returns Validation result with score and flags
 */
export function analyzeReceiptForFraud(file: {
    originalname: string;
    mimetype: string;
    size: number;
    buffer?: Buffer;
}): {
    suspicious: boolean;
    score: number;
    flags: string[];
} {
    const flags: string[] = [];
    let score = 0;

    // This is a simplified implementation
    // In a real system, you might use AI to analyze the image

    // Check for unusually small file size (potential screenshot or fake)
    if (file.size < 50000) { // 50KB
        flags.push('Unusually small file size');
        score += 10;
    }

    // Check file extension match with mimetype
    const extension = path.extname(file.originalname).toLowerCase();
    if (file.mimetype === 'image/jpeg' && extension !== '.jpg' && extension !== '.jpeg') {
        flags.push('File extension mismatch');
        score += 20;
    } else if (file.mimetype === 'image/png' && extension !== '.png') {
        flags.push('File extension mismatch');
        score += 20;
    } else if (file.mimetype === 'application/pdf' && extension !== '.pdf') {
        flags.push('File extension mismatch');
        score += 20;
    }

    return {
        suspicious: score >= 30,
        score,
        flags
    };
}
