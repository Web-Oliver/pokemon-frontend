import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { ChevronLeft, ChevronRight, Package } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { getElementTheme, ThemeColor } from '../../theme/formThemes';

interface ImageSlideshowProps {
  images: string[];
  fallbackIcon?: React.ReactNode;
  autoplay?: boolean;
  autoplayDelay?: number;
  className?: string;
  showThumbnails?: boolean;
  themeColor?: ThemeColor;
}

// Helper function to get image URL without assumptions
const getImageUrl = (imageUrl: string): string => {
  return imageUrl.startsWith('http')
    ? imageUrl
    : `http://localhost:3000${imageUrl}`;
};

// Helper function to get thumbnail URL
const getThumbnailUrl = (imageUrl: string): string => {
  // Extract the file extension and name
  const ext = imageUrl.substring(imageUrl.lastIndexOf('.'));
  const nameWithoutExt = imageUrl.substring(0, imageUrl.lastIndexOf('.'));

  // Create thumbnail filename with -thumb suffix
  const thumbnailUrl = `${nameWithoutExt}-thumb${ext}`;

  return thumbnailUrl.startsWith('http')
    ? thumbnailUrl
    : `http://localhost:3000${thumbnailUrl}`;
};

export const ImageSlideshow: React.FC<ImageSlideshowProps> = memo(
  ({
    images,
    fallbackIcon = <Package className="w-8 h-8 text-indigo-600" />,
    autoplay = false,
    autoplayDelay = 3000,
    className = '',
    showThumbnails = false,
    themeColor = 'dark',
  }) => {
    const { config } = useTheme();
    const elementTheme = getElementTheme(themeColor);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [imageIsVertical, setImageIsVertical] = useState(false);

    // Optimize: Memoize autoplay plugins to prevent re-creation
    const autoplayPlugins = useMemo(
      () =>
        autoplay
          ? [Autoplay({ delay: autoplayDelay, stopOnInteraction: false })]
          : [],
      [autoplay, autoplayDelay]
    );

    const [emblaMainRef, emblaMainApi] = useEmblaCarousel(
      { loop: true, duration: 25 },
      autoplayPlugins
    );

    // Optimize: Memoize thumbs config to prevent re-creation
    const thumbsConfig = useMemo(
      () => ({
        containScroll: 'keepSnaps',
        dragFree: true,
      }),
      []
    );

    const [emblaThumbsRef, emblaThumbsApi] = useEmblaCarousel(thumbsConfig);

    const onThumbClick = useCallback(
      (index: number) => {
        if (!emblaMainApi || !emblaThumbsApi) {
          return;
        }
        emblaMainApi.scrollTo(index);
      },
      [emblaMainApi, emblaThumbsApi]
    );

    // Optimize: Stable callback to prevent infinite useEffect loops
    const onSelect = useCallback(() => {
      if (!emblaMainApi || !emblaThumbsApi) {
        return;
      }
      const currentIndex = emblaMainApi.selectedScrollSnap();
      setSelectedIndex(currentIndex);
      emblaThumbsApi.scrollTo(currentIndex);
    }, [emblaMainApi, emblaThumbsApi]);

    // Optimize: Separate effect setup to prevent callback dependency issues
    useEffect(() => {
      if (!emblaMainApi) {
        return;
      }

      // Set initial selection
      onSelect();

      // Add event listeners
      emblaMainApi.on('select', onSelect);
      emblaMainApi.on('reInit', onSelect);

      // Cleanup
      return () => {
        emblaMainApi.off('select', onSelect);
        emblaMainApi.off('reInit', onSelect);
      };
    }, [emblaMainApi, onSelect]);

    const scrollPrev = useCallback(
      (e?: React.MouseEvent) => {
        e?.preventDefault();
        e?.stopPropagation();
        if (emblaMainApi) {
          emblaMainApi.scrollPrev();
        }
      },
      [emblaMainApi]
    );

    const scrollNext = useCallback(
      (e?: React.MouseEvent) => {
        e?.preventDefault();
        e?.stopPropagation();
        if (emblaMainApi) {
          emblaMainApi.scrollNext();
        }
      },
      [emblaMainApi]
    );

    // Optimize: Memoize computed values
    const hasImages = useMemo(() => images && images.length > 0, [images]);
    const hasMultipleImages = useMemo(
      () => images && images.length > 1,
      [images]
    );

    // Function to check if current image is vertical
    const checkImageOrientation = useCallback((imageUrl: string) => {
      const img = new Image();
      img.onload = () => {
        setImageIsVertical(img.height > img.width);
      };
      img.src = getImageUrl(imageUrl);
    }, []);

    // Check image orientation when selection changes
    useEffect(() => {
      if (hasImages && images[selectedIndex]) {
        checkImageOrientation(images[selectedIndex]);
      }
    }, [selectedIndex, images, hasImages, checkImageOrientation]);

    if (!hasImages) {
      return (
        <div
          className={`w-full h-48 bg-zinc-800/60 rounded-xl flex items-center justify-center shadow-2xl ${elementTheme.border} ${className}`}
          style={{
            boxShadow:
              '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)',
          }}
        >
          <div className="flex flex-col items-center space-y-2 text-zinc-400">
            {fallbackIcon}
            <span className="text-sm">No images available</span>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full h-full">
        {/* Main Slideshow */}
        <div className="relative w-full h-full group">
          {/* Futuristic Dark Navigation Buttons - Cursor.com Style */}
          {hasMultipleImages && (
            <>
              <button
                className={`absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-zinc-900/80 hover:bg-zinc-800/90 text-zinc-300 hover:text-white rounded-lg sm:rounded-xl flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 z-50 ${elementTheme.border} hover:border-zinc-600 backdrop-blur-xl group`}
                onClick={scrollPrev}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                aria-label="Previous image"
                type="button"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 transition-transform duration-300 group-hover:-translate-x-0.5" />
                <div className="absolute inset-0 rounded-lg sm:rounded-xl bg-gradient-to-r from-blue-500/20 via-purple-500/10 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                <div className="absolute inset-0 rounded-lg sm:rounded-xl bg-gradient-to-br from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
              <button
                className={`absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-zinc-900/80 hover:bg-zinc-800/90 text-zinc-300 hover:text-white rounded-lg sm:rounded-xl flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 z-50 ${elementTheme.border} hover:border-zinc-600 backdrop-blur-xl group`}
                onClick={scrollNext}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                aria-label="Next image"
                type="button"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 transition-transform duration-300 group-hover:translate-x-0.5" />
                <div className="absolute inset-0 rounded-lg sm:rounded-xl bg-gradient-to-r from-cyan-500/20 via-purple-500/10 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                <div className="absolute inset-0 rounded-lg sm:rounded-xl bg-gradient-to-br from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </>
          )}

          <div
            className={`relative w-full h-full overflow-hidden bg-zinc-800/60 rounded-2xl ${className}`}
          >
            <div className="embla w-full h-full" ref={emblaMainRef}>
              <div className="embla__container flex h-full">
                {images.map((image, index) => (
                  <div
                    className="embla__slide flex-[0_0_100%] min-w-0 h-full relative overflow-hidden"
                    key={index}
                  >
                    <div className="w-full h-full">
                      <img
                        src={getImageUrl(image)}
                        alt={`Item image ${index + 1}`}
                        className="w-full h-full object-cover transition-opacity duration-300"
                        loading={index === 0 ? 'eager' : 'lazy'}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          console.warn(`Failed to load image: ${target.src}`);
                        }}
                        onLoad={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.opacity = '1';
                        }}
                        style={{ opacity: 0 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Futuristic Dark Thumbnail Navigation - Cursor.com Style */}
        {showThumbnails && hasImages && images.length > 1 && (
          <div className="embla-thumbs px-2 sm:px-0 mt-4 relative z-50">
            <div
              className="embla-thumbs__viewport overflow-hidden"
              ref={emblaThumbsRef}
            >
              <div className="embla-thumbs__container flex gap-2 sm:gap-3 md:gap-4">
                {images.map((image, index) => {
                  const isActive = index === selectedIndex;
                  return (
                    <div
                      className="embla-thumbs__slide flex-[0_0_auto] min-w-0"
                      key={index}
                    >
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onThumbClick(index);
                        }}
                        onMouseDown={(e) => e.stopPropagation()}
                        onTouchStart={(e) => e.stopPropagation()}
                        className={`relative z-50 w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl sm:rounded-2xl overflow-hidden border-2 transition-all duration-300 group cursor-pointer ${
                          isActive
                            ? 'border-cyan-400 ring-2 ring-cyan-400/30 shadow-xl shadow-cyan-400/25 scale-105 sm:scale-110'
                            : `${elementTheme.border} hover:border-zinc-600/70 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95`
                        }`}
                        type="button"
                        aria-label={`Go to image ${index + 1}`}
                      >
                        <img
                          src={getThumbnailUrl(image)}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover transition-all duration-300 group-hover:scale-110"
                          loading="lazy"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            // Fallback to full image if thumbnail fails
                            target.src = getImageUrl(image);
                            console.warn(
                              `Failed to load thumbnail, falling back to full image: ${target.src}`
                            );
                          }}
                          onLoad={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.opacity = '1';
                          }}
                          style={{ opacity: 0 }}
                        />

                        {/* Active overlay */}
                        {isActive && (
                          <>
                            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-blue-500/10 to-purple-500/20 pointer-events-none"></div>
                            <div className="absolute inset-0 bg-gradient-to-t from-transparent via-cyan-400/5 to-transparent pointer-events-none"></div>
                          </>
                        )}

                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

                        {/* Active indicator */}
                        {isActive && (
                          <div className="absolute bottom-1 left-1 w-2 h-2 sm:w-3 sm:h-3 bg-zinc-900/80 rounded-full shadow-lg flex items-center justify-center border border-cyan-400/50">
                            <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full animate-pulse"></div>
                          </div>
                        )}

                        {/* Futuristic glow effect */}
                        {isActive && (
                          <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-400/20 via-blue-400/20 to-purple-400/20 rounded-xl sm:rounded-2xl blur-sm opacity-75 animate-pulse"></div>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);

ImageSlideshow.displayName = 'ImageSlideshow';
