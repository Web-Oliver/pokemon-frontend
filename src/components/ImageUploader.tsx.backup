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
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Upload, X } from 'lucide-react';
import { PokemonConfirmModal } from '../shared/components/atoms/design-system/PokemonModal';
import { ImageAnalysisIndicator } from '../shared/components/molecules/common/ImageAnalysisIndicator';
import { FormErrorMessage } from '../shared/components/molecules/common/FormElements';
import { useDragAndDrop } from '../shared/hooks/useDragAndDrop';
import { useImageRemoval } from '../shared/hooks/useImageRemoval';
import {
  cleanupObjectURL,
  createExistingImagePreview,
  type ImagePreview,
  processImageFiles,
} from '../shared/utils/ui/imageUtils';
import { cn } from '../shared/utils';

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
  // Memoize existingImageUrls to prevent unnecessary re-renders
  const memoizedExistingImageUrls = useMemo(() => {
    return existingImageUrls || [];
  }, [existingImageUrls?.join(',')]);

  const [previews, setPreviews] = useState<ImagePreview[]>([]);
  const [error, setError] = useState<string | undefined>(undefined);
  const [ctrlPressed, setCtrlPressed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadAreaRef = useRef<HTMLDivElement>(null);

  // Simple aspect ratio analysis state (replaced missing hook)
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const analyzeExistingImages = useCallback(
    async (
      imageUrls: string[]
    ): Promise<
      Array<{
        index: number;
        aspectInfo: any;
      }>
    > => {
      if (!enableAspectRatioDetection || !imageUrls?.length) {
        return [];
      }

      setIsAnalyzing(true);
      try {
        const results = await Promise.all(
          imageUrls.map(async (url, index) => {
            return new Promise<{ index: number; aspectInfo: any }>(
              (resolve) => {
                const img = new Image();
                img.onload = () => {
                  const aspectRatio = img.width / img.height;
                  let aspectInfo = 'square';
                  if (aspectRatio > 1.2) aspectInfo = 'landscape';
                  else if (aspectRatio < 0.8) aspectInfo = 'portrait';

                  resolve({ index, aspectInfo });
                };
                img.onerror = () => resolve({ index, aspectInfo: 'unknown' });
                img.src = url;
              }
            );
          })
        );
        setIsAnalyzing(false);
        return results;
      } catch (error) {
        setIsAnalyzing(false);
        return [];
      }
    },
    [enableAspectRatioDetection]
  );

  const analyzeNewImages = useCallback(
    async (
      images: any[]
    ): Promise<Array<{ index: number; aspectInfo: any }>> => {
      if (!enableAspectRatioDetection || !images.length) {
        return [];
      }

      setIsAnalyzing(true);
      try {
        const results = await Promise.all(
          images.map(async (imageFile, index) => {
            return new Promise<{ index: number; aspectInfo: any }>(
              (resolve) => {
                const img = new Image();
                img.onload = () => {
                  const aspectRatio = img.width / img.height;
                  let aspectInfo = 'square';
                  if (aspectRatio > 1.2) aspectInfo = 'landscape';
                  else if (aspectRatio < 0.8) aspectInfo = 'portrait';

                  resolve({ index, aspectInfo });
                };
                img.onerror = () => resolve({ index, aspectInfo: 'unknown' });
                img.src = URL.createObjectURL(imageFile);
              }
            );
          })
        );
        setIsAnalyzing(false);
        return results;
      } catch (error) {
        setIsAnalyzing(false);
        return [];
      }
    },
    [enableAspectRatioDetection]
  );

  const handleFileDrop = useCallback(
    async (files: FileList) => {
      console.log(
        '[ImageUploader] handleFileDrop called with files:',
        Array.from(files).map((f) => ({ name: f.name, size: f.size }))
      );
      console.log(
        '[ImageUploader] Current previews before processing:',
        previews.length
      );

      const { newFiles, newPreviews, errorMessage } = await processImageFiles(
        files,
        previews,
        maxFiles,
        maxFileSize,
        acceptedTypes
      );

      console.log('[ImageUploader] processImageFiles returned:', {
        newFiles: newFiles.map((f) => ({ name: f.name, size: f.size })),
        newPreviewsCount: newPreviews.length,
        errorMessage,
      });

      if (errorMessage) {
        setError(errorMessage);
        setTimeout(() => setError(undefined), 5000);
      } else {
        setError(undefined);
      }

      // Update previews first
      const updatedPreviews = [...previews, ...newPreviews];
      setPreviews(updatedPreviews);

      // Analyze aspect ratios if enabled
      if (newPreviews.length > 0) {
        const aspectResults = await analyzeNewImages(newPreviews);
        if (aspectResults.length > 0) {
          setPreviews((prev) =>
            prev.map((preview) => {
              const result = aspectResults.find((r) => r.index === preview.id);
              return result
                ? { ...preview, aspectInfo: result.aspectInfo }
                : preview;
            })
          );
        }
      }

      // Update parent component - USE UPDATED PREVIEWS, NOT OLD STATE!
      // Only get files from updatedPreviews (newFiles are already included in updatedPreviews)
      const allFiles = updatedPreviews
        .filter((p) => !p.isExisting && p.file)
        .map((p) => p.file!);
      const remainingExistingUrls = updatedPreviews
        .filter((p) => p.isExisting)
        .map((p) => p.url.replace('http://localhost:3000', ''));

      console.log('[ImageUploader] Calling onImagesChange with:', {
        allFiles: allFiles.map((f) => ({ name: f.name, size: f.size })),
        remainingExistingUrls,
      });

      onImagesChange(allFiles, remainingExistingUrls);
    },
    [
      previews,
      maxFiles,
      maxFileSize,
      acceptedTypes,
      analyzeNewImages,
      onImagesChange,
    ]
  );

  const { dragActive, handleDrag, handleDragIn, handleDragOut, handleDrop } =
    useDragAndDrop(handleFileDrop, disabled);

  const handlePreviewsUpdate = useCallback(
    (updatedPreviews: ImagePreview[]) => {
      setPreviews(updatedPreviews);

      // Update parent component
      const remainingFiles = updatedPreviews
        .filter((p) => !p.isExisting && p.file)
        .map((p) => p.file!);
      const remainingExistingUrls = updatedPreviews
        .filter((p) => p.isExisting)
        .map((p) => p.url.replace('http://localhost:3000', ''));
      onImagesChange(remainingFiles, remainingExistingUrls);
    },
    [onImagesChange]
  );

  const {
    showRemoveConfirm,
    imageToRemove,
    isRemoving,
    handleRemoveImage,
    confirmRemoveImage,
    handleCancelRemoveImage,
  } = useImageRemoval(previews, handlePreviewsUpdate);

  // Handle file input change
  const handleFileChange = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        await handleFileDrop(e.target.files);
      }
      e.target.value = '';
    },
    [handleFileDrop]
  );

  // Open file dialog
  const openFileDialog = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  // Handle clipboard paste
  const handlePaste = useCallback(
    async (e: ClipboardEvent) => {
      if (disabled) return;
      
      const items = e.clipboardData?.items;
      if (!items) return;

      const imageFiles: File[] = [];
      
      // Check clipboard items for images
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile();
          if (file) {
            // Create a new File with a meaningful name
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const extension = file.type.split('/')[1] || 'png';
            const newFile = new File([file], `pasted-image-${timestamp}.${extension}`, {
              type: file.type,
              lastModified: Date.now(),
            });
            imageFiles.push(newFile);
          }
        }
      }

      if (imageFiles.length > 0) {
        e.preventDefault();
        await handleFileDrop(imageFiles as FileList);
      }
    },
    [disabled, handleFileDrop]
  );

  // Add clipboard event listeners when upload area is focused/hovered
  useEffect(() => {
    const uploadArea = uploadAreaRef.current;
    if (!uploadArea || disabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Track Ctrl key state for visual feedback
      if (e.ctrlKey || e.metaKey) {
        setCtrlPressed(true);
      }
      
      // Listen for Ctrl+V or Cmd+V
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        // Focus the upload area to ensure paste event is captured
        uploadArea.focus();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      // Reset Ctrl key state
      if (!e.ctrlKey && !e.metaKey) {
        setCtrlPressed(false);
      }
    };

    // Add event listeners
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    uploadArea.addEventListener('paste', handlePaste);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      uploadArea.removeEventListener('paste', handlePaste);
    };
  }, [handlePaste, disabled]);

  // Reset previews when existingImageUrls changes, but preserve new uploads
  useEffect(() => {
    if (!memoizedExistingImageUrls || memoizedExistingImageUrls.length === 0) {
      setPreviews((current) => current.filter((p) => !p.isExisting));
      return;
    }

    // Remove duplicates from existingImageUrls
    const uniqueUrls = Array.from(new Set(memoizedExistingImageUrls));

    // Preserve any non-existing previews (newly uploaded files) and add existing ones
    setPreviews((current) => {
      const newUploads = current.filter((p) => !p.isExisting);
      const existingPreviews = uniqueUrls.map((url, index) =>
        createExistingImagePreview(url, index)
      );
      const combined = [...existingPreviews, ...newUploads];
      return combined;
    });
  }, [memoizedExistingImageUrls]);

  // Analyze existing images when previews change - Following DIP
  useEffect(() => {
    if (!memoizedExistingImageUrls.length || !enableAspectRatioDetection) return;

    const analyzeExisting = async () => {
      const aspectResults = await analyzeExistingImages(memoizedExistingImageUrls);
      if (Array.isArray(aspectResults) && aspectResults.length > 0) {
        setPreviews((prev) =>
          prev.map((preview, index) => {
            const result = aspectResults.find((r) => r.index === index);
            return result
              ? { ...preview, aspectInfo: result.aspectInfo }
              : preview;
          })
        );
      }
    };

    analyzeExisting();
  }, [memoizedExistingImageUrls, enableAspectRatioDetection]);

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
        ref={uploadAreaRef}
        tabIndex={disabled ? -1 : 0}
        className={cn(
          'relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
          {
            'border-blue-400 bg-blue-50/50': dragActive && !disabled,
            'border-green-400 bg-green-50/50': ctrlPressed && !dragActive && !disabled,
            'border-gray-300 hover:border-gray-400': !dragActive && !ctrlPressed && !disabled,
            'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60': disabled,
          }
        )}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        title={disabled ? '' : 'Drag & drop, click to browse, or Ctrl+V to paste images'}
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
            <p className="text-sm text-gray-500 mb-2">
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
            <p className="text-sm text-gray-500 mb-4">
              📋 <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">Ctrl+V</kbd> to paste images from clipboard
            </p>
            <p className="text-xs text-gray-400">
              Supports {acceptedTypes.join(', ')} • Max {maxFileSize}MB per file
              • Up to {maxFiles} files
            </p>
          </div>
        )}
      </div>

      {/* Error display */}
      <FormErrorMessage
        error={error}
        variant="toast"
        dismissible
        onDismiss={() => setError(undefined)}
      />

      {/* Image previews grid */}
      {previews.length > 0 && (
        <div className="mt-6">
          <div
            className={cn('grid gap-4', {
              'grid-cols-1': adaptiveLayout && previews.length === 1,
              'grid-cols-2': adaptiveLayout && previews.length === 2,
              'grid-cols-2 sm:grid-cols-3':
                adaptiveLayout && previews.length >= 3,
              'grid-cols-2 sm:grid-cols-3 md:grid-cols-4': !adaptiveLayout,
            })}
          >
            {previews.map((preview) => {
              console.log(
                '[ImageUploader] Rendering preview:',
                preview.id,
                preview.url
              );
              return (
                <div key={preview.id} className="relative group w-fit">
                  <img
                    src={preview.url}
                    alt="Preview"
                    className="max-w-[200px] h-auto transition-transform duration-300 group-hover:scale-105"
                  />
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
              );
            })}
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

export default ImageUploader;
