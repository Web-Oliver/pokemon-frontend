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
import GlassmorphismHeader from '../../../../shared/components/molecules/common/GlassmorphismHeader';
import FormActionButtons from '../../../../shared/components/molecules/common/FormActionButtons';

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
    <div className={`mb-8 ${className}`}>
      {/* Glassmorphism Header */}
      <GlassmorphismHeader
        icon={Star}
        title={title}
        description={subtitle}
        className="mb-8"
      />

      {/* Action Buttons */}
      <FormActionButtons
        primaryAction={{
          label: 'Edit Item',
          onClick: onEdit,
          icon: Edit,
          variant: 'primary',
        }}
        secondaryActions={[
          ...(!item.sold
            ? [
                {
                  label: 'Mark Sold',
                  onClick: onMarkSold,
                  icon: Check,
                  variant: 'success' as const,
                },
              ]
            : []),
          {
            label: 'Delete',
            onClick: onDelete,
            icon: Trash2,
            variant: 'danger' as const,
          },
        ]}
        tertiaryAction={{
          label: 'Back to Collection',
          onClick: onBackToCollection,
          icon: ArrowLeft,
        }}
      />

      {/* Stunning Premium Header Section */}
      <div className="relative overflow-hidden mt-8">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/10 to-pink-900/20"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.15),transparent_70%)]"></div>

        <div className="relative bg-[var(--theme-surface)] backdrop-blur-2xl rounded-[2rem] shadow-2xl border border-[var(--theme-border)] p-8 ring-1 ring-[var(--theme-border)]/50">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-6 lg:space-y-0">
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-[var(--theme-accent-primary)]/20 to-[var(--theme-accent-secondary)]/20 backdrop-blur-xl border border-[var(--theme-border)] shadow-lg">
                  <Star className="w-6 h-6 text-[var(--theme-accent-primary)]" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-[var(--theme-text-primary)] via-[var(--theme-accent-primary)]/80 to-[var(--theme-accent-secondary)]/80 bg-clip-text text-transparent leading-tight">
                    {title}
                  </h1>
                  <p className="text-lg text-[var(--theme-accent-primary)]/80 font-medium mt-1">
                    {subtitle}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 mt-6">
                <div className="px-4 py-2 rounded-xl bg-[var(--theme-surface-secondary)] backdrop-blur-xl border border-[var(--theme-border)] text-[var(--theme-text-primary)]">
                  <span className="text-sm font-medium">Set: {setName}</span>
                </div>
                <div className="px-4 py-2 rounded-xl bg-[var(--theme-status-success)]/20 backdrop-blur-xl border border-[var(--theme-status-success)]/30 text-[var(--theme-status-success)]">
                  <span className="text-sm font-bold">
                    {item.myPrice || '0'} kr
                  </span>
                </div>
                <div
                  className={`px-4 py-2 rounded-xl backdrop-blur-xl border ${
                    item.sold
                      ? 'bg-[var(--theme-status-error)]/20 border-[var(--theme-status-error)]/30 text-[var(--theme-status-error)]'
                      : 'bg-[var(--theme-status-success)]/20 border-[var(--theme-status-success)]/30 text-[var(--theme-status-success)]'
                  }`}
                >
                  <span className="text-sm font-medium">
                    {item.sold ? 'Sold' : 'Available'}
                  </span>
                </div>
              </div>
            </div>

            {/* Premium Action Buttons */}
            <div className="flex flex-col sm:flex-row lg:flex-col space-y-3 sm:space-y-0 sm:space-x-3 lg:space-x-0 lg:space-y-3">
              <button
                onClick={onEdit}
                className="group relative overflow-hidden px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300 transform hover:scale-[1.02] border border-blue-400/20"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-indigo-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center space-x-2">
                  <Edit className="w-4 h-4" />
                  <span>Edit Item</span>
                </div>
              </button>

              {!item?.sold && (
                <button
                  onClick={onMarkSold}
                  className="group relative overflow-hidden px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/40 transition-all duration-300 transform hover:scale-[1.02] border border-emerald-400/20"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-teal-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center space-x-2">
                    <Check className="w-4 h-4" />
                    <span>Mark Sold</span>
                  </div>
                </button>
              )}

              <button
                onClick={onDelete}
                className="group relative overflow-hidden px-6 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-pink-600 text-white font-semibold shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/40 transition-all duration-300 transform hover:scale-[1.02] border border-red-400/20"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-400/20 to-pink-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative flex items-center space-x-2">
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
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
