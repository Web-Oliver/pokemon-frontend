/**
 * Confidence Indicator Component - Shows confidence scores with visual indicators
 */

import React from 'react';
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

interface ConfidenceIndicatorProps {
  confidence: number; // 0-1 scale
  size?: 'sm' | 'md' | 'lg';
  showPercentage?: boolean;
  showIcon?: boolean;
}

export const ConfidenceIndicator: React.FC<ConfidenceIndicatorProps> = ({
  confidence,
  size = 'md',
  showPercentage = true,
  showIcon = true,
}) => {
  const percentage = Math.round(confidence * 100);
  
  // Determine confidence level and styling
  let levelInfo;
  if (confidence >= 0.8) {
    levelInfo = {
      level: 'High',
      color: 'text-green-700',
      bgColor: 'bg-green-100',
      borderColor: 'border-green-200',
      icon: TrendingUp,
      barColor: 'bg-green-500',
    };
  } else if (confidence >= 0.6) {
    levelInfo = {
      level: 'Medium',
      color: 'text-yellow-700',
      bgColor: 'bg-yellow-100',
      borderColor: 'border-yellow-200',
      icon: AlertTriangle,
      barColor: 'bg-yellow-500',
    };
  } else {
    levelInfo = {
      level: 'Low',
      color: 'text-red-700',
      bgColor: 'bg-red-100',
      borderColor: 'border-red-200',
      icon: TrendingDown,
      barColor: 'bg-red-500',
    };
  }

  const sizeClasses = {
    sm: {
      container: 'px-2 py-1',
      text: 'text-xs',
      icon: 'w-3 h-3',
      bar: 'h-1',
    },
    md: {
      container: 'px-3 py-2',
      text: 'text-sm',
      icon: 'w-4 h-4',
      bar: 'h-2',
    },
    lg: {
      container: 'px-4 py-3',
      text: 'text-base',
      icon: 'w-5 h-5',
      bar: 'h-3',
    },
  };

  const IconComponent = levelInfo.icon;

  return (
    <div className={`
      inline-flex items-center gap-2 rounded-lg border
      ${levelInfo.bgColor} ${levelInfo.borderColor} ${sizeClasses[size].container}
    `}>
      {showIcon && (
        <IconComponent className={`${levelInfo.color} ${sizeClasses[size].icon}`} />
      )}
      
      <div className="flex items-center gap-2">
        <span className={`font-medium ${levelInfo.color} ${sizeClasses[size].text}`}>
          {levelInfo.level}
        </span>
        
        {showPercentage && (
          <span className={`${levelInfo.color} ${sizeClasses[size].text}`}>
            {percentage}%
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div className={`w-12 bg-gray-200 rounded-full overflow-hidden ${sizeClasses[size].bar}`}>
        <div
          className={`${levelInfo.barColor} ${sizeClasses[size].bar} transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};