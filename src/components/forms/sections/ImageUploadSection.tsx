/**
 * Image Upload Section Component
 * Shared component for image uploading across card forms
 * Following CLAUDE.md principles for component separation and reusability
 */

import React from 'react';
import { Camera } from 'lucide-react';
import ImageUploader from '../../ImageUploader';

interface ImageUploadSectionProps {
  onImagesChange: (files: File[], remainingExistingUrls?: string[]) => void;
  existingImageUrls?: string[];
  // Customization props
  maxFiles?: number;
  maxFileSize?: number;
  title?: string;
  // Show section only for unsold items
  isVisible?: boolean;
}

const ImageUploadSection: React.FC<ImageUploadSectionProps> = ({
  onImagesChange,
  existingImageUrls = [],
  maxFiles = 8,
  maxFileSize = 5,
  title = 'Card Images',
  isVisible = true,
}) => {
  if (!isVisible) {
    return null;
  }

  return (
    <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-700/20 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/50 to-zinc-900/50"></div>

      <h4 className="text-xl font-bold text-zinc-100 mb-6 flex items-center relative z-10">
        <Camera className="w-6 h-6 mr-3 text-zinc-300" />
        {title}
      </h4>

      <div className="relative z-10">
        <ImageUploader
          onImagesChange={onImagesChange}
          existingImageUrls={existingImageUrls}
          multiple={true}
          maxFiles={maxFiles}
          maxFileSize={maxFileSize}
        />

        <div className="mt-4 p-4 bg-gradient-to-r from-slate-50/80 to-indigo-50/80 rounded-xl border border-slate-200/50 dark:border-zinc-700/50 dark:border-zinc-700/50 backdrop-blur-sm">
          <div className="text-sm text-slate-600 dark:text-zinc-400 dark:text-zinc-300 space-y-1">
            <p className="font-semibold">
              • Upload up to {maxFiles} images (max {maxFileSize}MB each)
            </p>
            <p>• Supported formats: JPG, PNG, WebP</p>
            <p>• Include front, back, and detail shots for best results</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageUploadSection;
