/**
 * Dashboard Page Component - Context7 2025 Award-Winning Futuristic Design
 *
 * Breathtaking glassmorphism & neumorphism dashboard with stunning animations.
 * Features ultra-modern stats display, neural-network interactions, and immersive visualization.
 *
 * Following CLAUDE.md + Context7 2025 principles:
 * - Award-winning futuristic glassmorphism design with neural micro-interactions
 * - Advanced neumorphism with floating holographic cards and depth layers
 * - Cyberpunk gradients and holographic color palettes with RGB shifting
 * - Context7 2025 futuristic design system compliance
 * - Quantum animations, particle effects, and neural hover transformations
 * - Neo-brutalist elements mixed with soft glassmorphism
 * - UPDATED: Now displays SetProducts count from new backend architecture
 * - Ultra-premium dashboard with stunning visual hierarchy and micro-interactions
 */

import {
  Award,
  BarChart3,
  Calendar,
  CheckCircle,
  DollarSign,
  Edit,
  Grid3X3,
  Info,
  Minus,
  Package,
  Plus,
  Settings,
  Star,
  Trash2,
  TrendingUp,
  Database,
  Sparkles,
  Cpu,
} from 'lucide-react';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { PageLayout } from '../components/layouts/PageLayout';
import { useRecentActivities } from '../hooks/useActivity';
import { useCollectionStats } from '../hooks/useCollectionStats';
import { getDataCounts } from '../api/statusApi';
import { displayPrice, getRelativeTime } from '../utils/formatting';
import { navigationHelper } from '../utils/navigation';
import {
  GlassmorphismContainer,
  IconGlassmorphism,
} from '../components/effects/GlassmorphismContainer';
import { ParticleSystem } from '../components/effects';

const Dashboard: React.FC = () => {
  // Context7 Recent Activities Hook
  const { activities: recentActivities, loading: activitiesLoading } =
    useRecentActivities(5);

  // Context7 Collection Statistics Hook
  const {
    totalItems,
    totalValueFormatted,
    totalSales,
    topGradedCards,
    loading: statsLoading,
  } = useCollectionStats();

  // NEW: Data counts from status endpoint (including SetProducts)
  const { data: dataCounts, isLoading: dataCountsLoading } = useQuery({
    queryKey: ['dataCounts'],
    queryFn: getDataCounts,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Handle navigation to different sections
  const handleNavigation = (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  // Context7 Activity Icon Mapping
  const getActivityIcon = (type: string) => {
    const iconMap: Record<string, any> = {
      card_added: Plus,
      card_updated: Edit,
      card_deleted: Trash2,
      price_update: TrendingUp,
      auction_created: DollarSign,
      auction_updated: Edit,
      auction_deleted: Trash2,
      auction_item_added: Plus,
      auction_item_removed: Minus,
      sale_completed: CheckCircle,
      sale_updated: Edit,
      milestone: Award,
      collection_stats: BarChart3,
      system: Settings,
    };
    return iconMap[type] || Info;
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
      title="Dashboard"
      subtitle="Professional Pokémon Collection Management"
    >
      <div className="min-h-screen bg-gradient-to-br from-[var(--theme-background)] via-purple-950/20 to-indigo-950/30 relative overflow-hidden">
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
        <ParticleSystem
          particleCount={15}
          colors={['#06b6d4', '#a855f7', '#ec4899', '#10b981']}
          sizeRange={[2, 8]}
          durationRange={[3, 7]}
          opacity={0.2}
          animationType="pulse"
        />

        <div className="relative z-10 p-8">
          <div className="max-w-7xl mx-auto space-y-12">
            {/* Context7 2025 Futuristic Glassmorphism Header */}
            <div className="relative group">
              <GlassmorphismContainer
                variant="intense"
                colorScheme="default"
                size="xl"
                rounded="3xl"
                pattern="neural"
                glow="intense"
                animated={true}
              >
                {/* Top accent line with RGB shifting */}
                <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 opacity-80 animate-pulse"></div>

                {/* Floating geometric elements */}
                <div
                  className="absolute top-8 right-8 w-20 h-20 border-2 border-cyan-400/50 rounded-2xl rotate-45 animate-spin opacity-40 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                  style={{
                    animationDuration: 'var(--animation-duration-particle)',
                  }}
                ></div>
                <div className="absolute bottom-8 left-8 w-16 h-16 border-2 border-purple-400/50 rounded-full animate-pulse opacity-40 shadow-[0_0_20px_rgba(168,85,247,0.3)]"></div>

                <div className="flex items-center justify-between mb-8">
                  {/* Holographic icon container */}
                  <div className="flex items-center">
                    <div className="relative mr-8">
                      <IconGlassmorphism variant="lg" colorScheme="default">
                        <Cpu className="w-10 h-10 text-[var(--theme-accent-primary)] relative z-10 animate-pulse" />
                        {/* Orbiting elements */}
                        <div
                          className="absolute inset-0 animate-spin opacity-40"
                          style={{
                            animationDuration:
                              'var(--animation-duration-orbit)',
                          }}
                        >
                          <div className="w-2 h-2 bg-cyan-400 rounded-full absolute -top-1 left-1/2 transform -translate-x-1/2"></div>
                          <div className="w-1.5 h-1.5 bg-purple-400 rounded-full absolute -bottom-1 left-1/2 transform -translate-x-1/2"></div>
                        </div>
                      </IconGlassmorphism>
                    </div>

                    {/* Title section with cyberpunk styling */}
                    <div className="flex-1">
                      <h1 className="text-5xl font-black mb-3 tracking-tight bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(6,182,212,0.5)]">
                        Command Center
                      </h1>
                      <p className="text-cyan-100/90 text-xl font-medium leading-relaxed flex items-center gap-3">
                        <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
                        Neural-powered collection management for your universe
                      </p>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center space-x-4">
                    <GlassmorphismContainer
                      variant="subtle"
                      colorScheme="custom"
                      customGradient={{
                        from: 'cyan-500/20',
                        to: 'purple-500/20',
                      }}
                      size="xs"
                      rounded="2xl"
                      interactive={true}
                      onClick={() => navigationHelper.navigateToCreate.item()}
                      className="px-6 py-4 border border-cyan-400/30 hover:border-cyan-400/50 text-cyan-300 hover:text-white transition-all duration-500 group/btn shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] flex items-center cursor-pointer"
                    >
                      <Plus className="w-5 h-5 mr-3 group-hover/btn:scale-110 transition-all duration-300" />
                      Add Item
                    </GlassmorphismContainer>
                    <GlassmorphismContainer
                      variant="subtle"
                      colorScheme="custom"
                      customGradient={{
                        from: 'emerald-500/20',
                        to: 'cyan-500/20',
                      }}
                      size="xs"
                      rounded="2xl"
                      interactive={true}
                      onClick={() =>
                        navigationHelper.navigateToCreate.auction()
                      }
                      className="px-6 py-4 border border-emerald-400/30 hover:border-emerald-400/50 text-emerald-300 hover:text-white transition-all duration-500 group/btn shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] flex items-center cursor-pointer"
                    >
                      <Calendar className="w-5 h-5 mr-3 group-hover/btn:scale-110 transition-all duration-300" />
                      Create Auction
                    </GlassmorphismContainer>
                  </div>
                </div>
              </GlassmorphismContainer>

              {/* Premium floating elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-zinc-800/20 rounded-full animate-pulse"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-zinc-800/10 rounded-full animate-pulse delay-75"></div>
            </div>

            {/* Context7 2025 Futuristic Neural Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
              {/* Total Items - Cyberpunk Quantum Card */}
              <div className="group relative overflow-hidden">
                {/* Holographic border animation */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 rounded-[1.5rem] opacity-0 group-hover:opacity-100 transition-all duration-1000 animate-pulse blur-sm"></div>

                <GlassmorphismContainer
                  variant="intense"
                  colorScheme="default"
                  size="md"
                  rounded="2xl"
                  pattern="neural"
                  glow="medium"
                  interactive={true}
                  className="hover:shadow-[0_12px_40px_0_rgba(6,182,212,0.3)] group-hover:scale-[1.02] group-hover:-translate-y-1"
                >
                  {/* Quantum glow effect */}
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60 animate-pulse"></div>

                  <div className="flex items-center">
                    <div className="relative mr-4">
                      <IconGlassmorphism variant="md" colorScheme="default">
                        <Package className="w-8 h-8 text-cyan-300 relative z-10 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)] animate-pulse" />
                        {/* Orbiting quantum particles */}
                        <div
                          className="absolute inset-0 animate-spin opacity-60 group-hover:opacity-100 transition-opacity duration-500"
                          style={{
                            animationDuration:
                              'var(--animation-duration-particle)',
                          }}
                        >
                          <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full absolute -top-0.5 left-1/2 transform -translate-x-1/2 blur-sm"></div>
                          <div className="w-1 h-1 bg-purple-400 rounded-full absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 blur-sm"></div>
                        </div>
                      </IconGlassmorphism>
                    </div>

                    <div className="flex-1">
                      <p className="text-sm font-semibold text-[var(--theme-accent-primary)]/90 mb-2 tracking-wider uppercase">
                        Neural Items
                      </p>
                      <p className="text-3xl font-black bg-gradient-to-r from-[var(--theme-accent-primary)] via-purple-300 to-pink-300 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(6,182,212,0.3)] group-hover:scale-105 transition-transform duration-300">
                        {statsLoading ? '--' : totalItems.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </GlassmorphismContainer>
              </div>

              {/* Total Value - Holographic Currency Card */}
              <div className="group relative overflow-hidden">
                {/* Holographic border animation */}
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-blue-500/20 rounded-[1.5rem] opacity-0 group-hover:opacity-100 transition-all duration-1000 animate-pulse blur-sm"></div>

                <GlassmorphismContainer
                  variant="intense"
                  colorScheme="success"
                  size="md"
                  rounded="2xl"
                  pattern="neural"
                  glow="medium"
                  interactive={true}
                  className="hover:shadow-[0_12px_40px_0_rgba(16,185,129,0.3)] group-hover:scale-[1.02] group-hover:-translate-y-1"
                >
                  {/* Quantum glow effect */}
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-60 animate-pulse"></div>

                  <div className="flex items-center">
                    <div className="relative mr-4">
                      <IconGlassmorphism variant="md" colorScheme="success">
                        <DollarSign className="w-8 h-8 text-[var(--theme-status-success)] relative z-10 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />
                        {/* Success flow animation */}
                        <div className="absolute inset-0 opacity-50 group-hover:opacity-80 transition-opacity duration-500">
                          <div className="w-1 h-1 bg-emerald-400 rounded-full absolute top-2 left-2 animate-ping"></div>
                          <div
                            className="w-1 h-1 bg-cyan-400 rounded-full absolute top-2 right-2 animate-ping"
                            style={{
                              animationDelay: 'var(--animation-delay-short)',
                            }}
                          ></div>
                          <div
                            className="w-1 h-1 bg-blue-400 rounded-full absolute bottom-2 left-2 animate-ping"
                            style={{
                              animationDelay: 'var(--animation-delay-medium)',
                            }}
                          ></div>
                          <div
                            className="w-1 h-1 bg-emerald-400 rounded-full absolute bottom-2 right-2 animate-ping"
                            style={{
                              animationDelay: 'var(--animation-delay-long)',
                            }}
                          ></div>
                        </div>
                      </IconGlassmorphism>
                    </div>

                    <div className="flex-1">
                      <p className="text-sm font-semibold text-[var(--theme-status-success)]/90 mb-2 tracking-wider uppercase">
                        Quantum Value
                      </p>
                      <p className="text-3xl font-black bg-gradient-to-r from-[var(--theme-status-success)] via-[var(--theme-accent-primary)] to-[var(--theme-accent-secondary)] bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(16,185,129,0.3)] group-hover:scale-105 transition-transform duration-300">
                        {statsLoading ? '--' : totalValueFormatted}
                      </p>
                    </div>
                  </div>
                </GlassmorphismContainer>
              </div>

              {/* Sales - Temporal Analytics Card */}
              <div className="group relative overflow-hidden">
                {/* Holographic border animation */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-orange-500/20 rounded-[1.5rem] opacity-0 group-hover:opacity-100 transition-all duration-1000 animate-pulse blur-sm"></div>

                <GlassmorphismContainer
                  variant="intense"
                  colorScheme="warning"
                  size="md"
                  rounded="2xl"
                  pattern="neural"
                  glow="medium"
                  interactive={true}
                  className="hover:shadow-[0_12px_40px_0_rgba(168,85,247,0.3)] group-hover:scale-[1.02] group-hover:-translate-y-1"
                >
                  {/* Quantum glow effect */}
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-400 to-transparent opacity-60 animate-pulse"></div>

                  <div className="flex items-center">
                    <div className="relative mr-4">
                      <IconGlassmorphism variant="md" colorScheme="warning">
                        <TrendingUp className="w-8 h-8 text-[var(--theme-accent-secondary)] relative z-10 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)] animate-pulse" />
                        {/* Temporal ripple effect */}
                        <div className="absolute inset-0 rounded-[1.2rem] border border-purple-400/30 animate-ping opacity-40"></div>
                        <div
                          className="absolute inset-2 rounded-xl border border-pink-400/20 animate-ping opacity-30"
                          style={{
                            animationDelay: 'var(--animation-delay-medium)',
                          }}
                        ></div>
                      </IconGlassmorphism>
                    </div>

                    <div className="flex-1">
                      <p className="text-sm font-semibold text-[var(--theme-accent-secondary)]/90 mb-2 tracking-wider uppercase">
                        Temporal Sales
                      </p>
                      <p className="text-3xl font-black bg-gradient-to-r from-[var(--theme-accent-secondary)] via-pink-300 to-orange-300 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(168,85,247,0.3)] group-hover:scale-105 transition-transform duration-300">
                        {statsLoading ? '--' : totalSales.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </GlassmorphismContainer>
              </div>

              {/* Top Graded - Elite Achievement Card */}
              <div className="group relative overflow-hidden">
                {/* Holographic border animation */}
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-red-500/20 rounded-[1.5rem] opacity-0 group-hover:opacity-100 transition-all duration-1000 animate-pulse blur-sm"></div>

                <GlassmorphismContainer
                  variant="intense"
                  colorScheme="custom"
                  customGradient={{
                    from: 'amber-500/20',
                    via: 'orange-500/15',
                    to: 'red-500/20',
                  }}
                  size="md"
                  rounded="2xl"
                  pattern="dots"
                  glow="medium"
                  interactive={true}
                  className="hover:shadow-[0_12px_40px_0_rgba(245,158,11,0.3)] group-hover:scale-[1.02] group-hover:-translate-y-1"
                >
                  {/* Quantum glow effect */}
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-60 animate-pulse"></div>

                  <div className="relative z-10 flex items-center">
                    {/* Advanced neumorphic icon container */}
                    <div className="relative mr-4">
                      <IconGlassmorphism variant="md" colorScheme="custom" className="from-amber-500/30 via-orange-500/20 to-red-500/30">
                        <Star className="w-8 h-8 text-amber-300 relative z-10 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)] animate-pulse" />

                        {/* Achievement sparkles */}
                        <div className="absolute inset-0 opacity-50 group-hover:opacity-80 transition-opacity duration-500">
                          <div className="w-1 h-1 bg-amber-400 rounded-full absolute top-1 left-3 animate-ping"></div>
                          <div
                            className="w-1 h-1 bg-orange-400 rounded-full absolute top-3 right-1 animate-ping"
                            style={{
                              animationDelay: 'var(--animation-delay-short)',
                            }}
                          ></div>
                          <div
                            className="w-1 h-1 bg-red-400 rounded-full absolute bottom-1 left-1 animate-ping"
                            style={{
                              animationDelay: 'var(--animation-delay-short)',
                            }}
                          ></div>
                          <div
                            className="w-1 h-1 bg-amber-400 rounded-full absolute bottom-3 right-3 animate-ping"
                            style={{
                              animationDelay: 'var(--animation-delay-medium)',
                            }}
                          ></div>
                        </div>
                      </IconGlassmorphism>
                    </div>

                    <div className="flex-1">
                      <p className="text-sm font-semibold text-amber-200/90 mb-2 tracking-wider uppercase">
                        Elite Graded
                      </p>
                      <p className="text-3xl font-black bg-gradient-to-r from-amber-300 via-orange-300 to-red-300 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(245,158,11,0.3)] group-hover:scale-105 transition-transform duration-300">
                        {statsLoading ? '--' : topGradedCards.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </GlassmorphismContainer>
              </div>

              {/* SetProducts - Quantum Database Card */}
              <div className="group relative overflow-hidden">
                {/* Holographic border animation */}
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 via-rose-500/20 to-red-500/20 rounded-[1.5rem] opacity-0 group-hover:opacity-100 transition-all duration-1000 animate-pulse blur-sm"></div>

                <GlassmorphismContainer
                  variant="intense"
                  colorScheme="danger"
                  size="md"
                  rounded="2xl"
                  pattern="grid"
                  glow="medium"
                  interactive={true}
                  className="hover:shadow-[0_12px_40px_0_rgba(236,72,153,0.3)] group-hover:scale-[1.02] group-hover:-translate-y-1"
                >
                  {/* Quantum glow effect */}
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-pink-400 to-transparent opacity-60 animate-pulse"></div>

                  <div className="relative z-10 flex items-center">
                    {/* Advanced neumorphic icon container */}
                    <div className="relative mr-4">
                      <IconGlassmorphism variant="md" colorScheme="danger">
                        <Database className="w-8 h-8 text-pink-300 relative z-10 drop-shadow-[0_0_10px_rgba(236,72,153,0.5)] animate-pulse" />

                        {/* Database sync animation */}
                        <div className="absolute inset-0 opacity-50 group-hover:opacity-80 transition-opacity duration-500">
                          <div className="w-1 h-1 bg-pink-400 rounded-full absolute top-2 left-2 animate-ping"></div>
                          <div
                            className="w-1 h-1 bg-rose-400 rounded-full absolute top-2 right-2 animate-ping"
                            style={{
                              animationDelay: 'var(--animation-delay-short)',
                            }}
                          ></div>
                          <div
                            className="w-1 h-1 bg-red-400 rounded-full absolute bottom-2 left-2 animate-ping"
                            style={{
                              animationDelay: 'var(--animation-delay-medium)',
                            }}
                          ></div>
                          <div
                            className="w-1 h-1 bg-pink-400 rounded-full absolute bottom-2 right-2 animate-ping"
                            style={{
                              animationDelay: 'var(--animation-delay-long)',
                            }}
                          ></div>
                        </div>
                      </IconGlassmorphism>
                    </div>

                    <div className="flex-1">
                      <p className="text-sm font-semibold text-pink-200/90 mb-2 tracking-wider uppercase">
                        Quantum Sets
                      </p>
                      <p className="text-3xl font-black bg-gradient-to-r from-pink-300 via-rose-300 to-red-300 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(236,72,153,0.3)] group-hover:scale-105 transition-transform duration-300">
                        {dataCountsLoading
                          ? '--'
                          : dataCounts?.setProducts?.toLocaleString() || '0'}
                      </p>
                    </div>
                  </div>
                </GlassmorphismContainer>
              </div>
            </div>

            {/* Context7 Premium Quick Actions */}
            <GlassmorphismContainer
              variant="intense"
              colorScheme="primary"
              size="full"
              rounded="3xl"
              pattern="neural"
              glow="medium"
              className="relative overflow-hidden"
            >
              <div className="p-8 border-b border-[var(--theme-border)] relative z-10">
                <h2 className="text-2xl font-bold text-[var(--theme-text-primary)] tracking-wide">
                  Quick Actions
                </h2>
              </div>
              <div className="p-8 relative z-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  <button
                    onClick={() => handleNavigation('/add-item')}
                    className="group p-8 bg-gradient-to-br from-[var(--theme-surface-secondary)] to-[var(--theme-surface-secondary)]/80 backdrop-blur-sm border-2 border-[var(--theme-accent-primary)]/50 rounded-3xl hover:border-[var(--theme-accent-primary)] hover:shadow-2xl hover:shadow-[var(--theme-accent-primary)]/20 transition-all duration-500 hover:scale-105 relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--theme-accent-primary)]/10 to-[var(--theme-accent-secondary)]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="w-16 h-16 bg-gradient-to-br from-[var(--theme-accent-primary)] to-[var(--theme-accent-secondary)] rounded-2xl shadow-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                      <Plus className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-lg font-bold text-[var(--theme-text-primary)] mb-2 group-hover:text-[var(--theme-accent-primary)] transition-colors duration-300">
                      Add New Item
                    </p>
                    <p className="text-sm text-[var(--theme-text-muted)] font-medium">
                      Add cards or products
                    </p>
                  </button>

                  <button
                    onClick={() => handleNavigation('/sales-analytics')}
                    className="group p-8 bg-gradient-to-br from-[var(--theme-surface-secondary)] to-[var(--theme-surface-secondary)]/80 backdrop-blur-sm border-2 border-[var(--theme-status-success)]/50 rounded-3xl hover:border-[var(--theme-status-success)] hover:shadow-2xl hover:shadow-[var(--theme-status-success)]/20 transition-all duration-500 hover:scale-105 relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--theme-status-success)]/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="w-16 h-16 bg-gradient-to-br from-[var(--theme-status-success)] to-teal-600 rounded-2xl shadow-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                      <BarChart3 className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-lg font-bold text-[var(--theme-text-primary)] mb-2 group-hover:text-[var(--theme-status-success)] transition-colors duration-300">
                      View Analytics
                    </p>
                    <p className="text-sm text-[var(--theme-text-muted)] font-medium">
                      Sales and trends
                    </p>
                  </button>

                  <button
                    onClick={() => handleNavigation('/collection')}
                    className="group p-8 bg-gradient-to-br from-[var(--theme-surface-secondary)] to-[var(--theme-surface-secondary)]/80 backdrop-blur-sm border-2 border-[var(--theme-accent-secondary)]/50 rounded-3xl hover:border-[var(--theme-accent-secondary)] hover:shadow-2xl hover:shadow-[var(--theme-accent-secondary)]/20 transition-all duration-500 hover:scale-105 relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--theme-accent-secondary)]/10 to-violet-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="w-16 h-16 bg-gradient-to-br from-[var(--theme-accent-secondary)] to-violet-600 rounded-2xl shadow-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                      <Grid3X3 className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-lg font-bold text-[var(--theme-text-primary)] mb-2 group-hover:text-[var(--theme-accent-secondary)] transition-colors duration-300">
                      Browse Collection
                    </p>
                    <p className="text-sm text-[var(--theme-text-muted)] font-medium">
                      View all items
                    </p>
                  </button>
                </div>
              </div>
            </GlassmorphismContainer>

            {/* Context7 Premium Recent Activity */}
            <GlassmorphismContainer
              variant="intense"
              colorScheme="secondary"
              size="full"  
              rounded="3xl"
              pattern="waves"
              glow="medium"
              className="relative overflow-hidden"
            >

              {/* Header */}
              <div className="p-8 border-b border-[var(--theme-border)] relative z-10">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-[var(--theme-text-primary)] tracking-wide flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-[var(--theme-accent-secondary)] to-[var(--theme-accent-secondary)] rounded-2xl shadow-xl flex items-center justify-center mr-4">
                      <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    Recent Activity
                  </h2>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-[var(--theme-status-success)] rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-[var(--theme-text-muted)]">
                      Live
                    </span>
                  </div>
                </div>
              </div>

              {/* Context7 Premium Timeline Activity Feed */}
              <div className="p-8 relative z-10">
                {activitiesLoading ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner
                      size="md"
                      text="Loading recent activities..."
                    />
                  </div>
                ) : recentActivities &&
                  Array.isArray(recentActivities) &&
                  recentActivities.length > 0 ? (
                  <div className="space-y-6">
                    {recentActivities
                      .filter(
                        (activity) =>
                          activity &&
                          typeof activity === 'object' &&
                          ('_id' in activity || 'id' in activity) &&
                          activity.title &&
                          activity.description
                      )
                      .map((activity) => {
                        const IconComponent = getActivityIcon(
                          activity.type || 'system'
                        );
                        const colors = getColorClasses(
                          activity.metadata?.color || 'indigo'
                        );

                        // Generate safe key with fallback
                        const activityKey =
                          activity._id ||
                          activity.id ||
                          `activity-${Date.now()}-${Math.random()}`;

                        return (
                          <div
                            key={activityKey}
                            className="flex items-start space-x-4 group hover:bg-gradient-to-r hover:from-[var(--theme-surface-secondary)]/50 hover:to-[var(--theme-surface-secondary)]/30 rounded-2xl p-4 transition-all duration-300"
                          >
                            <div className="flex-shrink-0">
                              <div
                                className={`w-12 h-12 bg-gradient-to-br ${colors.bg} rounded-2xl shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                              >
                                <IconComponent className="w-6 h-6 text-white" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-bold text-[var(--theme-text-primary)] group-hover:text-[var(--theme-accent-primary)] transition-colors duration-300">
                                  {activity.title}
                                </p>
                                <span className="text-xs text-[var(--theme-text-muted)] font-medium">
                                  {activity.timestamp
                                    ? getRelativeTime(activity.timestamp)
                                    : 'Unknown time'}
                                </span>
                              </div>
                              <p className="text-sm text-[var(--theme-text-muted)] mt-1">
                                {activity.description}
                              </p>
                              <div className="flex items-center mt-2 space-x-3">
                                {Array.isArray(activity.metadata?.badges) &&
                                  activity.metadata.badges
                                    .filter(
                                      (badge) =>
                                        badge && typeof badge === 'string'
                                    )
                                    .map((badge, index) => (
                                      <span
                                        key={`badge-${activityKey}-${index}`}
                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${colors.badge}`}
                                      >
                                        {badge}
                                      </span>
                                    ))}
                                {(activity.metadata?.newPrice ||
                                  activity.metadata?.salePrice ||
                                  activity.metadata?.estimatedValue) && (
                                  <span className="text-xs text-[var(--theme-text-muted)]">
                                    {activity.metadata?.newPrice &&
                                      typeof activity.metadata.newPrice ===
                                        'number' &&
                                      displayPrice(activity.metadata.newPrice)}
                                    {activity.metadata?.salePrice &&
                                      typeof activity.metadata.salePrice ===
                                        'number' &&
                                      displayPrice(activity.metadata.salePrice)}
                                    {activity.metadata?.estimatedValue &&
                                      typeof activity.metadata
                                        .estimatedValue === 'number' &&
                                      `Est. ${displayPrice(activity.metadata.estimatedValue)}`}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div
                              className={`w-2 h-2 ${colors.dot} rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                            ></div>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-gradient-to-br from-[var(--theme-surface-secondary)] to-[var(--theme-surface-secondary)]/80 rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-6">
                      <Package className="w-10 h-10 text-[var(--theme-text-muted)]" />
                    </div>
                    <h3 className="text-xl font-bold text-[var(--theme-text-primary)] mb-3">
                      No recent activity
                    </h3>
                    <p className="text-[var(--theme-text-muted)] font-medium max-w-md mx-auto leading-relaxed">
                      Start adding items to your collection to see activity
                      here.
                    </p>
                  </div>
                )}

                {/* Context7 Premium Show More Section */}
                <div className="mt-8 pt-6 border-t border-[var(--theme-border)]">
                  <button
                    onClick={() => handleNavigation('/activity')}
                    className="w-full group bg-gradient-to-r from-[var(--theme-surface-secondary)] to-[var(--theme-surface-secondary)]/80 hover:from-[var(--theme-surface-secondary)]/80 hover:to-[var(--theme-surface-secondary)]/60 border-2 border-[var(--theme-accent-primary)]/50 hover:border-[var(--theme-accent-primary)] rounded-2xl p-4 transition-all duration-300 hover:shadow-xl hover:shadow-[var(--theme-accent-primary)]/20"
                  >
                    <div className="flex items-center justify-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-[var(--theme-accent-primary)] to-[var(--theme-accent-secondary)] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <BarChart3 className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-bold text-[var(--theme-text-secondary)] group-hover:text-[var(--theme-accent-primary)] transition-colors duration-300">
                        View All Activity & Analytics
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            </GlassmorphismContainer>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Dashboard;
