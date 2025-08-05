/**
 * Page Layout Component
 * Layer 3: Components (UI Building Blocks)
 * Eliminates duplicate page structure patterns across 14+ files
 * Follows DRY principle and provides consistent page experience
 */

import React from 'react';
import LoadingSpinner from '../common/LoadingSpinner';
import GlassmorphismHeader from '../common/GlassmorphismHeader';

export interface PageLayoutProps {
  title: string;
  subtitle?: string;
  loading?: boolean;
  error?: string | null;
  actions?: React.ReactNode;
  children: React.ReactNode;
  variant?: 'default' | 'blue' | 'emerald';
}

/**
 * Standardized page layout component
 * Consolidates: background pattern, header structure, loading states, error handling
 * Used across Collection, SetSearch, Analytics, Auctions, and other pages
 */
export const PageLayout: React.FC<PageLayoutProps> = ({
  title,
  subtitle,
  loading = false,
  error = null,
  actions,
  children,
  variant = 'default',
}) => {
  // Define variant-specific gradient classes
  const gradientClasses = {
    default: 'from-zinc-950 via-zinc-900 to-zinc-950',
    blue: 'from-zinc-950 via-zinc-900 to-zinc-950',
    emerald: 'from-zinc-950 via-zinc-900 to-zinc-950',
  };

  // Loading state
  if (loading) {
    return (
      <div
        className={`min-h-screen bg-gradient-to-br ${gradientClasses[variant]} relative overflow-hidden`}
      >
        {/* Context7 Premium Background Pattern */}
        <div className="absolute inset-0 opacity-30">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236366f1' fill-opacity='0.03'%3E%3Ccircle cx='40' cy='40' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <LoadingSpinner text={`Loading ${title}...`} />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${gradientClasses[variant]} relative overflow-hidden`}
    >
      {/* Context7 Premium Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236366f1' fill-opacity='0.03'%3E%3Ccircle cx='40' cy='40' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      <div className="relative z-10 p-8">
        <div className="max-w-7xl mx-auto space-y-10">
          {/* Premium Page Header - Only render if title is provided */}
          {title && (
            <GlassmorphismHeader
              title={title}
              description={subtitle}
              className="mb-6"
            >
              {actions}
            </GlassmorphismHeader>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-900/30 backdrop-blur-sm border border-red-500/50 rounded-3xl p-6 shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="text-red-400 text-sm font-medium bg-red-900/50 px-4 py-2 rounded-2xl border border-red-500/30">
                  Error
                </div>
                <span className="text-red-300 font-medium text-lg">
                  {error}
                </span>
              </div>
            </div>
          )}

          {/* Page Content */}
          {children}
        </div>
      </div>
    </div>
  );
};
