/**
 * Activity Page Component - Unified Design System
 *
 * Modern activity timeline with unified theme system integration.
 * Features premium glassmorphism design, enhanced filtering, and immersive timeline visualization.
 *
 * Following CLAUDE.md unified design principles:
 * - Unified theme system with glassmorphism patterns
 * - Shared particle systems and neural background utilities
 * - Consolidated component usage (PokemonCard, PokemonBadge, etc.)
 * - Theme-aware styling and consistent design patterns
 * - Optimized performance through shared utilities
 * - REFACTORED: Extracted reusable components to eliminate DRY violations
 */

import {
  Activity as ActivityIcon,
  ArrowLeft,
  Award,
  BarChart3,
  Calendar,
  CheckCircle,
  Clock,
  Cpu,
  DollarSign,
  Edit,
  Info,
  Minus,
  Plus,
  Search,
  Settings,
  Sparkles,
  Target,
  Trash2,
  TrendingUp,
  Zap,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import LoadingSpinner from '../../../shared/components/molecules/common/LoadingSpinner';
import ActivityStatCard from '../../../shared/components/molecules/common/ActivityStatCard';
import ActivityListItem from '../../../shared/components/molecules/common/ActivityListItem';
import ActivityFilterHub from '../../../shared/components/molecules/common/ActivityFilterHub';
import { PageLayout } from '../../../shared/components/layout/layouts/PageLayout';
import GlassmorphismHeader from '../../../shared/components/molecules/common/GlassmorphismHeader';
import { ACTIVITY_TYPES, useActivity } from '../../../shared/hooks/useActivity';
import {
  displayPrice,
  getRelativeTime,
} from '../../../shared/utils/helpers/formatting';

// Import our unified design system
import {
  PokemonCard,
  PokemonButton,
  PokemonInput,
  PokemonBadge,
  PokemonPageContainer,
} from '../../../shared/components/atoms/design-system';

const Activity: React.FC = () => {
  const [searchInput, setSearchInput] = useState('');

  // Context7 Activity Hook Integration
  const {
    activities,
    stats,
    loading,
    error,
    hasMore,
    searchTerm,
    filters,
    setFilters,
    searchActivities,
    clearSearch,
    loadMore,
  } = useActivity();

  // Ensure clean filter state on mount
  useEffect(() => {
    setFilters({ type: undefined, dateRange: undefined });
  }, [setFilters]);

  // Handle navigation
  const handleNavigation = (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  // Context7 Icon Mapping for Activity Types
  const getActivityIcon = (type: string) => {
    const iconMap: Record<string, any> = {
      [ACTIVITY_TYPES.CARD_ADDED]: Plus,
      [ACTIVITY_TYPES.CARD_UPDATED]: Edit,
      [ACTIVITY_TYPES.CARD_DELETED]: Trash2,
      [ACTIVITY_TYPES.PRICE_UPDATE]: TrendingUp,
      [ACTIVITY_TYPES.AUCTION_CREATED]: DollarSign,
      [ACTIVITY_TYPES.AUCTION_UPDATED]: Edit,
      [ACTIVITY_TYPES.AUCTION_DELETED]: Trash2,
      [ACTIVITY_TYPES.AUCTION_ITEM_ADDED]: Plus,
      [ACTIVITY_TYPES.AUCTION_ITEM_REMOVED]: Minus,
      [ACTIVITY_TYPES.SALE_COMPLETED]: CheckCircle,
      [ACTIVITY_TYPES.SALE_UPDATED]: Edit,
      [ACTIVITY_TYPES.MILESTONE]: Award,
      [ACTIVITY_TYPES.COLLECTION_STATS]: BarChart3,
      [ACTIVITY_TYPES.SYSTEM]: Settings,
    };
    return iconMap[type] || Info;
  };

  // Context7 Filter Options
  const filterOptions = [
    { value: 'all', label: 'All Activity', icon: ActivityIcon },
    { value: ACTIVITY_TYPES.CARD_ADDED, label: 'Cards Added', icon: Plus },
    {
      value: ACTIVITY_TYPES.PRICE_UPDATE,
      label: 'Price Updates',
      icon: TrendingUp,
    },
    {
      value: ACTIVITY_TYPES.AUCTION_CREATED,
      label: 'Auctions',
      icon: DollarSign,
    },
    { value: ACTIVITY_TYPES.SALE_COMPLETED, label: 'Sales', icon: CheckCircle },
    { value: ACTIVITY_TYPES.MILESTONE, label: 'Milestones', icon: Award },
  ];

  const dateRangeOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
  ];

  // Context7 Event Handlers
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      searchActivities(searchInput.trim());
    } else {
      clearSearch();
    }
  };

  const handleFilterChange = (filterValue: string) => {
    if (filterValue === 'all') {
      setFilters({ type: undefined });
    } else {
      setFilters({ type: filterValue as keyof typeof ACTIVITY_TYPES });
    }
  };

  const handleDateRangeChange = (range: string) => {
    if (range === 'all') {
      setFilters({ dateRange: undefined });
    } else {
      setFilters({ dateRange: range as any });
    }
  };

  const getColorClasses = (color: string) => {
    const colorMap = {
      emerald: {
        bg: 'from-emerald-500 to-teal-600',
        badge: 'bg-emerald-100 text-emerald-800',
        dot: 'bg-emerald-400',
      },
      amber: {
        bg: 'from-amber-500 to-orange-600',
        badge: 'bg-amber-100 text-amber-800',
        dot: 'bg-amber-400',
      },
      purple: {
        bg: 'from-purple-500 to-violet-600',
        badge: 'bg-purple-100 text-purple-800',
        dot: 'bg-purple-400',
      },
      indigo: {
        bg: 'from-indigo-500 to-blue-600',
        badge: 'bg-indigo-100 text-indigo-800',
        dot: 'bg-indigo-400',
      },
      red: {
        bg: 'from-red-500 to-rose-600',
        badge: 'bg-red-100 text-red-800',
        dot: 'bg-red-400',
      },
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.indigo;
  };

  return (
    <PageLayout>
      <PokemonPageContainer withParticles={true} withNeural={true}>
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Unified Header using PokemonCard */}
          <PokemonCard
            variant="glass"
            size="xl"
            className="text-white relative overflow-hidden"
          >
            {/* Floating geometric elements */}
            <div
              className="absolute top-8 right-8 w-20 h-20 border-2 border-cyan-400/50 rounded-2xl rotate-45 animate-spin opacity-40 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
              style={{ animationDuration: '20s' }}
            ></div>
            <div className="absolute bottom-8 left-8 w-16 h-16 border-2 border-purple-400/50 rounded-full animate-pulse opacity-40 shadow-[0_0_20px_rgba(168,85,247,0.3)]"></div>

            <div className="relative z-10">
              <div className="flex items-center mb-8">
                {/* Back button using unified styling */}
                <PokemonButton
                  variant="ghost"
                  size="md"
                  onClick={() => handleNavigation('/dashboard')}
                  className="mr-6 p-4 text-cyan-300 hover:text-cyan-200"
                >
                  <ArrowLeft className="w-6 h-6" />
                </PokemonButton>

                {/* Icon container */}
                <div className="relative mr-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-[1.5rem] shadow-2xl flex items-center justify-center border border-white/[0.15] group-hover:scale-105 transition-all duration-500">
                    <div className="absolute inset-2 bg-gradient-to-br from-cyan-400/10 to-purple-500/10 rounded-xl blur-lg"></div>
                    <Cpu className="w-10 h-10 text-cyan-300 relative z-10 animate-pulse" />
                    <div
                      className="absolute inset-0 animate-spin opacity-40"
                      style={{ animationDuration: '15s' }}
                    >
                      <div className="w-2 h-2 bg-cyan-400 rounded-full absolute -top-1 left-1/2 transform -translate-x-1/2"></div>
                      <div className="w-1.5 h-1.5 bg-purple-400 rounded-full absolute -bottom-1 left-1/2 transform -translate-x-1/2"></div>
                    </div>
                  </div>
                </div>

                {/* Title section */}
                <div className="flex-1">
                  <h1 className="text-5xl font-black mb-3 tracking-tight bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(6,182,212,0.5)]">
                    Activity Feed
                  </h1>
                  <p className="text-cyan-100/90 text-xl font-medium leading-relaxed flex items-center gap-3">
                    <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
                    Advanced timeline visualization of your collection universe
                  </p>
                </div>
              </div>

              {/* Stats Grid using ActivityStatCard */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Total Activities */}
                <ActivityStatCard
                  title="Total Activities"
                  value={stats?.total || 0}
                  icon={Zap}
                  colorScheme={{
                    bg: 'from-cyan-500/30 via-purple-500/20 to-pink-500/30',
                    iconColor: 'text-cyan-300',
                    titleColor: 'text-cyan-200/90',
                    valueGradient: 'from-cyan-300 via-purple-300 to-pink-300',
                    valueShadow: 'drop-shadow-[0_0_20px_rgba(6,182,212,0.3)]',
                    dotColors: {
                      primary: 'bg-cyan-400',
                      secondary: 'bg-purple-400',
                    },
                  }}
                />

                {/* Recent Activity */}
                <ActivityStatCard
                  title="Recent Activity"
                  value={
                    stats?.lastActivity
                      ? new Date(stats.lastActivity).toLocaleDateString()
                      : 'No activity'
                  }
                  icon={Clock}
                  colorScheme={{
                    bg: 'from-purple-500/30 via-pink-500/20 to-orange-500/30',
                    iconColor: 'text-purple-300',
                    titleColor: 'text-purple-200/90',
                    valueGradient: 'from-purple-300 via-pink-300 to-orange-300',
                    valueShadow: 'drop-shadow-[0_0_20px_rgba(168,85,247,0.3)]',
                    dotColors: {
                      primary: 'bg-purple-400',
                      secondary: 'bg-pink-400',
                    },
                  }}
                  animationChildren={
                    <>
                      <div className="absolute inset-0 rounded-[1.2rem] border border-purple-400/30 animate-ping opacity-40"></div>
                      <div
                        className="absolute inset-2 rounded-xl border border-pink-400/20 animate-ping opacity-30"
                        style={{ animationDelay: '0.5s' }}
                      ></div>
                    </>
                  }
                />

                {/* Showing Results */}
                <ActivityStatCard
                  title="Showing Results"
                  value={activities.length}
                  icon={Target}
                  colorScheme={{
                    bg: 'from-emerald-500/30 via-cyan-500/20 to-blue-500/30',
                    iconColor: 'text-emerald-300',
                    titleColor: 'text-emerald-200/90',
                    valueGradient: 'from-emerald-300 via-cyan-300 to-blue-300',
                    valueShadow: 'drop-shadow-[0_0_20px_rgba(16,185,129,0.3)]',
                    dotColors: {
                      primary: 'bg-emerald-400',
                      secondary: 'bg-cyan-400',
                    },
                  }}
                  animationChildren={
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
                  }
                />
              </div>
            </div>
          </PokemonCard>

          {/* Filter Hub using ActivityFilterHub */}
          <ActivityFilterHub
            searchInput={searchInput}
            setSearchInput={setSearchInput}
            searchTerm={searchTerm}
            handleSearch={handleSearch}
            clearSearch={clearSearch}
            filters={filters}
            handleFilterChange={handleFilterChange}
            handleDateRangeChange={handleDateRangeChange}
            filterOptions={filterOptions}
            dateRangeOptions={dateRangeOptions}
          />

          {/* Activity Timeline using ActivityListItem */}
          <PokemonCard variant="glass" size="lg" className="relative">
            {loading && activities.length === 0 ? (
              <div className="flex justify-center py-16">
                <LoadingSpinner size="lg" text="Loading activities..." />
              </div>
            ) : (
              <div className="space-y-6">
                {activities.length > 0 ? (
                  activities
                    // Remove duplicates by _id to prevent key conflicts
                    .filter(
                      (activity, index, self) =>
                        index ===
                        self.findIndex(
                          (a) =>
                            (a._id && a._id === activity._id) ||
                            (a.id && a.id === activity.id) ||
                            (a.timestamp === activity.timestamp &&
                              a.title === activity.title)
                        )
                    )
                    .map((activity, index) => {
                      const IconComponent = getActivityIcon(activity.type);
                      const colors = getColorClasses(
                        activity.metadata?.color || 'indigo'
                      );

                      // Use index as primary key since we've already deduplicated
                      const uniqueKey = `activity-${index}-${activity._id || activity.id || activity.timestamp}`;

                      return (
                        <ActivityListItem
                          key={uniqueKey}
                          activity={activity}
                          IconComponent={IconComponent}
                          colors={colors}
                          uniqueKey={uniqueKey}
                        />
                      );
                    })
                ) : (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-white rounded-3xl flex items-center justify-center mx-auto mb-6 border border-slate-200/50 dark:border-zinc-700/50 dark:border-zinc-700/50 shadow-lg">
                      <Search className="w-8 h-8 text-slate-400 dark:text-zinc-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-zinc-100 dark:text-white mb-3">
                      No activities found
                    </h3>
                    <p className="text-slate-600 dark:text-zinc-400 dark:text-zinc-300 font-medium max-w-md mx-auto leading-relaxed">
                      {error
                        ? error
                        : 'Try adjusting your search term or filters to see more results.'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Load More Section */}
            {hasMore && (
              <div className="mt-12 pt-8 border-t border-slate-200/50 dark:border-zinc-700/50">
                <div className="text-center">
                  <PokemonButton
                    variant="secondary"
                    size="lg"
                    onClick={loadMore}
                    disabled={loading}
                    className="group transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/20"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Clock className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-bold">
                        {loading ? 'Loading...' : 'Load Earlier Activities'}
                      </span>
                    </div>
                  </PokemonButton>
                </div>
              </div>
            )}
          </PokemonCard>
        </div>
      </PokemonPageContainer>
    </PageLayout>
  );
};

export default Activity;
