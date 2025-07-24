/**
 * Loading States Components
 * Layer 3: Components (UI Building Blocks)
 *
 * Consolidates duplicate loading spinner patterns across the application.
 * Following CLAUDE.md principles:
 * - DRY: Eliminates duplicate loading patterns
 * - SRP: Each component has a single loading responsibility
 * - Reusability: Generic components for common loading scenarios
 */

import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface BaseLoadingProps {
  className?: string;
}

/**
 * Button Loading State
 * Used inside buttons when processing actions
 */
export const ButtonLoading: React.FC<BaseLoadingProps & { text?: string }> = ({
  text = 'Loading...',
  className = '',
}) => (
  <>
    <LoadingSpinner size="sm" className={`mr-2 ${className}`} />
    {text}
  </>
);

/**
 * Page Loading State
 * Used for main page content loading
 */
export const PageLoading: React.FC<BaseLoadingProps & { text?: string }> = ({
  text = 'Loading...',
  className = '',
}) => (
  <div className={`flex items-center justify-center py-12 ${className}`}>
    <LoadingSpinner text={text} />
  </div>
);

/**
 * Content Area Loading State
 * Used for large content areas and sections
 */
export const ContentLoading: React.FC<BaseLoadingProps & { text?: string }> = ({
  text = 'Loading content...',
  className = '',
}) => (
  <div className={`flex items-center justify-center py-16 ${className}`}>
    <LoadingSpinner size="lg" text={text} />
  </div>
);

/**
 * Inline Loading State
 * Used for small inline loading indicators
 */
export const InlineLoading: React.FC<BaseLoadingProps & { text?: string }> = ({
  text,
  className = '',
}) => (
  <div className={`flex items-center ${className}`}>
    <LoadingSpinner size="sm" className="mr-2" />
    {text && (
      <span className="text-sm text-slate-600 dark:text-zinc-400 dark:text-zinc-300">
        {text}
      </span>
    )}
  </div>
);

/**
 * Modal Loading State
 * Used for loading states within modals
 */
export const ModalLoading: React.FC<BaseLoadingProps & { text?: string }> = ({
  text = 'Loading...',
  className = '',
}) => (
  <div className={`flex items-center justify-center py-8 ${className}`}>
    <LoadingSpinner text={text} />
  </div>
);

/**
 * Card Loading State
 * Used for loading states within cards and panels
 */
export const CardLoading: React.FC<BaseLoadingProps & { text?: string }> = ({
  text = 'Loading...',
  className = '',
}) => (
  <div className={`flex items-center justify-center py-6 ${className}`}>
    <LoadingSpinner size="md" text={text} />
  </div>
);
