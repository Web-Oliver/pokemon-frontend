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

  // Stunning Date Picker - Award-Winning Design
  const headerActions = (
    <div className="relative group">
      {/* Holographic Background Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-violet-500/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
      
      {/* Main Date Picker Container */}
      <div className="relative bg-gradient-to-br from-zinc-900/90 via-zinc-800/80 to-zinc-900/90 backdrop-blur-2xl border border-zinc-600/20 rounded-2xl shadow-[0_0_40px_rgba(6,182,212,0.15)] hover:shadow-[0_0_60px_rgba(6,182,212,0.25)] transition-all duration-500 p-5 min-w-[380px]">
        {/* Shimmer Animation */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out rounded-2xl"></div>
        
        <div className="relative z-10 flex items-center space-x-4">
          {/* Animated Calendar Icon */}
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-lg flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            {/* Icon glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </div>
          
          {/* Start Date Input */}
          <div className="relative flex-1">
            <label className="block text-xs font-bold text-cyan-400 mb-1 uppercase tracking-widest">From</label>
            <div className="relative group/input">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-xl opacity-0 group-focus-within/input:opacity-100 transition-opacity duration-300"></div>
              <input
                type="date"
                value={localDateRange.startDate || ''}
                onChange={(e) => setLocalDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                onBlur={() => setDateRange({ startDate: localDateRange.startDate, endDate: localDateRange.endDate })}
                className="relative w-full px-4 py-3 bg-zinc-800/60 backdrop-blur-sm border border-zinc-600/40 rounded-xl text-zinc-100 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400/60 transition-all duration-300 hover:border-zinc-500/60"
              />
            </div>
          </div>
          
          {/* Elegant Separator */}
          <div className="flex flex-col items-center py-6">
            <div className="w-8 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full mb-1"></div>
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">to</span>
            <div className="w-8 h-0.5 bg-gradient-to-r from-blue-400 to-violet-400 rounded-full mt-1"></div>
          </div>
          
          {/* End Date Input */}
          <div className="relative flex-1">
            <label className="block text-xs font-bold text-violet-400 mb-1 uppercase tracking-widest">Until</label>
            <div className="relative group/input">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-violet-500/20 rounded-xl opacity-0 group-focus-within/input:opacity-100 transition-opacity duration-300"></div>
              <input
                type="date"
                value={localDateRange.endDate || ''}
                onChange={(e) => setLocalDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                onBlur={() => setDateRange({ startDate: localDateRange.startDate, endDate: localDateRange.endDate })}
                className="relative w-full px-4 py-3 bg-zinc-800/60 backdrop-blur-sm border border-zinc-600/40 rounded-xl text-zinc-100 font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-400/60 transition-all duration-300 hover:border-zinc-500/60"
              />
            </div>
          </div>
          
          {/* Clear Button - Only show when dates are selected */}
          {(localDateRange.startDate || localDateRange.endDate) && (
            <div className="relative">
              <button
                onClick={() => {
                  setLocalDateRange({ startDate: '', endDate: '' });
                  setDateRange({ startDate: undefined, endDate: undefined });
                }}
                className="w-10 h-10 bg-gradient-to-br from-red-500/20 to-pink-500/20 hover:from-red-500/30 hover:to-pink-500/30 text-red-400 hover:text-red-300 border border-red-500/30 hover:border-red-400/50 rounded-xl transition-all duration-300 hover:scale-110 flex items-center justify-center group/clear"
              >
                <X className="w-5 h-5 group-hover/clear:rotate-90 transition-transform duration-300" />
              </button>
            </div>
          )}
        </div>
        
        {/* Active Filter Indicator */}
        {(localDateRange.startDate || localDateRange.endDate) && (
          <div className="mt-4 pt-3 border-t border-zinc-700/40">
            <div className="flex items-center text-xs text-cyan-300 font-medium">
              <div className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full mr-2 animate-pulse"></div>
              Filtering: {localDateRange.startDate || 'Start'} → {localDateRange.endDate || 'End'}
            </div>
          </div>
        )}
      </div>
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


          {/* 🏆 AWARD-WINNING SALES VISUALIZATION - Groundbreaking Design */}
          <div className="relative mb-8 overflow-hidden">
            {/* Holographic Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-violet-900/20 via-fuchsia-800/15 to-cyan-900/20 blur-3xl animate-pulse"></div>
            <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,rgba(139,92,246,0.1),rgba(59,130,246,0.1),rgba(16,185,129,0.1),rgba(245,158,11,0.1),rgba(239,68,68,0.1),rgba(139,92,246,0.1))] animate-spin" style={{ animationDuration: '20s' }}></div>
            
            <div className="relative backdrop-blur-3xl bg-gradient-to-br from-zinc-900/80 via-zinc-800/60 to-zinc-900/80 rounded-[2rem] border border-white/10 shadow-[0_0_100px_rgba(139,92,246,0.3)] p-10">
              {/* Floating Particles Effect */}
              <div className="absolute inset-0 overflow-hidden rounded-[2rem]">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-2 bg-gradient-to-r from-cyan-400 to-violet-400 rounded-full animate-bounce opacity-40"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                      animationDelay: `${i * 0.5}s`,
                      animationDuration: `${3 + Math.random() * 2}s`
                    }}
                  ></div>
                ))}
              </div>

              <div className="relative z-10">
                {/* Spectacular Header */}
                <div className="text-center mb-12">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 mb-6 shadow-[0_0_50px_rgba(139,92,246,0.5)] animate-pulse">
                    <TrendingUp className="w-10 h-10 text-white" />
                  </div>
                  <h2 className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-violet-300 to-fuchsia-300 mb-4 tracking-wide">
                    SALES UNIVERSE
                  </h2>
                  <p className="text-xl text-zinc-300 font-medium">Experience your collection's cosmic performance</p>
                </div>

                {/* Error Display */}
                {error && (
                  <div className="mb-8 p-4 bg-red-900/20 backdrop-blur-sm border border-red-500/30 rounded-2xl">
                    <p className="text-sm text-red-300 font-medium">{error}</p>
                  </div>
                )}

                {Array.isArray(sales) && sales.length > 0 ? (
                  <>
                    {/* 🌟 REVOLUTIONARY DUAL METRIC DISPLAY */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
                      {/* Total Cards Sold - Quantum Display */}
                      <div className="group relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                        <div className="relative bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 backdrop-blur-xl rounded-3xl border border-emerald-400/30 p-8 hover:scale-105 transition-all duration-500 shadow-[0_0_60px_rgba(16,185,129,0.2)]">
                          <div className="flex items-center justify-between mb-6">
                            <div className="w-16 h-16 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform duration-500">
                              <span className="text-2xl">🃏</span>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-emerald-400 font-bold uppercase tracking-widest mb-1">Total Cards</div>
                              <div className="text-6xl font-black text-white group-hover:text-emerald-300 transition-colors duration-300">
                                {sales.length}
                              </div>
                            </div>
                          </div>
                          <div className="h-2 bg-zinc-700/50 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full w-full animate-pulse"></div>
                          </div>
                          <div className="mt-4 text-center">
                            <span className="inline-flex items-center px-4 py-2 bg-emerald-500/20 text-emerald-300 rounded-full text-sm font-bold border border-emerald-400/30">
                              🚀 CARDS CONQUERED
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Total Revenue - Galactic Display */}
                      <div className="group relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 to-purple-500/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                        <div className="relative bg-gradient-to-br from-zinc-800/80 to-zinc-900/80 backdrop-blur-xl rounded-3xl border border-violet-400/30 p-8 hover:scale-105 transition-all duration-500 shadow-[0_0_60px_rgba(139,92,246,0.2)]">
                          <div className="flex items-center justify-between mb-6">
                            <div className="w-16 h-16 bg-gradient-to-r from-violet-400 to-purple-400 rounded-2xl flex items-center justify-center shadow-lg group-hover:-rotate-12 transition-transform duration-500">
                              <DollarSign className="w-8 h-8 text-white" />
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-violet-400 font-bold uppercase tracking-widest mb-1">Total Revenue</div>
                              <div className="text-6xl font-black text-white group-hover:text-violet-300 transition-colors duration-300">
                                {displayPrice(sales.reduce((sum, sale) => sum + (Number(sale.actualSoldPrice) || 0), 0)).replace(' kr.', '')}
                              </div>
                              <div className="text-lg text-violet-300 font-medium">kr.</div>
                            </div>
                          </div>
                          <div className="h-2 bg-zinc-700/50 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-violet-400 to-purple-400 rounded-full w-full animate-pulse"></div>
                          </div>
                          <div className="mt-4 text-center">
                            <span className="inline-flex items-center px-4 py-2 bg-violet-500/20 text-violet-300 rounded-full text-sm font-bold border border-violet-400/30">
                              💎 REVENUE GENERATED
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 🔥 REVOLUTIONARY CATEGORY CONSTELLATION */}
                    <div className="relative">
                      <div className="text-center mb-8">
                        <h3 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-300 via-orange-300 to-red-300 mb-2">
                          Category Constellation
                        </h3>
                        <p className="text-zinc-400">Each category shines with its own brilliance</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {(() => {
                          const categoryStats = {
                            'PSA Graded Card': { count: 0, revenue: 0, icon: '🏆', color: 'from-yellow-400 to-orange-400', border: 'border-yellow-400/30', bg: 'bg-yellow-500/20', text: 'text-yellow-300' },
                            'Raw Card': { count: 0, revenue: 0, icon: '🃏', color: 'from-blue-400 to-cyan-400', border: 'border-blue-400/30', bg: 'bg-blue-500/20', text: 'text-blue-300' },
                            'Sealed Product': { count: 0, revenue: 0, icon: '📦', color: 'from-purple-400 to-pink-400', border: 'border-purple-400/30', bg: 'bg-purple-500/20', text: 'text-purple-300' }
                          };

                          sales.forEach(sale => {
                            const category = sale.itemCategory;
                            if (categoryStats[category]) {
                              categoryStats[category].count += 1;
                              categoryStats[category].revenue += Number(sale.actualSoldPrice) || 0;
                            }
                          });

                          return Object.entries(categoryStats).map(([category, stats]) => (
                            <div key={category} className="group relative">
                              <div className={`absolute inset-0 bg-gradient-to-r ${stats.color.replace('to-', 'to-').replace('from-', 'from-')}/10 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-500`}></div>
                              <div className={`relative bg-zinc-800/60 backdrop-blur-xl rounded-2xl border ${stats.border} p-6 hover:scale-105 transition-all duration-500`}>
                                <div className="text-center">
                                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r ${stats.color} mb-4 text-2xl shadow-lg group-hover:animate-bounce`}>
                                    {stats.icon}
                                  </div>
                                  <h4 className="text-lg font-bold text-white mb-2">{category}</h4>
                                  <div className="space-y-2">
                                    <div className={`inline-flex items-center px-3 py-1 ${stats.bg} ${stats.text} rounded-full text-sm font-bold ${stats.border} border`}>
                                      {stats.count} cards
                                    </div>
                                    <div className={`text-2xl font-black ${stats.text}`}>
                                      {displayPrice(stats.revenue)}
                                    </div>
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
                    <div className="relative inline-block">
                      <div className="w-32 h-32 bg-gradient-to-r from-violet-500/20 to-cyan-500/20 rounded-full mx-auto mb-8 flex items-center justify-center border-4 border-violet-400/30 backdrop-blur-sm">
                        <TrendingUp className="w-16 h-16 text-violet-400" />
                      </div>
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-500/10 to-cyan-500/10 blur-2xl animate-pulse"></div>
                    </div>
                    <h3 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-300 to-cyan-300 mb-4">
                      Your Sales Universe Awaits
                    </h3>
                    <p className="text-xl text-zinc-400 font-medium max-w-md mx-auto">
                      This cosmic dashboard will come alive with stunning visuals once you start your selling journey.
                    </p>
                  </div>
                )}
              </div>

              {/* Ambient Border Glow */}
              <div className="absolute inset-0 rounded-[2rem] border border-white/5 pointer-events-none"></div>
              <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-r from-violet-500/5 via-transparent to-cyan-500/5 pointer-events-none"></div>
            </div>
          </div>

          {/* Stunning Sales Gallery - Context7 Premium Design */}
          <div className="bg-gradient-to-br from-zinc-900/90 via-zinc-800/80 to-zinc-900/90 backdrop-blur-2xl rounded-3xl shadow-2xl border border-zinc-700/30 relative overflow-hidden">
            {/* Premium background effects */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-blue-500/5 to-purple-500/5"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.3),transparent_50%)] opacity-20"></div>
            
            <div className="relative z-10">
              <div className="p-8 border-b border-zinc-700/40">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-zinc-200 to-zinc-400 mb-2">
                      Recent Sales
                    </h2>
                    <p className="text-zinc-400 font-medium">Your latest sold items with beautiful details</p>
                  </div>
                  {Array.isArray(sales) && sales.length > 0 && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleExportCSV}
                      disabled={loading}
                      className="bg-gradient-to-r from-emerald-600/20 to-teal-600/20 hover:from-emerald-600/30 hover:to-teal-600/30 border-emerald-500/30 text-emerald-300 hover:text-emerald-200"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export CSV
                    </Button>
                  )}
                </div>
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
                    <div className="relative">
                      <div className="w-24 h-24 bg-gradient-to-br from-zinc-700/40 to-zinc-800/40 rounded-3xl mx-auto mb-6 flex items-center justify-center border border-zinc-600/30 backdrop-blur-sm">
                        <TrendingUp className="w-12 h-12 text-zinc-400" />
                        {/* Animated glow */}
                        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-emerald-500/20 via-blue-500/20 to-purple-500/20 blur-xl animate-pulse"></div>
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3 bg-gradient-to-r from-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                      No Sales Yet
                    </h3>
                    <p className="text-zinc-400 font-medium max-w-md mx-auto">
                      Your beautiful sales gallery will appear here once you start selling items. Each sale will be displayed with stunning visuals and detailed information.
                    </p>
                  </div>
                )}
              </div>

              {/* Beautiful Footer with View All Button */}
              {Array.isArray(sales) && sales.length > 10 && (
                <div className="px-8 py-6 border-t border-zinc-700/40 bg-zinc-900/30 backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                      <p className="text-sm text-zinc-400 font-medium">
                        Showing 10 of {sales.length} sales
                      </p>
                    </div>
                    <button className="group relative px-6 py-3 bg-gradient-to-r from-emerald-600/20 to-teal-600/20 hover:from-emerald-600/30 hover:to-teal-600/30 text-emerald-300 hover:text-emerald-200 font-semibold rounded-xl border border-emerald-500/30 hover:border-emerald-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/20">
                      <span className="relative z-10 flex items-center">
                        View All Sales
                        <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </span>
                      {/* Button glow effect */}
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
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
