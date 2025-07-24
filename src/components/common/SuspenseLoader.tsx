/**
 * Suspense Loader Component
 *
 * Following CLAUDE.md principles and Context7 patterns:
 * - Single Responsibility: Only handles loading UI for Suspense fallbacks
 * - Layer 3: UI Building Block - reusable loading component
 * - DRY: Consistent loading experience across lazy-loaded components
 */

import React from 'react';

interface SuspenseLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

const SuspenseLoader: React.FC<SuspenseLoaderProps> = ({
  size = 'lg',
  text = 'Loading...',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'h-32',
    md: 'h-48',
    lg: 'h-64',
  };

  const spinnerSizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return (
    <div className={`flex flex-col items-center justify-center ${sizeClasses[size]} ${className}`}>
      <div className='bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 flex flex-col items-center space-y-4'>
        <div className='relative'>
          <div
            className={`${spinnerSizes[size]} border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin`}
          ></div>
          <div className='absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-blue-500/20 rounded-full animate-pulse'></div>
        </div>
        <div className='text-center'>
          <h3 className='text-lg font-semibold text-slate-900 mb-1'>{text}</h3>
          <p className='text-sm text-slate-600'>Please wait while we load the content...</p>
        </div>
      </div>

      {/* Premium floating elements */}
      <div className='absolute -top-2 -right-2 w-12 h-12 bg-indigo-500/10 rounded-full animate-pulse delay-75'></div>
      <div className='absolute -bottom-2 -left-2 w-16 h-16 bg-purple-500/5 rounded-full animate-pulse delay-150'></div>
    </div>
  );
};

export default SuspenseLoader;
