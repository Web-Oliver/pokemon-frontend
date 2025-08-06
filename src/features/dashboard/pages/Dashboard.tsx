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
  Calendar,
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
import LoadingSpinner from '../../../shared/components/molecules/common/LoadingSpinner';
import { PageLayout } from '../../../shared/components/layout/layouts/PageLayout';
import UnifiedHeader from '../../../shared/components/molecules/common/UnifiedHeader';
import { useRecentActivities } from '../../../shared/hooks/useActivity';
import { useCollectionStats } from '../../../shared/hooks/useCollectionStats';
import { unifiedApiService } from '../../../shared/services/UnifiedApiService';
import { displayPrice } from '../../../shared/utils/helpers/formatting';
import {
  getActivityIcon,
  getActivityColor,
} from '../../../shared/utils/helpers/activityHelpers';
import { navigationHelper } from '../../../shared/utils/helpers/navigation';
import {
  GlassmorphismContainer,
  IconGlassmorphism,
} from '../../../shared/components/organisms/effects/GlassmorphismContainer';
import { ActivityTimeline } from '../../../shared/components/analytics/ActivityTimeline';
import ActivityListItem from '../../../shared/components/molecules/common/ActivityListItem';
import { ParticleSystem } from '../../../shared/components/organisms/effects';
import {
  DashboardItemsCard,
  DashboardValueCard,
  DashboardSalesCard,
  DashboardGradedCard,
  DashboardDataCard,
} from '../components/dashboard';

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

  // Handle navigation to different sections
  const handleNavigation = (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  // Handle navigation to activity page
  const handleActivityNavigation = () => {
    handleNavigation('/activity');
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
            <UnifiedHeader
              icon={Cpu}
              title="Command Center"
              subtitle="Neural-powered collection management for your universe"
              variant="glassmorphism"
              size="lg"
              className="mb-6"
            />

            {/* Context7 2025 Futuristic Neural Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
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

              {/* Simple Activity Display */}
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
                      .slice(0, 5)
                      .map((activity) => {
                        const IconComponent = getActivityIcon(
                          activity.type || 'system'
                        );
                        const activityColor = getActivityColor(
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
                            badges: activity.metadata?.badges || []
                          }
                        };

                        const colors = {
                          bg: `from-${activityColor}-500 to-${activityColor}-600`,
                          badge: `bg-${activityColor}-500/20 text-${activityColor}-200`,
                          dot: `bg-${activityColor}-400`
                        };

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

                {/* Show More Button */}
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
