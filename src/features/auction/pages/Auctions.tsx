/**
 * Auctions Page - Unified Design System
 *
 * Modern auction management with unified theme system integration.
 * Features premium glassmorphism design, enhanced filtering, and immersive visualization.
 *
 * Following CLAUDE.md unified design principles:
 * - Unified theme system with glassmorphism patterns
 * - Shared particle systems and neural background utilities
 * - Consolidated component usage (PokemonCard, PokemonButton, etc.)
 * - Theme-aware styling and consistent design patterns
 * - Optimized performance through shared utilities
 * - Preserved Context7 2025 futuristic header design as specified
 */

import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Filter,
  Package,
  Plus,
  X,
  Zap,
  Award,
  Clock,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import GenericLoadingState from '../../../shared/components/molecules/common/GenericLoadingState';
import { PageLayout } from '../../../shared/components/layout/layouts/PageLayout';
import UnifiedHeader from '../../../shared/components/molecules/common/UnifiedHeader';
import { useAuction } from '../../../shared/hooks/useAuction';
import {
  getStatusColor,
  getStatusPriority,
} from '../../../shared/utils/helpers/auctionStatusUtils';
import { formatDateWithTime } from '../../../shared/utils/helpers/formatting';
import { navigationHelper } from "../../../shared/utils/navigation";

// Import unified design system
import {
  PokemonCard,
  PokemonButton,
  PokemonSelect,
  PokemonPageContainer,
} from '../../../shared/components/atoms/design-system';

const Auctions: React.FC = () => {
  const { auctions, loading, error, fetchAuctions, clearError } = useAuction();

  // Filter state
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Navigation state (using simple URL management for now)
  const navigateToAuctionDetail = (auctionId: string) => {
    navigationHelper.navigateToAuctionDetail(auctionId);
  };

  const navigateToCreateAuction = () => {
    navigationHelper.navigateToCreate.auction();
  };

  // Filter auctions based on status
  const filteredAuctions = auctions.filter((auction) => {
    if (!statusFilter) {
      return true;
    }
    return auction.status === statusFilter;
  });

  // Handle status filter change
  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    if (value) {
      fetchAuctions({ status: value });
    } else {
      fetchAuctions();
    }
  };

  // Clear filters
  const clearFilters = () => {
    setStatusFilter('');
    fetchAuctions();
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    const formatted = new Intl.NumberFormat('da-DK', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
    return `${formatted} kr.`;
  };

  // Sort auctions by status priority and date
  const sortedAuctions = [...filteredAuctions].sort((a, b) => {
    const statusDiff =
      getStatusPriority(a.status) - getStatusPriority(b.status);
    if (statusDiff !== 0) {
      return statusDiff;
    }
    return (
      new Date(b.auctionDate).getTime() - new Date(a.auctionDate).getTime()
    );
  });

  // Calculate stats for display
  const activeAuctions = auctions.filter((a) => a.status === 'active').length;
  const draftAuctions = auctions.filter((a) => a.status === 'draft').length;
  const completedAuctions = auctions.filter((a) => a.status === 'sold').length;

  // Auto-refresh auctions when the page becomes visible (for better UX)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchAuctions();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchAuctions]);

  // Debug current auctions state
  useEffect(() => {
    console.log('[Auctions] Current auctions count:', auctions.length);
    console.log(
      '[Auctions] Current auctions:',
      auctions.map((a) => ({
        id: a.id || a._id,
        topText: a.topText,
        status: a.status,
      }))
    );
  }, [auctions]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(clearError, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  // Handle navigation
  const handleNavigation = (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <PageLayout>
      <PokemonPageContainer withParticles={true} withNeural={true}>
        <div className="max-w-7xl mx-auto space-y-12">
          <UnifiedHeader
            icon={DollarSign}
            title="Auction Hub"
            subtitle="Neural-powered auction management for your collection universe"
            variant="glassmorphism"
            size="lg"
            showBackButton={true}
            onBack={() => handleNavigation('/dashboard')}
            className="mb-8"
            actions={[
              {
                label: 'Refresh',
                onClick: () => {
                  console.log('[Auctions] Manual refresh triggered');
                  fetchAuctions();
                },
                icon: Zap,
                variant: 'outline',
              },
              {
                label: 'Create Auction',
                onClick: navigateToCreateAuction,
                icon: Plus,
                variant: 'primary',
              },
            ]}
          />

          {/* Stats Grid using PokemonCard System */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Active Auctions */}
            <PokemonCard
              variant="glass"
              size="md"
              interactive
              className="group"
            >
              <div className="relative z-10 flex items-center">
                <div className="relative mr-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/30 via-purple-500/20 to-pink-500/30 backdrop-blur-sm rounded-[1.2rem] flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                    <Zap className="w-8 h-8 text-cyan-300 relative z-10 animate-pulse" />
                    <div
                      className="absolute inset-0 animate-spin opacity-60 group-hover:opacity-100 transition-opacity duration-500"
                      style={{ animationDuration: '20s' }}
                    >
                      <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full absolute -top-0.5 left-1/2 transform -translate-x-1/2 blur-sm"></div>
                      <div className="w-1 h-1 bg-purple-400 rounded-full absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 blur-sm"></div>
                    </div>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-cyan-200/90 mb-2 tracking-wider uppercase">
                    Active Auctions
                  </p>
                  <p className="text-3xl font-black bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(6,182,212,0.3)] group-hover:scale-105 transition-transform duration-300">
                    {activeAuctions}
                  </p>
                </div>
              </div>
            </PokemonCard>

            {/* Draft Auctions */}
            <PokemonCard
              variant="glass"
              size="md"
              interactive
              className="group"
            >
              <div className="relative z-10 flex items-center">
                <div className="relative mr-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500/30 via-pink-500/20 to-orange-500/30 backdrop-blur-sm rounded-[1.2rem] flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                    <Clock className="w-8 h-8 text-purple-300 relative z-10 animate-pulse" />
                    <div className="absolute inset-0 rounded-[1.2rem] border border-purple-400/30 animate-ping opacity-40"></div>
                    <div
                      className="absolute inset-2 rounded-xl border border-pink-400/20 animate-ping opacity-30"
                      style={{ animationDelay: '0.5s' }}
                    ></div>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-purple-200/90 mb-2 tracking-wider uppercase">
                    Draft Auctions
                  </p>
                  <p className="text-3xl font-black bg-gradient-to-r from-purple-300 via-pink-300 to-orange-300 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(168,85,247,0.3)] group-hover:scale-105 transition-transform duration-300">
                    {draftAuctions}
                  </p>
                </div>
              </div>
            </PokemonCard>

            {/* Completed Auctions */}
            <PokemonCard
              variant="glass"
              size="md"
              interactive
              className="group"
            >
              <div className="relative z-10 flex items-center">
                <div className="relative mr-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/30 via-cyan-500/20 to-blue-500/30 backdrop-blur-sm rounded-[1.2rem] flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                    <Award className="w-8 h-8 text-emerald-300 relative z-10 animate-pulse" />
                    <div className="absolute inset-0 opacity-50 group-hover:opacity-80 transition-opacity duration-500">
                      <div className="w-1 h-1 bg-emerald-400 rounded-full absolute top-2 left-2 animate-ping"></div>
                      <div
                        className="w-1 h-1 bg-cyan-400 rounded-full absolute top-2 right-2 animate-ping"
                        style={{ animationDelay: '0.3s' }}
                      ></div>
                      <div
                        className="w-1 h-1 bg-blue-400 rounded-full absolute bottom-2 left-2 animate-ping"
                        style={{ animationDelay: '0.6s' }}
                      ></div>
                      <div
                        className="w-1 h-1 bg-emerald-400 rounded-full absolute bottom-2 right-2 animate-ping"
                        style={{ animationDelay: '0.9s' }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-emerald-200/90 mb-2 tracking-wider uppercase">
                    Completed Auctions
                  </p>
                  <p className="text-3xl font-black bg-gradient-to-r from-emerald-300 via-cyan-300 to-blue-300 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(16,185,129,0.3)] group-hover:scale-105 transition-transform duration-300">
                    {completedAuctions}
                  </p>
                </div>
              </div>
            </PokemonCard>
          </div>

          {/* Filter Hub using PokemonCard */}
          <PokemonCard variant="glass" size="lg" className="group relative">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                {/* Icon container */}
                <div className="relative mr-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/30 via-purple-500/20 to-pink-500/30 backdrop-blur-sm rounded-[1rem] shadow-xl flex items-center justify-center border border-white/[0.15] group-hover:scale-105 transition-all duration-500">
                    <div className="absolute inset-2 bg-gradient-to-br from-cyan-400/10 to-purple-500/10 rounded-lg blur-md"></div>
                    <Filter className="w-6 h-6 text-cyan-300 relative z-10 animate-pulse" />
                  </div>
                </div>
                <h2 className="text-2xl font-black bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                  Auction Filters
                </h2>
              </div>

              {statusFilter && (
                <PokemonButton
                  variant="danger"
                  size="sm"
                  onClick={clearFilters}
                  className="px-4 py-2 rounded-xl bg-white/[0.08] backdrop-blur-sm border border-white/[0.12] hover:bg-white/[0.12] hover:border-red-400/30 text-red-300 hover:text-white transition-all duration-500 group/btn shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(239,68,68,0.3)] flex items-center"
                >
                  <X className="w-4 h-4 mr-2 group-hover/btn:scale-110 transition-all duration-300" />
                  Clear Filters
                </PokemonButton>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-semibold text-cyan-200/90 mb-3 tracking-wider uppercase">
                  Status Filter
                </label>
                <PokemonSelect
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                  placeholder="All Statuses"
                  options={[
                    { value: '', label: 'All Statuses' },
                    { value: 'draft', label: 'Draft' },
                    { value: 'active', label: 'Active' },
                    { value: 'sold', label: 'Sold' },
                    { value: 'expired', label: 'Expired' },
                  ]}
                />
              </div>
            </div>
          </PokemonCard>

          {/* Context7 2025 Futuristic Error Message */}
          {error && (
            <div className="group relative overflow-hidden">
              {/* Error glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-pink-500/15 to-orange-500/20 rounded-[1.5rem] opacity-0 group-hover:opacity-100 transition-all duration-1000 blur-sm"></div>

              {/* Advanced glassmorphism error container */}
              <div className="relative backdrop-blur-xl bg-gradient-to-br from-white/[0.12] via-red-500/[0.08] to-pink-500/[0.12] border border-red-400/[0.20] rounded-[1.5rem] p-6 shadow-[0_8px_32px_0_rgba(239,68,68,0.37)] transition-all duration-500">
                {/* Error pattern overlay */}
                <div
                  className="absolute inset-0 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity duration-500"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23ef4444' stroke-width='0.1'%3E%3Ccircle cx='30' cy='30' r='0.5' fill='%23ef4444' fill-opacity='0.1'/%3E%3Cpath d='M15 15 L45 45 M45 15 L15 45' stroke-dasharray='1,2'/%3E%3C/g%3E%3C/svg%3E")`,
                    backgroundSize: '30px 30px',
                  }}
                ></div>

                <div className="flex items-center relative z-10">
                  <div className="flex-shrink-0 mr-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500/30 via-pink-500/20 to-orange-500/30 backdrop-blur-sm rounded-[1rem] shadow-xl flex items-center justify-center border border-red-400/[0.20]">
                      <X className="h-6 w-6 text-red-300 animate-pulse" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-red-200 font-medium">{error}</p>
                  </div>
                  <button
                    onClick={clearError}
                    className="ml-4 p-2 rounded-xl bg-white/[0.08] backdrop-blur-sm border border-white/[0.12] hover:bg-white/[0.12] hover:border-red-400/30 text-red-300 hover:text-white transition-all duration-500 group/btn"
                  >
                    <X className="h-4 w-4 group-hover/btn:scale-110 transition-all duration-300" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Context7 2025 Futuristic Loading State */}
          {loading && (
            <div className="group relative overflow-hidden">
              {/* Loading glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-purple-500/15 to-pink-500/20 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-all duration-1000 blur-sm animate-pulse"></div>

              {/* Advanced glassmorphism loading container */}
              <div className="relative backdrop-blur-xl bg-gradient-to-br from-white/[0.08] via-slate-500/[0.03] to-purple-500/[0.08] border border-white/[0.12] rounded-[2rem] shadow-[0_16px_40px_0_rgba(31,38,135,0.2)] p-12">
                {/* Loading pattern overlay */}
                <div
                  className="absolute inset-0 opacity-[0.02] animate-pulse transition-opacity duration-500"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23ffffff' stroke-width='0.1'%3E%3Ccircle cx='30' cy='30' r='0.5' fill='%23ffffff' fill-opacity='0.1'/%3E%3Cpath d='M15 15 L45 45 M45 15 L15 45' stroke-dasharray='1,2'/%3E%3C/g%3E%3C/svg%3E")`,
                    backgroundSize: '30px 30px',
                  }}
                ></div>

                {/* Quantum accent line */}
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent animate-pulse"></div>

                <div className="relative z-10">
                  <GenericLoadingState variant="spinner" text="Loading auctions..." />
                </div>
              </div>
            </div>
          )}

          {/* Auction Timeline using PokemonCard */}
          {!loading && (
            <PokemonCard variant="glass" size="lg" className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/3 via-orange-500/3 to-red-500/3"></div>
              <div className="relative z-10">
                <div className="mb-6 border-b border-slate-200/50 dark:border-zinc-700/50 pb-6">
                  <h2 className="text-2xl font-bold text-zinc-100 tracking-wide">
                    Auctions ({sortedAuctions.length})
                  </h2>
                </div>

                {sortedAuctions.length === 0 ? (
                  <div className="p-16 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-gray-200 rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-6">
                      <Package className="w-10 h-10 text-slate-500 dark:text-zinc-500 dark:text-zinc-400" />
                    </div>
                    <h3 className="text-xl font-bold text-zinc-100 mb-3">
                      No auctions found
                    </h3>
                    <p className="text-slate-600 dark:text-zinc-400 dark:text-zinc-300 font-medium max-w-md mx-auto leading-relaxed mb-8">
                      {statusFilter
                        ? `No auctions found with status "${statusFilter}". Try adjusting your filters.`
                        : 'Get started by creating your first auction.'}
                    </p>
                    <PokemonButton
                      variant="primary"
                      size="lg"
                      onClick={navigateToCreateAuction}
                      className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 hover:from-amber-700 hover:via-orange-700 hover:to-red-700 shadow-lg hover:shadow-xl hover:scale-105"
                    >
                      <Plus className="w-5 h-5 mr-3" />
                      Create First Auction
                    </PokemonButton>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {sortedAuctions.map((auction, index) => (
                      <PokemonCard
                        key={auction.id || auction._id || `auction-${index}`}
                        variant="glass"
                        size="md"
                        interactive
                        onClick={() =>
                          navigateToAuctionDetail(auction.id || auction._id)
                        }
                        className="group cursor-pointer relative"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-orange-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative z-10">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-3 mb-3">
                                <h3 className="text-xl font-bold text-zinc-100 truncate group-hover:text-amber-300 transition-colors duration-300">
                                  {auction.topText || 'Untitled Auction'}
                                </h3>
                                <span
                                  className={`inline-flex items-center px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wide ${getStatusColor(auction.status)}`}
                                >
                                  {auction.status.charAt(0).toUpperCase() +
                                    auction.status.slice(1)}
                                </span>
                              </div>

                              <p className="text-sm text-slate-600 dark:text-zinc-400 dark:text-zinc-300 mb-4 line-clamp-2 font-medium">
                                {auction.bottomText ||
                                  'No description available'}
                              </p>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div className="flex items-center text-slate-600 dark:text-zinc-400 dark:text-zinc-300">
                                  <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                                    <Calendar className="w-3 h-3 text-white" />
                                  </div>
                                  <span className="font-medium">
                                    {formatDateWithTime(auction.auctionDate)}
                                  </span>
                                </div>

                                <div className="flex items-center text-slate-600 dark:text-zinc-400 dark:text-zinc-300">
                                  <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center mr-3">
                                    <Package className="w-3 h-3 text-white" />
                                  </div>
                                  <span className="font-medium">
                                    {auction.items.length} item
                                    {auction.items.length !== 1 ? 's' : ''}
                                  </span>
                                </div>

                                <div className="flex items-center text-slate-600 dark:text-zinc-400 dark:text-zinc-300">
                                  <div className="w-6 h-6 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center mr-3">
                                    <DollarSign className="w-3 h-3 text-white" />
                                  </div>
                                  <span className="font-medium">
                                    Total: {formatCurrency(auction.totalValue)}
                                  </span>
                                </div>

                                {auction.soldValue > 0 && (
                                  <div className="flex items-center text-emerald-600">
                                    <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center mr-3">
                                      <DollarSign className="w-3 h-3 text-white" />
                                    </div>
                                    <span className="font-bold">
                                      Sold: {formatCurrency(auction.soldValue)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="ml-4">
                              <div className="text-right">
                                <p className="text-sm text-slate-500 dark:text-zinc-500 dark:text-zinc-400 font-medium">
                                  Last updated
                                </p>
                                <p className="text-sm font-bold text-zinc-100">
                                  {formatDateWithTime(auction.updatedAt)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </PokemonCard>
                    ))}
                  </div>
                )}
              </div>
            </PokemonCard>
          )}
        </div>
      </PokemonPageContainer>
    </PageLayout>
  );
};

export default Auctions;
