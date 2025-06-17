/**
 * Optimized Image Component
 * 
 * This component provides image optimization features including:
 * - Lazy loading
 * - Responsive sizing
 * - Blur-up loading effect
 * - WebP format support with fallback
 */

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  objectFit = 'cover',
  priority = false,
  placeholder = 'empty',
  blurDataURL,
  ...props
}: OptimizedImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  // Check if the browser supports WebP format
  useEffect(() => {
    const checkWebpSupport = async () => {
      const webpSupported = await isWebpSupported();
      
      // If WebP is supported and the image is not already a WebP, try to use a WebP version
      if (webpSupported && !src.toLowerCase().endsWith('.webp')) {
        // Try to load WebP version first (assuming there's a parallel .webp version available)
        const webpSrc = src.substring(0, src.lastIndexOf('.')) + '.webp';
        
        // Check if WebP version exists
        try {
          const response = await fetch(webpSrc, { method: 'HEAD' });
          if (response.ok) {
            setImageSrc(webpSrc);
            return;
          }
        } catch (e) {
          // WebP version doesn't exist, continue with original format
        }
      }
      
      // Use original image source if WebP is not supported or not available
      setImageSrc(src);
    };
    
    checkWebpSupport();
  }, [src]);

  // Function to check WebP support
  const isWebpSupported = (): Promise<boolean> => {
    return new Promise((resolve) => {
      const webpImage = new Image();
      webpImage.onload = () => resolve(true);
      webpImage.onerror = () => resolve(false);
      webpImage.src = 'data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==';
    });
  };

  // Handle image load event
  const handleLoad = () => {
    setLoaded(true);
  };

  // Handle image error event
  const handleError = () => {
    setError(true);
    console.error(`Failed to load image: ${src}`);
  };

  // Generate a placeholder for the image
  const getPlaceholder = () => {
    if (placeholder === 'blur' && blurDataURL) {
      return blurDataURL;
    }
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNmMWYxZjEiLz48L3N2Zz4=';
  };

  // If there's an error loading the image, show a placeholder
  if (error) {
    return (
      <div 
        className={cn(
          'bg-gray-200 flex items-center justify-center',
          className
        )}
        style={{ width, height }}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
      </div>
    );
  }

  return (
    <div className={cn('relative overflow-hidden', className)} style={{ width, height }}>
      {/* Placeholder shown while image is loading */}
      {!loaded && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse"
          style={{ backgroundImage: `url(${getPlaceholder()})`, backgroundSize: 'cover' }}
        />
      )}
      
      {/* Actual image */}
      {imageSrc && (
        <img
          src={imageSrc}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'transition-opacity duration-300',
            loaded ? 'opacity-100' : 'opacity-0',
            objectFit === 'contain' && 'object-contain',
            objectFit === 'cover' && 'object-cover',
            objectFit === 'fill' && 'object-fill',
            objectFit === 'none' && 'object-none',
            objectFit === 'scale-down' && 'object-scale-down',
          )}
          style={{ width: '100%', height: '100%' }}
          {...props}
        />
      )}
    </div>
  );
}
