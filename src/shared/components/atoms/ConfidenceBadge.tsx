import React from 'react';
import { cn } from "@/lib/utils"

interface ConfidenceBadgeProps {
  confidence: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'solid';
  showPercentage?: boolean;
  className?: string;
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({
  confidence,
  size = 'md',
  variant = 'default',
  showPercentage = true,
  className,
}) => {
  const getConfidenceColor = (conf: number) => {
    if (conf >= 0.8) return 'emerald';
    if (conf >= 0.6) return 'cyan';
    if (conf >= 0.4) return 'amber';
    return 'red';
  };

  const getConfidenceLevel = (conf: number) => {
    if (conf >= 0.9) return 'Excellent';
    if (conf >= 0.8) return 'Very Good';
    if (conf >= 0.6) return 'Good';
    if (conf >= 0.4) return 'Fair';
    return 'Poor';
  };

  const color = getConfidenceColor(confidence);
  const level = getConfidenceLevel(confidence);
  const percentage = Math.round(confidence * 100);

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const variantClasses = {
    default: {
      emerald: 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30',
      cyan: 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30',
      amber: 'bg-amber-500/20 text-amber-300 border border-amber-400/30',
      red: 'bg-red-500/20 text-red-300 border border-red-400/30'
    },
    outline: {
      emerald: 'bg-transparent text-emerald-300 border-2 border-emerald-400/50',
      cyan: 'bg-transparent text-cyan-300 border-2 border-cyan-400/50',
      amber: 'bg-transparent text-amber-300 border-2 border-amber-400/50',
      red: 'bg-transparent text-red-300 border-2 border-red-400/50'
    },
    solid: {
      emerald: 'bg-emerald-600 text-white border border-emerald-500',
      cyan: 'bg-cyan-600 text-white border border-cyan-500',
      amber: 'bg-amber-600 text-white border border-amber-500',
      red: 'bg-red-600 text-white border border-red-500'
    }
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-medium transition-colors',
        sizeClasses[size],
        variantClasses[variant][color],
        className
      )}
      title={`Confidence: ${percentage}% (${level})`}
    >
      <div className={cn(
        'w-2 h-2 rounded-full',
        color === 'emerald' && 'bg-emerald-400',
        color === 'cyan' && 'bg-cyan-400',
        color === 'amber' && 'bg-amber-400',
        color === 'red' && 'bg-red-400'
      )} />
      {showPercentage ? `${percentage}%` : level}
    </span>
  );
};