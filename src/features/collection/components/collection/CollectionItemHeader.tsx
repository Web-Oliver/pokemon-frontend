/**
 * Collection Item Header Component
 *
 * Extracted from CollectionItemDetail god class to follow CLAUDE.md principles:
 * - Single Responsibility: Only handles header display and action buttons
 * - DRY: Reusable header pattern across different item views
 * - Reusability: Can be used by other item detail components
 */

import React from 'react';
import { ArrowLeft, Edit, Check, Trash2, Star } from 'lucide-react';
import { CollectionItem } from '../../hooks/collection/useCollectionItem';
import UnifiedHeader from '../../../../shared/components/molecules/common/UnifiedHeader';


export interface CollectionItemHeaderProps {
  item: CollectionItem;
  title: string;
  subtitle: string;
  setName: string;
  onEdit: () => void;
  onMarkSold: () => void;
  onDelete: () => void;
  onBackToCollection: () => void;
  className?: string;
}

/**
 * Header component for collection item detail pages
 * Displays item information and primary action buttons
 */
export const CollectionItemHeader: React.FC<CollectionItemHeaderProps> = ({
  item,
  title,
  subtitle,
  setName,
  onEdit,
  onMarkSold,
  onDelete,
  onBackToCollection,
  className = '',
}) => {
  return (
    <div className={`mb-6 sm:mb-8 ${className}`}>
      {/* Unified Header */}
      <UnifiedHeader
        icon={Star}
        title={title}
        subtitle={subtitle}
        variant="glassmorphism"
        size="lg"
        showBackButton={true}
        onBack={onBackToCollection}
        actions={[]} // Explicitly pass empty actions array
        className="mb-8"
      />

      {/* Action Buttons - Using custom buttons instead of incorrect FormActionButtons */}

      {/* Stunning Premium Header Section */}
      <div className="relative overflow-hidden mt-6 sm:mt-8">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/10 to-pink-900/20"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.15),transparent_70%)]"></div>

        <div className="relative bg-[var(--theme-surface)] backdrop-blur-2xl rounded-2xl sm:rounded-[2rem] shadow-2xl border border-[var(--theme-border)] p-4 sm:p-6 lg:p-8 ring-1 ring-[var(--theme-border)]/50">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-6 lg:space-y-0">
            <div className="flex-1">
              <div className="flex items-start space-x-3 sm:space-x-4 mb-4">
                <div className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-gradient-to-br from-[var(--theme-accent-primary)]/20 to-[var(--theme-accent-secondary)]/20 backdrop-blur-xl border border-[var(--theme-border)] shadow-lg flex-shrink-0">
                  <Star className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--theme-accent-primary)]" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-[var(--theme-text-primary)] via-[var(--theme-accent-primary)]/80 to-[var(--theme-accent-secondary)]/80 bg-clip-text text-transparent leading-tight break-words">
                    {title}
                  </h1>
                  <p className="text-base sm:text-lg text-[var(--theme-accent-primary)]/80 font-medium mt-1 break-words">
                    {subtitle}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-4 sm:mt-6">
                <div className="px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl bg-[var(--theme-surface-secondary)] backdrop-blur-xl border border-[var(--theme-border)] text-[var(--theme-text-primary)] min-w-0">
                  <span className="text-xs sm:text-sm font-medium break-words">Set: {setName}</span>
                </div>
                <div className="px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl bg-[var(--theme-status-success)]/20 backdrop-blur-xl border border-[var(--theme-status-success)]/30 text-[var(--theme-status-success)]">
                  <span className="text-xs sm:text-sm font-bold whitespace-nowrap">
                    {item.myPrice || '0'} kr
                  </span>
                </div>
                <div
                  className={`px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl backdrop-blur-xl border ${
                    item.sold
                      ? 'bg-[var(--theme-status-error)]/20 border-[var(--theme-status-error)]/30 text-[var(--theme-status-error)]'
                      : 'bg-[var(--theme-status-success)]/20 border-[var(--theme-status-success)]/30 text-[var(--theme-status-success)]'
                  }`}
                >
                  <span className="text-xs sm:text-sm font-medium whitespace-nowrap">
                    {item.sold ? 'Sold' : 'Available'}
                  </span>
                </div>
              </div>
            </div>

            {/* Premium Action Buttons */}
            <div className="flex flex-col sm:flex-row lg:flex-col space-y-2 sm:space-y-0 sm:space-x-2 lg:space-x-0 lg:space-y-2 w-full sm:w-auto lg:w-auto">
              <button
                onClick={onEdit}
                className="group relative overflow-hidden px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 transform hover:scale-[1.02] border border-blue-400/20 flex-1 sm:flex-none"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center justify-center space-x-2">
                  <Edit className="w-4 h-4" />
                  <span className="text-sm sm:text-base">Edit Item</span>
                </div>
              </button>

              {!item?.sold && (
                <button
                  onClick={onMarkSold}
                  className="group relative overflow-hidden px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/40 transition-all duration-300 transform hover:scale-[1.02] border border-emerald-400/20 flex-1 sm:flex-none"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center justify-center space-x-2">
                    <Check className="w-4 h-4" />
                    <span className="text-sm sm:text-base">Mark Sold</span>
                  </div>
                </button>
              )}

              <button
                onClick={onDelete}
                className="group relative overflow-hidden px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-gradient-to-r from-red-600 to-pink-600 text-white font-semibold shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/40 transition-all duration-300 transform hover:scale-[1.02] border border-red-400/20 flex-1 sm:flex-none"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-400/20 to-pink-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center justify-center space-x-2">
                  <Trash2 className="w-4 h-4" />
                  <span className="text-sm sm:text-base">Delete</span>
                </div>
              </button>
            </div>
          </div>

          {/* Breathing Animation */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 rounded-[2rem] animate-pulse opacity-40 pointer-events-none"></div>
        </div>
      </div>
    </div>
  );
};
