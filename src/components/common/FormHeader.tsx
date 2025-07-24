/**
 * FormHeader Component
 * Reusable form header with premium gradient design and theming
 *
 * Following CLAUDE.md principles:
 * - Single Responsibility: Handles only form header presentation
 * - Open/Closed: Extensible through theme configuration
 * - DRY: Eliminates repetitive header code across forms
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface FormHeaderProps {
  /** Icon component from lucide-react */
  icon: LucideIcon;
  /** Main header title */
  title: string;
  /** Descriptive subtitle text */
  description: string;
  /** Primary color theme for gradients */
  primaryColorClass?: 'purple' | 'blue' | 'emerald' | 'amber' | 'rose';
  /** Custom className for additional styling */
  className?: string;
}

// Theme configurations for different color schemes
const themeConfig = {
  purple: {
    background: 'from-purple-50/80 to-violet-50/80',
    border: 'border-purple-200/50',
    topBorder: 'from-purple-500 to-violet-500',
    overlay: 'from-purple-500/5 to-violet-500/5',
    iconBackground: 'from-purple-500 to-violet-600',
    titleText: 'from-purple-800 to-violet-800',
    descriptionText: 'text-purple-700',
  },
  blue: {
    background: 'from-blue-50/80 to-cyan-50/80',
    border: 'border-blue-200/50',
    topBorder: 'from-blue-500 to-cyan-500',
    overlay: 'from-blue-500/5 to-cyan-500/5',
    iconBackground: 'from-blue-500 to-cyan-600',
    titleText: 'from-blue-800 to-cyan-800',
    descriptionText: 'text-blue-700',
  },
  emerald: {
    background: 'from-emerald-50/80 to-teal-50/80',
    border: 'border-emerald-200/50',
    topBorder: 'from-emerald-500 to-teal-500',
    overlay: 'from-emerald-500/5 to-teal-500/5',
    iconBackground: 'from-emerald-500 to-teal-600',
    titleText: 'from-emerald-800 to-teal-800',
    descriptionText: 'text-emerald-700',
  },
  amber: {
    background: 'from-amber-50/80 to-orange-50/80',
    border: 'border-amber-200/50',
    topBorder: 'from-amber-500 to-orange-500',
    overlay: 'from-amber-500/5 to-orange-500/5',
    iconBackground: 'from-amber-500 to-orange-600',
    titleText: 'from-amber-800 to-orange-800',
    descriptionText: 'text-amber-700',
  },
  rose: {
    background: 'from-rose-50/80 to-pink-50/80',
    border: 'border-rose-200/50',
    topBorder: 'from-rose-500 to-pink-500',
    overlay: 'from-rose-500/5 to-pink-500/5',
    iconBackground: 'from-rose-500 to-pink-600',
    titleText: 'from-rose-800 to-pink-800',
    descriptionText: 'text-rose-700',
  },
} as const;

const FormHeader: React.FC<FormHeaderProps> = ({
  icon: Icon,
  title,
  description,
  primaryColorClass = 'purple',
  className = '',
}) => {
  const theme = themeConfig[primaryColorClass];

  return (
    <div
      className={`bg-gradient-to-r ${theme.background} backdrop-blur-sm border ${theme.border} rounded-3xl p-8 relative ${className}`}
    >
      {/* Top accent border */}
      <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${theme.topBorder}`}></div>

      {/* Background overlay */}
      <div className={`absolute inset-0 bg-gradient-to-r ${theme.overlay}`}></div>

      {/* Content */}
      <div className='flex items-center relative z-10'>
        {/* Icon container */}
        <div
          className={`w-14 h-14 bg-gradient-to-br ${theme.iconBackground} rounded-2xl shadow-xl flex items-center justify-center`}
        >
          <Icon className='w-7 h-7 text-white' />
        </div>

        {/* Text content */}
        <div className='ml-6'>
          <h3
            className={`text-2xl font-bold bg-gradient-to-r ${theme.titleText} bg-clip-text text-transparent mb-2`}
          >
            {title}
          </h3>
          <p className={`${theme.descriptionText} font-medium`}>{description}</p>
        </div>
      </div>
    </div>
  );
};

export default FormHeader;
