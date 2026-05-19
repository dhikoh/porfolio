/**
 * Convert various image URL formats to direct-embeddable URLs.
 * Handles Google Drive share links → direct download URLs.
 */
export function toDirectImageUrl(url: string): string {
  if (!url) return '';

  // Google Drive: /file/d/FILE_ID/... → /uc?export=view&id=FILE_ID
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (driveMatch) {
    return `https://drive.google.com/uc?export=view&id=${driveMatch[1]}`;
  }

  // Google Drive: /open?id=FILE_ID
  const driveOpenMatch = url.match(/drive\.google\.com\/open\?id=([^&]+)/);
  if (driveOpenMatch) {
    return `https://drive.google.com/uc?export=view&id=${driveOpenMatch[1]}`;
  }

  return url;
}
