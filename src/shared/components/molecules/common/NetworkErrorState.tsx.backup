/**
 * NetworkErrorState Component - Handles network connectivity issues
 * Layer 3: Components (UI Building Blocks)
 *
 * Provides user-friendly fallback when backend is not accessible
 * Following CLAUDE.md principles:
 * - Single Responsibility: Only handles network error display
 * - User Experience: Provides clear guidance for network issues
 */

import React from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { EmptyState } from './EmptyState';

interface NetworkErrorStateProps {
  /** Whether to show retry button */
  showRetry?: boolean;
  /** Retry callback function */
  onRetry?: () => void;
  /** Custom title override */
  title?: string;
  /** Custom description override */
  description?: string;
  /** Loading state for retry button */
  retrying?: boolean;
}

export const NetworkErrorState: React.FC<NetworkErrorStateProps> = ({
  showRetry = true,
  onRetry,
  title = 'Unable to connect to server',
  description = 'Please check if the backend server is running and try again.',
  retrying = false,
}) => {
  return (
    <EmptyState
      icon={WifiOff}
      title={title}
      description={description}
      variant="error"
      size="lg"
      action={
        showRetry && onRetry
          ? {
              label: retrying ? 'Retrying...' : 'Retry Connection',
              onClick: onRetry,
              variant: 'primary' as const,
            }
          : undefined
      }
    />
  );
};

export default NetworkErrorState;