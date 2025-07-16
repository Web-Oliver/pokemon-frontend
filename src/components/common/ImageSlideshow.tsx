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
  autoplay = true,
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

  const scrollPrev = useCallback(() => {
    if (emblaMainApi) {
      emblaMainApi.scrollPrev();
    }
  }, [emblaMainApi]);

  const scrollNext = useCallback(() => {
    if (emblaMainApi) {
      emblaMainApi.scrollNext();
    }
  }, [emblaMainApi]);

  const hasImages = images && images.length > 0;

  if (!hasImages) {
    return (
      <div
        className={`w-full ${className.includes('h-') ? '' : 'h-48'} bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center overflow-hidden shadow-inner ${className}`}
      >
        <div className='w-32 h-44 bg-gradient-to-br from-indigo-300 to-purple-300 rounded-xl shadow-lg flex items-center justify-center transform group-hover:scale-105 transition-transform duration-300'>
          <div className='w-24 h-32 bg-gradient-to-br from-white/80 to-indigo-50/80 rounded-lg flex items-center justify-center'>
            {fallbackIcon}
          </div>
        </div>
      </div>
    );
  }

  const heightClass = className.includes('h-') ? '' : 'h-48';
  const imageHeightClass = className.includes('h-') ? 'h-full' : 'h-48';

  return (
    <div className='space-y-4'>
      {/* Main Slideshow */}
      <div
        className={`relative w-full ${heightClass} overflow-hidden rounded-2xl shadow-inner ${className}`}
      >
        <div className='embla h-full' ref={emblaMainRef}>
          <div className='embla__container flex h-full'>
            {images.map((image, index) => (
              <div className='embla__slide flex-[0_0_100%] min-w-0 h-full' key={index}>
                <img
                  src={`http://localhost:3000${image}`}
                  alt={`Item image ${index + 1}`}
                  className={`w-full ${imageHeightClass} object-cover object-center`}
                  onError={e => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Buttons - Only show if multiple images */}
        {images.length > 1 && (
          <>
            <button
              className='absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 z-10'
              onClick={scrollPrev}
              aria-label='Previous image'
            >
              <ChevronLeft className='w-4 h-4' />
            </button>
            <button
              className='absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white text-gray-800 w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 z-10'
              onClick={scrollNext}
              aria-label='Next image'
            >
              <ChevronRight className='w-4 h-4' />
            </button>
          </>
        )}

        {/* Dots Indicator - Only show if multiple images and no thumbnails */}
        {images.length > 1 && !showThumbnails && (
          <div className='absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1 z-10'>
            {images.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                  index === selectedIndex ? 'bg-white' : 'bg-white/70 hover:bg-white'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnail Navigation - Only show if showThumbnails is true and multiple images */}
      {showThumbnails && images.length > 1 && (
        <div className='embla-thumbs'>
          <div className='embla-thumbs__viewport overflow-hidden' ref={emblaThumbsRef}>
            <div className='embla-thumbs__container flex gap-2'>
              {images.map((image, index) => (
                <div className='embla-thumbs__slide flex-[0_0_20%] min-w-0' key={index}>
                  <button
                    onClick={() => onThumbClick(index)}
                    className={`w-full h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                      index === selectedIndex
                        ? 'border-indigo-500 ring-2 ring-indigo-200 shadow-lg'
                        : 'border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md'
                    }`}
                    type='button'
                    aria-label={`Go to image ${index + 1}`}
                  >
                    <img
                      src={`http://localhost:3000${image}`}
                      alt={`Thumbnail ${index + 1}`}
                      className='w-full h-full object-cover object-center'
                      onError={e => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.parentElement!.style.backgroundColor = '#f3f4f6';
                      }}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
