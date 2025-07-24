/**
 * Memoized Revenue Chart Component
 * Optimized with React.memo to prevent unnecessary re-renders
 * 
 * Following CLAUDE.md SOLID principles:
 * - Single Responsibility: Only handles revenue chart rendering
 * - Performance optimized with React.memo and useMemo
 */

import React, { memo, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ISalesGraphData } from '../../domain/models/sale';

interface MemoizedRevenueChartProps {
  graphData: ISalesGraphData[];
  formatCurrency: (amount: number) => string;
}

const MemoizedRevenueChart: React.FC<MemoizedRevenueChartProps> = memo(({ 
  graphData, 
  formatCurrency 
}) => {
  // Memoize chart configuration to prevent recreation on every render
  const chartConfig = useMemo(() => ({
    margin: { top: 20, right: 30, left: 20, bottom: 5 },
    gradient: {
      id: 'revenueGradient',
      stops: [
        { offset: '0%', stopColor: '#3B82F6', stopOpacity: 0.8 },
        { offset: '100%', stopColor: '#1E40AF', stopOpacity: 0.3 }
      ]
    }
  }), []);

  // Memoize tooltip formatter to prevent recreation
  const tooltipFormatter = useMemo(() => ({
    labelFormatter: (value: string) => new Date(value).toLocaleDateString('da-DK'),
    formatter: (value: number) => [formatCurrency(value), 'Revenue']
  }), [formatCurrency]);

  // Memoize XAxis tick formatter
  const xAxisTickFormatter = useMemo(() => (value: string) =>
    new Date(value).toLocaleDateString('da-DK', {
      month: 'short',
      day: 'numeric',
    }), []);

  // Memoize YAxis tick formatter
  const yAxisTickFormatter = useMemo(() => (value: number) => {
    if (value >= 1000) {
      return `${Math.round(value / 1000)}k kr.`;
    }
    return `${Math.round(value)} kr.`;
  }, []);

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={graphData} margin={chartConfig.margin}>
        <defs>
          <linearGradient id={chartConfig.gradient.id} x1="0" y1="0" x2="0" y2="1">
            {chartConfig.gradient.stops.map((stop, index) => (
              <stop 
                key={index}
                offset={stop.offset} 
                stopColor={stop.stopColor} 
                stopOpacity={stop.stopOpacity} 
              />
            ))}
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" opacity={0.6} />
        <XAxis
          dataKey="date"
          tickFormatter={xAxisTickFormatter}
          tick={{ fill: '#64748B', fontSize: 12 }}
          axisLine={{ stroke: '#CBD5E1', strokeWidth: 1 }}
        />
        <YAxis
          tick={{ fill: '#64748B', fontSize: 12 }}
          axisLine={{ stroke: '#CBD5E1', strokeWidth: 1 }}
          tickFormatter={yAxisTickFormatter}
        />
        <Tooltip
          labelFormatter={tooltipFormatter.labelFormatter}
          formatter={tooltipFormatter.formatter}
          contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(226, 232, 240, 0.5)',
            borderRadius: '12px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          }}
        />
        <Bar
          dataKey="revenue"
          fill={`url(#${chartConfig.gradient.id})`}
          radius={[4, 4, 0, 0]}
          name="Revenue"
        />
      </BarChart>
    </ResponsiveContainer>
  );
});

MemoizedRevenueChart.displayName = 'MemoizedRevenueChart';

export default MemoizedRevenueChart;