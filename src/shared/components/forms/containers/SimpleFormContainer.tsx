/**
 * Simple Form Container Component
 * Layer 3: Components (UI Building Blocks) - Simple Container Pattern
 * 
 * Provides a simple form wrapper with header and loading/error states
 * Used by AddEditCardForm as a lightweight container
 */

import React from 'react';
import { LucideIcon } from 'lucide-react';
import UnifiedHeader from '../../molecules/common/UnifiedHeader';
import GenericLoadingState from '../../molecules/common/GenericLoadingState';

export interface SimpleFormContainerProps {
  /** Header icon */
  icon: LucideIcon;
  /** Form title */
  title: string;
  /** Form description */
  description: string;
  /** Loading state */
  isLoading?: boolean;
  /** Error message */
  error?: Error | string | null;
  /** Form content */
  children: React.ReactNode;
}

/**
 * Simple Form Container
 * Provides basic form structure with header, loading, and error states
 */
export const SimpleFormContainer: React.FC<SimpleFormContainerProps> = ({
  icon,
  title,
  description,
  isLoading = false,
  error,
  children,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-8">
        <UnifiedHeader
          icon={icon}
          title={title}
          subtitle={description}
          variant="form"
          size="md"
        />
        <div className="flex justify-center py-8">
          <GenericLoadingState variant="spinner" text="Loading form..." />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Form Header */}
      <UnifiedHeader
        icon={icon}
        title={title}
        subtitle={description}
        variant="form"
        size="md"
      />

      {/* Error Display */}
      {error && (
        <div className="bg-red-900/30 backdrop-blur-sm border border-red-500/50 rounded-3xl p-6 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="text-red-400 text-sm font-medium bg-red-900/50 px-4 py-2 rounded-2xl border border-red-500/30">
              Error
            </div>
            <span className="text-red-300 font-medium text-lg">
              {typeof error === 'string' ? error : error.message}
            </span>
          </div>
        </div>
      )}

      {/* Form Content */}
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
};

export default SimpleFormContainer;