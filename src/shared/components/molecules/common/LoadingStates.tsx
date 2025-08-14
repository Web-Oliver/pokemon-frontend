/**
 * Loading States Components with Theme Integration
 * Layer 3: Components (UI Building Blocks)
 *
 * Consolidates duplicate loading spinner patterns across the application.
 * Following CLAUDE.md principles:
 * - DRY: Eliminates duplicate loading patterns
 * - SRP: Each component has a single loading responsibility
 * - Reusability: Generic components for common loading scenarios
 * - Theme Integration: Uses unified theme system for consistent styling
 */

import React from 'react';
import GenericLoadingState from './GenericLoadingState';
import { string } from '../../theme/formThemes';

interface BaseLoadingProps {
  className?: string;
  themeColor?: string;
}

/**
 * Button Loading State
 * Used inside buttons when processing actions
 */
export const ButtonLoading: React.FC<BaseLoadingProps & { text?: string }> = ({
  text = 'Loading...',
  className = '',
  themeColor = 'dark',
}) => (
  <>
    <GenericLoadingState
      variant="spinner"
      size="sm"
      themeColor={themeColor}
      className={`mr-2 ${className}`}
    />
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
  themeColor = 'dark',
}) => (
  <div className={`flex items-center justify-center py-12 ${className}`}>
    <GenericLoadingState
      variant="spinner"
      text={text}
      themeColor={themeColor}
    />
  </div>
);

/**
 * Content Area Loading State
 * Used for large content areas and sections
 */
export const ContentLoading: React.FC<BaseLoadingProps & { text?: string }> = ({
  text = 'Loading content...',
  className = '',
  themeColor = 'dark',
}) => (
  <div className={`flex items-center justify-center py-16 ${className}`}>
    <GenericLoadingState
      variant="spinner"
      size="lg"
      text={text}
      themeColor={themeColor}
    />
  </div>
);

/**
 * Inline Loading State
 * Used for small inline loading indicators
 */
export const InlineLoading: React.FC<BaseLoadingProps & { text?: string }> = ({
  text,
  className = '',
  themeColor = 'dark',
}) => (
  <div className={`flex items-center ${className}`}>
    <GenericLoadingState
      variant="spinner"
      size="sm"
      themeColor={themeColor}
      className="mr-2"
    />
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
  themeColor = 'dark',
}) => (
  <div className={`flex items-center justify-center py-8 ${className}`}>
    <GenericLoadingState
      variant="spinner"
      text={text}
      themeColor={themeColor}
    />
  </div>
);

/**
 * Card Loading State
 * Used for loading states within cards and panels
 */
export const CardLoading: React.FC<BaseLoadingProps & { text?: string }> = ({
  text = 'Loading...',
  className = '',
  themeColor = 'dark',
}) => (
  <div className={`flex items-center justify-center py-6 ${className}`}>
    <GenericLoadingState
      variant="spinner"
      size="md"
      text={text}
      themeColor={themeColor}
    />
  </div>
);
