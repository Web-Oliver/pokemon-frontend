/**
 * Image Analysis Indicator Component - Following SOLID principles
 * Single Responsibility: Only displays analysis status
 * Open/Closed: Extensible for different analysis types
 */

import React from 'react';
import { Loader2 } from 'lucide-react';

interface ImageAnalysisIndicatorProps {
  isAnalyzing: boolean;
  enableAspectRatioDetection: boolean;
}

export const ImageAnalysisIndicator: React.FC<ImageAnalysisIndicatorProps> = ({
  isAnalyzing,
  enableAspectRatioDetection,
}) => {
  if (!enableAspectRatioDetection || !isAnalyzing) return null;

  return (
    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-center space-x-2">
        <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
        <span className="text-sm text-blue-800">Analyzing image aspect ratios...</span>
      </div>
    </div>
  );
};