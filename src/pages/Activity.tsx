/**
 * Activity Page Component - Context7 Award-Winning Design
 *
 * Comprehensive activity feed showing complete collection history.
 * Features premium filtering, search, and timeline visualization.
 *
 * Following CLAUDE.md + Context7 principles:
 * - Award-winning visual design with micro-interactions
 * - Glass-morphism and depth with floating cards
 * - Premium gradients and color palettes
 * - Context7 design system compliance
 * - Stunning animations and hover effects
 */

import React, { useState, useEffect } from 'react';
import {
  Package,
  TrendingUp,
  DollarSign,
  Eye,
  Plus,
  BarChart3,
  Filter,
  Search,
  Calendar,
  ArrowLeft,
  TrendingDown,
  Star,
  Archive,
  CheckCircle,
  Clock,
  Target,
  Zap,
  Award,
  ShoppingBag,
  Activity as ActivityIcon,
  Edit,
  Trash2,
  Minus,
  Settings,
  Info,
} from 'lucide-react';
import { useActivity, ACTIVITY_TYPES, ACTIVITY_PRIORITIES } from '../hooks/useActivity';
import { PageLayout } from '../components/layouts/PageLayout';
import { usePageLayout } from '../hooks/usePageLayout';
import { navigationHelper } from '../utils/navigation';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { displayPrice, getRelativeTime } from '../utils/formatting';

const Activity: React.FC = () => {
  const [searchInput, setSearchInput] = useState('');

  // Context7 Activity Hook Integration
  const {
    activities,
    stats,
    loading,
    error,
    hasMore,
    total,
    searchTerm,
    filters,
    setFilters,
    searchActivities,
    clearSearch,
    loadMore,
    refresh,
    markAsRead,
    archiveActivity,
  } = useActivity();

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
    { value: ACTIVITY_TYPES.PRICE_UPDATE, label: 'Price Updates', icon: TrendingUp },
    { value: ACTIVITY_TYPES.AUCTION_CREATED, label: 'Auctions', icon: DollarSign },
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
      title='Activity Feed'
      subtitle='Recent activity and updates for your collection'
      loading={loading}
      error={error}
      variant='default'
    >
      {/* Context7 Premium Background Pattern */}
      <div className='absolute inset-0 opacity-30'>
        <div
          className='w-full h-full'
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236366f1' fill-opacity='0.03'%3E%3Ccircle cx='40' cy='40' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      <div className='relative z-10 p-8'>
        <div className='max-w-6xl mx-auto space-y-8'>
          {/* Context7 Premium Header */}
          <div className='bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 rounded-3xl shadow-2xl text-white p-10 relative overflow-hidden border border-white/20'>
            <div className='absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10'></div>
            <div className='absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-white/50 via-white/80 to-white/50'></div>

            <div className='relative z-10'>
              <div className='flex items-center mb-6'>
                <button
                  onClick={() => handleNavigation('/dashboard')}
                  className='mr-4 p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-all duration-300 group'
                >
                  <ArrowLeft className='w-5 h-5 group-hover:scale-110 transition-transform duration-300' />
                </button>
                <div className='w-16 h-16 bg-white/20 rounded-3xl shadow-xl flex items-center justify-center mr-6'>
                  <ActivityIcon className='w-8 h-8 text-white' />
                </div>
                <div>
                  <h1 className='text-4xl font-bold mb-2 tracking-wide drop-shadow-lg'>
                    Activity History
                  </h1>
                  <p className='text-indigo-100 text-xl font-medium leading-relaxed'>
                    Complete timeline of your collection journey
                  </p>
                </div>
              </div>

              {/* Live Stats */}
              <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                <div className='bg-white/10 rounded-2xl p-4 backdrop-blur-sm'>
                  <div className='flex items-center'>
                    <div className='w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mr-3'>
                      <Zap className='w-5 h-5 text-white' />
                    </div>
                    <div>
                      <p className='text-sm text-indigo-100'>Total Activities</p>
                      <p className='text-xl font-bold text-white'>{stats?.total || 0}</p>
                    </div>
                  </div>
                </div>
                <div className='bg-white/10 rounded-2xl p-4 backdrop-blur-sm'>
                  <div className='flex items-center'>
                    <div className='w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mr-3'>
                      <Clock className='w-5 h-5 text-white' />
                    </div>
                    <div>
                      <p className='text-sm text-indigo-100'>Recent Activity</p>
                      <p className='text-xl font-bold text-white'>
                        {stats?.lastActivity
                          ? new Date(stats.lastActivity).toLocaleDateString()
                          : 'No activity'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className='bg-white/10 rounded-2xl p-4 backdrop-blur-sm'>
                  <div className='flex items-center'>
                    <div className='w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mr-3'>
                      <Target className='w-5 h-5 text-white' />
                    </div>
                    <div>
                      <p className='text-sm text-indigo-100'>Showing Results</p>
                      <p className='text-xl font-bold text-white'>{activities.length}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Premium floating elements */}
            <div className='absolute -top-4 -right-4 w-24 h-24 bg-white/10 rounded-full animate-pulse'></div>
            <div className='absolute -bottom-6 -left-6 w-32 h-32 bg-white/5 rounded-full animate-pulse delay-75'></div>
          </div>

          {/* Context7 Premium Filter Section */}
          <div className='bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 relative overflow-hidden'>
            <div className='absolute inset-0 bg-gradient-to-br from-white/50 to-slate-50/50'></div>
            <div className='p-8 relative z-10'>
              <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6'>
                {/* Search */}
                <div className='flex-1 max-w-md'>
                  <form onSubmit={handleSearch} className='relative'>
                    <Search className='absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5' />
                    <input
                      type='text'
                      placeholder='Search activities...'
                      value={searchInput}
                      onChange={e => setSearchInput(e.target.value)}
                      className='w-full pl-12 pr-4 py-3 bg-white/60 border border-slate-200/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300'
                    />
                    {searchTerm && (
                      <button
                        type='button'
                        onClick={() => {
                          setSearchInput('');
                          clearSearch();
                        }}
                        className='absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600'
                      >
                        ✕
                      </button>
                    )}
                  </form>
                </div>

                {/* Filter Pills */}
                <div className='flex flex-wrap gap-3'>
                  {filterOptions.map(option => {
                    const IconComponent = option.icon;
                    const isActive =
                      (option.value === 'all' && !filters.type) || filters.type === option.value;
                    return (
                      <button
                        key={option.value}
                        onClick={() => handleFilterChange(option.value)}
                        className={`flex items-center px-4 py-2 rounded-full transition-all duration-300 ${
                          isActive
                            ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                            : 'bg-white/60 text-slate-700 hover:bg-indigo-50 hover:text-indigo-700'
                        }`}
                      >
                        <IconComponent className='w-4 h-4 mr-2' />
                        <span className='text-sm font-medium'>{option.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Date Range */}
                <div className='flex items-center space-x-3'>
                  <Calendar className='w-5 h-5 text-slate-500' />
                  <select
                    value={filters.dateRange || 'all'}
                    onChange={e => handleDateRangeChange(e.target.value)}
                    className='bg-white/60 border border-slate-200/50 rounded-xl px-4 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500'
                  >
                    {dateRangeOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Context7 Premium Activity Timeline */}
          <div className='bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 relative overflow-hidden'>
            <div className='absolute inset-0 bg-gradient-to-br from-white/50 to-slate-50/50'></div>
            <div className='p-8 relative z-10'>
              {loading && activities.length === 0 ? (
                <div className='flex justify-center py-16'>
                  <LoadingSpinner size='lg' text='Loading activities...' />
                </div>
              ) : (
                <div className='space-y-6'>
                  {activities.length > 0 ? (
                    activities.map(activity => {
                      const IconComponent = getActivityIcon(activity.type);
                      const colors = getColorClasses(activity.metadata?.color || 'indigo');

                      return (
                        <div
                          key={activity._id}
                          className='flex items-start space-x-6 group hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/50 rounded-3xl p-6 transition-all duration-300 hover:shadow-xl border border-transparent hover:border-indigo-200/50'
                        >
                          {/* Icon */}
                          <div className='flex-shrink-0'>
                            <div
                              className={`w-14 h-14 bg-gradient-to-br ${colors.bg} rounded-3xl shadow-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}
                            >
                              <IconComponent className='w-7 h-7 text-white' />
                            </div>
                          </div>

                          {/* Content */}
                          <div className='flex-1 min-w-0'>
                            <div className='flex items-start justify-between mb-3'>
                              <div>
                                <h3 className='text-lg font-bold text-slate-900 group-hover:text-indigo-700 transition-colors duration-300 mb-1'>
                                  {activity.title}
                                </h3>
                                <p className='text-sm text-slate-600 leading-relaxed mb-2'>
                                  {activity.description}
                                </p>
                                {activity.details && (
                                  <p className='text-xs text-slate-500 font-medium'>
                                    {activity.details}
                                  </p>
                                )}
                              </div>
                              <div className='text-right ml-4'>
                                <span className='text-xs text-slate-500 font-medium block mb-2'>
                                  {getRelativeTime(activity.timestamp)}
                                </span>
                                {(activity.metadata?.newPrice ||
                                  activity.metadata?.salePrice ||
                                  activity.metadata?.estimatedValue) && (
                                  <span className='text-sm font-bold text-slate-900'>
                                    {activity.metadata.newPrice &&
                                      displayPrice(activity.metadata.newPrice)}
                                    {activity.metadata.salePrice &&
                                      displayPrice(activity.metadata.salePrice)}
                                    {activity.metadata.estimatedValue &&
                                      `Est. ${displayPrice(activity.metadata.estimatedValue)}`}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Badges */}
                            <div className='flex items-center space-x-3'>
                              {activity.metadata?.badges?.map((badge, index) => (
                                <span
                                  key={index}
                                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${colors.badge}`}
                                >
                                  {badge}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Hover Indicator */}
                          <div
                            className={`w-3 h-3 ${colors.dot} rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex-shrink-0 mt-2`}
                          ></div>
                        </div>
                      );
                    })
                  ) : (
                    <div className='text-center py-16'>
                      <div className='w-20 h-20 bg-gradient-to-br from-slate-100 to-white rounded-3xl flex items-center justify-center mx-auto mb-6 border border-slate-200/50 shadow-lg'>
                        <Search className='w-8 h-8 text-slate-400' />
                      </div>
                      <h3 className='text-xl font-bold text-slate-900 mb-3'>No activities found</h3>
                      <p className='text-slate-600 font-medium max-w-md mx-auto leading-relaxed'>
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
                <div className='mt-12 pt-8 border-t border-slate-200/50'>
                  <div className='text-center'>
                    <button
                      onClick={loadMore}
                      disabled={loading}
                      className='group bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 border-2 border-indigo-200/50 hover:border-indigo-400 rounded-2xl px-8 py-4 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/20 disabled:opacity-50'
                    >
                      <div className='flex items-center space-x-3'>
                        <div className='w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300'>
                          <Clock className='w-4 h-4 text-white' />
                        </div>
                        <span className='text-sm font-bold text-slate-700 group-hover:text-indigo-700 transition-colors duration-300'>
                          {loading ? 'Loading...' : 'Load Earlier Activities'}
                        </span>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Activity;
