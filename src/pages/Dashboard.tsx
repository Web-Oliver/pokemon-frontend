/**
 * Dashboard Page Component - Context7 Award-Winning Design
 *
 * Ultra-premium dashboard with stunning visual hierarchy and micro-interactions.
 * Features glass-morphism, premium gradients, and award-winning Context7 patterns.
 *
 * Following CLAUDE.md + Context7 principles:
 * - Award-winning visual design with micro-interactions
 * - Glass-morphism and depth with floating cards
 * - Premium gradients and color palettes
 * - Context7 design system compliance
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
} from 'lucide-react';
import React from 'react';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { PageLayout } from '../components/layouts/PageLayout';
import { useRecentActivities } from '../hooks/useActivity';
import { useCollectionStats } from '../hooks/useCollectionStats';
import { displayPrice, getRelativeTime } from '../utils/formatting';
import { navigationHelper } from '../utils/navigation';

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

  const headerActions = (
    <div className="flex items-center space-x-3">
      <button
        onClick={() => navigationHelper.navigateToCreate.item()}
        className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-2xl transition-all duration-300 inline-flex items-center shadow-lg hover:shadow-xl hover:scale-105"
      >
        <Plus className="w-5 h-5 mr-2" />
        Add Item
      </button>
      <button
        onClick={() => navigationHelper.navigateToCreate.auction()}
        className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 py-3 rounded-2xl transition-all duration-300 inline-flex items-center shadow-lg hover:shadow-xl hover:scale-105"
      >
        <Calendar className="w-5 h-5 mr-2" />
        Create Auction
      </button>
    </div>
  );

  return (
    <PageLayout
      title="Dashboard"
      subtitle="Overview of your Pokémon collection and recent activity"
      loading={false}
      error={null}
      actions={headerActions}
      variant="default"
    >
      {/* Context7 Premium Welcome Section - Dark Futuristic */}
      <div className="bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 rounded-3xl shadow-2xl shadow-cyan-500/25 text-white p-10 relative overflow-hidden border border-cyan-500/20">
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/10"></div>
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-white/50 via-white/80 to-white/50"></div>

        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-3 tracking-wide drop-shadow-lg">
            Welcome to PokéCollection
          </h1>
          <p className="text-cyan-100 text-xl font-medium leading-relaxed">
            Manage your Pokémon card collection with ease and precision.
          </p>
        </div>

        {/* Premium floating elements */}
        <div className="absolute -top-4 -right-4 w-24 h-24 bg-zinc-400/10 rounded-full animate-pulse"></div>
        <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-zinc-400/5 rounded-full animate-pulse delay-75"></div>
      </div>

      {/* Context7 Premium Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="group bg-zinc-900/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 relative overflow-hidden border border-zinc-700/50 hover:scale-105 transition-all duration-300 hover:shadow-cyan-500/20">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5"></div>
          <div className="flex items-center relative z-10">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl shadow-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
              <Package className="w-8 h-8 text-white" />
            </div>
            <div className="ml-6">
              <p className="text-sm font-bold text-zinc-400 tracking-wide uppercase">
                Total Items
              </p>
              <p className="text-3xl font-bold text-zinc-100 group-hover:text-cyan-400 transition-colors duration-300">
                {statsLoading ? '--' : totalItems.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="group bg-zinc-900/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 relative overflow-hidden border border-zinc-700/50 hover:scale-105 transition-all duration-300 hover:shadow-emerald-500/20">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5"></div>
          <div className="flex items-center relative z-10">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
              <DollarSign className="w-8 h-8 text-white" />
            </div>
            <div className="ml-6">
              <p className="text-sm font-bold text-zinc-400 tracking-wide uppercase">
                Total Value
              </p>
              <p className="text-3xl font-bold text-zinc-100 group-hover:text-emerald-300 transition-colors duration-300">
                {statsLoading ? '--' : totalValueFormatted}
              </p>
            </div>
          </div>
        </div>

        <div className="group bg-zinc-900/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 relative overflow-hidden border border-zinc-700/50 hover:scale-105 transition-all duration-300 hover:shadow-cyan-500/20">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-violet-500/5"></div>
          <div className="flex items-center relative z-10">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl shadow-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <div className="ml-6">
              <p className="text-sm font-bold text-zinc-400 tracking-wide uppercase">
                Sales
              </p>
              <p className="text-3xl font-bold text-zinc-100 group-hover:text-purple-300 transition-colors duration-300">
                {statsLoading ? '--' : totalSales.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="group bg-zinc-900/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 relative overflow-hidden border border-zinc-700/50 hover:scale-105 transition-all duration-300 hover:shadow-amber-500/20">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5"></div>
          <div className="flex items-center relative z-10">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
              <Star className="w-8 h-8 text-white" />
            </div>
            <div className="ml-6">
              <p className="text-sm font-bold text-zinc-400 tracking-wide uppercase">
                Top Graded
              </p>
              <p className="text-3xl font-bold text-zinc-100 group-hover:text-amber-300 transition-colors duration-300">
                {statsLoading ? '--' : topGradedCards.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Context7 Premium Quick Actions */}
      <div className="bg-zinc-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-zinc-700/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900/50 to-zinc-800/50"></div>
        <div className="p-8 border-b border-zinc-700/50 relative z-10">
          <h2 className="text-2xl font-bold text-zinc-100 tracking-wide">
            Quick Actions
          </h2>
        </div>
        <div className="p-8 relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <button
              onClick={() => handleNavigation('/add-item')}
              className="group p-8 bg-gradient-to-br from-zinc-800/80 to-zinc-700/80 backdrop-blur-sm border-2 border-cyan-700/50 rounded-3xl hover:border-cyan-400 hover:shadow-2xl hover:shadow-cyan-500/20 transition-all duration-500 hover:scale-105 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl shadow-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                <Plus className="w-8 h-8 text-white" />
              </div>
              <p className="text-lg font-bold text-zinc-100 mb-2 group-hover:text-cyan-400 transition-colors duration-300">
                Add New Item
              </p>
              <p className="text-sm text-zinc-400 font-medium">
                Add cards or products
              </p>
            </button>

            <button
              onClick={() => handleNavigation('/sales-analytics')}
              className="group p-8 bg-gradient-to-br from-zinc-800/80 to-zinc-700/80 backdrop-blur-sm border-2 border-emerald-700/50 rounded-3xl hover:border-emerald-400 hover:shadow-2xl hover:shadow-emerald-500/20 transition-all duration-500 hover:scale-105 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <p className="text-lg font-bold text-zinc-100 mb-2 group-hover:text-emerald-300 transition-colors duration-300">
                View Analytics
              </p>
              <p className="text-sm text-zinc-400 font-medium">
                Sales and trends
              </p>
            </button>

            <button
              onClick={() => handleNavigation('/collection')}
              className="group p-8 bg-gradient-to-br from-zinc-800/80 to-zinc-700/80 backdrop-blur-sm border-2 border-purple-700/50 rounded-3xl hover:border-purple-400 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 hover:scale-105 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-violet-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl shadow-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                <Grid3X3 className="w-8 h-8 text-white" />
              </div>
              <p className="text-lg font-bold text-zinc-100 mb-2 group-hover:text-purple-300 transition-colors duration-300">
                Browse Collection
              </p>
              <p className="text-sm text-zinc-400 font-medium">
                View all items
              </p>
            </button>
          </div>
        </div>
      </div>

      {/* Context7 Premium Recent Activity */}
      <div className="bg-zinc-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-zinc-700/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900/50 to-zinc-800/50"></div>

        {/* Header */}
        <div className="p-8 border-b border-zinc-700/50 relative z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-zinc-100 tracking-wide flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-xl flex items-center justify-center mr-4">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              Recent Activity
            </h2>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-zinc-400">Live</span>
            </div>
          </div>
        </div>

        {/* Context7 Premium Timeline Activity Feed */}
        <div className="p-8 relative z-10">
          {activitiesLoading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner size="md" text="Loading recent activities..." />
            </div>
          ) : recentActivities.length > 0 ? (
            <div className="space-y-6">
              {recentActivities.map((activity) => {
                const IconComponent = getActivityIcon(activity.type);
                const colors = getColorClasses(
                  activity.metadata?.color || 'indigo'
                );

                return (
                  <div
                    key={activity._id}
                    className="flex items-start space-x-4 group hover:bg-gradient-to-r hover:from-zinc-800/50 hover:to-zinc-700/50 rounded-2xl p-4 transition-all duration-300"
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
                        <p className="text-sm font-bold text-zinc-100 group-hover:text-cyan-400 transition-colors duration-300">
                          {activity.title}
                        </p>
                        <span className="text-xs text-zinc-400 font-medium">
                          {getRelativeTime(activity.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-zinc-400 mt-1">
                        {activity.description}
                      </p>
                      <div className="flex items-center mt-2 space-x-3">
                        {activity.metadata?.badges?.map((badge, index) => (
                          <span
                            key={index}
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${colors.badge}`}
                          >
                            {badge}
                          </span>
                        ))}
                        {(activity.metadata?.newPrice ||
                          activity.metadata?.salePrice ||
                          activity.metadata?.estimatedValue) && (
                          <span className="text-xs text-zinc-400">
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
                    <div
                      className={`w-2 h-2 ${colors.dot} rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                    ></div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-br from-zinc-700 to-zinc-600 rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-6">
                <Package className="w-10 h-10 text-zinc-400" />
              </div>
              <h3 className="text-xl font-bold text-zinc-100 mb-3">
                No recent activity
              </h3>
              <p className="text-zinc-400 font-medium max-w-md mx-auto leading-relaxed">
                Start adding items to your collection to see activity here.
              </p>
            </div>
          )}

          {/* Context7 Premium Show More Section */}
          <div className="mt-8 pt-6 border-t border-zinc-700/50">
            <button
              onClick={() => handleNavigation('/analytics')}
              className="w-full group bg-gradient-to-r from-zinc-800 to-zinc-700 hover:from-zinc-700 hover:to-zinc-600 border-2 border-cyan-700/50 hover:border-cyan-400 rounded-2xl p-4 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/20"
            >
              <div className="flex items-center justify-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-bold text-zinc-300 group-hover:text-cyan-400 transition-colors duration-300">
                  View All Activity & Analytics
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Dashboard;
