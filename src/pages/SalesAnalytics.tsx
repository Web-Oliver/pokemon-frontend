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
  Calendar,
  RefreshCcw,
  Download,
  Filter,
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
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useSalesAnalytics } from '../hooks/useSalesAnalytics';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Button from '../components/common/Button';
import { handleApiError, showSuccessToast } from '../utils/errorHandler';

const SalesAnalytics: React.FC = () => {
  const {
    sales,
    graphData,
    loading,
    error,
    kpis,
    categoryBreakdown,
    trendAnalysis,
    dateRange,
    setDateRange,
    refreshData,
    exportSalesCSV,
  } = useSalesAnalytics();

  const [dateRangeInput, setDateRangeInput] = useState({
    startDate: dateRange?.startDate || '',
    endDate: dateRange?.endDate || '',
  });

  // Chart colors
  const chartColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('da-DK', {
      style: 'currency',
      currency: 'DKK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.round(amount));
  };

  // Handle CSV export with error handling and user feedback
  const handleExportCSV = async () => {
    try {
      exportSalesCSV();
      showSuccessToast('Sales data exported successfully!');
    } catch (error) {
      handleApiError(error, 'Failed to export sales data');
    }
  };

  // Format percentage
  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // Format date range filter
  const handleDateRangeSubmit = () => {
    setDateRange({
      startDate: dateRangeInput.startDate || undefined,
      endDate: dateRangeInput.endDate || undefined,
    });
  };

  const clearDateRange = () => {
    setDateRangeInput({ startDate: '', endDate: '' });
    setDateRange({});
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
    const getTrendIcon = (trend: string) => {
      switch (trend) {
        case 'up':
          return <ArrowUp className='w-4 h-4 text-green-500' />;
        case 'down':
          return <ArrowDown className='w-4 h-4 text-red-500' />;
        default:
          return <Minus className='w-4 h-4 text-gray-500' />;
      }
    };

    if (loading && (!sales || sales.length === 0)) {
      return (
        <div className='min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 relative overflow-hidden'>
          <div className='absolute inset-0 opacity-30'>
            <div
              className='w-full h-full'
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236366f1' fill-opacity='0.03'%3E%3Ccircle cx='40' cy='40' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            ></div>
          </div>
          <div className='relative z-10 p-8'>
            <div className='max-w-7xl mx-auto'>
              <div className='bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-12 relative overflow-hidden'>
                <div className='absolute inset-0 bg-gradient-to-r from-teal-500/5 via-emerald-500/5 to-green-500/5'></div>
                <div className='relative z-10'>
                  <LoadingSpinner size='large' />
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 relative overflow-hidden'>
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
          <div className='max-w-7xl mx-auto space-y-10'>
            {/* Context7 Premium Analytics Header */}
            <div className='bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-10 relative overflow-hidden group'>
              <div className='absolute inset-0 bg-gradient-to-r from-teal-500/5 via-emerald-500/5 to-green-500/5'></div>
              <div className='relative z-10'>
                <div className='flex justify-between items-start'>
                  <div>
                    <h1 className='text-4xl font-bold text-slate-900 tracking-wide mb-3 bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent'>Sales Analytics</h1>
                    <p className='text-xl text-slate-600 font-medium leading-relaxed'>
                      Track your collection's financial performance and trends
                    </p>
                  </div>

                  {/* Context7 Premium Date Range Filter */}
                  <div className='flex items-center space-x-4'>
                    <div className='flex items-center space-x-3'>
                      <div className='w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center'>
                        <Calendar className='w-4 h-4 text-white' />
                      </div>
                      <input
                        type='date'
                        value={dateRangeInput.startDate}
                        onChange={e =>
                          setDateRangeInput(prev => ({ ...prev, startDate: e.target.value }))
                        }
                        className='border border-slate-300 rounded-xl px-4 py-2 text-sm font-medium backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                        placeholder='Start Date'
                      />
                      <span className='text-slate-500 font-medium'>to</span>
                      <input
                        type='date'
                        value={dateRangeInput.endDate}
                        onChange={e =>
                          setDateRangeInput(prev => ({ ...prev, endDate: e.target.value }))
                        }
                        className='border border-slate-300 rounded-xl px-4 py-2 text-sm font-medium backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent'
                        placeholder='End Date'
                      />
                    </div>

                    <Button
                      variant='primary'
                      size='sm'
                      onClick={handleDateRangeSubmit}
                      disabled={loading}
                    >
                      <Filter className='w-4 h-4 mr-1' />
                      Apply
                    </Button>

                    <Button variant='secondary' size='sm' onClick={clearDateRange} disabled={loading}>
                      Clear
                    </Button>

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
              <div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out'></div>
            </div>

            {/* Context7 Premium KPI Summary Cards */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
              <div className='group bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 relative overflow-hidden border border-white/20 hover:scale-105 transition-all duration-500 hover:shadow-emerald-500/20'>
                <div className='absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5'></div>
                <div className='flex items-center relative z-10'>
                  <div className='w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500'>
                    <DollarSign className='w-8 h-8 text-white' />
                  </div>
                  <div className='ml-6 flex-1'>
                    <p className='text-sm font-bold text-emerald-600 tracking-wide uppercase mb-1'>Revenue</p>
                    <p className='text-3xl font-bold text-slate-900 group-hover:text-emerald-700 transition-colors duration-300'>
                      {formatCurrency(kpis?.totalRevenue || 0)}
                    </p>
                    <p className='text-xs text-slate-500 mt-1 font-medium'>
                      Total earned
                    </p>
                  </div>
                </div>
              </div>

              <div className='group bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 relative overflow-hidden border border-white/20 hover:scale-105 transition-all duration-500 hover:shadow-blue-500/20'>
                <div className='absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5'></div>
                <div className='flex items-center relative z-10'>
                  <div className='w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500'>
                    <TrendingUp className='w-8 h-8 text-white' />
                  </div>
                  <div className='ml-6 flex-1'>
                    <p className='text-sm font-bold text-blue-600 tracking-wide uppercase mb-1'>Facebook</p>
                    <p className='text-3xl font-bold text-slate-900 group-hover:text-blue-700 transition-colors duration-300'>
                      {sales.filter(sale => sale.source === 'Facebook').length}
                    </p>
                    <p className='text-xs text-slate-500 mt-1 font-medium'>
                      Items sold
                    </p>
                  </div>
                </div>
              </div>

              <div className='group bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 relative overflow-hidden border border-white/20 hover:scale-105 transition-all duration-500 hover:shadow-purple-500/20'>
                <div className='absolute inset-0 bg-gradient-to-br from-purple-500/5 to-violet-500/5'></div>
                <div className='flex items-center relative z-10'>
                  <div className='w-16 h-16 bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl shadow-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500'>
                    <BarChart3 className='w-8 h-8 text-white' />
                  </div>
                  <div className='ml-6 flex-1'>
                    <p className='text-sm font-bold text-purple-600 tracking-wide uppercase mb-1'>DBA</p>
                    <p className='text-3xl font-bold text-slate-900 group-hover:text-purple-700 transition-colors duration-300'>
                      {sales.filter(sale => sale.source === 'DBA').length}
                    </p>
                    <p className='text-xs text-slate-500 mt-1 font-medium'>
                      Items sold
                    </p>
                  </div>
                </div>
              </div>

              <div className='group bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 relative overflow-hidden border border-white/20 hover:scale-105 transition-all duration-500 hover:shadow-amber-500/20'>
                <div className='absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5'></div>
                <div className='flex items-center relative z-10'>
                  <div className='w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500'>
                    <PieChart className='w-8 h-8 text-white' />
                  </div>
                  <div className='ml-6 flex-1'>
                    <p className='text-sm font-bold text-amber-600 tracking-wide uppercase mb-1'>Total Items</p>
                    <p className='text-3xl font-bold text-slate-900 group-hover:text-amber-700 transition-colors duration-300'>{kpis?.totalItems || 0}</p>
                    <p className='text-xs text-slate-500 mt-1 font-medium'>
                      Items sold
                    </p>
                  </div>
                </div>
              </div>
            </div>

          {/* Charts Section */}
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* Revenue Over Time Chart */}
            <div className='bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 relative overflow-hidden'>
              <div className='absolute inset-0 bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-purple-500/5'></div>
              <div className='relative z-10 p-8'>
                <div className='mb-6'>
                  <h2 className='text-2xl font-bold text-slate-900 mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent'>Revenue Over Time</h2>
                  <p className='text-slate-600 font-medium'>Track your sales performance across different periods</p>
                </div>
                {graphData && graphData.length > 0 ? (
                  <ResponsiveContainer width='100%' height={350}>
                    <BarChart data={graphData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <defs>
                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.8}/>
                          <stop offset="100%" stopColor="#1E40AF" stopOpacity={0.3}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray='3 3' stroke='#E2E8F0' opacity={0.6} />
                      <XAxis
                        dataKey='date'
                        tickFormatter={value => new Date(value).toLocaleDateString('da-DK', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
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
                        formatter={(value: number) => [formatCurrency(value), 'Revenue']}
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
                    <h3 className='text-xl font-bold text-slate-900 mb-2'>No Revenue Data</h3>
                    <p className='text-slate-500 font-medium'>Revenue data over time will appear here once you start selling items.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Category Breakdown Chart */}
            <div className='bg-white rounded-lg shadow'>
              <div className='p-6 border-b border-gray-200'>
                <h2 className='text-lg font-semibold text-gray-900'>Sales by Category</h2>
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
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className='text-center py-12'>
                    <PieChart className='mx-auto w-12 h-12 text-gray-400' />
                    <h3 className='mt-4 text-lg font-medium text-gray-900'>No category data</h3>
                    <p className='mt-2 text-gray-500'>Sales by category will appear here.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sales Table */}
          <div className='bg-white rounded-lg shadow'>
            <div className='p-6 border-b border-gray-200'>
              <div className='flex justify-between items-center'>
                <h2 className='text-lg font-semibold text-gray-900'>Recent Sales</h2>
                {sales && sales.length > 0 && (
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
              {sales && sales.length > 0 ? (
                <table className='min-w-full divide-y divide-gray-200'>
                  <thead className='bg-gray-50'>
                    <tr>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Item
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Category
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        My Price
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Sale Price
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Profit
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Date Sold
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Source
                      </th>
                    </tr>
                  </thead>
                  <tbody className='bg-white divide-y divide-gray-200'>
                    {sales.slice(0, 10).map((sale, index) => {
                      const actualPrice = Number(sale.actualSoldPrice) || 0;
                      const myPrice = Number(sale.myPrice) || 0;
                      const profit = actualPrice - myPrice;
                      const profitColor = profit >= 0 ? 'text-green-600' : 'text-red-600';

                      return (
                        <tr key={sale.id || `sale-${index}`} className='hover:bg-gray-50'>
                          <td className='px-6 py-4 whitespace-nowrap'>
                            <div className='text-sm font-medium text-gray-900'>{sale.itemName || 'Unknown Item'}</div>
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap'>
                            <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
                              {sale.itemCategory?.replace(/([A-Z])/g, ' $1').trim() || 'Unknown'}
                            </span>
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                            {formatCurrency(myPrice)}
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                            {formatCurrency(actualPrice)}
                          </td>
                          <td
                            className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${profitColor}`}
                          >
                            {formatCurrency(profit)}
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                            {sale.dateSold ? new Date(sale.dateSold).toLocaleDateString('da-DK') : 'Unknown'}
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
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
                  <h3 className='mt-4 text-lg font-medium text-gray-900'>No sales data</h3>
                  <p className='mt-2 text-gray-500'>
                    Sales transactions will appear here once you start selling items.
                  </p>
                </div>
              )}
            </div>

            {sales && sales.length > 10 && (
              <div className='px-6 py-3 border-t border-gray-200 text-center'>
                <p className='text-sm text-gray-500'>
                  Showing 10 of {sales.length} sales.
                  <button className='ml-1 text-blue-600 hover:text-blue-800'>View all</button>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesAnalytics;
