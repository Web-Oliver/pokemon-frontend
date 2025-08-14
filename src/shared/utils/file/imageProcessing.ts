/**
 * Image Processing Utilities
 * Split from fileOperations.ts for better maintainability
 *
 * Following CLAUDE.md principles:
 * - Single Responsibility: Image aspect ratio and responsive utilities
 * - DRY: Centralized image processing logic
 */

// Context7 styling functions removed during cleanup - no longer needed

export interface ImageAspectInfo {
  ratio: number;
  category:
    | 'square'
    | 'portrait'
    | 'landscape'
    | 'wide'
    | 'tall'
    | 'ultra-wide'
    | 'ultra-tall';
  orientation: 'vertical' | 'horizontal' | 'square';
  cssClass: string;
  containerClass: string;
  responsiveClasses: string;
}

export interface ResponsiveImageConfig {
  baseAspect: string;
  mobileAspect?: string;
  tabletAspect?: string;
  desktopAspect?: string;
  objectFit: 'cover' | 'contain' | 'fill' | 'scale-down' | 'none';
  objectPosition: string;
}

/**
 * Detects image aspect ratio and provides classification
 */
export const detectImageAspectRatio = async (
  imageUrl: string
): Promise<ImageAspectInfo> => {
  return new Promise((resolve) => {
    const img = new Image();

    img.onload = () => {
      const ratio = img.width / img.height;
      const aspectInfo = classifyAspectRatio(ratio);
      resolve(aspectInfo);
    };

    img.onerror = () => {
      // Default to square if image fails to load
      resolve(classifyAspectRatio(1));
    };

    img.src = imageUrl;
  });
};

/**
 * Classifies aspect ratio into categories with Context7 styling
 */
export const classifyAspectRatio = (ratio: number): ImageAspectInfo => {
  let category: ImageAspectInfo['category'];
  let orientation: ImageAspectInfo['orientation'];
  let cssClass: string;
  let containerClass: string;
  let responsiveClasses: string;

  // Classify aspect ratio
  if (ratio === 1) {
    category = 'square';
    orientation = 'square';
    cssClass = 'aspect-square';
    containerClass = 'aspect-square';
    responsiveClasses = 'aspect-square sm:aspect-square md:aspect-square';
  } else if (ratio > 2.5) {
    category = 'ultra-wide';
    orientation = 'horizontal';
    cssClass = 'aspect-[5/2]';
    containerClass = 'aspect-[5/2]';
    responsiveClasses = 'aspect-[3/2] sm:aspect-[5/2] md:aspect-[5/2]';
  } else if (ratio > 1.8) {
    category = 'wide';
    orientation = 'horizontal';
    cssClass = 'aspect-video';
    containerClass = 'aspect-video';
    responsiveClasses = 'aspect-[4/3] sm:aspect-video md:aspect-video';
  } else if (ratio > 1.3) {
    category = 'landscape';
    orientation = 'horizontal';
    cssClass = 'aspect-[4/3]';
    containerClass = 'aspect-[4/3]';
    responsiveClasses = 'aspect-square sm:aspect-[4/3] md:aspect-[4/3]';
  } else if (ratio > 0.9) {
    category = 'square';
    orientation = 'square';
    cssClass = 'aspect-square';
    containerClass = 'aspect-square';
    responsiveClasses = 'aspect-square sm:aspect-square md:aspect-square';
  } else if (ratio > 0.6) {
    category = 'portrait';
    orientation = 'vertical';
    cssClass = 'aspect-[3/4]';
    containerClass = 'aspect-[3/4]';
    responsiveClasses = 'aspect-square sm:aspect-[3/4] md:aspect-[3/4]';
  } else if (ratio > 0.4) {
    category = 'tall';
    orientation = 'vertical';
    cssClass = 'aspect-[3/5]';
    containerClass = 'aspect-[3/5]';
    responsiveClasses = 'aspect-[3/4] sm:aspect-[3/5] md:aspect-[3/5]';
  } else {
    category = 'ultra-tall';
    orientation = 'vertical';
    cssClass = 'aspect-[2/5]';
    containerClass = 'aspect-[2/5]';
    responsiveClasses = 'aspect-[3/5] sm:aspect-[2/5] md:aspect-[2/5]';
  }

  return {
    ratio,
    category,
    orientation,
    cssClass,
    containerClass,
    responsiveClasses,
  };
};

/**
 * Gets optimized responsive image configuration based on aspect ratio
 * Standard with Context7 patterns for both vertical and horizontal images
 */
export const getResponsiveImageConfig = (
  aspectInfo: ImageAspectInfo
): ResponsiveImageConfig => {
  const { category, orientation } = aspectInfo;

  // Standard responsive configuration based on Context7 Tailwind patterns
  switch (category) {
    case 'ultra-wide':
      return {
        baseAspect: 'aspect-[5/2]',
        mobileAspect: 'aspect-[3/2]',
        tabletAspect: 'aspect-[5/2]',
        desktopAspect: 'aspect-[5/2]',
        objectFit: 'cover',
        objectPosition: 'center',
      };

    case 'wide':
      return {
        baseAspect: 'aspect-video', // 16:9
        mobileAspect: 'aspect-[4/3]', // Responsive fallback for mobile
        tabletAspect: 'aspect-video',
        desktopAspect: 'aspect-video',
        objectFit: 'contain',
        objectPosition: 'center',
      };

    case 'landscape':
      return {
        baseAspect: 'aspect-[4/3]',
        mobileAspect: 'aspect-[3/2]', // Better mobile display
        tabletAspect: 'aspect-[4/3]',
        desktopAspect: 'aspect-[4/3]',
        objectFit: 'contain',
        objectPosition: 'center',
      };

    case 'square':
      return {
        baseAspect: 'aspect-square',
        mobileAspect: 'aspect-square',
        tabletAspect: 'aspect-square',
        desktopAspect: 'aspect-square',
        objectFit: 'cover',
        objectPosition: 'center',
      };

    case 'portrait':
      return {
        baseAspect: 'aspect-[3/5]', // Better match for PSA cards (0.6 ratio)
        mobileAspect: 'aspect-[3/5]', // Keep consistent for PSA cards
        tabletAspect: 'aspect-[3/5]',
        desktopAspect: 'aspect-[3/5]',
        objectFit: 'contain', // Show full image without cropping for PSA cards
        objectPosition: 'center', // Center the full image
      };

    case 'tall':
      return {
        baseAspect: 'aspect-[3/5]',
        mobileAspect: 'aspect-[2/3]', // More mobile-friendly
        tabletAspect: 'aspect-[3/5]',
        desktopAspect: 'aspect-[3/5]',
        objectFit: 'contain', // Show full image without cropping for PSA cards
        objectPosition: 'center', // Center the full image
      };

    case 'ultra-tall':
      return {
        baseAspect: 'aspect-[2/5]',
        mobileAspect: 'aspect-[1/2]', // Very mobile-friendly
        tabletAspect: 'aspect-[2/5]',
        desktopAspect: 'aspect-[2/5]',
        objectFit: 'contain', // Prevent cropping for ultra-tall images
        objectPosition: 'center top',
      };

    default:
      // Intelligent fallback based on orientation
      if (orientation === 'horizontal') {
        return {
          baseAspect: 'aspect-[4/3]',
          mobileAspect: 'aspect-[3/2]',
          tabletAspect: 'aspect-[4/3]',
          desktopAspect: 'aspect-[4/3]',
          objectFit: 'cover',
          objectPosition: 'center',
        };
      } else if (orientation === 'vertical') {
        return {
          baseAspect: 'aspect-[3/4]',
          mobileAspect: 'aspect-[2/3]',
          tabletAspect: 'aspect-[3/4]',
          desktopAspect: 'aspect-[3/4]',
          objectFit: 'cover',
          objectPosition: 'center top',
        };
      }
      return {
        baseAspect: 'aspect-square',
        objectFit: 'cover',
        objectPosition: 'center',
      };
  }
};

/**
 * Builds responsive CSS classes for image containers
 */
export const buildResponsiveImageClasses = (
  config: ResponsiveImageConfig
): string => {
  const classes = [config.baseAspect];

  if (config.mobileAspect) {
    classes.push(config.mobileAspect);
  }

  if (config.tabletAspect) {
    classes.push(`sm:${config.tabletAspect}`);
  }

  if (config.desktopAspect) {
    classes.push(`md:${config.desktopAspect}`);
  }

  return classes.join(' ');
};

// Image processing utilities optimized for Pokemon card display

/**
 * Determines optimal grid layout based on mixed aspect ratios
 * Standard Context7 algorithm for vertical and horizontal image mixing
 */
export const getOptimalGridLayout = (
  aspectInfos: ImageAspectInfo[]
): string => {
  if (aspectInfos.length === 0) {
    return 'grid-cols-1';
  }

  const orientations = aspectInfos.map((info) => info.orientation);
  const categories = aspectInfos.map((info) => info.category);

  const hasVertical = orientations.includes('vertical');
  const hasHorizontal = orientations.includes('horizontal');
  const hasSquare = orientations.includes('square');

  const verticalCount = orientations.filter((o) => o === 'vertical').length;
  const horizontalCount = orientations.filter((o) => o === 'horizontal').length;
  // const squareCount = orientations.filter(o => o === 'square').length;

  const totalImages = aspectInfos.length;
  const verticalRatio = verticalCount / totalImages;
  const horizontalRatio = horizontalCount / totalImages;

  // Context7 enhanced logic for mixed orientations
  if (hasVertical && hasHorizontal && hasSquare) {
    // All three types - use masonry-style adaptive grid
    return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-max';
  }

  if (hasVertical && hasHorizontal) {
    // Mixed vertical and horizontal
    if (verticalRatio > 0.7) {
      // Mostly vertical - use more columns
      return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4';
    } else if (horizontalRatio > 0.7) {
      // Mostly horizontal - use fewer columns
      return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6';
    } else {
      // Balanced mix - adaptive responsive grid
      return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 auto-rows-fr';
    }
  }

  // Predominantly vertical images - optimize for more columns
  if (hasVertical && !hasHorizontal) {
    if (categories.includes('ultra-tall')) {
      // Ultra-tall images need special handling
      return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3';
    }
    return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4';
  }

  // Predominantly horizontal images - optimize for fewer columns
  if (hasHorizontal && !hasVertical) {
    if (categories.includes('ultra-wide')) {
      // Ultra-wide images need special handling
      return 'grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8';
    }
    return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6';
  }

  // Square images - balanced grid
  if (hasSquare) {
    return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-6';
  }

  // Intelligent fallback based on total count
  if (totalImages <= 2) {
    return 'grid-cols-1 sm:grid-cols-2 gap-6';
  } else if (totalImages <= 4) {
    return 'grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-5';
  } else {
    return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4';
  }
};

// Responsive image utilities for optimal display across devices

/**
 * Preloads an image and returns aspect ratio information
 */
export const preloadImageWithAspectRatio = async (
  imageUrl: string
): Promise<ImageAspectInfo> => {
  try {
    const aspectInfo = await detectImageAspectRatio(imageUrl);
    return aspectInfo;
  } catch (_error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('[ImageUtils] Failed to detect aspect ratio for:', imageUrl);
    }
    return classifyAspectRatio(1); // Default to square
  }
};

/**
 * Creates responsive srcSet for different screen sizes
 */
export const createResponsiveSrcSet = (
  baseUrl: string,
  sizes: number[] = [320, 640, 1024, 1280]
): string => {
  return sizes.map((size) => `${baseUrl}?w=${size} ${size}w`).join(', ');
};

/**
 * Gets optimal sizes attribute for responsive images
 */
export const getOptimalSizesAttribute = (
  aspectInfo: ImageAspectInfo
): string => {
  const { orientation, category } = aspectInfo;

  if (orientation === 'vertical') {
    return '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw';
  }

  if (orientation === 'horizontal' && category === 'ultra-wide') {
    return '(max-width: 640px) 100vw, (max-width: 1024px) 75vw, 50vw';
  }

  if (orientation === 'horizontal') {
    return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
  }

  // Square and default
  return '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw';
};
