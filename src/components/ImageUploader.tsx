/**
 * ImageUploader Component
 * 
 * Advanced image upload component with drag-and-drop functionality and preview.
 * Phase 4.5: Basic image uploader with file input and local previews.
 * 
 * Following CLAUDE.md principles:
 * - Beautiful, award-winning design with modern aesthetics
 * - Single Responsibility: Image upload and preview management
 * - Reusable across different forms and contexts
 * - Responsive design for all device sizes
 */

import React, { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react';

interface ImageUploaderProps {
  onImagesChange: (files: File[]) => void;
  existingImageUrls?: string[];
  multiple?: boolean;
  maxFiles?: number;
  maxFileSize?: number; // in MB
  acceptedTypes?: string[];
  disabled?: boolean;
}

interface ImagePreview {
  id: string;
  file?: File;
  url: string;
  isExisting?: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImagesChange,
  existingImageUrls = [],
  multiple = true,
  maxFiles = 10,
  maxFileSize = 5, // 5MB default
  acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  disabled = false
}) => {
  const [previews, setPreviews] = useState<ImagePreview[]>(() => {
    // Initialize with existing images
    return existingImageUrls.map((url, index) => ({
      id: `existing-${index}`,
      url,
      isExisting: true
    }));
  });
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  const processFiles = (files: FileList | File[]) => {
    const newFiles: File[] = [];
    const newPreviews: ImagePreview[] = [];
    let errorMessage = '';

    const fileArray = Array.from(files);
    
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
        isExisting: false
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

    // Update previews
    setPreviews(prev => [...prev, ...newPreviews]);
    
    // Update parent component with all current files
    const allFiles = [
      ...previews.filter(p => !p.isExisting && p.file).map(p => p.file!),
      ...newFiles
    ];
    onImagesChange(allFiles);
  };

  // Handle file input change
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
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

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (disabled) return;
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  // Remove image from preview
  const removeImage = (id: string) => {
    const imageToRemove = previews.find(p => p.id === id);
    
    if (imageToRemove && !imageToRemove.isExisting && imageToRemove.url) {
      // Clean up object URL to prevent memory leaks
      URL.revokeObjectURL(imageToRemove.url);
    }

    const updatedPreviews = previews.filter(p => p.id !== id);
    setPreviews(updatedPreviews);

    // Update parent component with remaining files
    const remainingFiles = updatedPreviews
      .filter(p => !p.isExisting && p.file)
      .map(p => p.file!);
    onImagesChange(remainingFiles);
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
  }, []);

  return (
    <div className="w-full">
      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg transition-all duration-200 ${
          dragActive
            ? 'border-blue-400 bg-blue-50'
            : disabled
            ? 'border-gray-200 bg-gray-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <div className="p-6 text-center">
          <div className={`mx-auto w-12 h-12 mb-4 ${
            disabled ? 'text-gray-300' : 'text-gray-400'
          }`}>
            <Upload className="w-full h-full" />
          </div>
          
          <p className={`text-lg font-medium mb-2 ${
            disabled ? 'text-gray-400' : 'text-gray-700'
          }`}>
            {dragActive ? 'Drop images here' : 'Upload Images'}
          </p>
          
          <p className={`text-sm mb-4 ${
            disabled ? 'text-gray-300' : 'text-gray-500'
          }`}>
            Drag and drop images here, or click to select files
          </p>
          
          <div className={`text-xs ${
            disabled ? 'text-gray-300' : 'text-gray-400'
          }`}>
            <p>Supported formats: JPEG, PNG, WebP</p>
            <p>Max file size: {maxFileSize}MB • Max files: {maxFiles}</p>
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

      {/* Image Previews */}
      {previews.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Selected Images ({previews.length})
          </h4>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {previews.map((preview) => (
              <div key={preview.id} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                  <img
                    src={preview.url}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Handle broken image
                      const target = e.target as HTMLImageElement;
                      target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAyOEMxNi42ODYzIDI4IDEzLjUwNTQgMjYuNjgzOSAxMS4xNzE2IDI0LjM1MDRDOC44Mzc4NCAyMi4wMTY5IDcuNTIxNjggMTguODM2IDcuNTIxNjggMTUuNTIyNEM3LjUyMTY4IDEyLjIwODggOC44Mzc4NCA5LjAyNzkxIDExLjE3MTYgNi42OTQ0MkMxMy41MDU0IDQuMzYwOTMgMTYuNjg2MyAzLjA0NDc3IDIwIDMuMDQ0NzdDMjMuMzE0IDMuMDQ0NzcgMjYuNDk0OSA0LjM2MDkzIDI4LjgyODMgNi42OTQ0MkMzMS4xNjIyIDkuMDI3OTEgMzIuNDc4MyAxMi4yMDg4IDMyLjQ3ODMgMTUuNTIyNEMzMi40NzgzIDE4LjgzNiAzMS4xNjIyIDIyLjAxNjkgMjguODI4MyAyNC4zNTA0QzI2LjQ5NDkgMjYuNjgzOSAyMy4zMTQgMjggMjAgMjhaIiBmaWxsPSIjRDFEOURCIi8+CjxwYXRoIGQ9Ik0yMCAyMi41NDc3QzE5LjQxNjcgMjIuNTQ3NyAxOC44NjY3IDIyLjMxNTQgMTguNDYxOSAyMS45MTA2QzE4LjA1NzEgMjEuNTA1OCAxNy44MjQ4IDIwLjk1NTggMTcuODI0OCAyMC4zNzI0VjE0LjE5NzdDMTcuODI0OCAxMy42MTQ0IDE4LjA1NzEgMTMuMDY0NCAxOC40NjE5IDEyLjY1OTZDMTguODY2NyAxMi4yNTQ4IDE5LjQxNjcgMTIuMDIyNSAyMCAxMi4wMjI1QzIwLjU4MzMgMTIuMDIyNSAyMS4xMzMzIDEyLjI1NDggMjEuNTM4MSAxMi42NTk2QzIxLjk0MjkgMTMuMDY0NCAyMi4xNzUyIDEzLjYxNDQgMjIuMTc1MiAxNC4xOTc3VjIwLjM3MjRDMjIuMTc1MiAyMC45NTU4IDIxLjk0MjkgMjEuNTA1OCAyMS41MzgxIDIxLjkxMDZDMjEuMTMzMyAyMi4zMTU0IDIwLjU4MzMgMjIuNTQ3NyAyMCAyMi41NDc3WiIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNMjAgMjYuNjk2N0MxOS40MTY3IDI2LjY5NjcgMTguODY2NyAyNi40NjQ0IDE4LjQ2MTkgMjYuMDU5NkMxOC4wNTcxIDI1LjY1NDggMTcuODI0OCAyNS4xMDQ4IDE3LjgyNDggMjQuNTIxNUMxNy44MjQ4IDIzLjkzODEgMTguMDU3MSAyMy4zODgxIDE4LjQ2MTkgMjIuOTgzM0MxOC44NjY3IDIyLjU3ODUgMTkuNDE2NyAyMi4zNDYyIDIwIDIyLjM0NjJDMjAuNTgzMyAyMi4zNDYyIDIxLjEzMzMgMjIuNTc4NSAyMS41MzgxIDIyLjk4MzNDMjEuOTQyOSAyMy4zODgxIDIyLjE3NTIgMjMuOTM4MSAyMi4xNzUyIDI0LjUyMTVDMjIuMTc1MiAyNS4xMDQ4IDIxLjk0MjkgMjUuNjU0OCAyMS41MzgxIDI2LjA1OTZDMjEuMTMzMyAyNi40NjQ0IDIwLjU4MzMgMjYuNjk2NyAyMCAyNi42OTY3WiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
                    }}
                  />
                </div>
                
                {/* Remove button */}
                {!disabled && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(preview.id);
                    }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                    aria-label="Remove image"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}

                {/* Existing image indicator */}
                {preview.isExisting && (
                  <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-blue-500 text-white text-xs rounded">
                    Existing
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;