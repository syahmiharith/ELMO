'use server';

import { uploadImage, type UploadImageInput, type UploadImageOutput } from "@/ai/flows/upload-image";

export async function handleImageUpload(
  input: UploadImageInput
): Promise<{ success: boolean; data?: UploadImageOutput; error?: string }> {
  try {
    const result = await uploadImage(input);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error uploading image:', error);
    return { success: false, error: 'Failed to upload image. Please try again later.' };
  }
}
