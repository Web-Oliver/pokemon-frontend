import React, { useCallback, useEffect, useState, memo, useMemo } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { ChevronLeft, ChevronRight, Package } from 'lucide-react';

interface ImageSlideshowProps {
  images: string[];
  fallbackIcon?: React.ReactNode;
  autoplay?: boolean;
  autoplayDelay?: number;
  className?: string;
  showThumbnails?: boolean;
}

export const ImageSlideshow: React.FC<ImageSlideshowProps> = memo(
  ({
    images,
    fallbackIcon = <Package className="w-8 h-8 text-indigo-600" />,
    autoplay = false,
    autoplayDelay = 3000,
    className = '',
    showThumbnails = false,
  }) => {
    const [selectedIndex, setSelectedIndex] = useState(0);

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

    if (!hasImages) {
      return (
        <div
          className={`w-full h-48 bg-zinc-800/60 rounded-xl flex items-center justify-center shadow-2xl border border-zinc-700/20 ${className}`}
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
      <div className="space-y-4">
        {/* Main Slideshow */}
        <div className="relative w-full group">
          {/* Futuristic Dark Navigation Buttons - Cursor.com Style */}
          {hasMultipleImages && (
            <>
              <button
                className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-zinc-900/80 hover:bg-zinc-800/90 text-zinc-300 hover:text-white rounded-lg sm:rounded-xl flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 z-30 border border-zinc-700/50 hover:border-zinc-600 backdrop-blur-xl group"
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
                className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-zinc-900/80 hover:bg-zinc-800/90 text-zinc-300 hover:text-white rounded-lg sm:rounded-xl flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 z-30 border border-zinc-700/50 hover:border-zinc-600 backdrop-blur-xl group"
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
            className={`relative w-full h-full overflow-hidden rounded-xl bg-zinc-800/60 shadow-2xl hover:shadow-3xl transition-all duration-300 border border-zinc-700/20 ${className}`}
            style={{
              boxShadow:
                '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05)',
            }}
          >
            <div className="embla w-full h-full" ref={emblaMainRef}>
              <div className="embla__container flex h-full">
                {images.map((image, index) => (
                  <div
                    className="embla__slide flex-[0_0_100%] min-w-0 h-full relative overflow-hidden"
                    key={index}
                  >
                    <img
                      src={
                        image.startsWith('http')
                          ? image
                          : `http://localhost:3000${image}`
                      }
                      alt={`Item image ${index + 1}`}
                      className="w-full h-full object-cover transition-opacity duration-300"
                      loading="lazy"
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
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Futuristic Dark Dots Indicator - Cursor.com Style */}
        {hasMultipleImages && !showThumbnails && (
          <div className="flex justify-center items-center py-3 sm:py-4">
            <div className="flex space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-2 sm:py-3 bg-zinc-900/60 backdrop-blur-xl rounded-2xl border border-zinc-700/50 shadow-2xl">
              {images.map((_, index) => {
                const isActive = index === selectedIndex;
                return (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      emblaMainApi?.scrollTo(index);
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    className={`relative transition-all duration-300 rounded-full border group ${
                      isActive
                        ? 'w-6 sm:w-8 md:w-10 h-2 sm:h-2.5 md:h-3 bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 border-blue-400/50 shadow-lg shadow-blue-400/25'
                        : 'w-2 sm:w-2.5 md:w-3 h-2 sm:h-2.5 md:h-3 bg-zinc-600 border-zinc-600/50 hover:bg-zinc-500 hover:border-zinc-500/70 hover:scale-125 active:scale-90'
                    }`}
                    aria-label={`Go to image ${index + 1}`}
                    type="button"
                  >
                    {/* Active indicator glow */}
                    {isActive && (
                      <>
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400/40 via-cyan-400/40 to-purple-400/40 blur-sm animate-pulse"></div>
                        <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-blue-400/20 via-cyan-400/20 to-purple-400/20 blur-md"></div>
                      </>
                    )}

                    {/* Hover effect overlay */}
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500/30 via-blue-500/30 to-purple-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Futuristic Dark Thumbnail Navigation - Cursor.com Style */}
        {showThumbnails && hasMultipleImages && (
          <div className="embla-thumbs px-2 sm:px-0">
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
                        className={`relative w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-xl sm:rounded-2xl overflow-hidden border-2 transition-all duration-300 group ${
                          isActive
                            ? 'border-cyan-400 ring-2 ring-cyan-400/30 shadow-xl shadow-cyan-400/25 scale-105 sm:scale-110'
                            : 'border-zinc-700/50 hover:border-zinc-600/70 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95'
                        }`}
                        type="button"
                        aria-label={`Go to image ${index + 1}`}
                      >
                        <img
                          src={
                            image.startsWith('http')
                              ? image
                              : `http://localhost:3000${image}`
                          }
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover transition-all duration-300 group-hover:scale-110"
                          loading="lazy"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            console.warn(
                              `Failed to load thumbnail: ${target.src}`
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
