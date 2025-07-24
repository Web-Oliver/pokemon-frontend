import React, { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { ChevronLeft, ChevronRight, Package, Sparkles } from 'lucide-react';
import {
  detectImageAspectRatio,
  getResponsiveImageConfig,
  buildResponsiveImageClasses,
  getContext7ContainerClasses,
  getContext7ImageClasses,
  getContext7GlassOverlay,
  getContext7ShimmerEffect,
  type ImageAspectInfo,
} from '../../utils/imageUtils';

interface ImageSlideshowProps {
  images: string[];
  fallbackIcon?: React.ReactNode;
  autoplay?: boolean;
  autoplayDelay?: number;
  className?: string;
  showThumbnails?: boolean;
  adaptiveLayout?: boolean;
  enableAspectRatioDetection?: boolean;
}

export const ImageSlideshow: React.FC<ImageSlideshowProps> = ({
  images,
  fallbackIcon = <Package className='w-8 h-8 text-indigo-600' />,
  autoplay = true,
  autoplayDelay = 3000,
  className = '',
  showThumbnails = false,
  adaptiveLayout = true,
  enableAspectRatioDetection = true,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [imageAspects, setImageAspects] = useState<ImageAspectInfo[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
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

  // Analyze image aspect ratios for adaptive layout
  useEffect(() => {
    if (!enableAspectRatioDetection || !images.length) {
      return;
    }

    const analyzeImages = async () => {
      setIsAnalyzing(true);
      try {
        const aspectPromises = images.map(image => {
          const fullUrl = image.startsWith('http') ? image : `http://localhost:3000${image}`;
          return detectImageAspectRatio(fullUrl);
        });
        
        const aspects = await Promise.all(aspectPromises);
        setImageAspects(aspects);
      } catch (error) {
        console.warn('[ImageSlideshow] Failed to analyze image aspects:', error);
        // Fallback to default square aspect ratios
        setImageAspects(images.map(() => ({ 
          ratio: 1, 
          category: 'square' as const, 
          orientation: 'square' as const,
          cssClass: 'aspect-square',
          containerClass: 'aspect-square',
          responsiveClasses: 'aspect-square'
        })));
      } finally {
        setIsAnalyzing(false);
      }
    };

    analyzeImages();
  }, [images, enableAspectRatioDetection]);

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
  const currentAspect = imageAspects[selectedIndex];
  const responsiveConfig = currentAspect ? getResponsiveImageConfig(currentAspect) : null;

  if (!hasImages) {
    return (
      <div
        className={`w-full group relative overflow-hidden ${className.includes('h-') ? '' : 'h-48'} ${className}`}
      >
        {/* Context7 Premium Fallback Container */}
        <div className={`w-full h-full ${getContext7ContainerClasses('square')} flex items-center justify-center`}>
          {/* Animated Background Pattern */}
          <div className='absolute inset-0 opacity-20'>
            <div className='w-full h-full bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-blue-500/10'></div>
            <div
              className='w-full h-full'
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236366f1' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            ></div>
          </div>

          {/* Context7 Premium Card Mockup */}
          <div className='relative z-10 w-32 h-44 bg-gradient-to-br from-indigo-200 via-purple-200 to-blue-200 rounded-2xl shadow-2xl flex items-center justify-center transform group-hover:scale-105 group-hover:rotate-1 transition-all duration-500'>
            {/* Inner Card */}
            <div className='w-28 h-40 bg-gradient-to-br from-white/90 to-indigo-50/90 rounded-xl shadow-inner flex items-center justify-center border border-white/50'>
              <div className='flex flex-col items-center space-y-2'>
                {fallbackIcon}
                <div className='flex space-x-1'>
                  <div className='w-1 h-1 bg-indigo-400 rounded-full animate-pulse'></div>
                  <div className='w-1 h-1 bg-purple-400 rounded-full animate-pulse delay-75'></div>
                  <div className='w-1 h-1 bg-blue-400 rounded-full animate-pulse delay-150'></div>
                </div>
              </div>
            </div>

            {/* Premium shimmer effect */}
            <div className={getContext7ShimmerEffect()}></div>
          </div>

          {/* Context7 Premium Floating Elements */}
          <div className='absolute top-4 right-4 w-3 h-3 bg-indigo-300/40 rounded-full animate-pulse'></div>
          <div className='absolute bottom-6 left-6 w-2 h-2 bg-purple-300/30 rounded-full animate-bounce delay-200'></div>
          <div className='absolute top-1/3 left-4 w-1.5 h-1.5 bg-blue-300/25 rounded-full animate-ping delay-500'></div>
        </div>
      </div>
    );
  }

  // Determine container classes based on current image aspect ratio
  const getAdaptiveContainerClasses = () => {
    if (!adaptiveLayout || !currentAspect) {
      return className.includes('h-') ? '' : 'h-48';
    }
    
    const config = getResponsiveImageConfig(currentAspect);
    const responsiveClasses = buildResponsiveImageClasses(config);
    return responsiveClasses;
  };

  const containerClasses = getAdaptiveContainerClasses();
  const imageClasses = responsiveConfig ? getContext7ImageClasses(responsiveConfig, true) : `w-full h-full object-cover object-center transition-all duration-500 group-hover:scale-110`;

  return (
    <div className='space-y-6'>
      {/* Context7 Premium Analysis Indicator */}
      {isAnalyzing && enableAspectRatioDetection && (
        <div className='flex items-center justify-center py-2'>
          <div className='flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200/50 shadow-lg'>
            <Sparkles className='w-4 h-4 text-indigo-600 animate-spin' />
            <span className='text-sm font-medium text-indigo-700'>Optimizing layout...</span>
          </div>
        </div>
      )}

      {/* Main Slideshow with Adaptive Layout */}
      <div className='relative w-full group'>
        <div
          className={`relative w-full overflow-hidden ${
            adaptiveLayout && currentAspect 
              ? `${containerClasses} ${getContext7ContainerClasses(currentAspect.orientation)}`
              : `${className.includes('h-') ? '' : 'h-48'} rounded-2xl bg-gradient-to-br from-slate-100 to-white border border-slate-200/50 shadow-xl`
          } ${className}`}
        >
          <div className='embla w-full h-full' ref={emblaMainRef}>
            <div className='embla__container flex h-full'>
              {images.map((image, index) => {
                const imageAspect = imageAspects[index];
                const imageConfig = imageAspect ? getResponsiveImageConfig(imageAspect) : null;
                const slideImageClasses = imageConfig ? getContext7ImageClasses(imageConfig, true) : imageClasses;
                
                return (
                  <div className='embla__slide flex-[0_0_100%] min-w-0 h-full relative overflow-hidden' key={index}>
                    <img
                      src={image.startsWith('http') ? image : `http://localhost:3000${image}`}
                      alt={`Item image ${index + 1}`}
                      className={slideImageClasses}
                      loading="lazy"
                      onError={e => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        console.warn(`Failed to load image: ${target.src}`);
                      }}
                      onLoad={e => {
                        const target = e.target as HTMLImageElement;
                        target.style.opacity = '1';
                      }}
                      style={{ opacity: 0, transition: 'opacity 0.3s ease-in-out' }}
                    />
                    
                    {/* Context7 Premium Glass Overlay */}
                    {imageAspect && (
                      <div className={getContext7GlassOverlay(imageAspect.orientation)}></div>
                    )}
                    
                    {/* Context7 Premium Shimmer Effect */}
                    <div className={getContext7ShimmerEffect()}></div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Context7 Premium Navigation Buttons */}
          {images.length > 1 && (
            <>
              <button
                className='absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/95 backdrop-blur-xl hover:bg-white text-slate-800 rounded-2xl flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 hover:-translate-x-1 z-20 border border-white/50 group/btn'
                onClick={scrollPrev}
                aria-label='Previous image'
              >
                <ChevronLeft className='w-5 h-5 transition-transform duration-300 group-hover/btn:-translate-x-0.5' />
                <div className='absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300'></div>
              </button>
              <button
                className='absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/95 backdrop-blur-xl hover:bg-white text-slate-800 rounded-2xl flex items-center justify-center shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 hover:translate-x-1 z-20 border border-white/50 group/btn'
                onClick={scrollNext}
                aria-label='Next image'
              >
                <ChevronRight className='w-5 h-5 transition-transform duration-300 group-hover/btn:translate-x-0.5' />
                <div className='absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300'></div>
              </button>
            </>
          )}

          {/* Context7 Premium Dots Indicator */}
          {images.length > 1 && !showThumbnails && (
            <div className='absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-20'>
              <div className='flex space-x-2 px-4 py-2 bg-black/20 backdrop-blur-xl rounded-2xl border border-white/20'>
                {images.map((_, index) => {
                  const isActive = index === selectedIndex;
                  const imageAspect = imageAspects[index];
                  
                  return (
                    <button
                      key={index}
                      onClick={() => emblaMainApi?.scrollTo(index)}
                      className={`relative transition-all duration-300 rounded-full ${
                        isActive 
                          ? 'w-8 h-3 bg-white shadow-lg' 
                          : 'w-3 h-3 bg-white/60 hover:bg-white/80 hover:scale-110'
                      }`}
                      aria-label={`Go to image ${index + 1}`}
                    >
                      {/* Context7 Aspect Ratio Indicator */}
                      {isActive && imageAspect && (
                        <div className={`absolute inset-0 rounded-full bg-gradient-to-r opacity-30 ${
                          imageAspect.orientation === 'vertical' 
                            ? 'from-green-400 to-emerald-400'
                            : imageAspect.orientation === 'horizontal'
                            ? 'from-blue-400 to-indigo-400' 
                            : 'from-purple-400 to-pink-400'
                        }`}></div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Context7 Premium Thumbnail Navigation - Only show if showThumbnails is true and multiple images */}
      {showThumbnails && images.length > 1 && (
        <div className='embla-thumbs'>
          <div className='embla-thumbs__viewport overflow-hidden' ref={emblaThumbsRef}>
            <div className='embla-thumbs__container flex gap-3'>
              {images.map((image, index) => {
                const thumbAspect = imageAspects[index];
                const isActive = index === selectedIndex;
                const thumbConfig = thumbAspect ? getResponsiveImageConfig(thumbAspect) : null;
                
                // Determine thumbnail container size based on aspect ratio
                const getThumbnailContainerClass = () => {
                  if (!thumbAspect) return 'w-16 h-16'; // Default square
                  
                  switch (thumbAspect.category) {
                    case 'ultra-wide':
                      return 'w-20 h-12'; // Wide thumbnail
                    case 'wide':
                      return 'w-18 h-14'; // Moderately wide
                    case 'landscape':
                      return 'w-17 h-14'; // Landscape
                    case 'square':
                      return 'w-16 h-16'; // Perfect square
                    case 'portrait':
                      return 'w-14 h-17'; // Portrait
                    case 'tall':
                      return 'w-12 h-18'; // Tall
                    case 'ultra-tall':
                      return 'w-10 h-20'; // Ultra tall
                    default:
                      return 'w-16 h-16';
                  }
                };
                
                const containerClass = getThumbnailContainerClass();
                const thumbImageClasses = thumbConfig 
                  ? getContext7ImageClasses(thumbConfig, false)
                  : 'w-full h-full object-cover object-center';
                
                return (
                  <div className='embla-thumbs__slide flex-[0_0_auto] min-w-0 group/thumb' key={index}>
                    <button
                      onClick={() => onThumbClick(index)}
                      className={`${containerClass} rounded-2xl overflow-hidden border-2 transition-all duration-300 relative ${
                        isActive
                          ? 'border-indigo-500 ring-2 ring-indigo-200/50 shadow-xl scale-110'
                          : 'border-slate-200/50 hover:border-indigo-300 shadow-lg hover:shadow-xl hover:scale-105'
                      } ${getContext7ContainerClasses(thumbAspect?.orientation || 'square')}`}
                      type='button'
                      aria-label={`Go to image ${index + 1}`}
                    >
                      <img
                        src={image.startsWith('http') ? image : `http://localhost:3000${image}`}
                        alt={`Thumbnail ${index + 1}`}
                        className={thumbImageClasses}
                        loading="lazy"
                        onError={e => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.parentElement!.style.backgroundColor = '#f3f4f6';
                          console.warn(`Failed to load thumbnail: ${target.src}`);
                        }}
                        onLoad={e => {
                          const target = e.target as HTMLImageElement;
                          target.style.opacity = '1';
                        }}
                        style={{ opacity: 0, transition: 'opacity 0.3s ease-in-out' }}
                      />
                      
                      {/* Context7 Premium Active Overlay */}
                      {isActive && (
                        <div className='absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-blue-500/20 pointer-events-none'></div>
                      )}
                      
                      {/* Context7 Premium Hover Overlay */}
                      <div className='absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover/thumb:opacity-100 transition-opacity duration-300 pointer-events-none'></div>
                      
                      {/* Context7 Premium Shimmer Effect */}
                      <div className={getContext7ShimmerEffect()}></div>
                      
                      {/* Context7 Premium Aspect Ratio Indicator */}
                      {thumbAspect && enableAspectRatioDetection && (
                        <div className='absolute top-1 right-1 z-10'>
                          <div className={`w-2 h-2 rounded-full ${
                            thumbAspect.orientation === 'vertical' ? 'bg-green-400' :
                            thumbAspect.orientation === 'horizontal' ? 'bg-blue-400' : 'bg-purple-400'
                          } opacity-0 group-hover/thumb:opacity-100 transition-opacity duration-300 shadow-lg`}></div>
                        </div>
                      )}
                      
                      {/* Context7 Premium Active Badge */}
                      {isActive && (
                        <div className='absolute bottom-1 left-1 z-10'>
                          <div className='w-3 h-3 bg-white rounded-full shadow-lg flex items-center justify-center'>
                            <div className='w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse'></div>
                          </div>
                        </div>
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
};
