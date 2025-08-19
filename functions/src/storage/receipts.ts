/**
 * @fileoverview Storage related Cloud Functions.
 * 
 * Handles validation of uploaded receipt files.
 */

import { onObjectFinalized } from "firebase-functions/v2/storage";
import { logger } from "firebase-functions";

interface StorageObjectDataLite {
    name: string;
    contentType?: string | null;
}

interface ReceiptUploadEvent {
    bucket: string;
    data: StorageObjectDataLite;
}

type ReceiptContentType = "image/jpeg" | "image/png" | "application/pdf";

/**
 * Triggered when a new file is uploaded to the 'receipts/' path in Storage.
 * Performs basic validation on the uploaded file.
 */
export const onReceiptUpload = onObjectFinalized(
    { bucket: process.env.GCLOUD_STORAGE_BUCKET },
    async (event: ReceiptUploadEvent): Promise<void> => {
        const fileBucket: string = event.bucket;
        const filePath: string = event.data.name;
        const contentType: string | null | undefined = event.data.contentType;

        if (!filePath.startsWith("receipts/")) {
            // Not a receipt, ignore.
            return;
        }

        logger.info(`Processing receipt upload: ${filePath}`);

        // Basic validation checks
        const allowedTypes: ReadonlyArray<ReceiptContentType> = ["image/jpeg", "image/png", "application/pdf"];
        if (!contentType || !allowedTypes.includes(contentType as ReceiptContentType)) {
            logger.warn(`Invalid file type for receipt: ${contentType}. File: ${filePath}`);
            // Optional: Delete the file from storage
            // const bucket = getStorage().bucket(fileBucket);
            // await bucket.file(filePath).delete();
            // logger.info(`Deleted invalid receipt file: ${filePath}`);
            return;
        }

        logger.info(`Receipt ${filePath} passed basic validation.`);
        // In a real app, you might trigger an OCR process here
        // or update the corresponding Firestore order document.
    });
