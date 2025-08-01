/**
 * Collection Stats Component
 *
 * Displays collection overview statistics with Context7 premium design
 * Following CLAUDE.md principles:
 * - Single Responsibility: Only handles statistics display
 * - Open/Closed: Extensible for new statistics
 * - DRY: Reusable statistics card pattern
 * - Layer 3: UI Building Block component
 */

import React from 'react';
import { Archive, CheckCircle, Package, Star } from 'lucide-react';

export interface CollectionStatsProps {
  psaGradedCount: number;
  rawCardsCount: number;
  sealedProductsCount: number;
  soldItemsCount: number;
  loading?: boolean;
  activeTab?: string;
  onTabChange?: (tab: 'psa-graded' | 'raw-cards' | 'sealed-products' | 'sold-items') => void;
}

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  count: number;
  loading?: boolean;
  gradientFrom: string;
  gradientTo: string;
  textColor: string;
  hoverShadow: string;
  isActive?: boolean;
  onClick?: () => void;
  tabId: string;
}

const StatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  title,
  count,
  loading,
  gradientFrom,
  gradientTo,
  textColor,
  hoverShadow,
  isActive,
  onClick,
  tabId,
}) => (
  <div
    onClick={onClick}
    className={`group cursor-pointer relative overflow-hidden transition-all duration-300 ${
      isActive 
        ? 'bg-white/10 border-2 border-white/20 shadow-xl' 
        : 'bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20'
    } backdrop-blur-xl rounded-2xl p-6`}
  >
    {/* Main content layout */}
    <div className="flex flex-col items-center text-center space-y-4">
      {/* Icon */}
      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradientFrom.replace('/10', '/20')} ${gradientTo.replace('/10', '/20')} flex items-center justify-center transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`}>
        <Icon className="w-7 h-7 text-white" />
      </div>
      
      {/* Count */}
      <div className="space-y-1">
        <div className={`text-4xl font-black ${isActive ? textColor : 'text-white group-hover:' + textColor} transition-colors duration-300`}>
          {loading ? (
            <div className="w-16 h-10 bg-white/10 rounded-lg animate-pulse"></div>
          ) : (
            count.toLocaleString()
          )}
        </div>
        
        {/* Title */}
        <div className={`text-sm font-semibold uppercase tracking-wider ${isActive ? textColor : 'text-white/70 group-hover:text-white'} transition-colors duration-300`}>
          {title}
        </div>
      </div>
    </div>
  </div>
);

export const CollectionStats: React.FC<CollectionStatsProps> = ({
  psaGradedCount,
  rawCardsCount,
  sealedProductsCount,
  soldItemsCount,
  loading = false,
  activeTab,
  onTabChange,
}) => {
  return (
    <div className="mb-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 max-w-6xl mx-auto">
        <StatCard
          icon={Star}
          title="PSA Graded"
          count={psaGradedCount}
          loading={loading}
          gradientFrom="from-blue-500/10"
          gradientTo="to-cyan-500/10"
          textColor="text-blue-400"
          hoverShadow="hover:shadow-blue-500/30"
          isActive={activeTab === 'psa-graded'}
          onClick={() => onTabChange?.('psa-graded')}
          tabId="psa-graded"
        />

        <StatCard
          icon={Package}
          title="Raw Cards"
          count={rawCardsCount}
          loading={loading}
          gradientFrom="from-emerald-500/10"
          gradientTo="to-green-500/10"
          textColor="text-emerald-400"
          hoverShadow="hover:shadow-emerald-500/30"
          isActive={activeTab === 'raw-cards'}
          onClick={() => onTabChange?.('raw-cards')}
          tabId="raw-cards"
        />

        <StatCard
          icon={Archive}
          title="Sealed Products"
          count={sealedProductsCount}
          loading={loading}
          gradientFrom="from-purple-500/10"
          gradientTo="to-pink-500/10"
          textColor="text-purple-400"
          hoverShadow="hover:shadow-purple-500/30"
          isActive={activeTab === 'sealed-products'}
          onClick={() => onTabChange?.('sealed-products')}
          tabId="sealed-products"
        />

        <StatCard
          icon={CheckCircle}
          title="Sold Items"
          count={soldItemsCount}
          loading={loading}
          gradientFrom="from-orange-500/10"
          gradientTo="to-red-500/10"
          textColor="text-orange-400"
          hoverShadow="hover:shadow-orange-500/30"
          isActive={activeTab === 'sold-items'}
          onClick={() => onTabChange?.('sold-items')}
          tabId="sold-items"
        />
      </div>
    </div>
  );
};

export default CollectionStats;
