/**
 * ImageUploader Component - Context7 Award-Winning Design
 *
 * Ultra-premium image upload component with stunning visual hierarchy and micro-interactions.
 * Features glass-morphism, premium gradients, and award-winning Context7 design patterns.
 *
 * Following CLAUDE.md + Context7 principles:
 * - Award-winning visual design with micro-interactions
 * - Glass-morphism and depth with floating elements
 * - Premium color palettes and gradients
 * - Context7 design system compliance
 * - Stunning animations and hover effects
 */

import React, {
  ChangeEvent,
  DragEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { AlertCircle, Camera, Image, Sparkles, Upload, X } from 'lucide-react';
import { PokemonConfirmModal } from './design-system/PokemonModal';
import { GlassmorphismContainer } from './effects/GlassmorphismContainer';
import {
  detectImageAspectRatio,
  getContext7ContainerClasses,
  getContext7GlassOverlay,
  getContext7ImageClasses,
  getContext7ShimmerEffect,
  getOptimalGridLayout,
  getResponsiveImageConfig,
  type ImageAspectInfo,
} from '../utils/fileOperations';
import { cn } from '../utils/themeUtils';

interface ImageUploaderProps {
  onImagesChange: (files: File[], remainingExistingUrls?: string[]) => void;
  existingImageUrls?: string[];
  multiple?: boolean;
  maxFiles?: number;
  maxFileSize?: number; // in MB
  acceptedTypes?: string[];
  disabled?: boolean;
  enableAspectRatioDetection?: boolean;
  adaptiveLayout?: boolean;
}

interface ImagePreview {
  id: string;
  file?: File;
  url: string;
  isExisting?: boolean;
  aspectInfo?: ImageAspectInfo;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImagesChange,
  existingImageUrls = [],
  multiple = true,
  maxFiles = 10,
  maxFileSize = 5, // 5MB default
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  disabled = false,
  enableAspectRatioDetection = true,
  adaptiveLayout = true,
}) => {
  // State management - Following SRP
  const [previews, setPreviews] = useState<ImagePreview[]>(() => {
    return existingImageUrls.map((url, index) => createExistingImagePreview(url, index));
  });
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Custom hooks - Following DIP and SRP
  const { isAnalyzing, analyzeExistingImages, analyzeNewImages } = useAspectRatioAnalysis(
    enableAspectRatioDetection,
    detectImageAspectRatio
  );

  const handleFileDrop = useCallback(async (files: FileList) => {
    const { newFiles, newPreviews, errorMessage } = await processImageFiles(
      files,
      previews,
      maxFiles,
      maxFileSize,
      acceptedTypes
    );

    if (errorMessage) {
      setError(errorMessage);
      setTimeout(() => setError(null), 5000);
    } else {
      setError(null);
    }

    // Update previews first
    const updatedPreviews = [...previews, ...newPreviews];
    setPreviews(updatedPreviews);

    // Analyze aspect ratios if enabled
    if (newPreviews.length > 0) {
      const aspectResults = await analyzeNewImages(newPreviews);
      if (aspectResults.length > 0) {
        setPreviews(prev => prev.map(preview => {
          const result = aspectResults.find(r => r.id === preview.id);
          return result ? { ...preview, aspectInfo: result.aspectInfo } : preview;
        }));
      }
    }

    // Update parent component
    const allFiles = [
      ...previews.filter(p => !p.isExisting && p.file).map(p => p.file!),
      ...newFiles,
    ];
    const remainingExistingUrls = previews
      .filter(p => p.isExisting)
      .map(p => p.url.replace('http://localhost:3000', ''));
    onImagesChange(allFiles, remainingExistingUrls);
  }, [previews, maxFiles, maxFileSize, acceptedTypes, analyzeNewImages, onImagesChange]);

  const { dragActive, handleDrag, handleDragIn, handleDragOut, handleDrop } = useDragAndDrop(
    handleFileDrop,
    disabled
  );

  const handlePreviewsUpdate = useCallback((updatedPreviews: ImagePreview[]) => {
    setPreviews(updatedPreviews);
    
    // Update parent component
    const remainingFiles = updatedPreviews
      .filter(p => !p.isExisting && p.file)
      .map(p => p.file!);
    const remainingExistingUrls = updatedPreviews
      .filter(p => p.isExisting)
      .map(p => p.url.replace('http://localhost:3000', ''));
    onImagesChange(remainingFiles, remainingExistingUrls);
  }, [onImagesChange]);

  const {
    showRemoveConfirm,
    imageToRemove,
    isRemoving,
    handleRemoveImage,
    confirmRemoveImage,
    handleCancelRemoveImage,
  } = useImageRemoval(previews, handlePreviewsUpdate);

  // Handle file input change
  const handleFileChange = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await handleFileDrop(e.target.files);
    }
    e.target.value = '';
  }, [handleFileDrop]);

  // Open file dialog
  const openFileDialog = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  // Analyze existing images on mount - Following DIP
  useEffect(() => {
    if (!existingImageUrls.length) return;

    const analyzeExisting = async () => {
      const aspectResults = await analyzeExistingImages(existingImageUrls);
      if (aspectResults.length > 0) {
        setPreviews(prev => prev.map((preview, index) => {
          const result = aspectResults.find(r => r.index === index);
          return result ? { ...preview, aspectInfo: result.aspectInfo } : preview;
        }));
      }
    };

    analyzeExisting();
  }, [existingImageUrls, analyzeExistingImages]);

  // Cleanup object URLs on unmount - Following proper resource management
  useEffect(() => {
    return () => {
      previews.forEach(cleanupObjectURL);
    };
  }, [previews]);

  return (
    <div className="w-full">
      {/* Analysis indicator component - Following SRP */}
      <ImageAnalysisIndicator 
        isAnalyzing={isAnalyzing} 
        enableAspectRatioDetection={enableAspectRatioDetection} 
      />

      {/* Rest of component continues with drag/drop zone and preview grid... */}
      {/* Main upload area */}
      <div
        className={cn(
          'relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300',
          {
            'border-blue-400 bg-blue-50/50': dragActive && !disabled,
            'border-gray-300 hover:border-gray-400': !dragActive && !disabled,
            'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60': disabled,
          }
        )}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={acceptedTypes.join(',')}
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled}
        />

        {dragActive ? (
          <div className="py-8">
            <Upload className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <p className="text-lg font-medium text-blue-700">
              Release to add your beautiful images
            </p>
          </div>


        ) : (
          <div className="py-4">
            <Upload className="w-10 h-10 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-700 mb-2">
              ✨ Drop your images here!
            </p>
            <p className="text-sm text-gray-500 mb-4">
              or{' '}
              <button
                type="button"
                onClick={openFileDialog}
                disabled={disabled}
                className="text-blue-600 hover:text-blue-700 font-medium underline"
              >
                browse files
              </button>
            </p>
            <p className="text-xs text-gray-400">
              Supports {acceptedTypes.join(', ')} • Max {maxFileSize}MB per file • Up to{' '}
              {maxFiles} files
            </p>
          </div>
        )}
      </div>

      {/* Error display */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Image previews grid */}
      {previews.length > 0 && (
        <div className="mt-6">
          <div
            className={cn('grid gap-4', {
              'grid-cols-1': adaptiveLayout && previews.length === 1,
              'grid-cols-2': adaptiveLayout && previews.length === 2,
              'grid-cols-2 sm:grid-cols-3': adaptiveLayout && previews.length >= 3,
              'grid-cols-2 sm:grid-cols-3 md:grid-cols-4': !adaptiveLayout,
            })}
          >
            {previews.map((preview) => (
              <div key={preview.id} className="relative group">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={preview.url}
                    alt="Preview"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveImage(preview.id)}
                  disabled={isRemoving}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                </button>
                {preview.aspectInfo && (
                  <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 text-white text-xs rounded">
                    {preview.aspectInfo.category}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confirmation modal for removing images */}
      {showRemoveConfirm && imageToRemove && (
        <PokemonConfirmModal
          isOpen={showRemoveConfirm}
          onClose={handleCancelRemoveImage}
          onConfirm={confirmRemoveImage}
          title="Remove Image"
          confirmMessage={`Are you sure you want to remove this ${
            imageToRemove.isExisting ? 'existing' : 'new'
          } image?`}
          confirmText="Remove"
          variant="danger"
          loading={isRemoving}
        />
      )}
    </div>
  );
};

      {/* Context7 Premium Error Message */}
      {error && (
        <GlassmorphismContainer
          variant="subtle"
          colorScheme="danger"
          size="md"
          rounded="2xl"
          glow="subtle"
          className="mb-6 flex items-center border border-red-200/60"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-rose-500/5"></div>
          <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-rose-500 rounded-xl flex items-center justify-center mr-3 shadow-lg">
            <AlertCircle className="w-4 h-4 text-white" />
          </div>
          <p className="text-sm text-red-700 font-medium relative z-10">
            {error}
          </p>
        </GlassmorphismContainer>
      )}

      {/* Context7 Premium Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-3xl transition-all duration-500 ease-out group overflow-hidden ${dragActive ? 'border-indigo-400 bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 shadow-2xl scale-105' : disabled ? 'border-zinc-700/40 bg-zinc-800/50' : 'border-slate-300 hover:border-indigo-300 hover:bg-gradient-to-br hover:from-indigo-50/30 hover:via-blue-50/30 hover:to-purple-50/30 hover:shadow-xl hover:scale-102'} ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'} backdrop-blur-sm`}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        {/* Context7 Premium Background Pattern */}
        <div className="absolute inset-0 opacity-30">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236366f1' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>

        {/* Premium floating particles */}
        {dragActive && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-indigo-300/40 rounded-full animate-bounce"></div>
            <div className="absolute top-3/4 right-1/3 w-1.5 h-1.5 bg-blue-300/30 rounded-full animate-pulse delay-100"></div>
            <div className="absolute bottom-1/4 left-1/3 w-1 h-1 bg-purple-300/25 rounded-full animate-ping delay-200"></div>
          </div>
        )}

        <div className="p-10 text-center relative z-10">
          {/* Context7 Premium Upload Icon */}
          <div
            className={`mx-auto w-20 h-20 mb-6 rounded-2xl flex items-center justify-center transition-all duration-500 ${disabled ? 'bg-slate-100 text-slate-300' : dragActive ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-2xl scale-110 rotate-3' : 'bg-gradient-to-br from-zinc-800/60 to-zinc-900/80 text-zinc-400 group-hover:from-cyan-900/30 group-hover:to-blue-900/30 group-hover:text-cyan-400 group-hover:scale-110 group-hover:shadow-xl border border-zinc-700/40 group-hover:border-cyan-600/40'}`}
          >
            {dragActive ? (
              <Sparkles className="w-10 h-10 animate-pulse" />
            ) : (
              <div className="relative">
                <Camera className="w-8 h-8" />
                <Upload className="w-4 h-4 absolute -top-1 -right-1" />
              </div>
            )}
          </div>

          <p
            className={`text-xl font-bold mb-3 tracking-wide ${disabled ? 'text-slate-400' : dragActive ? 'text-indigo-700' : 'text-slate-700 group-hover:text-indigo-700'} transition-colors duration-300`}
          >
            {dragActive ? '✨ Drop your images here!' : 'Upload Premium Images'}
          </p>

          <p
            className={`text-sm mb-6 font-medium ${disabled ? 'text-slate-300' : 'text-slate-500 group-hover:text-slate-600'} transition-colors duration-300`}
          >
            {dragActive
              ? 'Release to add your beautiful images'
              : 'Drag and drop your images here, or click to browse'}
          </p>

          {/* Context7 Premium Specs */}
          <div
            className={`inline-flex items-center space-x-4 px-6 py-3 rounded-2xl text-xs font-semibold tracking-wide transition-all duration-300 ${disabled ? 'bg-slate-100 text-slate-300' : 'bg-zinc-800/80 backdrop-blur-sm text-zinc-400 border border-zinc-700/40 shadow-lg group-hover:bg-cyan-900/30 group-hover:text-cyan-400 group-hover:border-cyan-600/40'}`}
          >
            <div className="flex items-center space-x-1">
              <Image className="w-3 h-3" />
              <span>JPEG, PNG, WebP</span>
            </div>
            <div className="w-1 h-1 bg-slate-300 dark:bg-zinc-700 dark:bg-zinc-700 rounded-full"></div>
            <span>Max {maxFileSize}MB</span>
            <div className="w-1 h-1 bg-slate-300 dark:bg-zinc-700 dark:bg-zinc-700 rounded-full"></div>
            <span>Up to {maxFiles} files</span>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes.join(',')}
          multiple={multiple}
          onChange={handleFileChange}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          style={{ display: 'none' }}
        />
      </div>

      {/* Context7 Premium Image Previews */}
      {previews.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-lg font-bold text-slate-800 dark:text-zinc-200 dark:text-zinc-100 tracking-wide">
              Selected Images
            </h4>
            <div className="px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-2xl border border-indigo-200/50 shadow-lg">
              <span className="text-sm font-bold text-indigo-700">
                {previews.length} {previews.length === 1 ? 'Image' : 'Images'}
              </span>
            </div>
          </div>

          <div
            className={`grid ${getOptimalGridLayout(previews.map((p) => p.aspectInfo).filter(Boolean) as ImageAspectInfo[])}`}
          >
            {previews.map((preview) => {
              const aspectInfo = preview.aspectInfo;
              const previewConfig = aspectInfo
                ? getResponsiveImageConfig(aspectInfo)
                : null;

              // Determine container aspect ratio class
              const getContainerAspectClass = () => {
                if (!adaptiveLayout || !aspectInfo) {
                  return 'aspect-[3/5]';
                } // Default portrait

                switch (aspectInfo.category) {
                  case 'ultra-wide':
                    return 'aspect-[5/2] max-h-48';
                  case 'wide':
                    return 'aspect-video max-h-56';
                  case 'landscape':
                    return 'aspect-[4/3] max-h-64';
                  case 'square':
                    return 'aspect-square max-h-72';
                  case 'portrait':
                    return 'aspect-[3/4] max-h-80';
                  case 'tall':
                    return 'aspect-[3/5] max-h-88';
                  case 'ultra-tall':
                    return 'aspect-[2/5] max-h-96';
                  default:
                    return 'aspect-[3/5]';
                }
              };

              const containerAspectClass = getContainerAspectClass();
              const containerClasses = aspectInfo
                ? getContext7ContainerClasses(aspectInfo.orientation)
                : 'rounded-2xl overflow-hidden bg-gradient-to-br from-zinc-800/60 to-zinc-900/80 border border-zinc-700/40 shadow-xl group-hover:shadow-2xl transition-all duration-500 group-hover:scale-105 relative';

              const imageClasses = previewConfig
                ? getContext7ImageClasses(previewConfig, true)
                : 'w-full h-full object-cover transition-all duration-500 group-hover:scale-110';

              return (
                <div key={preview.id} className="relative group">
                  {/* Context7 Premium Responsive Image Container */}
                  <div
                    className={`${containerAspectClass} ${containerClasses}`}
                  >
                    <img
                      src={preview.url}
                      alt="Preview"
                      className={imageClasses}
                      onError={(e) => {
                        // Handle broken image
                        const target = e.target as HTMLImageElement;
                        target.src =
                          'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAyOEMxNi42ODYzIDI4IDEzLjUwNTQgMjYuNjgzOSAxMS4xNzE2IDI0LjM1MDRDOC44Mzc4NCAyMi4wMTY5IDcuNTIxNjggMTguODM2IDcuNTIxNjggMTUuNTIyNEM3LjUyMTY4IDEyLjIwODggOC44Mzc4NCA5LjAyNzkxIDExLjE3MTYgNi42OTQ0MkMxMy41MDU0IDQuMzYwOTMgMTYuNjg2MyAzLjA0NDc3IDIwIDMuMDQ0NzdDMjMuMzE0IDMuMDQ0NzcgMjYuNDk0OSA0LjM2MDkzIDI4LjgyODMgNi42OTQ0MkMzMS4xNjIyIDkuMDI3OTEgMzIuNDc4MyAxMi4yMDg4IDMyLjQ3ODMgMTUuNTIyNEMzMi40NzgzIDE4LjgzNiAzMS4xNjIyIDIyLjAxNjkgMjguODI4MyAyNC4zNTA0QzI2LjQ5NDkgMjYuNjgzOSAyMy4zMTQgMjggMjAgMjhaIiBmaWxsPSIjRDFEOURCIi8+CjxwYXRoIGQ9Ik0yMCAyMi41NDc3QzE5LjQxNjcgMjIuNTQ3NyAxOC44NjY3IDIyLjMxNTQgMTguNDYxOSAyMS45MTA2QzE4LjA1NzEgMjEuNTA1OCAxNy44MjQ4IDIwLjk1NTggMTcuODI0OCAyMC4zNzI0VjE0LjE5NzdDMTcuODI0OCAxMy42MTQ0IDE4LjA1NzEgMTMuMDY0NCAxOC40NjE5IDEyLjY1OTZDMTguODY2NyAxMi4yNTQ4IDE5LjQxNjcgMTIuMDIyNSAyMCAxMi4wMjI1QzIwLjU4MzMgMTIuMDIyNSAyMS4xMzMzIDEyLjI1NDggMjEuNTM4MSAxMi42NTk2QzIxLjk0MjkgMTMuMDY0NCAyMi4xNzUyIDEzLjYxNDQgMjIuMTc1MiAxNC4xOTc3VjIwLjM3MjRDMjIuMTc1MiAyMC45NTU4IDIxLjk0MjkgMjEuNTA1OCAyMS41MzgxIDIxLjkxMDZDMjEuMTMzMyAyMi4zMTU0IDIwLjU4MzMgMjIuNTQ3NyAyMCAyMi41NDc3WiIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNMjAgMjYuNjk2N0MxOS40MTY3IDI2LjY5NjcgMTguODY2NyAyNi40NjQ0IDE4LjQ2MTkgMjYuMDU5NkMxOC4wNTcxIDI1LjY1NDggMTcuODI0OCAyNS4xMDQ4IDE3LjgyNDggMjQuNTIxNUMxNy44MjQ4IDIzLjkzODEgMTguMDU3MSAyMy4zODgxIDE4LjQ2MTkgMjIuOTgzM0MxOC44NjY3IDIyLjU3ODUgMTkuNDE2NyAyMi4zNDYyIDIwIDIyLjM0NjJDMjAuNTgzMyAyMi4zNDYyIDIxLjEzMzMgMjIuNTc4NSAyMS41MzgxIDIyLjk4MzNDMjEuOTQyOSAyMy4zODgxIDIyLjE3NTIgMjMuOTM4MSAyMi4xNzUyIDI0LjUyMTVDMjIuMTc1MiAyNS4xMDQ4IDIxLjk0MjkgMjUuNjU0OCAyMS41MzgxIDI2LjA1OTZDMjEuMTMzMyAyNi40NjQ0IDIwLjU4MzMgMjYuNjk2NyAyMCAyNi42OTY3WiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
                      }}
                    />

                    {/* Context7 Premium Glass Overlay */}
                    {aspectInfo && (
                      <div
                        className={getContext7GlassOverlay(
                          aspectInfo.orientation
                        )}
                      ></div>
                    )}

                    {/* Context7 Premium Shimmer Effect */}
                    <div className={getContext7ShimmerEffect()}></div>
                  </div>

                  {/* Context7 Premium Remove Button */}
                  {!disabled && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleRemoveImage(preview.id);
                      }}
                      onDoubleClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      disabled={isRemoving || showRemoveConfirm}
                      className={`absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white rounded-2xl flex items-center justify-center transition-all duration-300 opacity-75 group-hover:opacity-100 hover:opacity-100 shadow-lg hover:shadow-xl hover:scale-110 border-2 border-zinc-600 backdrop-blur-sm ${isRemoving || showRemoveConfirm ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                      aria-label="Remove image"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}

                  {/* Context7 Premium Existing Image Badge */}
                  {preview.isExisting && (
                    <div className="absolute bottom-2 left-2 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg border border-zinc-600/20 backdrop-blur-sm">
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-zinc-200 rounded-full animate-pulse"></div>
                        <span>Existing</span>
                      </div>
                    </div>
                  )}

                  {/* Context7 Premium Hover Effects */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Remove Image Confirmation Modal */}
      <PokemonConfirmModal
        isOpen={showRemoveConfirm}
        onClose={handleCancelRemoveImage}
        onConfirm={confirmRemoveImage}
        title="Remove Image"
        confirmMessage={`Are you sure you want to remove this image? ${
          imageToRemove?.isExisting
            ? 'This will permanently remove the image from your collection.'
            : 'This will remove the image from the upload queue.'
        }`}
        confirmText="Remove Image"
        variant={imageToRemove?.isExisting ? 'danger' : 'warning'}
        loading={isRemoving}
      />
    </div>
  );
};

export default ImageUploader;
