/**
 * CategoryStats Component - Category Overview Display
 *
 * Following CLAUDE.md principles:
 * - SRP: Single responsibility for category statistics display
 * - DRY: Reusable category stats pattern
 * - Layer 3: Pure UI component with clear props interface
 */

import { DollarSign, Gavel, Package, Settings } from 'lucide-react';
import React from 'react';
import { GlassmorphismContainer } from '../effects/GlassmorphismContainer';

export interface CategoryStatsProps {
  analyticsData: any;
  className?: string;
}

export const CategoryStats: React.FC<CategoryStatsProps> = ({
  analyticsData,
  className = '',
}) => {
  const categories = [
    {
      name: 'Collection',
      value: analyticsData?.categoryStats.collection || 0,
      icon: Package,
      colorScheme: 'success' as const,
      iconColors: 'from-emerald-500 to-teal-600',
      shadowColor: 'rgba(16,185,129,0.3)',
    },
    {
      name: 'Auctions',
      value: analyticsData?.categoryStats.auction || 0,
      icon: Gavel,
      colorScheme: 'custom' as const,
      customGradient: {
        from: 'purple-500/20',
        via: 'violet-500/15',
        to: 'pink-500/20'
      },
      iconColors: 'from-purple-500 to-violet-600',
      shadowColor: 'rgba(147,51,234,0.3)',
    },
    {
      name: 'Sales',
      value: analyticsData?.categoryStats.sales || 0,
      icon: DollarSign,
      colorScheme: 'success' as const,
      iconColors: 'from-emerald-500 to-green-600',
      shadowColor: 'rgba(16,185,129,0.3)',
    },
    {
      name: 'System',
      value: analyticsData?.categoryStats.system || 0,
      icon: Settings,
      colorScheme: 'secondary' as const,
      iconColors: 'from-slate-500 to-slate-600',
      shadowColor: 'rgba(100,116,139,0.3)',
    },
  ];

  return (
    <div className={`grid grid-cols-1 md:grid-cols-4 gap-6 ${className}`}>
      {categories.map((category) => (
        <GlassmorphismContainer
          key={category.name}
          variant="medium"
          colorScheme={category.colorScheme}
          size="md"
          rounded="2xl"
          glow="subtle"
          interactive={true}
          customGradient={category.customGradient}
          className="group"
        >
          <div className="flex items-center">
            <div 
              className={`w-12 h-12 bg-gradient-to-br ${category.iconColors} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
              style={{ 
                boxShadow: `0 0 15px ${category.shadowColor}` 
              }}
            >
              <category.icon className="w-6 h-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-[var(--theme-text-secondary)] uppercase tracking-wide">
                {category.name}
              </p>
              <p className="text-2xl font-bold text-[var(--theme-text-primary)]">
                {category.value}
              </p>
            </div>
          </div>
        </GlassmorphismContainer>
      ))}
    </div>
  );
};

export default CategoryStats;