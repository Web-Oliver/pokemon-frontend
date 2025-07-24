/**
 * Sales Analytics Page Component
 *
 * Financial tracking and analytics dashboard for sales data.
 * Complete implementation with real data integration and charts.
 *
 * Following CLAUDE.md principles for beautiful, award-winning design.
 */

import React, { useState } from 'react';
import {
  TrendingUp,
  DollarSign,
  BarChart3,
  PieChart,
  RefreshCcw,
  Download,
  ArrowUp,
  ArrowDown,
  Minus,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useSalesAnalytics } from '../hooks/useSalesAnalytics';
import { PageLayout } from '../components/layouts/PageLayout';
import { useExportOperations } from '../hooks/useExportOperations';
import Button from '../components/common/Button';
import { handleApiError } from '../utils/errorHandler';
import { displayPrice } from '../utils/formatting';
import DateRangeFilter, { DateRangeState } from '../components/common/DateRangeFilter';

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
        .filter(item => item.value > 0)
    : [];

  // Get trend icon
  const _getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <ArrowUp className='w-4 h-4 text-green-500' />;
      case 'down':
        return <ArrowDown className='w-4 h-4 text-red-500' />;
      default:
        return <Minus className='w-4 h-4 text-zinc-500' />;
    }
  };

  // Actions for header
  const headerActions = (
    <button
      onClick={handleExportCSV}
      disabled={!Array.isArray(sales) || sales.length === 0}
      className='bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 py-3 rounded-2xl transition-all duration-300 inline-flex items-center shadow-lg hover:shadow-xl hover:scale-105 border border-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed'
    >
      <Download className='w-5 h-5 mr-2' />
      Export CSV
    </button>
  );

  return (
    <PageLayout
      title='Sales Analytics'
      subtitle='Financial tracking and analytics dashboard for sales data'
      loading={loading && (!Array.isArray(sales) || sales.length === 0)}
      error={error}
      actions={headerActions}
      variant='default'
    >
      <div className='relative z-10 p-8'>
        <div className='max-w-7xl mx-auto space-y-10'>
          {/* Context7 Premium Analytics Header */}
          <div className='bg-zinc-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-zinc-700/20 p-10 relative overflow-hidden group'>
            <div className='absolute inset-0 bg-gradient-to-r from-teal-500/5 via-emerald-500/5 to-green-500/5'></div>
            <div className='relative z-10'>
              <div className='flex justify-between items-start'>
                <div>
                  <h1 className='text-4xl font-bold text-zinc-100 tracking-wide mb-3 bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent'>
                    Sales Analytics
                  </h1>
                  <p className='text-xl text-zinc-300 font-medium leading-relaxed'>
                    Track your collection's financial performance and trends
                  </p>
                </div>

                {/* Export and Refresh Controls */}
                <div className='flex items-center space-x-4'>
                  <Button variant='secondary' size='sm' onClick={refreshData} disabled={loading}>
                    <RefreshCcw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </div>

              {error && (
                <div className='mt-6 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200/50 rounded-2xl'>
                  <p className='text-sm text-red-600 font-medium'>{error}</p>
                </div>
              )}
            </div>
            {/* Premium shimmer effect */}
            <div className='absolute inset-0 bg-gradient-to-r from-transparent via-zinc-300/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out'></div>
          </div>

          {/* Date Range Filter */}
          <DateRangeFilter
            value={localDateRange}
            onChange={handleDateRangeChange}
            showPresets={false}
            showCustomRange={true}
            loading={loading}
          />

          {/* Context7 Premium KPI Summary Cards */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
            <div className='group bg-zinc-900/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 relative overflow-hidden border border-zinc-700/20 hover:scale-105 transition-all duration-500 hover:shadow-emerald-500/20'>
              <div className='absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5'></div>
              <div className='flex items-center relative z-10'>
                <div className='w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500'>
                  <DollarSign className='w-8 h-8 text-white' />
                </div>
                <div className='ml-6 flex-1'>
                  <p className='text-sm font-bold text-emerald-600 tracking-wide uppercase mb-1'>
                    Revenue
                  </p>
                  <p className='text-3xl font-bold text-zinc-100 group-hover:text-emerald-400 transition-colors duration-300'>
                    {displayPrice(kpis?.totalRevenue || 0)}
                  </p>
                  <p className='text-xs text-zinc-400 mt-1 font-medium'>Total earned</p>
                </div>
              </div>
            </div>

            <div className='group bg-zinc-900/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 relative overflow-hidden border border-zinc-700/20 hover:scale-105 transition-all duration-500 hover:shadow-blue-500/20'>
              <div className='absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5'></div>
              <div className='flex items-center relative z-10'>
                <div className='w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500'>
                  <TrendingUp className='w-8 h-8 text-white' />
                </div>
                <div className='ml-6 flex-1'>
                  <p className='text-sm font-bold text-blue-600 tracking-wide uppercase mb-1'>
                    Facebook
                  </p>
                  <p className='text-3xl font-bold text-zinc-100 group-hover:text-blue-400 transition-colors duration-300'>
                    {Array.isArray(sales)
                      ? sales.filter(sale => sale.source === 'Facebook').length
                      : 0}
                  </p>
                  <p className='text-xs text-zinc-400 mt-1 font-medium'>Items sold</p>
                </div>
              </div>
            </div>

            <div className='group bg-zinc-900/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 relative overflow-hidden border border-zinc-700/20 hover:scale-105 transition-all duration-500 hover:shadow-purple-500/20'>
              <div className='absolute inset-0 bg-gradient-to-br from-purple-500/5 to-violet-500/5'></div>
              <div className='flex items-center relative z-10'>
                <div className='w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl shadow-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500'>
                  <BarChart3 className='w-8 h-8 text-white' />
                </div>
                <div className='ml-6 flex-1'>
                  <p className='text-sm font-bold text-purple-600 tracking-wide uppercase mb-1'>
                    DBA
                  </p>
                  <p className='text-3xl font-bold text-zinc-100 group-hover:text-purple-300 transition-colors duration-300'>
                    {Array.isArray(sales) ? sales.filter(sale => sale.source === 'DBA').length : 0}
                  </p>
                  <p className='text-xs text-zinc-400 mt-1 font-medium'>Items sold</p>
                </div>
              </div>
            </div>

            <div className='group bg-zinc-900/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 relative overflow-hidden border border-zinc-700/20 hover:scale-105 transition-all duration-500 hover:shadow-amber-500/20'>
              <div className='absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5'></div>
              <div className='flex items-center relative z-10'>
                <div className='w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500'>
                  <PieChart className='w-8 h-8 text-white' />
                </div>
                <div className='ml-6 flex-1'>
                  <p className='text-sm font-bold text-amber-600 tracking-wide uppercase mb-1'>
                    Total Items
                  </p>
                  <p className='text-3xl font-bold text-zinc-100 group-hover:text-amber-300 transition-colors duration-300'>
                    {kpis?.totalItems || 0}
                  </p>
                  <p className='text-xs text-zinc-400 mt-1 font-medium'>Items sold</p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* Revenue Over Time Chart */}
            <div className='bg-zinc-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-zinc-700/20 relative overflow-hidden'>
              <div className='absolute inset-0 bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-purple-500/5'></div>
              <div className='relative z-10 p-8'>
                <div className='mb-6'>
                  <h2 className='text-2xl font-bold text-zinc-100 mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent'>
                    Revenue Over Time
                  </h2>
                  <p className='text-slate-600 font-medium'>
                    Track your sales performance across different periods
                  </p>
                </div>
                {graphData && graphData.length > 0 ? (
                  <ResponsiveContainer width='100%' height={350}>
                    <BarChart data={graphData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <defs>
                        <linearGradient id='revenueGradient' x1='0' y1='0' x2='0' y2='1'>
                          <stop offset='0%' stopColor='#3B82F6' stopOpacity={0.8} />
                          <stop offset='100%' stopColor='#1E40AF' stopOpacity={0.3} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray='3 3' stroke='#E2E8F0' opacity={0.6} />
                      <XAxis
                        dataKey='date'
                        tickFormatter={value =>
                          new Date(value).toLocaleDateString('da-DK', {
                            month: 'short',
                            day: 'numeric',
                          })
                        }
                        tick={{ fill: '#64748B', fontSize: 12 }}
                        axisLine={{ stroke: '#CBD5E1', strokeWidth: 1 }}
                      />
                      <YAxis
                        tick={{ fill: '#64748B', fontSize: 12 }}
                        axisLine={{ stroke: '#CBD5E1', strokeWidth: 1 }}
                        tickFormatter={value => {
                          if (value >= 1000) {
                            return `${Math.round(value / 1000)}k kr.`;
                          }
                          return `${Math.round(value)} kr.`;
                        }}
                      />
                      <Tooltip
                        labelFormatter={value => new Date(value).toLocaleDateString('da-DK')}
                        formatter={(value: number) => [displayPrice(value), 'Revenue']}
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          backdropFilter: 'blur(12px)',
                          border: '1px solid rgba(226, 232, 240, 0.5)',
                          borderRadius: '12px',
                          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                        }}
                      />
                      <Bar
                        dataKey='revenue'
                        fill='url(#revenueGradient)'
                        radius={[4, 4, 0, 0]}
                        name='Revenue'
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className='text-center py-16'>
                    <div className='w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mx-auto mb-4 flex items-center justify-center'>
                      <BarChart3 className='w-8 h-8 text-white' />
                    </div>
                    <h3 className='text-xl font-bold text-zinc-100 mb-2'>No Revenue Data</h3>
                    <p className='text-slate-500 font-medium'>
                      Revenue data over time will appear here once you start selling items.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Category Breakdown Chart */}
            <div className='bg-zinc-800 rounded-lg shadow'>
              <div className='p-6 border-b border-gray-200'>
                <h2 className='text-lg font-semibold text-zinc-100'>Sales by Category</h2>
              </div>
              <div className='p-6'>
                {pieChartData.length > 0 ? (
                  <ResponsiveContainer width='100%' height={300}>
                    <RechartsPieChart>
                      <Pie
                        dataKey='value'
                        data={pieChartData}
                        cx='50%'
                        cy='50%'
                        outerRadius={80}
                        stroke='none'
                        strokeWidth={0}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {pieChartData.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={chartColors[index % chartColors.length]}
                            stroke='none'
                            strokeWidth={0}
                          />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => displayPrice(value)} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className='text-center py-12'>
                    <PieChart className='mx-auto w-12 h-12 text-zinc-500' />
                    <h3 className='mt-4 text-lg font-medium text-zinc-100'>No category data</h3>
                    <p className='mt-2 text-zinc-400'>Sales by category will appear here.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sales Table */}
          <div className='bg-zinc-800 rounded-lg shadow'>
            <div className='p-6 border-b border-zinc-600'>
              <div className='flex justify-between items-center'>
                <h2 className='text-lg font-semibold text-zinc-100'>Recent Sales</h2>
                {Array.isArray(sales) && sales.length > 0 && (
                  <Button
                    variant='secondary'
                    size='sm'
                    onClick={handleExportCSV}
                    disabled={loading}
                  >
                    <Download className='w-4 h-4 mr-1' />
                    Export CSV
                  </Button>
                )}
              </div>
            </div>
            <div className='overflow-x-auto'>
              {Array.isArray(sales) && sales.length > 0 ? (
                <table className='min-w-full divide-y divide-gray-200'>
                  <thead className='bg-gray-50'>
                    <tr>
                      <th className='px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider'>
                        Item
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider'>
                        Category
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider'>
                        My Price
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider'>
                        Sale Price
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider'>
                        Profit
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider'>
                        Date Sold
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider'>
                        Source
                      </th>
                    </tr>
                  </thead>
                  <tbody className='bg-zinc-800 divide-y divide-zinc-600'>
                    {sales.slice(0, 10).map((sale, index) => {
                      const actualPrice = Number(sale.actualSoldPrice) || 0;
                      const myPrice = Number(sale.myPrice) || 0;
                      const profit = actualPrice - myPrice;
                      const profitColor = profit >= 0 ? 'text-green-600' : 'text-red-600';

                      return (
                        <tr key={sale.id || `sale-${index}`} className='hover:bg-gray-50'>
                          <td className='px-6 py-4 whitespace-nowrap'>
                            <div className='text-sm font-medium text-zinc-100'>
                              {sale.itemName || 'Unknown Item'}
                            </div>
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap'>
                            <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
                              {sale.itemCategory?.replace(/([A-Z])/g, ' $1').trim() || 'Unknown'}
                            </span>
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-zinc-100'>
                            {displayPrice(myPrice)}
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-zinc-100'>
                            {displayPrice(actualPrice)}
                          </td>
                          <td
                            className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${profitColor}`}
                          >
                            {displayPrice(profit)}
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-zinc-400'>
                            {sale.dateSold
                              ? new Date(sale.dateSold).toLocaleDateString('da-DK')
                              : 'Unknown'}
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-zinc-400'>
                            {sale.source || 'Unknown'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className='text-center py-12'>
                  <TrendingUp className='mx-auto w-12 h-12 text-gray-400' />
                  <h3 className='mt-4 text-lg font-medium text-zinc-100'>No sales data</h3>
                  <p className='mt-2 text-zinc-400'>
                    Sales transactions will appear here once you start selling items.
                  </p>
                </div>
              )}
            </div>

            {Array.isArray(sales) && sales.length > 10 && (
              <div className='px-6 py-3 border-t border-gray-200 text-center'>
                <p className='text-sm text-zinc-400'>
                  Showing 10 of {sales.length} sales.
                  <button className='ml-1 text-blue-600 hover:text-blue-800'>View all</button>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default SalesAnalytics;
