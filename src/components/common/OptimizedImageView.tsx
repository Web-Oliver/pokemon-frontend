/**
 * Optimized Image View Component with Theme Integration
 *
 * Performance-optimized image display component that implements lazy loading
 * and reduces unnecessary re-renders. Inspired by Pikawiz's simple approach.
 *
 * Following CLAUDE.md principles:
 * - Single Responsibility: Only handles optimized image display
 * - DRY: Reusable across all image display needs
 * - Performance: Implements lazy loading and minimal re-renders
 * - Theme Integration: Uses unified theme system for consistent styling
 */

import React, { memo, useEffect, useRef, useState } from 'react';
import { Package } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { getElementTheme, ThemeColor } from '../../theme/formThemes';

interface OptimizedImageViewProps {
  src: string;
  alt: string;
  className?: string;
  fallbackIcon?: React.ReactNode;
  onLoad?: () => void;
  onError?: (error: any) => void;
  themeColor?: ThemeColor;
}

const OptimizedImageViewComponent: React.FC<OptimizedImageViewProps> = ({
  src,
  alt,
  className = '',
  fallbackIcon = <Package className="w-8 h-8 text-cyan-400" />,
  onLoad,
  onError,
  themeColor = 'dark',
}) => {
  const {} = useTheme();
  const elementTheme = getElementTheme(themeColor);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Implement intersection observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px',
        threshold: 0.01,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setHasError(true);
    onError?.(e);
  };

  const imageSrc = src.startsWith('http') ? src : `http://localhost:3000${src}`;

  if (hasError) {
    return (
      <div
        ref={containerRef}
        className={`flex items-center justify-center bg-zinc-800/60 rounded-xl ${elementTheme.border} backdrop-blur-sm ${className}`}
      >
        <div className="flex flex-col items-center space-y-2 text-zinc-400">
          {fallbackIcon}
          <span className="text-sm">Failed to load image</span>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Placeholder while loading with theme integration */}
      {!isLoaded && (
        <div
          className={`absolute inset-0 flex items-center justify-center bg-zinc-800/60 rounded-xl ${elementTheme.border} backdrop-blur-sm`}
        >
          <div className="animate-pulse flex flex-col items-center space-y-2">
            {fallbackIcon}
            <div className="w-16 h-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full animate-pulse"></div>
          </div>
        </div>
      )}

      {/* Only render image when in view */}
      {isInView && (
        <img
          ref={imgRef}
          src={imageSrc}
          alt={alt}
          className={`w-full h-full object-cover transition-all duration-300 rounded-xl ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
        />
      )}
    </div>
  );
};

// Memoize with shallow comparison including theme
export const OptimizedImageView = memo(
  OptimizedImageViewComponent,
  (prev, next) => {
    return (
      prev.src === next.src &&
      prev.alt === next.alt &&
      prev.className === next.className &&
      prev.themeColor === next.themeColor
    );
  }
);

export default OptimizedImageView;
