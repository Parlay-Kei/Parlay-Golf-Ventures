/**
 * Image Utilities
 * 
 * This utility provides functions for working with optimized images,
 * including responsive image selection and placeholder generation.
 */

// Types for the image manifest
interface ImageSize {
  webp?: string;
  jpg?: string;
  png?: string;
}

interface ImageSizes {
  [size: string]: ImageSize;
}

interface ImageInfo {
  sizes: ImageSizes;
  placeholder: string;
}

interface ImageManifest {
  [imageName: string]: ImageInfo;
}

// Default image path
const IMAGE_BASE_PATH = '/images/optimized';

/**
 * Get the appropriate image source based on screen size
 * @param imageName The base name of the image without extension
 * @param preferredSize The preferred size of the image
 * @param preferWebp Whether to prefer WebP format if available
 * @returns The URL of the optimized image
 */
export const getResponsiveImageSrc = async (
  imageName: string,
  preferredSize: number = 640,
  preferWebp: boolean = true
): Promise<string> => {
  try {
    // Try to load the image manifest
    const manifestModule = await import('/public/images/optimized/image-manifest.json');
    const manifest: ImageManifest = manifestModule.default;
    
    // Check if the image exists in the manifest
    if (!manifest[imageName]) {
      console.warn(`Image "${imageName}" not found in the manifest. Using original image.`);
      return `/images/${imageName}`;
    }
    
    // Find the closest size to the preferred size
    const availableSizes = Object.keys(manifest[imageName].sizes)
      .map(size => parseInt(size))
      .sort((a, b) => a - b);
    
    const closestSize = availableSizes.reduce((prev, curr) => {
      return (Math.abs(curr - preferredSize) < Math.abs(prev - preferredSize)) ? curr : prev;
    }, availableSizes[0]);
    
    // Get the image format
    const sizeInfo = manifest[imageName].sizes[closestSize.toString()];
    
    // Prefer WebP if available and supported
    if (preferWebp && sizeInfo.webp) {
      return `${IMAGE_BASE_PATH}/${sizeInfo.webp}`;
    }
    
    // Fallback to other formats
    if (sizeInfo.jpg) {
      return `${IMAGE_BASE_PATH}/${sizeInfo.jpg}`;
    }
    
    if (sizeInfo.png) {
      return `${IMAGE_BASE_PATH}/${sizeInfo.png}`;
    }
    
    // If no optimized version is found, return the original image
    return `/images/${imageName}`;
    
  } catch (error) {
    console.error('Error loading image manifest:', error);
    return `/images/${imageName}`;
  }
};

/**
 * Get the placeholder image URL for blur-up loading effect
 * @param imageName The base name of the image without extension
 * @returns The URL of the placeholder image
 */
export const getImagePlaceholder = async (imageName: string): Promise<string> => {
  try {
    // Try to load the image manifest
    const manifestModule = await import('/public/images/optimized/image-manifest.json');
    const manifest: ImageManifest = manifestModule.default;
    
    // Check if the image exists in the manifest
    if (!manifest[imageName]) {
      return '';
    }
    
    return `${IMAGE_BASE_PATH}/${manifest[imageName].placeholder}`;
  } catch (error) {
    console.error('Error loading image placeholder:', error);
    return '';
  }
};

/**
 * Generate a data URL for a color to use as a placeholder
 * @param color The color to use for the placeholder (hex format)
 * @returns A data URL representing the color
 */
export const generateColorPlaceholder = (color: string = '#f1f1f1'): string => {
  return `data:image/svg+xml;base64,${btoa(
    `<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="${color}"/></svg>`
  )}`;
};

/**
 * Check if the browser supports WebP format
 * @returns A promise that resolves to true if WebP is supported, false otherwise
 */
export const isWebpSupported = (): Promise<boolean> => {
  return new Promise((resolve) => {
    const webpImage = new Image();
    webpImage.onload = () => resolve(true);
    webpImage.onerror = () => resolve(false);
    webpImage.src = 'data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==';
  });
};
