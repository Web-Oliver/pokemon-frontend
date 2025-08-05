/**
 * SearchSectionContainer - Unified Container for Card/Product Search
 * Layer 3: Components (UI Building Blocks)
 *
 * Following CLAUDE.md principles:
 * - DRY: Single template for both Card and Product search sections
 * - Single Responsibility: Handles UI container and visual effects only
 * - Open/Closed: Extensible for different search types through props
 * - Interface Segregation: Specific props interface for search containers
 */

import React, { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface SearchSectionContainerProps {
  /** Section configuration */
  sectionTitle: string;
  sectionIcon: LucideIcon;
  description?: string;

  /** Content slots */
  children: ReactNode;

  /** Styling overrides */
  className?: string;

  /** Theme variants */
  variant?: 'card' | 'product' | 'default';
}

/**
 * Unified Search Section Container
 * Provides Context7 Premium styling and effects for both Card and Product search sections
 */
export const SearchSectionContainer: React.FC<SearchSectionContainerProps> = ({
  sectionTitle,
  sectionIcon: SectionIcon,
  description,
  children,
  className = '',
  variant = 'default',
}) => {
  // Variant-specific styling
  const variantClasses = {
    card: 'from-cyan-500/10 via-blue-500/10 to-purple-500/10',
    product: 'from-emerald-500/10 via-blue-500/10 to-purple-500/10',
    default: 'from-cyan-500/10 via-blue-500/10 to-purple-500/10',
  };

  const variantSecondaryClasses = {
    card: 'from-cyan-400/5 via-blue-400/5 to-purple-400/5',
    product: 'from-emerald-400/5 via-blue-400/5 to-purple-400/5',
    default: 'from-cyan-400/5 via-blue-400/5 to-purple-400/5',
  };

  const defaultDescription =
    variant === 'card'
      ? 'Search sets first, then find cards within the selected set'
      : 'Search and select from your collection database';

  return (
    <div className={`relative ${className}`}>
      {/* Main Container with Context7 Design */}
      <div className="relative">
        {/* Context7 Background Glass Effects */}
        <div
          className={`absolute -inset-4 bg-gradient-to-r ${variantClasses[variant]} rounded-[3rem] blur-2xl opacity-60`}
        ></div>
        <div
          className={`absolute -inset-2 bg-gradient-to-r ${variantSecondaryClasses[variant]} rounded-[2.5rem] blur-xl`}
        ></div>

        <div className="relative bg-black/40 backdrop-blur-3xl rounded-[2rem] shadow-2xl border border-white/10 p-8 ring-1 ring-white/5 overflow-visible">
          {/* Floating Orbs */}
          <div className="absolute -top-6 -right-6 w-32 h-32 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div
            className="absolute -bottom-6 -left-6 w-24 h-24 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 rounded-full blur-2xl animate-pulse"
            style={{ animationDelay: '1s' }}
          ></div>

          {/* Context7 Premium Header */}
          <div className="mb-8 relative z-10 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 backdrop-blur-xl border border-white/10 shadow-lg">
                <SectionIcon className="w-8 h-8 text-cyan-400" />
              </div>
            </div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-white via-cyan-100 to-blue-100 bg-clip-text text-transparent leading-tight mb-2">
              {sectionTitle}
            </h3>
            <p className="text-white/60 font-medium">
              {description || defaultDescription}
            </p>
          </div>

          {/* Content Area */}
          <div className="relative z-10">{children}</div>

          {/* Breathing Animation for main container */}
          <div
            className={`absolute inset-0 bg-gradient-to-r ${variantClasses[variant]} rounded-[2rem] animate-pulse opacity-40 pointer-events-none`}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default SearchSectionContainer;
