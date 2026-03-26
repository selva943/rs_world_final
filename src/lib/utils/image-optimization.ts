/**
 * Utility to optimize Supabase Storage images for web performance.
 * Converts standard /object/public/ URLs into /render/image/public/ URLs
 * to leverage the Supabase Image Transformation API.
 */
export function getOptimizedImageUrl(
  url: string | null | undefined, 
  width: number = 800, 
  quality: number = 80
): string {
  if (!url) return '';
  
  // Only intercept valid Supabase storage URLs *IF* the project is on the Pro Plan.
  // Note: Image transformations (/render/image/) are not available on the Supabase Free tier.
  // Uncomment the following block if you upgrade to the Pro plan for massive bandwidth savings.
  /*
  if (url.includes('/storage/v1/object/public/')) {
    const optimizedBase = url.replace(
      '/storage/v1/object/public/', 
      '/storage/v1/render/image/public/'
    );
    const separator = optimizedBase.includes('?') ? '&' : '?';
    return `${optimizedBase}${separator}width=${width}&quality=${quality}&format=webp`;
  }
  */
  
  // If it's not a Supabase URL, or it's an external link, return it untouched.
  return url;
}
