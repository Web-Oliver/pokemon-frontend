/**
 * Context7 Award-Winning Image Upload Section Component
 * Ultra-premium image upload with stunning visual hierarchy and micro-interactions
 * Features glass-morphism, premium gradients, and award-winning design patterns
 *
 * Following CLAUDE.md + Context7 principles:
 * - Award-winning visual design with micro-interactions
 * - Glass-morphism and depth with floating elements
 * - Premium gradients and color palettes
 * - Context7 design system compliance
 * - Stunning animations and hover effects
 */

import React from 'react';
import { Camera, Image, Sparkles, Upload } from 'lucide-react';
import ImageUploader from '../../../../components/ImageUploader';

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
    <div className="relative">
      {/* Background Glass Effects */}
      <div className="absolute -inset-4 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-indigo-500/10 rounded-[3rem] blur-2xl opacity-60"></div>
      <div className="absolute -inset-2 bg-gradient-to-r from-pink-400/5 via-purple-400/5 to-indigo-400/5 rounded-[2.5rem] blur-xl"></div>

      <div className="relative bg-black/40 backdrop-blur-3xl rounded-[2rem] shadow-2xl border border-white/10 p-8 ring-1 ring-white/5 overflow-hidden">
        {/* Floating Orbs */}
        <div className="absolute -top-6 -right-6 w-32 h-32 bg-gradient-to-br from-pink-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute -bottom-6 -left-6 w-24 h-24 bg-gradient-to-br from-indigo-500/10 to-blue-500/10 rounded-full blur-2xl animate-pulse"
          style={{ animationDelay: '1s' }}
        ></div>

        {/* Context7 Premium Header */}
        <div className="mb-8 relative z-10 text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-pink-500/20 to-purple-600/20 backdrop-blur-xl border border-white/10 shadow-lg">
              <Camera className="w-8 h-8 text-pink-400" />
            </div>
          </div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-white via-pink-100 to-purple-100 bg-clip-text text-transparent leading-tight mb-2">
            {title}
          </h3>
          <p className="text-white/60 font-medium">
            Showcase your collection with stunning photography
          </p>
        </div>

        {/* Premium Image Upload Container */}
        <div className="relative z-10">
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-lg">
            <ImageUploader
              onImagesChange={onImagesChange}
              existingImageUrls={existingImageUrls}
              multiple={true}
              maxFiles={maxFiles}
              maxFileSize={maxFileSize}
            />
          </div>

          {/* Context7 Premium Guidelines */}
          <div className="mt-6 bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-xl rounded-xl p-6 border border-white/10">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-600/20 backdrop-blur-xl border border-white/10">
                <Sparkles className="w-5 h-5 text-violet-400" />
              </div>
              <span className="text-white font-semibold">
                Photography Guidelines
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Upload Specs */}
              <div className="bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-xl rounded-lg p-4 border border-white/10">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-600/20 backdrop-blur-xl border border-white/10">
                    <Upload className="w-4 h-4 text-blue-400" />
                  </div>
                  <span className="text-white/80 font-semibold text-sm">
                    Upload Specs
                  </span>
                </div>
                <div className="space-y-1 text-xs text-white/60">
                  <p>• Up to {maxFiles} images</p>
                  <p>• Max {maxFileSize}MB each</p>
                  <p>• JPG, PNG, WebP</p>
                </div>
              </div>

              {/* Shot Types */}
              <div className="bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-xl rounded-lg p-4 border border-white/10">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="p-1.5 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-600/20 backdrop-blur-xl border border-white/10">
                    <Image className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="text-white/80 font-semibold text-sm">
                    Shot Types
                  </span>
                </div>
                <div className="space-y-1 text-xs text-white/60">
                  <p>• Front & back views</p>
                  <p>• Corner detail shots</p>
                  <p>• Surface condition</p>
                </div>
              </div>

              {/* Pro Tips */}
              <div className="bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-xl rounded-lg p-4 border border-white/10">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="p-1.5 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-600/20 backdrop-blur-xl border border-white/10">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                  </div>
                  <span className="text-white/80 font-semibold text-sm">
                    Pro Tips
                  </span>
                </div>
                <div className="space-y-1 text-xs text-white/60">
                  <p>• Good lighting is key</p>
                  <p>• Avoid shadows/glare</p>
                  <p>• Show card clearly</p>
                </div>
              </div>
            </div>

            {/* Premium Status Indicator */}
            <div className="mt-4 flex items-center justify-center space-x-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-xl border border-green-500/30 px-4 py-2 rounded-xl shadow-lg">
              <div className="relative">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 w-2 h-2 bg-green-400 rounded-full animate-ping opacity-75"></div>
              </div>
              <span className="text-xs font-semibold text-green-300">
                Ready for Upload
              </span>
            </div>
          </div>
        </div>

        {/* Breathing Animation */}
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 via-purple-500/5 to-indigo-500/5 rounded-[2rem] animate-pulse opacity-40 pointer-events-none"></div>
      </div>
    </div>
  );
};

export default ImageUploadSection;
