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
  LineChart,
  Line,
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
  } = useSalesAnalytics();

  const [dateRangeInput, setDateRangeInput] = useState({
    startDate: dateRange.startDate || '',
    endDate: dateRange.endDate || '',
  });

  // Chart colors
  const chartColors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('da-DK', {
      style: 'currency',
      currency: 'DKK',
    }).format(amount);
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
  const pieChartData = Object.entries(categoryBreakdown)
    .map(([category, data]) => ({
      name: category.replace(/([A-Z])/g, ' $1').trim(),
      value: data.revenue,
      count: data.count,
    }))
    .filter(item => item.value > 0);

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

  if (loading && sales.length === 0) {
    return (
      <div className='p-6'>
        <div className='max-w-7xl mx-auto'>
          <LoadingSpinner size='large' />
        </div>
      </div>
    );
  }

  return (
    <div className='p-6'>
      <div className='max-w-7xl mx-auto space-y-6'>
        {/* Analytics Header */}
        <div className='bg-white rounded-lg shadow p-6'>
          <div className='flex justify-between items-start'>
            <div>
              <h1 className='text-2xl font-bold text-gray-900 mb-4'>Sales Analytics</h1>
              <p className='text-gray-600'>
                Track your collection's financial performance and trends
              </p>
            </div>

            {/* Date Range Filter */}
            <div className='flex items-center space-x-4'>
              <div className='flex items-center space-x-2'>
                <Calendar className='w-4 h-4 text-gray-500' />
                <input
                  type='date'
                  value={dateRangeInput.startDate}
                  onChange={e =>
                    setDateRangeInput(prev => ({ ...prev, startDate: e.target.value }))
                  }
                  className='border border-gray-300 rounded px-2 py-1 text-sm'
                  placeholder='Start Date'
                />
                <span className='text-gray-500'>to</span>
                <input
                  type='date'
                  value={dateRangeInput.endDate}
                  onChange={e => setDateRangeInput(prev => ({ ...prev, endDate: e.target.value }))}
                  className='border border-gray-300 rounded px-2 py-1 text-sm'
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
            <div className='mt-4 p-3 bg-red-50 border border-red-200 rounded-md'>
              <p className='text-sm text-red-600'>{error}</p>
            </div>
          )}
        </div>

        {/* KPI Summary Cards */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          <div className='bg-white rounded-lg shadow p-6'>
            <div className='flex items-center'>
              <div className='w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center'>
                <DollarSign className='w-6 h-6 text-green-600' />
              </div>
              <div className='ml-4 flex-1'>
                <p className='text-sm font-medium text-gray-600'>Total Revenue</p>
                <p className='text-2xl font-bold text-gray-900'>
                  {formatCurrency(kpis.totalRevenue)}
                </p>
                {trendAnalysis.revenueGrowthRate !== 0 && (
                  <div className='flex items-center mt-1'>
                    {getTrendIcon(trendAnalysis.trend)}
                    <span className='text-xs text-gray-500 ml-1'>
                      {formatPercentage(trendAnalysis.revenueGrowthRate)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className='bg-white rounded-lg shadow p-6'>
            <div className='flex items-center'>
              <div className='w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center'>
                <TrendingUp className='w-6 h-6 text-blue-600' />
              </div>
              <div className='ml-4 flex-1'>
                <p className='text-sm font-medium text-gray-600'>Total Profit</p>
                <p className='text-2xl font-bold text-gray-900'>
                  {formatCurrency(kpis.totalProfit)}
                </p>
                {trendAnalysis.profitGrowthRate !== 0 && (
                  <div className='flex items-center mt-1'>
                    {getTrendIcon(trendAnalysis.trend)}
                    <span className='text-xs text-gray-500 ml-1'>
                      {formatPercentage(trendAnalysis.profitGrowthRate)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className='bg-white rounded-lg shadow p-6'>
            <div className='flex items-center'>
              <div className='w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center'>
                <BarChart3 className='w-6 h-6 text-purple-600' />
              </div>
              <div className='ml-4 flex-1'>
                <p className='text-sm font-medium text-gray-600'>Avg Margin</p>
                <p className='text-2xl font-bold text-gray-900'>
                  {formatPercentage(kpis.averageMargin)}
                </p>
                <p className='text-xs text-gray-500 mt-1'>
                  Profit: {formatPercentage(kpis.profitabilityRatio)}
                </p>
              </div>
            </div>
          </div>

          <div className='bg-white rounded-lg shadow p-6'>
            <div className='flex items-center'>
              <div className='w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center'>
                <PieChart className='w-6 h-6 text-yellow-600' />
              </div>
              <div className='ml-4 flex-1'>
                <p className='text-sm font-medium text-gray-600'>Items Sold</p>
                <p className='text-2xl font-bold text-gray-900'>{kpis.totalItems}</p>
                <p className='text-xs text-gray-500 mt-1'>
                  Avg: {formatCurrency(kpis.averageSalePrice)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {/* Revenue Over Time Chart */}
          <div className='bg-white rounded-lg shadow'>
            <div className='p-6 border-b border-gray-200'>
              <h2 className='text-lg font-semibold text-gray-900'>Revenue & Profit Over Time</h2>
            </div>
            <div className='p-6'>
              {graphData.length > 0 ? (
                <ResponsiveContainer width='100%' height={300}>
                  <LineChart data={graphData}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis
                      dataKey='date'
                      tickFormatter={value => new Date(value).toLocaleDateString('da-DK')}
                    />
                    <YAxis />
                    <Tooltip
                      labelFormatter={value => new Date(value).toLocaleDateString('da-DK')}
                      formatter={(value: number, name: string) => [
                        name === 'revenue' || name === 'profit' ? formatCurrency(value) : value,
                        name.charAt(0).toUpperCase() + name.slice(1),
                      ]}
                    />
                    <Legend />
                    <Line
                      type='monotone'
                      dataKey='revenue'
                      stroke='#3B82F6'
                      strokeWidth={2}
                      name='Revenue'
                    />
                    <Line
                      type='monotone'
                      dataKey='profit'
                      stroke='#10B981'
                      strokeWidth={2}
                      name='Profit'
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className='text-center py-12'>
                  <BarChart3 className='mx-auto w-12 h-12 text-gray-400' />
                  <h3 className='mt-4 text-lg font-medium text-gray-900'>No time-series data</h3>
                  <p className='mt-2 text-gray-500'>Sales data over time will appear here.</p>
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
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieChartData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={chartColors[index % chartColors.length]}
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
              {sales.length > 0 && (
                <Button variant='secondary' size='sm'>
                  <Download className='w-4 h-4 mr-1' />
                  Export CSV
                </Button>
              )}
            </div>
          </div>
          <div className='overflow-x-auto'>
            {sales.length > 0 ? (
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
                      Purchase Price
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
                  {sales.slice(0, 10).map(sale => {
                    const profit = sale.actualSoldPrice - sale.myPrice;
                    const profitColor = profit >= 0 ? 'text-green-600' : 'text-red-600';

                    return (
                      <tr key={sale.id} className='hover:bg-gray-50'>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <div className='text-sm font-medium text-gray-900'>{sale.itemName}</div>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap'>
                          <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800'>
                            {sale.itemCategory.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                          {formatCurrency(sale.myPrice)}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900'>
                          {formatCurrency(sale.actualSoldPrice)}
                        </td>
                        <td
                          className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${profitColor}`}
                        >
                          {formatCurrency(profit)}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                          {new Date(sale.dateSold).toLocaleDateString('da-DK')}
                        </td>
                        <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                          {sale.source}
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

          {sales.length > 10 && (
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
  );
};

export default SalesAnalytics;
