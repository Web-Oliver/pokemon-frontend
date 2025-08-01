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
}) => (
  <div
    className={`group bg-zinc-900/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 relative overflow-hidden hover:scale-105 transition-all duration-500 ${hoverShadow}`}
  >
    <div
      className={`absolute inset-0 bg-gradient-to-br ${gradientFrom} ${gradientTo}`}
    ></div>
    <div className="flex items-center relative z-10">
      <div
        className={`w-16 h-16 bg-gradient-to-br ${gradientFrom.replace('/5', '')} ${gradientTo.replace('/5', '')} rounded-2xl shadow-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}
      >
        <Icon className="w-8 h-8 text-white" />
      </div>
      <div className="ml-6">
        <p
          className={`text-sm font-bold ${textColor} tracking-wide uppercase mb-1`}
        >
          {title}
        </p>
        <div
          className={`text-3xl font-bold text-zinc-100 group-hover:${textColor} transition-colors duration-300`}
        >
          {loading ? (
            <div className="w-12 h-8 bg-zinc-700 rounded-lg animate-pulse"></div>
          ) : (
            count
          )}
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
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      <StatCard
        icon={Star}
        title="PSA Graded"
        count={psaGradedCount}
        loading={loading}
        gradientFrom="from-cyan-500/10"
        gradientTo="to-blue-500/10"
        textColor="text-cyan-400"
        hoverShadow="hover:shadow-indigo-500/20"
      />

      <StatCard
        icon={Package}
        title="Raw Cards"
        count={rawCardsCount}
        loading={loading}
        gradientFrom="from-emerald-500/10"
        gradientTo="to-teal-500/10"
        textColor="text-emerald-400"
        hoverShadow="hover:shadow-emerald-500/20"
      />

      <StatCard
        icon={Archive}
        title="Sealed Products"
        count={sealedProductsCount}
        loading={loading}
        gradientFrom="from-purple-500/10"
        gradientTo="to-violet-500/10"
        textColor="text-purple-400"
        hoverShadow="hover:shadow-purple-500/20"
      />

      <StatCard
        icon={CheckCircle}
        title="Sold Items"
        count={soldItemsCount}
        loading={loading}
        gradientFrom="from-amber-500/10"
        gradientTo="to-orange-500/10"
        textColor="text-amber-400"
        hoverShadow="hover:shadow-amber-500/20"
      />
    </div>
  );
};

export default CollectionStats;
