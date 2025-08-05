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
import LoadingSpinner from '../components/common/LoadingSpinner';
import { PageLayout } from '../components/layouts/PageLayout';
import { ACTIVITY_TYPES, useActivity } from '../hooks/useActivity';
import { displayPrice, getRelativeTime } from '../utils/formatting';

// Import our unified design system
import {
  PokemonCard,
  PokemonButton,
  PokemonInput,
  PokemonBadge,
  PokemonPageContainer,
} from '../components/design-system';

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
    <PageLayout
      title="Activity"
      subtitle="Recent collection activities and events"
    >
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

              {/* Stats Grid using PokemonCard */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Total Activities */}
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
                        Total Activities
                      </p>
                      <p className="text-3xl font-black bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(6,182,212,0.3)] group-hover:scale-105 transition-transform duration-300">
                        {stats?.total || 0}
                      </p>
                    </div>
                  </div>
                </PokemonCard>

                {/* Recent Activity */}
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
                        Recent Activity
                      </p>
                      <p className="text-xl font-black bg-gradient-to-r from-purple-300 via-pink-300 to-orange-300 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(168,85,247,0.3)] group-hover:scale-105 transition-transform duration-300">
                        {stats?.lastActivity
                          ? new Date(stats.lastActivity).toLocaleDateString()
                          : 'No activity'}
                      </p>
                    </div>
                  </div>
                </PokemonCard>

                {/* Showing Results */}
                <PokemonCard
                  variant="glass"
                  size="md"
                  interactive
                  className="group"
                >
                  <div className="relative z-10 flex items-center">
                    <div className="relative mr-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/30 via-cyan-500/20 to-blue-500/30 backdrop-blur-sm rounded-[1.2rem] flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                        <Target className="w-8 h-8 text-emerald-300 relative z-10 animate-pulse" />
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
                        Showing Results
                      </p>
                      <p className="text-3xl font-black bg-gradient-to-r from-emerald-300 via-cyan-300 to-blue-300 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(16,185,129,0.3)] group-hover:scale-105 transition-transform duration-300">
                        {activities.length}
                      </p>
                    </div>
                  </div>
                </PokemonCard>
              </div>
            </div>
          </PokemonCard>

          {/* Filter Hub using PokemonCard */}
          <PokemonCard variant="glass" size="lg" className="group relative">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              {/* Search */}
              <div className="flex-1 max-w-md">
                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <PokemonInput
                    type="text"
                    placeholder="Search activities..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="pl-12"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchInput('');
                        clearSearch();
                      }}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors duration-200"
                    >
                      ✕
                    </button>
                  )}
                </form>
              </div>

              {/* Filter Pills using PokemonBadge */}
              <div className="flex flex-wrap gap-3">
                {filterOptions.map((option) => {
                  const IconComponent = option.icon;
                  const isActive =
                    (option.value === 'all' && !filters.type) ||
                    filters.type === option.value;

                  return (
                    <button
                      key={option.value}
                      onClick={() => handleFilterChange(option.value)}
                      className="transition-all duration-300 hover:scale-105"
                    >
                      <PokemonBadge
                        variant={isActive ? 'primary' : 'secondary'}
                        style={isActive ? 'solid' : 'glass'}
                        shape="pill"
                        className={`transition-all duration-300 ${
                          isActive ? 'shadow-lg scale-105' : 'hover:shadow-md'
                        }`}
                      >
                        <IconComponent className="w-4 h-4" />
                        {option.label}
                      </PokemonBadge>
                    </button>
                  );
                })}
              </div>

              {/* Date Range */}
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-slate-500" />
                <select
                  value={filters.dateRange || 'all'}
                  onChange={(e) => handleDateRangeChange(e.target.value)}
                  className="bg-zinc-800/60 border border-zinc-700/50 rounded-xl px-4 py-2 text-sm font-medium text-zinc-300 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  {dateRangeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </PokemonCard>

          {/* Activity Timeline using PokemonCard */}
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
                        <PokemonCard
                          key={uniqueKey}
                          variant="glass"
                          size="md"
                          interactive
                          className="mb-6 group relative"
                        >
                          {/* Timeline accent */}
                          <div className="absolute left-0 top-0 h-full w-[2px] bg-gradient-to-b from-transparent via-cyan-400/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                          <div className="relative z-10 flex items-start space-x-6">
                            {/* Advanced Neumorphic Icon Container */}
                            <div className="flex-shrink-0 relative">
                              {/* Outer holographic ring */}
                              <div className="absolute inset-0 rounded-[1.2rem] bg-gradient-to-br from-cyan-400/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-all duration-500 animate-pulse blur-sm"></div>

                              {/* Main neumorphic icon container */}
                              <div
                                className={`relative w-16 h-16 bg-gradient-to-br ${colors.bg.replace('from-', 'from-').replace('to-', 'to-')} backdrop-blur-sm rounded-[1.2rem] shadow-[inset_0_2px_4px_0_rgba(255,255,255,0.1),inset_0_-2px_4px_0_rgba(0,0,0,0.1),0_8px_16px_0_rgba(0,0,0,0.2)] flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}
                              >
                                {/* Inner quantum glow */}
                                <div className="absolute inset-2 bg-gradient-to-br from-white/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>

                                {/* Icon with enhanced effects */}
                                <IconComponent className="w-8 h-8 text-white relative z-10 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] group-hover:drop-shadow-[0_0_12px_rgba(6,182,212,0.6)] transition-all duration-500" />

                                {/* Orbital elements */}
                                <div
                                  className="absolute inset-0 animate-spin opacity-40 group-hover:opacity-70 transition-opacity duration-500"
                                  style={{ animationDuration: '15s' }}
                                >
                                  <div className="w-1 h-1 bg-cyan-400 rounded-full absolute -top-0.5 left-1/2 transform -translate-x-1/2 blur-sm"></div>
                                  <div className="w-0.5 h-0.5 bg-purple-400 rounded-full absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 blur-sm"></div>
                                </div>

                                {/* Activity pulse ring */}
                                <div className="absolute inset-0 rounded-[1.2rem] border border-white/20 animate-ping opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
                              </div>
                            </div>

                            {/* Futuristic Content Section */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                  {/* Enhanced title with cyberpunk styling */}
                                  <h3 className="text-xl font-black bg-gradient-to-r from-white via-cyan-200 to-purple-200 bg-clip-text text-transparent mb-3 leading-tight drop-shadow-[0_0_10px_rgba(6,182,212,0.3)] group-hover:from-cyan-300 group-hover:via-purple-300 group-hover:to-pink-300 transition-all duration-500">
                                    {activity.title}
                                  </h3>

                                  {/* Description with neural glow */}
                                  <p className="text-sm text-cyan-100/80 leading-relaxed mb-3 group-hover:text-white/90 transition-colors duration-300">
                                    {activity.description}
                                  </p>

                                  {/* Details with quantum accent */}
                                  {activity.details && (
                                    <p className="text-xs text-purple-200/60 font-medium group-hover:text-purple-200/80 transition-colors duration-300 italic">
                                      {activity.details}
                                    </p>
                                  )}
                                </div>

                                {/* Futuristic timestamp and price section */}
                                <div className="text-right ml-6 relative">
                                  {/* Holographic timestamp container */}
                                  <div className="relative mb-3">
                                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                    <span className="relative text-xs font-semibold text-cyan-200/70 bg-white/[0.03] px-3 py-1.5 rounded-lg border border-white/[0.08] backdrop-blur-sm group-hover:text-cyan-200 group-hover:border-cyan-400/20 transition-all duration-300">
                                      {getRelativeTime(activity.timestamp)}
                                    </span>
                                  </div>

                                  {/* Enhanced price display */}
                                  {(activity.metadata?.newPrice ||
                                    activity.metadata?.salePrice ||
                                    activity.metadata?.estimatedValue) && (
                                    <div className="relative">
                                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                      <span className="relative text-base font-black bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/[0.10] backdrop-blur-sm group-hover:scale-105 transition-transform duration-300 drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]">
                                        {activity.metadata.newPrice &&
                                          displayPrice(
                                            activity.metadata.newPrice
                                          )}
                                        {activity.metadata.salePrice &&
                                          displayPrice(
                                            activity.metadata.salePrice
                                          )}
                                        {activity.metadata.estimatedValue &&
                                          `Est. ${displayPrice(activity.metadata.estimatedValue)}`}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Badge System using PokemonBadge */}
                              <div className="flex items-center space-x-3 mt-4">
                                {activity.metadata?.badges?.map(
                                  (badge, badgeIndex) => (
                                    <PokemonBadge
                                      key={badgeIndex}
                                      variant="info"
                                      style="glass"
                                      shape="pill"
                                      size="sm"
                                      dot
                                      pulse
                                      className="group/badge hover:scale-105 transition-transform duration-300"
                                    >
                                      {badge}
                                    </PokemonBadge>
                                  )
                                )}
                              </div>
                            </div>

                            {/* Activity Indicator */}
                            <div className="flex-shrink-0 relative mt-2">
                              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400/30 to-purple-400/30 opacity-0 group-hover:opacity-100 animate-ping transition-opacity duration-500"></div>
                              <div
                                className={`relative w-4 h-4 ${colors.dot} rounded-full opacity-60 group-hover:opacity-100 transition-all duration-300 shadow-[0_0_8px_currentColor] group-hover:scale-125`}
                              >
                                <div className="absolute inset-0.5 bg-white/30 rounded-full animate-pulse"></div>
                              </div>
                            </div>
                          </div>
                        </PokemonCard>
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
