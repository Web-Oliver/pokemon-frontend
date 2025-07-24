/**
 * Memoized Pie Chart Component
 * Optimized with React.memo to prevent unnecessary re-renders
 * 
 * Following CLAUDE.md SOLID principles:
 * - Single Responsibility: Only handles pie chart rendering
 * - Performance optimized with React.memo and useMemo
 */

import React, { memo, useMemo } from 'react';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface PieChartDataItem {
  name: string;
  value: number;
  count: number;
}

interface MemoizedPieChartProps {
  data: PieChartDataItem[];
  colors: string[];
  formatCurrency: (amount: number) => string;
}

const MemoizedPieChart: React.FC<MemoizedPieChartProps> = memo(({ 
  data, 
  colors, 
  formatCurrency 
}) => {
  // Memoize chart configuration
  const chartConfig = useMemo(() => ({
    cx: '50%',
    cy: '50%',
    outerRadius: 80,
    stroke: 'none',
    strokeWidth: 0
  }), []);

  // Memoize label formatter to prevent recreation
  const labelFormatter = useMemo(() => 
    ({ name, percent }: { name: string; percent: number }) => 
      `${name}: ${(percent * 100).toFixed(0)}%`,
    []
  );

  // Memoize tooltip formatter
  const tooltipFormatter = useMemo(() => 
    (value: number) => formatCurrency(value),
    [formatCurrency]
  );

  // Memoize cells to prevent recreation on every render
  const cells = useMemo(() => 
    data.map((_, index) => (
      <Cell
        key={`cell-${index}`}
        fill={colors[index % colors.length]}
        stroke="none"
        strokeWidth={0}
      />
    )),
    [data, colors]
  );

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RechartsPieChart>
        <Pie
          dataKey="value"
          data={data}
          cx={chartConfig.cx}
          cy={chartConfig.cy}
          outerRadius={chartConfig.outerRadius}
          stroke={chartConfig.stroke}
          strokeWidth={chartConfig.strokeWidth}
          label={labelFormatter as any}
        >
          {cells}
        </Pie>
        <Tooltip formatter={tooltipFormatter} />
      </RechartsPieChart>
    </ResponsiveContainer>
  );
});

MemoizedPieChart.displayName = 'MemoizedPieChart';

export default MemoizedPieChart;