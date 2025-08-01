/**
 * Sales Analytics Page Component
 *
 * Financial tracking and analytics dashboard for sales data.
 * Complete implementation with real data integration and charts.
 *
 * Following CLAUDE.md principles for beautiful, award-winning design.
 */

import {
  ArrowDown,
  ArrowUp,
  BarChart3,
  Calendar,
  DollarSign,
  Download,
  Minus,
  PieChart,
  RefreshCcw,
  TrendingUp,
  X,
} from 'lucide-react';
import React, { useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import Button from '../components/common/Button';
import DateRangeFilter, {
  DateRangeState,
} from '../components/common/DateRangeFilter';
import { PageLayout } from '../components/layouts/PageLayout';
import { useExportOperations } from '../hooks/useExportOperations';
import { useSalesAnalytics } from '../hooks/useSalesAnalytics';
import { handleApiError } from '../utils/errorHandler';
import { displayPrice } from '../utils/formatting';

const SalesAnalytics: React.FC = () => {
  const {
    sales,
    graphData,
    loading,
    error,
    kpis,
    categoryBreakdown,
    trendAnalysis: _trendAnalysis,
    dateRange,
    setDateRange,
    refreshData,
  } = useSalesAnalytics();

  const [localDateRange, setLocalDateRange] = useState<DateRangeState>({
    startDate: dateRange?.startDate,
    endDate: dateRange?.endDate,
  });

  // Chart colors
  const chartColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  // Use centralized price formatting from utils/formatting.ts

  const { exportSalesData } = useExportOperations();

  // Handle CSV export with error handling and user feedback
  const handleExportCSV = async () => {
    try {
      await exportSalesData(sales, dateRange);
    } catch (error) {
      handleApiError(error, 'Failed to export sales data');
    }
  };

  // Format percentage
  const _formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // Handle date range changes from the DateRangeFilter component
  const handleDateRangeChange = (newDateRange: DateRangeState) => {
    setLocalDateRange(newDateRange);
    setDateRange({
      startDate: newDateRange.startDate,
      endDate: newDateRange.endDate,
    });
  };

  // Prepare pie chart data
  const pieChartData = categoryBreakdown
    ? Object.entries(categoryBreakdown)
        .map(([category, data]) => {
          let displayName = category;
          // Shorten category names for better display
          switch (category) {
            case 'psaGradedCard':
              displayName = 'PSA Cards';
              break;
            case 'rawCard':
              displayName = 'Raw Cards';
              break;
            case 'sealedProduct':
              displayName = 'Sealed';
              break;
            default:
              displayName = category.replace(/([A-Z])/g, ' $1').trim();
          }
          return {
            name: displayName,
            value: data?.revenue || 0,
            count: data?.count || 0,
          };
        })
        .filter((item) => item.value > 0)
    : [];

  // Get trend icon
  const _getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <ArrowUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <ArrowDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-zinc-500" />;
    }
  };

  // Date Range Filter
  const headerActions = (
    <div className="bg-zinc-900/95 border border-zinc-700/50 rounded-lg p-4 min-w-[380px]">
      <div className="flex items-center space-x-4">
        {/* Calendar Icon */}
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
          <Calendar className="w-5 h-5 text-white" />
        </div>
        
        {/* Start Date Input */}
        <div className="flex-1">
          <label className="block text-xs font-medium text-zinc-400 mb-1">From</label>
          <input
            type="date"
            value={localDateRange.startDate || ''}
            onChange={(e) => setLocalDateRange(prev => ({ ...prev, startDate: e.target.value }))}
            onBlur={() => setDateRange({ startDate: localDateRange.startDate, endDate: localDateRange.endDate })}
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400"
          />
        </div>
        
        {/* Separator */}
        <div className="flex flex-col items-center">
          <div className="w-6 h-0.5 bg-zinc-600 rounded-full mb-1"></div>
          <span className="text-xs text-zinc-400">to</span>
          <div className="w-6 h-0.5 bg-zinc-600 rounded-full mt-1"></div>
        </div>
        
        {/* End Date Input */}
        <div className="flex-1">
          <label className="block text-xs font-medium text-zinc-400 mb-1">Until</label>
          <input
            type="date"
            value={localDateRange.endDate || ''}
            onChange={(e) => setLocalDateRange(prev => ({ ...prev, endDate: e.target.value }))}
            onBlur={() => setDateRange({ startDate: localDateRange.startDate, endDate: localDateRange.endDate })}
            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-lg text-white font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400"
          />
        </div>
        
        {/* Clear Button - Only show when dates are selected */}
        {(localDateRange.startDate || localDateRange.endDate) && (
          <button
            onClick={() => {
              setLocalDateRange({ startDate: '', endDate: '' });
              setDateRange({ startDate: undefined, endDate: undefined });
            }}
            className="w-8 h-8 bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-400/50 rounded-lg transition-all duration-200 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      
      {/* Active Filter Indicator */}
      {(localDateRange.startDate || localDateRange.endDate) && (
        <div className="mt-3 pt-3 border-t border-zinc-700/40">
          <div className="flex items-center text-xs text-blue-300 font-medium">
            <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
            Filtering: {localDateRange.startDate || 'Start'} → {localDateRange.endDate || 'End'}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <PageLayout
      title="Sales Analytics"
      subtitle="Financial tracking and analytics dashboard for sales data"
      loading={loading && (!Array.isArray(sales) || sales.length === 0)}
      error={error}
      actions={headerActions}
      variant="default"
    >
      <div className="relative z-10 p-8">
        <div className="max-w-7xl mx-auto space-y-10">


          {/* Sales Overview Section */}
          <div className="relative mb-8">
            <div className="bg-zinc-900/95 rounded-2xl border border-zinc-700/50 p-8">
              <div className="relative z-10">
                {/* Clean Header */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-blue-600 mb-4">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-2">
                    Sales Overview
                  </h2>
                  <p className="text-zinc-400">Track your collection's performance</p>
                </div>

                {/* Error Display */}
                {error && (
                  <div className="mb-8 p-4 bg-red-900/20 border border-red-500/30 rounded-xl">
                    <p className="text-sm text-red-300 font-medium">{error}</p>
                  </div>
                )}

                {Array.isArray(sales) && sales.length > 0 ? (
                  <>
                    {/* Key Metrics */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                      {/* Total Cards Sold */}
                      <div className="bg-zinc-800/60 rounded-xl border border-zinc-700/50 p-6 h-48">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-12 h-12 bg-emerald-600 rounded-lg flex items-center justify-center">
                            <span className="text-xl">🃏</span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-emerald-400 font-medium mb-1">Total Cards</div>
                            <div className="text-4xl font-bold text-white">
                              {sales.length}
                            </div>
                          </div>
                        </div>
                        <div className="h-2 bg-zinc-700/50 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full w-full"></div>
                        </div>
                        <div className="mt-4 text-center">
                          <span className="inline-flex items-center px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-sm font-medium border border-emerald-400/30">
                            Cards Conquered
                          </span>
                        </div>
                      </div>

                      {/* Total Revenue */}
                      <div className="bg-zinc-800/60 rounded-xl border border-zinc-700/50 p-6 h-48">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                            <DollarSign className="w-6 h-6 text-white" />
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-blue-400 font-medium mb-1">Total Revenue</div>
                            <div className="text-4xl font-bold text-white">
                              {displayPrice(sales.reduce((sum, sale) => sum + (Number(sale.actualSoldPrice) || 0), 0)).replace(' kr.', '')}
                            </div>
                            <div className="text-sm text-blue-300 font-medium">kr.</div>
                          </div>
                        </div>
                        <div className="h-2 bg-zinc-700/50 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full w-full"></div>
                        </div>
                        <div className="mt-4 text-center">
                          <span className="inline-flex items-center px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm font-medium border border-blue-400/30">
                            Revenue Generated
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Category Breakdown */}
                    <div className="relative">
                      <div className="text-center mb-8">
                        <h3 className="text-2xl font-bold text-white mb-2">
                          Category Breakdown
                        </h3>
                        <p className="text-zinc-400">Sales performance by item type</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {(() => {
                          const categoryStats = {
                            'PSA Graded Card': { count: 0, revenue: 0, icon: '🏆', color: 'bg-yellow-600', textColor: 'text-yellow-300', bgColor: 'bg-yellow-500/20', borderColor: 'border-yellow-400/30' },
                            'Raw Card': { count: 0, revenue: 0, icon: '🃏', color: 'bg-blue-600', textColor: 'text-blue-300', bgColor: 'bg-blue-500/20', borderColor: 'border-blue-400/30' },
                            'Sealed Product': { count: 0, revenue: 0, icon: '📦', color: 'bg-purple-600', textColor: 'text-purple-300', bgColor: 'bg-purple-500/20', borderColor: 'border-purple-400/30' }
                          };

                          sales.forEach(sale => {
                            const category = sale.itemCategory;
                            if (categoryStats[category]) {
                              categoryStats[category].count += 1;
                              categoryStats[category].revenue += Number(sale.actualSoldPrice) || 0;
                            }
                          });

                          return Object.entries(categoryStats).map(([category, stats]) => (
                            <div key={category} className="bg-zinc-800/60 rounded-xl border border-zinc-700/50 p-6">
                              <div className="text-center">
                                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${stats.color} mb-4 text-xl`}>
                                  {stats.icon}
                                </div>
                                <h4 className="text-lg font-bold text-white mb-2">{category}</h4>
                                <div className="space-y-2">
                                  <div className={`inline-flex items-center px-3 py-1 ${stats.bgColor} ${stats.textColor} rounded-full text-sm font-medium ${stats.borderColor} border`}>
                                    {stats.count} cards
                                  </div>
                                  <div className={`text-2xl font-bold ${stats.textColor}`}>
                                    {displayPrice(stats.revenue)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ));
                        })()}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-20">
                    <div className="w-24 h-24 bg-zinc-800 rounded-full mx-auto mb-8 flex items-center justify-center border border-zinc-700">
                      <TrendingUp className="w-12 h-12 text-zinc-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">
                      No Sales Data Yet
                    </h3>
                    <p className="text-zinc-400 max-w-md mx-auto">
                      Your sales analytics will appear here once you start selling items from your collection.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Sales */}
          <div className="bg-zinc-900/95 rounded-2xl border border-zinc-700/50 relative overflow-hidden">
            <div className="p-8 border-b border-zinc-700/40">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Recent Sales
                  </h2>
                  <p className="text-zinc-400">Your latest sold items with details</p>
                </div>
                {Array.isArray(sales) && sales.length > 0 && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleExportCSV}
                    disabled={loading}
                    className="bg-blue-600/20 hover:bg-blue-600/30 border-blue-500/30 text-blue-300 hover:text-blue-200"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export CSV
                  </Button>
                )}
              </div>
              
              {/* Clean List View Layout */}
              <div className="p-0">
                {Array.isArray(sales) && sales.length > 0 ? (
                  <div className="divide-y divide-zinc-700/30">
                    {sales.slice(0, 10).map((sale, index) => {
                      const actualPrice = Number(sale.actualSoldPrice) || 0;
                      const myPrice = Number(sale.myPrice) || 0;

                      return (
                        <div
                          key={sale.id || `sale-${index}`}
                          className="group relative px-8 py-6 hover:bg-zinc-800/30 transition-all duration-200"
                        >
                          <div className="flex items-center space-x-6">
                            {/* Product Thumbnail */}
                            <div className="flex-shrink-0 relative">
                              <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-zinc-700/40 to-zinc-800/40 border border-zinc-600/20 overflow-hidden">
                                {sale.thumbnailUrl ? (
                                  <img 
                                    src={`http://localhost:3000${sale.thumbnailUrl.startsWith('/') ? sale.thumbnailUrl : '/' + sale.thumbnailUrl}`}
                                    alt={sale.itemName}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      // Fallback to emoji if image fails to load
                                      const target = e.currentTarget;
                                      target.style.display = 'none';
                                      const fallbackDiv = target.nextElementSibling as HTMLElement;
                                      if (fallbackDiv) {
                                        fallbackDiv.style.display = 'flex';
                                      }
                                    }}
                                  />
                                ) : null}
                                <div 
                                  className="w-full h-full flex items-center justify-center text-zinc-400 text-lg" 
                                  style={{ display: sale.thumbnailUrl ? 'none' : 'flex' }}
                                >
                                  {(() => {
                                    const category = sale.itemCategory || 'Unknown';
                                    if (category.includes('PSA')) return '🏆';
                                    if (category.includes('Sealed')) return '📦';
                                    if (category.includes('Raw')) return '🃏';
                                    return '🎴';
                                  })()}
                                </div>
                              </div>
                              
                              {/* Category badge */}
                              <div className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-md text-xs font-bold bg-blue-600/80 text-white border border-blue-500/30">
                                {(() => {
                                  const category = sale.itemCategory || 'Unknown';
                                  if (category.includes('PSA')) return 'PSA';
                                  if (category.includes('Sealed')) return 'Sealed';
                                  if (category.includes('Raw')) return 'Raw';
                                  return 'Card';
                                })()}
                              </div>
                            </div>

                            {/* Product Name & Details */}
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-semibold text-white group-hover:text-emerald-200 transition-colors mb-1 truncate">
                                {sale.itemName || 'Unknown Item'}
                              </h3>
                              <div className="flex items-center space-x-4 text-sm text-zinc-400">
                                <span>
                                  📅 {sale.dateSold
                                    ? new Date(sale.dateSold).toLocaleDateString('da-DK', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric'
                                      })
                                    : 'Unknown'}
                                </span>
                                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-zinc-700/40 text-zinc-300">
                                  {sale.source === 'Facebook' ? '📘' : sale.source === 'DBA' ? '🏪' : '🌐'} {sale.source || 'Unknown'}
                                </span>
                              </div>
                            </div>

                            {/* Price Information */}
                            <div className="flex items-center space-x-8">
                              <div className="text-right">
                                <div className="text-xs text-zinc-400 uppercase tracking-wide mb-1">My Price</div>
                                <div className="text-sm font-semibold text-zinc-300">{displayPrice(myPrice)}</div>
                              </div>
                              
                              <div className="text-right">
                                <div className="text-xs text-emerald-400 uppercase tracking-wide mb-1">Sale Price</div>
                                <div className="text-lg font-bold text-emerald-400">{displayPrice(actualPrice)}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <div className="w-16 h-16 bg-zinc-800 rounded-lg mx-auto mb-6 flex items-center justify-center border border-zinc-700">
                      <TrendingUp className="w-8 h-8 text-zinc-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-3">
                      No Sales Yet
                    </h3>
                    <p className="text-zinc-400 max-w-md mx-auto">
                      Your recent sales will appear here once you start selling items.
                    </p>
                  </div>
                )}
              </div>

              {/* Footer with View All Button */}
              {Array.isArray(sales) && sales.length > 10 && (
                <div className="px-8 py-6 border-t border-zinc-700/40 bg-zinc-900/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <p className="text-sm text-zinc-400 font-medium">
                        Showing 10 of {sales.length} sales
                      </p>
                    </div>
                    <button className="px-6 py-3 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 hover:text-blue-200 font-semibold rounded-lg border border-blue-500/30 hover:border-blue-400/50 transition-all duration-200">
                      <span className="flex items-center">
                        View All Sales
                        <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </span>
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

export default SalesAnalytics;
