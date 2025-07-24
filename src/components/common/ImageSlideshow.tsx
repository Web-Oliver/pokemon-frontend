import React, { useCallback, useEffect, useState } from 'react';
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

export const ImageSlideshow: React.FC<ImageSlideshowProps> = ({
  images,
  fallbackIcon = <Package className='w-8 h-8 text-indigo-600' />,
  autoplay = false,
  autoplayDelay = 3000,
  className = '',
  showThumbnails = false,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [emblaMainRef, emblaMainApi] = useEmblaCarousel(
    { loop: true, duration: 25 },
    autoplay ? [Autoplay({ delay: autoplayDelay, stopOnInteraction: false })] : []
  );
  const [emblaThumbsRef, emblaThumbsApi] = useEmblaCarousel({
    containScroll: 'keepSnaps',
    dragFree: true,
  });

  const onThumbClick = useCallback(
    (index: number) => {
      if (!emblaMainApi || !emblaThumbsApi) {
        return;
      }
      emblaMainApi.scrollTo(index);
    },
    [emblaMainApi, emblaThumbsApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaMainApi || !emblaThumbsApi) {
      return;
    }
    setSelectedIndex(emblaMainApi.selectedScrollSnap());
    emblaThumbsApi.scrollTo(emblaMainApi.selectedScrollSnap());
  }, [emblaMainApi, emblaThumbsApi, setSelectedIndex]);

  useEffect(() => {
    if (!emblaMainApi) {
      return;
    }
    onSelect();
    emblaMainApi.on('select', onSelect);
    emblaMainApi.on('reInit', onSelect);
  }, [emblaMainApi, onSelect]);


  const scrollPrev = useCallback((e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (emblaMainApi) {
      emblaMainApi.scrollPrev();
    }
  }, [emblaMainApi]);

  const scrollNext = useCallback((e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (emblaMainApi) {
      emblaMainApi.scrollNext();
    }
  }, [emblaMainApi]);

  const hasImages = images && images.length > 0;

  if (!hasImages) {
    return (
      <div className={`w-full h-48 bg-gray-100 rounded-xl flex items-center justify-center ${className}`}>
        <div className='flex flex-col items-center space-y-2 text-gray-400'>
          {fallbackIcon}
          <span className='text-sm'>No images available</span>
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      {/* Main Slideshow */}
      <div className='relative w-full group'>
        {/* Navigation Buttons - Centered */}
        {images.length > 1 && (
          <>
            <button
              className='absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white text-gray-800 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 z-30'
              onClick={scrollPrev}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              aria-label='Previous image'
              type='button'
            >
              <ChevronLeft className='w-5 h-5' />
            </button>
            <button
              className='absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white text-gray-800 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 z-30'
              onClick={scrollNext}
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              aria-label='Next image'
              type='button'
            >
              <ChevronRight className='w-5 h-5' />
            </button>
          </>
        )}

        <div className={`relative w-full h-full overflow-hidden rounded-xl bg-gray-100 ${className}`}>
          <div className='embla w-full h-full' ref={emblaMainRef}>
            <div className='embla__container flex h-full'>
              {images.map((image, index) => (
                <div
                  className='embla__slide flex-[0_0_100%] min-w-0 h-full relative overflow-hidden'
                  key={index}
                >
                  <img
                    src={image.startsWith('http') ? image : `http://localhost:3000${image}`}
                    alt={`Item image ${index + 1}`}
                    className='w-full h-full object-cover transition-opacity duration-300'
                    loading='lazy'
                    onError={e => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      console.warn(`Failed to load image: ${target.src}`);
                    }}
                    onLoad={e => {
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

      {/* Dots Indicator */}
      {images.length > 1 && !showThumbnails && (
        <div className='flex justify-center items-center py-2'>
          <div className='flex space-x-2 px-3 py-2 bg-black/10 rounded-xl'>
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
                  className={`transition-all duration-200 rounded-full ${
                    isActive
                      ? 'w-6 h-2 bg-white'
                      : 'w-2 h-2 bg-white/60 hover:bg-white/80'
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                  type='button'
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Thumbnail Navigation */}
      {showThumbnails && images.length > 1 && (
        <div className='embla-thumbs'>
          <div className='embla-thumbs__viewport overflow-hidden' ref={emblaThumbsRef}>
            <div className='embla-thumbs__container flex gap-3'>
              {images.map((image, index) => {
                const isActive = index === selectedIndex;
                return (
                  <div className='embla-thumbs__slide flex-[0_0_auto] min-w-0' key={index}>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onThumbClick(index);
                      }}
                      onMouseDown={(e) => e.stopPropagation()}
                      onTouchStart={(e) => e.stopPropagation()}
                      className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                        isActive
                          ? 'border-blue-500 scale-105'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                      type='button'
                      aria-label={`Go to image ${index + 1}`}
                    >
                      <img
                        src={image.startsWith('http') ? image : `http://localhost:3000${image}`}
                        alt={`Thumbnail ${index + 1}`}
                        className='w-full h-full object-cover transition-opacity duration-300'
                        loading='lazy'
                        onError={e => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          console.warn(`Failed to load thumbnail: ${target.src}`);
                        }}
                        onLoad={e => {
                          const target = e.target as HTMLImageElement;
                          target.style.opacity = '1';
                        }}
                        style={{ opacity: 0 }}
                      />
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
};
