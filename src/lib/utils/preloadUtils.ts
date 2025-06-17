/**
 * Preload Utilities
 * 
 * This utility provides functions for preloading critical resources
 * such as images, fonts, and scripts to improve performance.
 */

/**
 * Preload an image
 * @param src The URL of the image to preload
 * @returns A promise that resolves when the image is loaded
 */
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to preload image: ${src}`));
    img.src = src;
  });
};

/**
 * Preload a font
 * @param fontFamily The font family name
 * @param fontWeight The font weight (default: 400)
 * @param fontStyle The font style (default: 'normal')
 * @returns A promise that resolves when the font is loaded
 */
export const preloadFont = (
  fontFamily: string,
  fontWeight: number = 400,
  fontStyle: string = 'normal'
): Promise<void> => {
  return document.fonts.load(`${fontWeight} ${fontStyle} 1em "${fontFamily}"`);
};

/**
 * Preload a script
 * @param src The URL of the script to preload
 * @returns A promise that resolves when the script is loaded
 */
export const preloadScript = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to preload script: ${src}`));
    document.head.appendChild(script);
  });
};

/**
 * Preload a CSS stylesheet
 * @param href The URL of the stylesheet to preload
 * @returns A promise that resolves when the stylesheet is loaded
 */
export const preloadStylesheet = (href: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    link.onload = () => resolve();
    link.onerror = () => reject(new Error(`Failed to preload stylesheet: ${href}`));
    document.head.appendChild(link);
  });
};

/**
 * Preload critical resources for the application
 * @param resources Object containing arrays of resources to preload
 */
export const preloadCriticalResources = async (
  resources: {
    images?: string[];
    fonts?: Array<{ family: string; weight?: number; style?: string }>;
    scripts?: string[];
    stylesheets?: string[];
  }
): Promise<void> => {
  try {
    const promises: Promise<void>[] = [];

    // Preload images
    if (resources.images && resources.images.length > 0) {
      promises.push(...resources.images.map(src => preloadImage(src)));
    }

    // Preload fonts
    if (resources.fonts && resources.fonts.length > 0) {
      promises.push(...resources.fonts.map(font => 
        preloadFont(font.family, font.weight, font.style)
      ));
    }

    // Preload scripts
    if (resources.scripts && resources.scripts.length > 0) {
      promises.push(...resources.scripts.map(src => preloadScript(src)));
    }

    // Preload stylesheets
    if (resources.stylesheets && resources.stylesheets.length > 0) {
      promises.push(...resources.stylesheets.map(href => preloadStylesheet(href)));
    }

    // Wait for all resources to load
    await Promise.all(promises);
    console.log('All critical resources preloaded successfully');
  } catch (error) {
    console.error('Error preloading critical resources:', error);
  }
};

/**
 * Add preload link tags to the document head
 * @param resources Object containing arrays of resources to add preload hints for
 */
export const addPreloadHints = (
  resources: {
    images?: string[];
    fonts?: Array<{ url: string; type: string }>;
    scripts?: string[];
    stylesheets?: string[];
  }
): void => {
  // Preload images
  if (resources.images && resources.images.length > 0) {
    resources.images.forEach(src => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
    });
  }

  // Preload fonts
  if (resources.fonts && resources.fonts.length > 0) {
    resources.fonts.forEach(font => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.href = font.url;
      link.type = font.type;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });
  }

  // Preload scripts
  if (resources.scripts && resources.scripts.length > 0) {
    resources.scripts.forEach(src => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'script';
      link.href = src;
      document.head.appendChild(link);
    });
  }

  // Preload stylesheets
  if (resources.stylesheets && resources.stylesheets.length > 0) {
    resources.stylesheets.forEach(href => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'style';
      link.href = href;
      document.head.appendChild(link);
    });
  }
};
