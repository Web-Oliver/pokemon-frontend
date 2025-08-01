/**
 * Simple Image Caching and Preloading
 * Following CLAUDE.md DRY principles - simple and effective
 */

const imageCache = new Map<string, HTMLImageElement>();
const loadingPromises = new Map<string, Promise<HTMLImageElement>>();

/**
 * Preload image and cache it
 */
export const preloadImage = (src: string): Promise<HTMLImageElement> => {
  // Return cached image if available
  if (imageCache.has(src)) {
    return Promise.resolve(imageCache.get(src)!);
  }

  // Return existing promise if already loading
  if (loadingPromises.has(src)) {
    return loadingPromises.get(src)!;
  }

  // Create new loading promise
  const promise = new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      imageCache.set(src, img);
      loadingPromises.delete(src);
      resolve(img);
    };
    
    img.onerror = () => {
      loadingPromises.delete(src);
      reject(new Error(`Failed to load image: ${src}`));
    };
    
    img.src = src;
  });

  loadingPromises.set(src, promise);
  return promise;
};

/**
 * Preload multiple images
 */
export const preloadImages = async (srcs: string[]): Promise<HTMLImageElement[]> => {
  return Promise.all(srcs.map(preloadImage));
};

/**
 * Check if image is cached
 */
export const isImageCached = (src: string): boolean => {
  return imageCache.has(src);
};

/**
 * Clear image cache
 */
export const clearImageCache = (): void => {
  imageCache.clear();
  loadingPromises.clear();
};