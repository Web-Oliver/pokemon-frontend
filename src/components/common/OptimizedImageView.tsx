/**
 * Optimized Image View Component
 *
 * Performance-optimized image display component that implements lazy loading
 * and reduces unnecessary re-renders. Inspired by Pikawiz's simple approach.
 *
 * Following CLAUDE.md principles:
 * - Single Responsibility: Only handles optimized image display
 * - DRY: Reusable across all image display needs
 * - Performance: Implements lazy loading and minimal re-renders
 */

import React, { useState, useRef, useEffect, memo } from 'react';
import { Package } from 'lucide-react';

interface OptimizedImageViewProps {
  src: string;
  alt: string;
  className?: string;
  fallbackIcon?: React.ReactNode;
  onLoad?: () => void;
  onError?: (error: any) => void;
}

const OptimizedImageViewComponent: React.FC<OptimizedImageViewProps> = ({
  src,
  alt,
  className = '',
  fallbackIcon = <Package className="w-8 h-8 text-indigo-600" />,
  onLoad,
  onError,
}) => {
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
        className={`flex items-center justify-center bg-zinc-800/60 rounded-xl ${className}`}
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
      {/* Placeholder while loading */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-800/60 rounded-xl">
          <div className="animate-pulse">{fallbackIcon}</div>
        </div>
      )}

      {/* Only render image when in view */}
      {isInView && (
        <img
          ref={imgRef}
          src={imageSrc}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
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

// Memoize with shallow comparison
export const OptimizedImageView = memo(
  OptimizedImageViewComponent,
  (prev, next) => {
    return (
      prev.src === next.src &&
      prev.alt === next.alt &&
      prev.className === next.className
    );
  }
);

export default OptimizedImageView;
