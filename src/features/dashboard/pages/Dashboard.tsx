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
  BarChart3,
  Cpu,
  Database,
  DollarSign,
  Grid3X3,
  Package,
  Plus,
  Sparkles,
  Star,
  TrendingUp,
} from 'lucide-react';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import GenericLoadingState from '@/shared/components/molecules/common/GenericLoadingState';
import { PageLayout } from '@/shared/components/layout/layouts/PageLayout';
import { useRecentActivities } from '@/shared/hooks/useActivity';
import { useCollectionStats } from '@/shared/hooks/useCollectionStats';
import { unifiedApiService } from '@/shared/services/UnifiedApiService';
import {
  getActivityColor,
  getActivityIcon,
} from '@/shared/utils/helpers/activityHelpers';
import { navigationHelper } from '@/shared/utils/navigation';
import ActivityListItem from '@/shared/components/molecules/common/ActivityListItem';

// Import our unified design system
import {
  PokemonButton,
  PokemonCard,
  PokemonPageContainer,
} from '@/shared/components/atoms/design-system';
import {
  DashboardDataCard,
  DashboardGradedCard,
  DashboardItemsCard,
  DashboardSalesCard,
  DashboardValueCard,
} from '@/shared/components/dashboard';

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
    queryFn: () => unifiedApiService.status.getDataCounts(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

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
                className="absolute top-8 right-8 w-20 h-20 border-2 border-cyan-400/50 rounded-2xl rotate-45 animate-spin opacity-40 z-10"
                style={{ animationDuration: '20s' }}
              ></div>
              <div className="absolute bottom-8 left-8 w-16 h-16 border-2 border-purple-400/50 rounded-full animate-pulse opacity-40 z-10"></div>

              <div className="relative z-20">
                <div className="flex items-center mb-8">
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
                    <h1 className="text-5xl font-black mb-3 tracking-tight bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                      Command Center
                    </h1>
                    <p className="text-cyan-100/90 text-xl font-medium leading-relaxed flex items-center gap-3">
                      <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
                      Neural-powered collection management for your universe
                    </p>
                  </div>
                </div>
              </div>
            </PokemonCard>

            {/* Context7 2025 Futuristic Neural Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 lg:gap-8">
              <DashboardItemsCard
                value={statsLoading ? 0 : totalItems}
                loading={statsLoading}
                label="Neural Items"
                icon={Package}
                colorScheme="default"
              />

              <DashboardValueCard
                value={totalValueFormatted}
                loading={statsLoading}
                label="Quantum Value"
                icon={DollarSign}
                colorScheme="success"
              />

              <DashboardSalesCard
                value={statsLoading ? 0 : totalSales}
                loading={statsLoading}
                label="Temporal Sales"
                icon={TrendingUp}
                colorScheme="warning"
              />

              <DashboardGradedCard
                value={statsLoading ? 0 : topGradedCards}
                loading={statsLoading}
                label="Elite Graded"
                icon={Star}
                colorScheme="custom"
                customGradient={{
                  from: 'amber-500/20',
                  via: 'orange-500/15',
                  to: 'red-500/20',
                }}
              />

              <DashboardDataCard
                value={dataCountsLoading ? 0 : dataCounts?.setProducts || 0}
                loading={dataCountsLoading}
                label="Quantum Sets"
                icon={Database}
                colorScheme="danger"
              />
            </div>
            {/* Context7 Premium Quick Actions */}
            <PokemonCard variant="glass" size="lg" className="relative">
              <div className="p-8 border-b border-white/[0.15] relative z-10">
                <h2 className="text-2xl font-bold text-white tracking-wide">
                  Quick Actions
                </h2>
              </div>
              <div className="p-8 relative z-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  <div
                    onClick={() => navigationHelper.navigateTo('/add-item')}
                    className="group p-8 bg-gradient-to-br from-white/[0.12] via-cyan-500/[0.08] to-purple-500/[0.12] backdrop-blur-xl border border-white/[0.15] rounded-[1.5rem] hover:scale-105 transition-all duration-500 cursor-pointer hover:shadow-[0_12px_40px_0_rgba(6,182,212,0.3)] text-center"
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-2xl shadow-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                      <Plus className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-lg font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors duration-300 text-center">
                      Add New Item
                    </p>
                    <p className="text-sm text-zinc-400 font-medium text-center">
                      Add cards or products
                    </p>
                  </div>

                  <div
                    onClick={() => navigationHelper.navigateTo('/sales-analytics')}
                    className="group p-8 bg-gradient-to-br from-white/[0.12] via-cyan-500/[0.08] to-purple-500/[0.12] backdrop-blur-xl border border-white/[0.15] rounded-[1.5rem] hover:scale-105 transition-all duration-500 cursor-pointer hover:shadow-[0_12px_40px_0_rgba(16,185,129,0.3)] text-center"
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                      <BarChart3 className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-lg font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors duration-300 text-center">
                      View Analytics
                    </p>
                    <p className="text-sm text-zinc-400 font-medium text-center">
                      Sales and trends
                    </p>
                  </div>

                  <div
                    onClick={() => navigationHelper.navigateTo('/collection')}
                    className="group p-8 bg-gradient-to-br from-white/[0.12] via-cyan-500/[0.08] to-purple-500/[0.12] backdrop-blur-xl border border-white/[0.15] rounded-[1.5rem] hover:scale-105 transition-all duration-500 cursor-pointer hover:shadow-[0_12px_40px_0_rgba(168,85,247,0.3)] text-center"
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl shadow-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                      <Grid3X3 className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-lg font-bold text-white mb-2 group-hover:text-purple-400 transition-colors duration-300 text-center">
                      Browse Collection
                    </p>
                    <p className="text-sm text-zinc-400 font-medium text-center">
                      View all items
                    </p>
                  </div>
                </div>
              </div>
            </PokemonCard>

            {/* Context7 Premium Recent Activity */}
            <PokemonCard variant="glass" size="lg" className="relative">
              {/* Header */}
              <div className="p-8 border-b border-white/[0.15] relative z-10">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-white tracking-wide flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl shadow-xl flex items-center justify-center mr-4">
                      <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    Recent Activity
                  </h2>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-zinc-400">
                      Live
                    </span>
                  </div>
                </div>
              </div>

              {/* Simple Activity Display */}
              <div className="p-8 relative z-10">
                {activitiesLoading ? (
                  <div className="flex justify-center py-8">
                    <GenericLoadingState
                      variant="spinner"
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
                      .slice(0, 5)
                      .map((activity) => {
                        const IconComponent = getActivityIcon(
                          activity.type || 'system'
                        );
                        const activityKey =
                          activity._id ||
                          activity.id ||
                          `activity-${Date.now()}-${Math.random()}`;

                        // Transform activity data to match ActivityListItem interface
                        const activityData = {
                          _id: activity._id || activity.id,
                          type: activity.type || 'system',
                          title: activity.title,
                          description: activity.description,
                          timestamp: activity.timestamp || new Date(),
                          metadata: {
                            ...(activity.metadata || {}),
                            badges: activity.metadata?.badges || [],
                          },
                        };

                        // Use same color system as Activity page for consistency
                        const getColorClasses = (color: string) => {
                          const colorMap = {
                            emerald: {
                              bg: 'from-emerald-500 to-teal-600',
                              badge: 'bg-emerald-500/20 text-emerald-200',
                              dot: 'bg-emerald-400',
                            },
                            amber: {
                              bg: 'from-amber-500 to-orange-600',
                              badge: 'bg-amber-500/20 text-amber-200',
                              dot: 'bg-amber-400',
                            },
                            purple: {
                              bg: 'from-purple-500 to-violet-600',
                              badge: 'bg-purple-500/20 text-purple-200',
                              dot: 'bg-purple-400',
                            },
                            indigo: {
                              bg: 'from-indigo-500 to-blue-600',
                              badge: 'bg-indigo-500/20 text-indigo-200',
                              dot: 'bg-indigo-400',
                            },
                            red: {
                              bg: 'from-red-500 to-rose-600',
                              badge: 'bg-red-500/20 text-red-200',
                              dot: 'bg-red-400',
                            },
                            // Additional colors from activityHelpers
                            blue: {
                              bg: 'from-blue-500 to-blue-600',
                              badge: 'bg-blue-500/20 text-blue-200',
                              dot: 'bg-blue-400',
                            },
                            orange: {
                              bg: 'from-orange-500 to-orange-600',
                              badge: 'bg-orange-500/20 text-orange-200',
                              dot: 'bg-orange-400',
                            },
                            yellow: {
                              bg: 'from-yellow-500 to-yellow-600',
                              badge: 'bg-yellow-500/20 text-yellow-200',
                              dot: 'bg-yellow-400',
                            },
                            cyan: {
                              bg: 'from-cyan-500 to-cyan-600',
                              badge: 'bg-cyan-500/20 text-cyan-200',
                              dot: 'bg-cyan-400',
                            },
                            slate: {
                              bg: 'from-slate-500 to-slate-600',
                              badge: 'bg-slate-500/20 text-slate-200',
                              dot: 'bg-slate-400',
                            },
                          };
                          return (
                            colorMap[color as keyof typeof colorMap] ||
                            colorMap.indigo
                          );
                        };

                        const activityColor = getActivityColor(
                          activity.type || 'system'
                        );
                        const colors = getColorClasses(activityColor);

                        return (
                          <ActivityListItem
                            key={activityKey}
                            activity={activityData}
                            IconComponent={IconComponent}
                            colors={colors}
                            uniqueKey={activityKey}
                          />
                        );
                      })}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-white rounded-3xl flex items-center justify-center mx-auto mb-6 border border-slate-200/50 shadow-lg">
                      <Package className="w-10 h-10 text-slate-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">
                      No recent activity
                    </h3>
                    <p className="text-zinc-400 font-medium max-w-md mx-auto leading-relaxed">
                      Start adding items to your collection to see activity
                      here.
                    </p>
                  </div>
                )}

                {/* Show More Button */}
                <div className="mt-8 pt-6 border-t border-white/[0.15]">
                  <div
                    onClick={() => navigationHelper.navigateTo('/activity')}
                    className="w-full group bg-gradient-to-br from-white/[0.12] via-cyan-500/[0.08] to-purple-500/[0.12] backdrop-blur-xl border border-white/[0.15] rounded-[1.5rem] p-4 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/20 cursor-pointer"
                  >
                    <div className="flex items-center justify-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <BarChart3 className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors duration-300">
                        View All Activity & Analytics
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </PokemonCard>
          </div>
        </PokemonPageContainer>
      </PageLayout>
  );
};

export default Dashboard;
