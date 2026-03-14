import { supabase } from './supabase';

const PRODUCT_IMAGES_BUCKET = 'product-images';
const RENTAL_IMAGES_BUCKET = 'rental-images';

/**
 * Upload a product image to Supabase Storage
 * @param file - The image file to upload
 * @returns The public URL of the uploaded image, or null if upload failed
 */
export async function uploadProductImage(file: File): Promise<string | null> {
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from(PRODUCT_IMAGES_BUCKET)
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false,
            });

        if (uploadError) {
            console.error('Error uploading product image:', uploadError);
            return null;
        }

        const { data } = supabase.storage
            .from(PRODUCT_IMAGES_BUCKET)
            .getPublicUrl(filePath);

        return data.publicUrl;
    } catch (error) {
        console.error('Error uploading product image:', error);
        return null;
    }
}

/**
 * Upload a rental tool image to Supabase Storage
 * @param file - The image file to upload
 * @returns The public URL of the uploaded image, or null if upload failed
 */
export async function uploadRentalImage(file: File): Promise<string | null> {
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from(RENTAL_IMAGES_BUCKET)
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false,
            });

        if (uploadError) {
            console.error('Error uploading rental image:', uploadError);
            return null;
        }

        const { data } = supabase.storage
            .from(RENTAL_IMAGES_BUCKET)
            .getPublicUrl(filePath);

        return data.publicUrl;
    } catch (error) {
        console.error('Error uploading rental image:', error);
        return null;
    }
}

/**
 * Get the public URL for an image in Supabase Storage
 * @param bucket - The storage bucket name
 * @param path - The file path within the bucket
 * @returns The public URL of the image
 */
export function getPublicUrl(bucket: string, path: string): string {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
}

/**
 * Delete an image from Supabase Storage
 * @param bucket - The storage bucket name
 * @param path - The file path within the bucket
 * @returns True if deletion was successful, false otherwise
 */
export async function deleteImage(bucket: string, path: string): Promise<boolean> {
    try {
        const { error } = await supabase.storage.from(bucket).remove([path]);

        if (error) {
            console.error('Error deleting image:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error deleting image:', error);
        return false;
    }
}

/**
 * Extract the file path from a Supabase Storage public URL
 * @param url - The public URL
 * @param bucket - The storage bucket name
 * @returns The file path, or null if URL is invalid
 */
export function extractPathFromUrl(url: string, bucket: string): string | null {
    try {
        const bucketPath = `/storage/v1/object/public/${bucket}/`;
        const index = url.indexOf(bucketPath);

        if (index === -1) return null;

        return url.substring(index + bucketPath.length);
    } catch (error) {
        console.error('Error extracting path from URL:', error);
        return null;
    }
}
