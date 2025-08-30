/**
 * Metric Card Component
 * Layer 3: UI Component (CLAUDE.md Architecture)
 * 
 * Simple metric display card for analytics dashboards
 */

import { LucideIcon } from 'lucide-react';
import { PokemonCard } from '@/shared/components/atoms/design-system';

export interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  subtitle?: string;
  className?: string;
}

export default function MetricCard({
  title,
  value,
  icon: Icon,
  trend,
  subtitle,
  className = ''
}: MetricCardProps) {
  return (
    <PokemonCard className={`p-6 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
        </div>
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      
      {trend && (
        <div className="mt-4 flex items-center">
          <span
            className={`text-sm font-medium ${
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {trend.isPositive ? '+' : ''}{trend.value}%
          </span>
          <span className="text-sm text-muted-foreground ml-2">
            from last month
          </span>
        </div>
      )}
    </PokemonCard>
  );
}

