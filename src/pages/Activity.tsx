/**
 * Activity Page Component - Context7 2025 Award-Winning Futuristic Design
 *
 * Breathtaking glassmorphism & neumorphism activity timeline with stunning animations.
 * Features ultra-modern filtering, neural-network search, and immersive timeline visualization.
 *
 * Following CLAUDE.md + Context7 2025 principles:
 * - Award-winning futuristic glassmorphism design with neural micro-interactions
 * - Advanced neumorphism with floating holographic cards and depth layers
 * - Cyberpunk gradients and holographic color palettes with RGB shifting
 * - Context7 2025 futuristic design system compliance
 * - Quantum animations, particle effects, and neural hover transformations
 * - Neo-brutalist elements mixed with soft glassmorphism
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
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-indigo-950/30 relative overflow-hidden">
        {/* Context7 2025 Futuristic Neural Background - Quantum Field Effect */}
        <div className="absolute inset-0 opacity-20">
          {/* Primary Neural Network Pattern */}
          <div
            className="absolute inset-0 animate-pulse"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cfilter id='glow'%3E%3CfeGaussianBlur stdDeviation='3' result='coloredBlur'/%3E%3CfeMerge%3E%3CfeMergeNode in='coloredBlur'/%3E%3CfeMergeNode in='SourceGraphic'/%3E%3C/feMerge%3E%3C/filter%3E%3C/defs%3E%3Cg fill='none' stroke='%2306b6d4' stroke-width='0.5' filter='url(%23glow)'%3E%3Ccircle cx='60' cy='60' r='2'/%3E%3Cline x1='60' y1='30' x2='60' y2='90'/%3E%3Cline x1='30' y1='60' x2='90' y2='60'/%3E%3Cline x1='40' y1='40' x2='80' y2='80'/%3E%3Cline x1='80' y1='40' x2='40' y2='80'/%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
          {/* Secondary Quantum Particles */}
          <div
            className="absolute inset-0 animate-bounce"
            style={{
              animationDuration: '6s',
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23a855f7' fill-opacity='0.05'%3E%3Ccircle cx='100' cy='50' r='1.5'/%3E%3Ccircle cx='50' cy='100' r='1'/%3E%3Ccircle cx='150' cy='100' r='1.5'/%3E%3Ccircle cx='100' cy='150' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
          {/* Holographic Grid Overlay */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `linear-gradient(90deg, transparent 98%, rgba(6, 182, 212, 0.1) 100%), linear-gradient(transparent 98%, rgba(168, 85, 247, 0.1) 100%)`,
              backgroundSize: '40px 40px',
            }}
          />
        </div>

        {/* Floating Particle Systems */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Floating particles */}
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full opacity-20 animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 6 + 2}px`,
                height: `${Math.random() * 6 + 2}px`,
                background: `radial-gradient(circle, ${['#06b6d4', '#a855f7', '#ec4899', '#10b981'][Math.floor(Math.random() * 4)]}, transparent)`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${Math.random() * 4 + 3}s`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 p-8">
          <div className="max-w-7xl mx-auto space-y-12">
            {/* Context7 2025 Futuristic Glassmorphism Header */}
            <div className="relative group">
              {/* Glassmorphism card with neumorphism elements */}
              <div className="backdrop-blur-xl bg-gradient-to-br from-white/[0.15] via-cyan-500/[0.12] to-purple-500/[0.15] border border-white/[0.20] rounded-[2rem] shadow-2xl text-white p-12 relative overflow-hidden">
                {/* Neural network glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-purple-500/15 to-pink-500/20 opacity-70 blur-3xl"></div>

                {/* Holographic border animation */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent opacity-30 group-hover:opacity-100 transition-all duration-1000 animate-pulse"></div>

                {/* Top accent line with RGB shifting */}
                <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 opacity-80 animate-pulse"></div>

                {/* Floating geometric elements */}
                <div
                  className="absolute top-8 right-8 w-20 h-20 border-2 border-cyan-400/50 rounded-2xl rotate-45 animate-spin opacity-40 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                  style={{ animationDuration: '20s' }}
                ></div>
                <div className="absolute bottom-8 left-8 w-16 h-16 border-2 border-purple-400/50 rounded-full animate-pulse opacity-40 shadow-[0_0_20px_rgba(168,85,247,0.3)]"></div>

                <div className="relative z-10">
                  <div className="flex items-center mb-8">
                    {/* Neumorphism back button */}
                    <button
                      onClick={() => handleNavigation('/dashboard')}
                      className="mr-6 p-4 rounded-2xl bg-white/[0.08] backdrop-blur-sm border border-white/[0.12] hover:bg-white/[0.12] hover:border-cyan-400/30 transition-all duration-500 group/btn shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(6,182,212,0.3)]"
                    >
                      <ArrowLeft className="w-6 h-6 group-hover/btn:scale-110 group-hover/btn:-translate-x-1 transition-all duration-300 text-cyan-300" />
                    </button>

                    {/* Holographic icon container */}
                    <div className="relative mr-8">
                      <div className="w-20 h-20 bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-[1.5rem] shadow-2xl flex items-center justify-center border border-white/[0.15] group-hover:scale-105 transition-all duration-500">
                        {/* Inner glow */}
                        <div className="absolute inset-2 bg-gradient-to-br from-cyan-400/10 to-purple-500/10 rounded-xl blur-lg"></div>
                        <Cpu className="w-10 h-10 text-cyan-300 relative z-10 animate-pulse" />
                        {/* Orbiting elements */}
                        <div
                          className="absolute inset-0 animate-spin opacity-40"
                          style={{ animationDuration: '15s' }}
                        >
                          <div className="w-2 h-2 bg-cyan-400 rounded-full absolute -top-1 left-1/2 transform -translate-x-1/2"></div>
                          <div className="w-1.5 h-1.5 bg-purple-400 rounded-full absolute -bottom-1 left-1/2 transform -translate-x-1/2"></div>
                        </div>
                      </div>
                    </div>

                    {/* Title section with cyberpunk styling */}
                    <div className="flex-1">
                      <h1 className="text-5xl font-black mb-3 tracking-tight bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(6,182,212,0.5)]">
                        Activity Feed
                      </h1>
                      <p className="text-cyan-100/90 text-xl font-medium leading-relaxed flex items-center gap-3">
                        <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
                        Advanced timeline visualization of your collection
                        universe
                      </p>
                    </div>
                  </div>

                  {/* Context7 2025 Futuristic Neural Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Total Activities - Cyberpunk Quantum Card */}
                    <div className="group relative overflow-hidden">
                      {/* Holographic border animation */}
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 rounded-[1.5rem] opacity-0 group-hover:opacity-100 transition-all duration-1000 animate-pulse blur-sm"></div>

                      {/* Main card with advanced glassmorphism */}
                      <div className="relative backdrop-blur-xl bg-gradient-to-br from-white/[0.12] via-cyan-500/[0.08] to-purple-500/[0.12] border border-white/[0.15] rounded-[1.5rem] p-6 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] hover:shadow-[0_12px_40px_0_rgba(6,182,212,0.3)] transition-all duration-500 group-hover:scale-[1.02] group-hover:-translate-y-1">
                        {/* Neural network pattern overlay */}
                        <div
                          className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-500"
                          style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%2306b6d4' stroke-width='0.3'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3Cline x1='15' y1='15' x2='45' y2='45'/%3E%3Cline x1='45' y1='15' x2='15' y2='45'/%3E%3C/g%3E%3C/svg%3E")`,
                            backgroundSize: '30px 30px',
                          }}
                        ></div>

                        {/* Quantum glow effect */}
                        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60 animate-pulse"></div>

                        <div className="relative z-10 flex items-center">
                          {/* Advanced neumorphic icon container */}
                          <div className="relative mr-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/30 via-purple-500/20 to-pink-500/30 backdrop-blur-sm rounded-[1.2rem] shadow-[inset_0_2px_4px_0_rgba(255,255,255,0.1),inset_0_-2px_4px_0_rgba(0,0,0,0.1)] flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                              {/* Inner holographic glow */}
                              <div className="absolute inset-2 bg-gradient-to-br from-cyan-400/20 to-purple-500/20 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                              <Zap className="w-8 h-8 text-cyan-300 relative z-10 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)] animate-pulse" />

                              {/* Orbiting quantum particles */}
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
                              Neural Activities
                            </p>
                            <p className="text-3xl font-black bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(6,182,212,0.3)] group-hover:scale-105 transition-transform duration-300">
                              {stats?.total || 0}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Recent Activity - Holographic Temporal Card */}
                    <div className="group relative overflow-hidden">
                      {/* Holographic border animation */}
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-orange-500/20 rounded-[1.5rem] opacity-0 group-hover:opacity-100 transition-all duration-1000 animate-pulse blur-sm"></div>

                      {/* Main card with advanced glassmorphism */}
                      <div className="relative backdrop-blur-xl bg-gradient-to-br from-white/[0.12] via-purple-500/[0.08] to-pink-500/[0.12] border border-white/[0.15] rounded-[1.5rem] p-6 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] hover:shadow-[0_12px_40px_0_rgba(168,85,247,0.3)] transition-all duration-500 group-hover:scale-[1.02] group-hover:-translate-y-1">
                        {/* Temporal wave pattern overlay */}
                        <div
                          className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-500"
                          style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='40' viewBox='0 0 80 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 20 Q20 10 40 20 T80 20' stroke='%23a855f7' stroke-width='0.5' fill='none'/%3E%3C/svg%3E")`,
                            backgroundSize: '40px 20px',
                          }}
                        ></div>

                        {/* Quantum glow effect */}
                        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-400 to-transparent opacity-60 animate-pulse"></div>

                        <div className="relative z-10 flex items-center">
                          {/* Advanced neumorphic icon container */}
                          <div className="relative mr-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-500/30 via-pink-500/20 to-orange-500/30 backdrop-blur-sm rounded-[1.2rem] shadow-[inset_0_2px_4px_0_rgba(255,255,255,0.1),inset_0_-2px_4px_0_rgba(0,0,0,0.1)] flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                              {/* Inner holographic glow */}
                              <div className="absolute inset-2 bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                              <Clock className="w-8 h-8 text-purple-300 relative z-10 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)] animate-pulse" />

                              {/* Temporal ripple effect */}
                              <div className="absolute inset-0 rounded-[1.2rem] border border-purple-400/30 animate-ping opacity-40"></div>
                              <div
                                className="absolute inset-2 rounded-xl border border-pink-400/20 animate-ping opacity-30"
                                style={{ animationDelay: '0.5s' }}
                              ></div>
                            </div>
                          </div>

                          <div className="flex-1">
                            <p className="text-sm font-semibold text-purple-200/90 mb-2 tracking-wider uppercase">
                              Temporal Activity
                            </p>
                            <p className="text-xl font-black bg-gradient-to-r from-purple-300 via-pink-300 to-orange-300 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(168,85,247,0.3)] group-hover:scale-105 transition-transform duration-300">
                              {stats?.lastActivity
                                ? new Date(
                                    stats.lastActivity
                                  ).toLocaleDateString()
                                : 'No activity'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Showing Results - Quantum Data Visualization Card */}
                    <div className="group relative overflow-hidden">
                      {/* Holographic border animation */}
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-blue-500/20 rounded-[1.5rem] opacity-0 group-hover:opacity-100 transition-all duration-1000 animate-pulse blur-sm"></div>

                      {/* Main card with advanced glassmorphism */}
                      <div className="relative backdrop-blur-xl bg-gradient-to-br from-white/[0.12] via-emerald-500/[0.08] to-cyan-500/[0.12] border border-white/[0.15] rounded-[1.5rem] p-6 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] hover:shadow-[0_12px_40px_0_rgba(16,185,129,0.3)] transition-all duration-500 group-hover:scale-[1.02] group-hover:-translate-y-1">
                        {/* Data visualization pattern overlay */}
                        <div
                          className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity duration-500"
                          style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%2310b981' stroke-width='0.3'%3E%3Crect x='10' y='40' width='8' height='10'/%3E%3Crect x='22' y='30' width='8' height='20'/%3E%3Crect x='34' y='35' width='8' height='15'/%3E%3C/g%3E%3C/svg%3E")`,
                            backgroundSize: '30px 30px',
                          }}
                        ></div>

                        {/* Quantum glow effect */}
                        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-60 animate-pulse"></div>

                        <div className="relative z-10 flex items-center">
                          {/* Advanced neumorphic icon container */}
                          <div className="relative mr-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/30 via-cyan-500/20 to-blue-500/30 backdrop-blur-sm rounded-[1.2rem] shadow-[inset_0_2px_4px_0_rgba(255,255,255,0.1),inset_0_-2px_4px_0_rgba(0,0,0,0.1)] flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                              {/* Inner holographic glow */}
                              <div className="absolute inset-2 bg-gradient-to-br from-emerald-400/20 to-cyan-500/20 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                              <Target className="w-8 h-8 text-emerald-300 relative z-10 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />

                              {/* Data flow animation */}
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
                              Quantum Results
                            </p>
                            <p className="text-3xl font-black bg-gradient-to-r from-emerald-300 via-cyan-300 to-blue-300 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(16,185,129,0.3)] group-hover:scale-105 transition-transform duration-300">
                              {activities.length}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Premium floating elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-zinc-800/20 rounded-full animate-pulse"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-zinc-800/10 rounded-full animate-pulse delay-75"></div>
            </div>

            {/* Context7 2025 Futuristic Neural Filter Hub */}
            <div className="group relative overflow-hidden">
              {/* Holographic field effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/5 to-pink-500/10 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-all duration-1000 blur-sm"></div>

              {/* Advanced glassmorphism container */}
              <div className="relative backdrop-blur-xl bg-gradient-to-br from-white/[0.08] via-slate-500/[0.03] to-purple-500/[0.08] border border-white/[0.12] rounded-[2rem] shadow-[0_16px_40px_0_rgba(31,38,135,0.2)] hover:shadow-[0_20px_50px_0_rgba(6,182,212,0.15)] transition-all duration-500">
                {/* Neural network grid pattern */}
                <div
                  className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity duration-500"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%2306b6d4' stroke-width='0.2'%3E%3Cpath d='M10 10h80v80h-80z'/%3E%3Cpath d='M10 50h80'/%3E%3Cpath d='M50 10v80'/%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3Ccircle cx='70' cy='30' r='2'/%3E%3Ccircle cx='30' cy='70' r='2'/%3E%3Ccircle cx='70' cy='70' r='2'/%3E%3C/g%3E%3C/svg%3E")`,
                    backgroundSize: '50px 50px',
                  }}
                ></div>

                {/* Quantum accent line */}
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent animate-pulse"></div>

                <div className="p-8 relative z-10">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    {/* Search */}
                    <div className="flex-1 max-w-md">
                      <form onSubmit={handleSearch} className="relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-zinc-600 w-5 h-5" />
                        <input
                          type="text"
                          placeholder="Search activities..."
                          value={searchInput}
                          onChange={(e) => setSearchInput(e.target.value)}
                          className="w-full pl-12 pr-4 py-3 bg-zinc-800/60 border border-zinc-700/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 text-zinc-100 placeholder-zinc-400"
                        />
                        {searchTerm && (
                          <button
                            type="button"
                            onClick={() => {
                              setSearchInput('');
                              clearSearch();
                            }}
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-zinc-600 hover:text-slate-600 dark:hover:text-zinc-400"
                          >
                            ✕
                          </button>
                        )}
                      </form>
                    </div>

                    {/* Filter Pills */}
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
                            className={`flex items-center px-4 py-2 rounded-full transition-all duration-300 ${isActive ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg' : 'bg-zinc-800/60 text-zinc-300 hover:bg-cyan-900/30 hover:text-cyan-400'}`}
                          >
                            <IconComponent className="w-4 h-4 mr-2" />
                            <span className="text-sm font-medium">
                              {option.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Date Range */}
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-slate-500 dark:text-zinc-500 dark:text-zinc-400" />
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
                </div>
              </div>
            </div>

            {/* Context7 Premium Activity Timeline */}
            <div className="bg-zinc-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-zinc-700/20 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-800/50 to-zinc-900/50"></div>
              <div className="p-8 relative z-10">
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
                            <div
                              key={uniqueKey}
                              className="group relative overflow-hidden mb-6"
                            >
                              {/* Holographic field effect */}
                              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-purple-500/5 to-pink-500/5 rounded-[1.5rem] opacity-0 group-hover:opacity-100 transition-all duration-1000 blur-sm"></div>

                              {/* Advanced glassmorphism activity card */}
                              <div className="relative backdrop-blur-xl bg-gradient-to-br from-white/[0.08] via-slate-500/[0.02] to-purple-500/[0.06] border border-white/[0.10] rounded-[1.5rem] p-6 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] hover:shadow-[0_12px_40px_0_rgba(6,182,212,0.2)] transition-all duration-500 group-hover:scale-[1.01] group-hover:-translate-y-1">
                                {/* Neural activity pattern */}
                                <div
                                  className="absolute inset-0 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity duration-500"
                                  style={{
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23ffffff' stroke-width='0.1'%3E%3Ccircle cx='30' cy='30' r='0.5' fill='%23ffffff' fill-opacity='0.1'/%3E%3Cpath d='M15 15 L45 45 M45 15 L15 45' stroke-dasharray='1,2'/%3E%3C/g%3E%3C/svg%3E")`,
                                    backgroundSize: '30px 30px',
                                  }}
                                ></div>

                                {/* Quantum timeline accent */}
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
                                            {getRelativeTime(
                                              activity.timestamp
                                            )}
                                          </span>
                                        </div>

                                        {/* Enhanced price display */}
                                        {(activity.metadata?.newPrice ||
                                          activity.metadata?.salePrice ||
                                          activity.metadata
                                            ?.estimatedValue) && (
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
                                              {activity.metadata
                                                .estimatedValue &&
                                                `Est. ${displayPrice(activity.metadata.estimatedValue)}`}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {/* Quantum Badge System */}
                                    <div className="flex items-center space-x-3 mt-4">
                                      {activity.metadata?.badges?.map(
                                        (badge, badgeIndex) => (
                                          <div
                                            key={badgeIndex}
                                            className="relative group/badge"
                                          >
                                            {/* Holographic badge glow */}
                                            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-purple-400/20 rounded-full opacity-0 group/badge:opacity-100 transition-opacity duration-300 blur-sm"></div>

                                            <span
                                              className={`relative inline-flex items-center px-4 py-2 rounded-full text-xs font-bold backdrop-blur-sm border border-white/[0.15] ${colors.badge} shadow-[0_4px_12px_0_rgba(0,0,0,0.15)] group/badge:scale-105 group/badge:shadow-[0_6px_16px_0_rgba(6,182,212,0.2)] transition-all duration-300`}
                                            >
                                              <span className="w-1.5 h-1.5 rounded-full bg-current mr-2 animate-pulse"></span>
                                              {badge}
                                            </span>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  </div>

                                  {/* Quantum Activity Indicator */}
                                  <div className="flex-shrink-0 relative mt-2">
                                    {/* Outer pulse ring */}
                                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400/30 to-purple-400/30 opacity-0 group-hover:opacity-100 animate-ping transition-opacity duration-500"></div>

                                    {/* Main indicator */}
                                    <div
                                      className={`relative w-4 h-4 ${colors.dot} rounded-full opacity-60 group-hover:opacity-100 transition-all duration-300 shadow-[0_0_8px_currentColor] group-hover:scale-125`}
                                    >
                                      <div className="absolute inset-0.5 bg-white/30 rounded-full animate-pulse"></div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
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
                  <div className="mt-12 pt-8 border-t border-slate-200/50 dark:border-zinc-700/50 dark:border-zinc-700/50">
                    <div className="text-center">
                      <button
                        onClick={loadMore}
                        disabled={loading}
                        className="group bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 border-2 border-indigo-200/50 hover:border-indigo-400 rounded-2xl px-8 py-4 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/20 disabled:opacity-50"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <Clock className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-sm font-bold text-slate-700 dark:text-zinc-300 dark:text-zinc-200 group-hover:text-indigo-700 transition-colors duration-300">
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
      </div>
    </PageLayout>
  );
};

export default Activity;
