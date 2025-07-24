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

import React, { useState, useRef, DragEvent, ChangeEvent, useEffect } from 'react';
import { Upload, X, AlertCircle, Camera, Image, Sparkles } from 'lucide-react';
import ConfirmModal from './common/ConfirmModal';
import {
  detectImageAspectRatio,
  getResponsiveImageConfig,
  buildResponsiveImageClasses,
  getContext7ContainerClasses,
  getContext7ImageClasses,
  getContext7GlassOverlay,
  getContext7ShimmerEffect,
  getOptimalGridLayout,
  type ImageAspectInfo,
} from '../utils/fileOperations';

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
  const [previews, setPreviews] = useState<ImagePreview[]>(() => {
    // Initialize with existing images
    return existingImageUrls.map((url, index) => {
      // Convert relative URLs to full URLs
      const fullUrl = url.startsWith('http') ? url : `http://localhost:3000${url}`;
      return {
        id: `existing-${index}`,
        url: fullUrl,
        isExisting: true,
      };
    });
  });
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [imageToRemove, setImageToRemove] = useState<{ id: string; isExisting: boolean } | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Analyze aspect ratios for existing images
  useEffect(() => {
    if (!enableAspectRatioDetection || !existingImageUrls.length) {
      return;
    }

    const analyzeExistingImages = async () => {
      setIsAnalyzing(true);
      try {
        const aspectPromises = existingImageUrls.map(async (url, index) => {
          const fullUrl = url.startsWith('http') ? url : `http://localhost:3000${url}`;
          const aspectInfo = await detectImageAspectRatio(fullUrl);
          return { index, aspectInfo };
        });
        
        const aspectResults = await Promise.all(aspectPromises);
        
        setPreviews(prev => {
          return prev.map((preview, index) => {
            const result = aspectResults.find(r => r.index === index);
            return result ? { ...preview, aspectInfo: result.aspectInfo } : preview;
          });
        });
      } catch (error) {
        console.warn('[ImageUploader] Failed to analyze existing image aspects:', error);
      } finally {
        setIsAnalyzing(false);
      }
    };

    analyzeExistingImages();
  }, [existingImageUrls, enableAspectRatioDetection]);

  // Validate file
  const validateFile = (file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return `File type ${file.type} is not supported. Please use: ${acceptedTypes.join(', ')}`;
    }

    if (file.size > maxFileSize * 1024 * 1024) {
      return `File size must be less than ${maxFileSize}MB`;
    }

    return null;
  };

  // Process selected files
  const processFiles = async (_files: FileList | File[]) => {
    const newFiles: File[] = [];
    const newPreviews: ImagePreview[] = [];
    let errorMessage = '';

    const fileArray = Array.from(_files);

    // Check total file count
    const currentFileCount = previews.filter(p => !p.isExisting).length;
    const totalNewFiles = Math.min(fileArray.length, maxFiles - currentFileCount);

    if (fileArray.length + currentFileCount > maxFiles) {
      errorMessage = `Maximum ${maxFiles} files allowed. ${fileArray.length + currentFileCount - maxFiles} files will be ignored.`;
    }

    for (let i = 0; i < totalNewFiles; i++) {
      const file = fileArray[i];
      const validationError = validateFile(file);

      if (validationError) {
        errorMessage = validationError;
        break;
      }

      const preview: ImagePreview = {
        id: `new-${Date.now()}-${i}`,
        file,
        url: URL.createObjectURL(file),
        isExisting: false,
      };

      newFiles.push(file);
      newPreviews.push(preview);
    }

    if (errorMessage) {
      setError(errorMessage);
      // Clear error after 5 seconds
      setTimeout(() => setError(null), 5000);
    } else {
      setError(null);
    }

    // Update previews first without aspect info
    setPreviews(prev => [...prev, ...newPreviews]);

    // Analyze aspect ratios for new images if enabled
    if (enableAspectRatioDetection && newPreviews.length > 0) {
      setIsAnalyzing(true);
      try {
        const aspectPromises = newPreviews.map(async (preview) => {
          const aspectInfo = await detectImageAspectRatio(preview.url);
          return { id: preview.id, aspectInfo };
        });
        
        const aspectResults = await Promise.all(aspectPromises);
        
        // Update previews with aspect info
        setPreviews(prev => {
          return prev.map(preview => {
            const result = aspectResults.find(r => r.id === preview.id);
            return result ? { ...preview, aspectInfo: result.aspectInfo } : preview;
          });
        });
      } catch (error) {
        console.warn('[ImageUploader] Failed to analyze new image aspects:', error);
      } finally {
        setIsAnalyzing(false);
      }
    }

    // Update parent component with all current files and remaining existing URLs
    const allFiles = [
      ...previews.filter(p => !p.isExisting && p.file).map(p => p.file!),
      ...newFiles,
    ];
    const remainingExistingUrls = previews
      .filter(p => p.isExisting)
      .map(p => p.url.replace('http://localhost:3000', '')); // Convert back to relative URLs
    onImagesChange(allFiles, remainingExistingUrls);
  };

  // Handle file input change
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processFiles(e.target.files);
    }
    // Reset input value to allow selecting same file again
    e.target.value = '';
  };

  // Handle drag events
  const handleDrag = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragIn = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragOut = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = async (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) {
      return;
    }

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFiles(e.dataTransfer.files);
    }
  };

  // Handle remove image request
  const handleRemoveImage = (id: string) => {
    // Prevent multiple clicks/rapid firing
    if (isRemoving || showRemoveConfirm) {
      return;
    }
    
    const preview = previews.find(p => p.id === id);
    if (preview) {
      setImageToRemove({ id, isExisting: preview.isExisting || false });
      setShowRemoveConfirm(true);
    }
  };

  // Confirm remove image from preview
  const confirmRemoveImage = () => {
    if (!imageToRemove || isRemoving) {
      return;
    }

    setIsRemoving(true);

    try {
      const preview = previews.find(p => p.id === imageToRemove.id);
      if (preview && !preview.isExisting && preview.url) {
        // Clean up object URL to prevent memory leaks
        URL.revokeObjectURL(preview.url);
      }

      const updatedPreviews = previews.filter(p => p.id !== imageToRemove.id);
      setPreviews(updatedPreviews);

      // Update parent component with remaining files and existing URLs
      const remainingFiles = updatedPreviews.filter(p => !p.isExisting && p.file).map(p => p.file!);
      const remainingExistingUrls = updatedPreviews
        .filter(p => p.isExisting)
        .map(p => p.url.replace('http://localhost:3000', '')); // Convert back to relative URLs
      onImagesChange(remainingFiles, remainingExistingUrls);
    } finally {
      // Always reset state, even if there's an error
      setShowRemoveConfirm(false);
      setImageToRemove(null);
      setIsRemoving(false);
    }
  };

  const handleCancelRemoveImage = () => {
    if (isRemoving) {
      return;
    }
    setShowRemoveConfirm(false);
    setImageToRemove(null);
  };

  // Open file dialog
  const openFileDialog = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Clean up object URLs on unmount
  React.useEffect(() => {
    return () => {
      previews.forEach(preview => {
        if (!preview.isExisting && preview.url) {
          URL.revokeObjectURL(preview.url);
        }
      });
    };
  }, [previews]);

  return (
    <div className='w-full'>
      {/* Context7 Premium Analysis Indicator */}
      {isAnalyzing && enableAspectRatioDetection && (
        <div className='mb-6 flex items-center justify-center py-3'>
          <div className='flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl border border-indigo-200/50 shadow-lg backdrop-blur-sm'>
            <Sparkles className='w-5 h-5 text-indigo-600 animate-spin' />
            <span className='text-sm font-bold text-indigo-700 tracking-wide'>Analyzing image layouts...</span>
          </div>
        </div>
      )}

      {/* Context7 Premium Error Message */}
      {error && (
        <div className='mb-6 p-4 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200/60 rounded-2xl flex items-center backdrop-blur-sm shadow-lg relative overflow-hidden'>
          <div className='absolute inset-0 bg-gradient-to-r from-red-500/5 to-rose-500/5'></div>
          <div className='w-8 h-8 bg-gradient-to-r from-red-500 to-rose-500 rounded-xl flex items-center justify-center mr-3 shadow-lg'>
            <AlertCircle className='w-4 h-4 text-white' />
          </div>
          <p className='text-sm text-red-700 font-medium relative z-10'>{error}</p>
        </div>
      )}

      {/* Context7 Premium Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-3xl transition-all duration-500 ease-out group overflow-hidden ${
          dragActive
            ? 'border-indigo-400 bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 shadow-2xl scale-105'
            : disabled
              ? 'border-slate-200 bg-slate-50/50'
              : 'border-slate-300 hover:border-indigo-300 hover:bg-gradient-to-br hover:from-indigo-50/30 hover:via-blue-50/30 hover:to-purple-50/30 hover:shadow-xl hover:scale-102'
        } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'} backdrop-blur-sm`}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        {/* Context7 Premium Background Pattern */}
        <div className='absolute inset-0 opacity-30'>
          <div
            className='w-full h-full'
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236366f1' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>

        {/* Premium floating particles */}
        {dragActive && (
          <div className='absolute inset-0 overflow-hidden pointer-events-none'>
            <div className='absolute top-1/4 left-1/4 w-2 h-2 bg-indigo-300/40 rounded-full animate-bounce'></div>
            <div className='absolute top-3/4 right-1/3 w-1.5 h-1.5 bg-blue-300/30 rounded-full animate-pulse delay-100'></div>
            <div className='absolute bottom-1/4 left-1/3 w-1 h-1 bg-purple-300/25 rounded-full animate-ping delay-200'></div>
          </div>
        )}

        <div className='p-10 text-center relative z-10'>
          {/* Context7 Premium Upload Icon */}
          <div
            className={`mx-auto w-20 h-20 mb-6 rounded-2xl flex items-center justify-center transition-all duration-500 ${
              disabled
                ? 'bg-slate-100 text-slate-300'
                : dragActive
                  ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-2xl scale-110 rotate-3'
                  : 'bg-gradient-to-br from-slate-100 to-white text-slate-400 group-hover:from-indigo-100 group-hover:to-purple-100 group-hover:text-indigo-600 group-hover:scale-110 group-hover:shadow-xl border border-slate-200/50 group-hover:border-indigo-200'
            }`}
          >
            {dragActive ? (
              <Sparkles className='w-10 h-10 animate-pulse' />
            ) : (
              <div className='relative'>
                <Camera className='w-8 h-8' />
                <Upload className='w-4 h-4 absolute -top-1 -right-1' />
              </div>
            )}
          </div>

          <p
            className={`text-xl font-bold mb-3 tracking-wide ${
              disabled
                ? 'text-slate-400'
                : dragActive
                  ? 'text-indigo-700'
                  : 'text-slate-700 group-hover:text-indigo-700'
            } transition-colors duration-300`}
          >
            {dragActive ? '✨ Drop your images here!' : 'Upload Premium Images'}
          </p>

          <p
            className={`text-sm mb-6 font-medium ${
              disabled ? 'text-slate-300' : 'text-slate-500 group-hover:text-slate-600'
            } transition-colors duration-300`}
          >
            {dragActive
              ? 'Release to add your beautiful images'
              : 'Drag and drop your images here, or click to browse'}
          </p>

          {/* Context7 Premium Specs */}
          <div
            className={`inline-flex items-center space-x-4 px-6 py-3 rounded-2xl text-xs font-semibold tracking-wide transition-all duration-300 ${
              disabled
                ? 'bg-slate-100 text-slate-300'
                : 'bg-white/80 backdrop-blur-sm text-slate-500 border border-slate-200/50 shadow-lg group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-200'
            }`}
          >
            <div className='flex items-center space-x-1'>
              <Image className='w-3 h-3' />
              <span>JPEG, PNG, WebP</span>
            </div>
            <div className='w-1 h-1 bg-slate-300 rounded-full'></div>
            <span>Max {maxFileSize}MB</span>
            <div className='w-1 h-1 bg-slate-300 rounded-full'></div>
            <span>Up to {maxFiles} files</span>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type='file'
          accept={acceptedTypes.join(',')}
          multiple={multiple}
          onChange={handleFileChange}
          disabled={disabled}
          className='absolute inset-0 w-full h-full opacity-0 cursor-pointer'
          style={{ display: 'none' }}
        />
      </div>

      {/* Context7 Premium Image Previews */}
      {previews.length > 0 && (
        <div className='mt-8'>
          <div className='flex items-center justify-between mb-6'>
            <h4 className='text-lg font-bold text-slate-800 tracking-wide'>Selected Images</h4>
            <div className='px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-2xl border border-indigo-200/50 shadow-lg'>
              <span className='text-sm font-bold text-indigo-700'>
                {previews.length} {previews.length === 1 ? 'Image' : 'Images'}
              </span>
            </div>
          </div>

          <div className={`grid ${getOptimalGridLayout(previews.map(p => p.aspectInfo).filter(Boolean) as ImageAspectInfo[])}`}>
            {previews.map((preview) => {
              const aspectInfo = preview.aspectInfo;
              const previewConfig = aspectInfo ? getResponsiveImageConfig(aspectInfo) : null;
              
              // Determine container aspect ratio class
              const getContainerAspectClass = () => {
                if (!adaptiveLayout || !aspectInfo) return 'aspect-[3/5]'; // Default portrait
                
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
                : 'rounded-2xl overflow-hidden bg-gradient-to-br from-slate-100 to-white border border-slate-200/50 shadow-xl group-hover:shadow-2xl transition-all duration-500 group-hover:scale-105 relative';
              
              const imageClasses = previewConfig
                ? getContext7ImageClasses(previewConfig, true)
                : 'w-full h-full object-cover transition-all duration-500 group-hover:scale-110';
              
              return (
                <div key={preview.id} className='relative group'>
                  {/* Context7 Premium Responsive Image Container */}
                  <div className={`${containerAspectClass} ${containerClasses}`}>
                    <img
                      src={preview.url}
                      alt='Preview'
                      className={imageClasses}
                      onError={e => {
                        // Handle broken image
                        const target = e.target as HTMLImageElement;
                        target.src =
                          'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAyOEMxNi42ODYzIDI4IDEzLjUwNTQgMjYuNjgzOSAxMS4xNzE2IDI0LjM1MDRDOC44Mzc4NCAyMi4wMTY5IDcuNTIxNjggMTguODM2IDcuNTIxNjggMTUuNTIyNEM3LjUyMTY4IDEyLjIwODggOC44Mzc4NCA5LjAyNzkxIDExLjE3MTYgNi42OTQ0MkMxMy41MDU0IDQuMzYwOTMgMTYuNjg2MyAzLjA0NDc3IDIwIDMuMDQ0NzdDMjMuMzE0IDMuMDQ0NzcgMjYuNDk0OSA0LjM2MDkzIDI4LjgyODMgNi42OTQ0MkMzMS4xNjIyIDkuMDI3OTEgMzIuNDc4MyAxMi4yMDg4IDMyLjQ3ODMgMTUuNTIyNEMzMi40NzgzIDE4LjgzNiAzMS4xNjIyIDIyLjAxNjkgMjguODI4MyAyNC4zNTA0QzI2LjQ5NDkgMjYuNjgzOSAyMy4zMTQgMjggMjAgMjhaIiBmaWxsPSIjRDFEOURCIi8+CjxwYXRoIGQ9Ik0yMCAyMi41NDc3QzE5LjQxNjcgMjIuNTQ3NyAxOC44NjY3IDIyLjMxNTQgMTguNDYxOSAyMS45MTA2QzE4LjA1NzEgMjEuNTA1OCAxNy44MjQ4IDIwLjk1NTggMTcuODI0OCAyMC4zNzI0VjE0LjE5NzdDMTcuODI0OCAxMy42MTQ0IDE4LjA1NzEgMTMuMDY0NCAxOC40NjE5IDEyLjY1OTZDMTguODY2NyAxMi4yNTQ4IDE5LjQxNjcgMTIuMDIyNSAyMCAxMi4wMjI1QzIwLjU4MzMgMTIuMDIyNSAyMS4xMzMzIDEyLjI1NDggMjEuNTM4MSAxMi42NTk2QzIxLjk0MjkgMTMuMDY0NCAyMi4xNzUyIDEzLjYxNDQgMjIuMTc1MiAxNC4xOTc3VjIwLjM3MjRDMjIuMTc1MiAyMC45NTU4IDIxLjk0MjkgMjEuNTA1OCAyMS41MzgxIDIxLjkxMDZDMjEuMTMzMyAyMi4zMTU0IDIwLjU4MzMgMjIuNTQ3NyAyMCAyMi41NDc3WiIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNMjAgMjYuNjk2N0MxOS40MTY3IDI2LjY5NjcgMTguODY2NyAyNi40NjQ0IDE4LjQ2MTkgMjYuMDU5NkMxOC4wNTcxIDI1LjY1NDggMTcuODI0OCAyNS4xMDQ4IDE3LjgyNDggMjQuNTIxNUMxNy44MjQ4IDIzLjkzODEgMTguMDU3MSAyMy4zODgxIDE4LjQ2MTkgMjIuOTgzM0MxOC44NjY3IDIyLjU3ODUgMTkuNDE2NyAyMi4zNDYyIDIwIDIyLjM0NjJDMjAuNTgzMyAyMi4zNDYyIDIxLjEzMzMgMjIuNTc4NSAyMS41MzgxIDIyLjk4MzNDMjEuOTQyOSAyMy4zODgxIDIyLjE3NTIgMjMuOTM4MSAyMi4xNzUyIDI0LjUyMTVDMjIuMTc1MiAyNS4xMDQ4IDIxLjk0MjkgMjUuNjU0OCAyMS41MzgxIDI2LjA1OTZDMjEuMTMzMyAyNi40NjQ0IDIwLjU4MzMgMjYuNjk2NyAyMCAyNi42OTY3WiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
                      }}
                    />

                    {/* Context7 Premium Glass Overlay */}
                    {aspectInfo && (
                      <div className={getContext7GlassOverlay(aspectInfo.orientation)}></div>
                    )}
                    
                    {/* Context7 Premium Shimmer Effect */}
                    <div className={getContext7ShimmerEffect()}></div>
                  </div>


                  {/* Context7 Premium Remove Button */}
                  {!disabled && (
                    <button
                      onClick={e => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleRemoveImage(preview.id);
                      }}
                      onDoubleClick={e => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      disabled={isRemoving || showRemoveConfirm}
                      className={`absolute -top-3 -right-3 w-8 h-8 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white rounded-2xl flex items-center justify-center transition-all duration-300 opacity-75 group-hover:opacity-100 hover:opacity-100 shadow-lg hover:shadow-xl hover:scale-110 border-2 border-white backdrop-blur-sm ${
                        isRemoving || showRemoveConfirm ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                      }`}
                      aria-label='Remove image'
                    >
                      <X className='w-4 h-4' />
                    </button>
                  )}

                  {/* Context7 Premium Existing Image Badge */}
                  {preview.isExisting && (
                    <div className='absolute bottom-2 left-2 px-3 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg border border-white/20 backdrop-blur-sm'>
                      <div className='flex items-center space-x-1'>
                        <div className='w-2 h-2 bg-white rounded-full animate-pulse'></div>
                        <span>Existing</span>
                      </div>
                    </div>
                  )}

                  {/* Context7 Premium Hover Effects */}
                  <div className='absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none'></div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Remove Image Confirmation Modal */}
      <ConfirmModal
        isOpen={showRemoveConfirm}
        onClose={handleCancelRemoveImage}
        onConfirm={confirmRemoveImage}
        title="Remove Image"
        description={`Are you sure you want to remove this image? ${
          imageToRemove?.isExisting 
            ? 'This will permanently remove the image from your collection.' 
            : 'This will remove the image from the upload queue.'
        }`}
        confirmText="Remove Image"
        variant={imageToRemove?.isExisting ? 'danger' : 'warning'}
        icon="trash"
        isLoading={isRemoving}
      />
    </div>
  );
};

export default ImageUploader;
