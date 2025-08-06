/**
 * AuctionEditLayout Component
 *
 * Extracts the massive JSX layout from AuctionEdit.tsx to eliminate UI bloat
 * and improve component maintainability. Contains all the premium styling and
 * form layout without business logic.
 *
 * Following CLAUDE.md SOLID principles:
 * - Single Responsibility: Handles only auction edit UI layout and styling
 * - DRY: Eliminates massive JSX duplication from page components
 * - Interface Segregation: Clean props interface for layout-only concerns
 */

import React from 'react';
import { AlertCircle, ArrowLeft, Calendar, Save, X, Edit3 } from 'lucide-react';
import Context7Background from '../../../../shared/components/organisms/effects/Context7Background';
import { UseFormReturn } from 'react-hook-form';
import { PokemonButton } from '../design-system/PokemonButton';
import LoadingSpinner from '../common/LoadingSpinner';
import { PageLayout } from '../layouts/PageLayout';
import { AuctionFormData } from '../../hooks/useAuctionFormData';

interface AuctionEditLayoutProps {
  currentAuction: any;
  loading: boolean;
  error: string | null;
  isEditing: boolean;
  form: UseFormReturn<AuctionFormData>;
  onBackToAuction: () => void;
  onSaveChanges: () => void;
  onClearError: () => void;
  getStatusColor: (status: string) => string;
  children?: React.ReactNode;
}

const AuctionEditLayout: React.FC<AuctionEditLayoutProps> = ({
  currentAuction,
  loading,
  error,
  isEditing,
  form,
  onBackToAuction,
  onSaveChanges,
  onClearError,
  getStatusColor,
  children,
}) => {
  const headerActions = (
    <div className="flex items-center space-x-3">
      <button
        onClick={onSaveChanges}
        className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 py-3 rounded-2xl transition-all duration-300 inline-flex items-center shadow-lg hover:shadow-xl hover:scale-105"
      >
        Save Changes
      </button>
      <button
        onClick={onBackToAuction}
        className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white px-6 py-3 rounded-2xl transition-all duration-300 inline-flex items-center shadow-lg hover:shadow-xl hover:scale-105"
      >
        Cancel
      </button>
    </div>
  );

  if (loading) {
    return (
      <PageLayout
        title="Edit Auction"
        subtitle="Modify your auction details"
        loading={true}
        error={error}
        actions={headerActions}
        variant="default"
      >
        <Context7Background opacity={0.3} color="default" />
        <div className="relative z-10 p-8">
          <div className="max-w-7xl mx-auto">
            <PremiumLoadingCard />
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!currentAuction) {
    return (
      <PageLayout
        title="Auction Not Found"
        subtitle="The auction you're trying to edit doesn't exist or has been deleted"
        loading={false}
        error="Auction not found"
        actions={
          <button
            onClick={onBackToAuction}
            className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white px-6 py-3 rounded-2xl transition-all duration-300 inline-flex items-center shadow-lg hover:shadow-xl hover:scale-105"
          >
            Back to Auctions
          </button>
        }
        variant="default"
      />
    );
  }

  return (
    <PageLayout
      title="Edit Auction"
      subtitle="Modify your auction details and manage items"
      loading={loading}
      error={error}
      actions={headerActions}
      variant="default"
    >
      <Context7Background opacity={0.3} color="default" />

      <div className="relative z-10 p-8">
        <div className="max-w-7xl mx-auto space-y-10">
          {/* Premium Header Section */}
          <PremiumHeaderSection
            currentAuction={currentAuction}
            isEditing={isEditing}
            onBackToAuction={onBackToAuction}
            onSaveChanges={onSaveChanges}
            getStatusColor={getStatusColor}
          />

          {/* Premium Error Message */}
          {error && (
            <PremiumErrorMessage error={error} onClearError={onClearError} />
          )}

          {/* Premium Auction Details Form */}
          <PremiumAuctionForm form={form} />

          {/* Children (AuctionItemsSection and Modals) */}
          {children}
        </div>
      </div>
    </PageLayout>
  );
};

// Removed duplicate - using Context7Background component instead

// Premium Loading Card Component
const PremiumLoadingCard: React.FC = () => (
  <div className="bg-[var(--theme-surface)] backdrop-blur-xl rounded-3xl shadow-2xl border border-[var(--theme-border)] p-12 relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-orange-500/5 to-[var(--theme-status-error)]/5"></div>
    <div className="relative z-10">
      <LoadingSpinner text="Loading auction details..." />
    </div>
  </div>
);

// Premium Header Section Component
interface PremiumHeaderSectionProps {
  currentAuction: any;
  isEditing: boolean;
  onBackToAuction: () => void;
  onSaveChanges: () => void;
  getStatusColor: (status: string) => string;
}

const PremiumHeaderSection: React.FC<PremiumHeaderSectionProps> = ({
  currentAuction,
  isEditing,
  onBackToAuction,
  onSaveChanges,
  getStatusColor,
}) => (
  <div className="bg-[var(--theme-surface)] backdrop-blur-xl rounded-3xl shadow-2xl border border-[var(--theme-border)] p-8 relative overflow-hidden group">
    <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-orange-500/5 to-[var(--theme-status-error)]/5"></div>
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-6">
        <PokemonButton
          onClick={onBackToAuction}
          variant="outline"
          className="inline-flex items-center border-[var(--theme-border)] hover:border-[var(--theme-border-hover)] text-[var(--theme-text-secondary)] hover:text-[var(--theme-text-primary)]"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Auction
        </PokemonButton>

        <div className="flex items-center space-x-3">
          <PokemonButton
            onClick={onSaveChanges}
            disabled={isEditing}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 py-3 rounded-2xl transition-all duration-300 inline-flex items-center shadow-lg hover:shadow-xl hover:scale-105"
          >
            {isEditing ? (
              <LoadingSpinner size="sm" className="mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Changes
          </PokemonButton>
        </div>
      </div>

      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-3 mb-4">
            <h1 className="text-4xl font-bold text-[var(--theme-text-primary)] tracking-wide bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              Edit Auction
            </h1>
            <span
              className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-wide ${getStatusColor(currentAuction.status)}`}
            >
              {currentAuction.status.charAt(0).toUpperCase() +
                currentAuction.status.slice(1)}
            </span>
          </div>

          <p className="text-xl text-[var(--theme-text-secondary)] font-medium leading-relaxed mb-6">
            Update auction details, manage items, and modify settings
          </p>
        </div>
      </div>
    </div>
    {/* Premium shimmer effect */}
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--theme-text-primary)]/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
  </div>
);

// Premium Error Message Component
interface PremiumErrorMessageProps {
  error: string;
  onClearError: () => void;
}

const PremiumErrorMessage: React.FC<PremiumErrorMessageProps> = ({
  error,
  onClearError,
}) => (
  <div className="bg-[var(--theme-status-error)]/10 backdrop-blur-sm border border-[var(--theme-status-error)]/30 rounded-3xl p-6 shadow-lg">
    <div className="flex items-center">
      <div className="flex-shrink-0">
        <div className="w-10 h-10 bg-gradient-to-br from-[var(--theme-status-error)] to-rose-600 rounded-2xl shadow-lg flex items-center justify-center">
          <AlertCircle className="h-5 w-5 text-white" />
        </div>
      </div>
      <div className="ml-4">
        <p className="text-sm text-[var(--theme-status-error)] font-medium">
          {error}
        </p>
      </div>
      <div className="ml-auto pl-3">
        <button
          onClick={onClearError}
          className="inline-flex text-[var(--theme-status-error)]/70 hover:text-[var(--theme-status-error)] p-2 rounded-lg hover:bg-[var(--theme-status-error)]/10 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  </div>
);

// Premium Auction Form Component
interface PremiumAuctionFormProps {
  form: UseFormReturn<AuctionFormData>;
}

const PremiumAuctionForm: React.FC<PremiumAuctionFormProps> = ({ form }) => (
  <div className="bg-[var(--theme-surface)] backdrop-blur-xl rounded-3xl shadow-2xl border border-[var(--theme-border)] p-8 relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-r from-[var(--theme-accent-secondary)]/3 via-purple-500/3 to-pink-500/3"></div>
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[var(--theme-text-primary)] tracking-wide">
          Auction Details
        </h2>
        <Edit3 className="w-6 h-6 text-[var(--theme-accent-secondary)]" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Top Text */}
        <div className="space-y-2">
          <label
            htmlFor="topText"
            className="block text-sm font-bold text-[var(--theme-text-secondary)] tracking-wide uppercase"
          >
            Auction Title
          </label>
          <input
            type="text"
            id="topText"
            {...form.register('topText')}
            className="w-full px-4 py-3 border border-[var(--theme-border)] rounded-xl text-sm font-medium backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent-secondary)] focus:border-transparent bg-[var(--theme-surface-secondary)] text-[var(--theme-text-primary)]"
            placeholder="Enter auction title..."
          />
        </div>

        {/* Auction Date */}
        <div className="space-y-2">
          <label
            htmlFor="auctionDate"
            className="block text-sm font-bold text-[var(--theme-text-secondary)] tracking-wide uppercase"
          >
            Auction Date
          </label>
          <div className="relative">
            <input
              type="date"
              id="auctionDate"
              {...form.register('auctionDate')}
              className="w-full px-4 py-3 pr-10 border border-slate-300 dark:border-zinc-600 dark:border-zinc-600 rounded-xl text-sm font-medium backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--theme-text-muted)]" />
          </div>
        </div>

        {/* Status */}
        <div className="space-y-2">
          <label
            htmlFor="status"
            className="block text-sm font-bold text-[var(--theme-text-secondary)] tracking-wide uppercase"
          >
            Status
          </label>
          <select
            id="status"
            {...form.register('status')}
            className="w-full px-4 py-3 border border-[var(--theme-border)] rounded-xl text-sm font-medium backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[var(--theme-accent-secondary)] focus:border-transparent bg-[var(--theme-surface-secondary)] text-[var(--theme-text-primary)]"
          >
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="sold">Sold</option>
            <option value="expired">Expired</option>
          </select>
        </div>

        {/* Bottom Text - Full Width */}
        <div className="md:col-span-2 space-y-2">
          <label
            htmlFor="bottomText"
            className="block text-sm font-bold text-[var(--theme-text-secondary)] tracking-wide uppercase"
          >
            Description
          </label>
          <textarea
            id="bottomText"
            {...form.register('bottomText')}
            rows={4}
            className="w-full px-4 py-3 border border-slate-300 dark:border-zinc-600 dark:border-zinc-600 rounded-xl text-sm font-medium backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            placeholder="Enter auction description..."
          />
        </div>
      </div>
    </div>
  </div>
);

export default AuctionEditLayout;
