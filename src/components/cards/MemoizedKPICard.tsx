/**
 * Memoized KPI Card Component
 * Optimized with React.memo to prevent unnecessary re-renders
 * 
 * Following CLAUDE.md SOLID principles:
 * - Single Responsibility: Only handles KPI card rendering
 * - Performance optimized with React.memo
 */

import React, { memo } from 'react';
import { LucideIcon } from 'lucide-react';

interface MemoizedKPICardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
  gradientFrom: string;
  gradientTo: string;
  textColor: string;
  hoverShadow: string;
}

const MemoizedKPICard: React.FC<MemoizedKPICardProps> = memo(({
  title,
  value,
  subtitle,
  icon: Icon,
  gradientFrom,
  gradientTo,
  textColor,
  hoverShadow
}) => {
  return (
    <div className={`group bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 relative overflow-hidden border border-white/20 hover:scale-105 transition-all duration-500 ${hoverShadow}`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${gradientFrom} ${gradientTo}`}></div>
      <div className="flex items-center relative z-10">
        <div className={`w-16 h-16 bg-gradient-to-br ${gradientFrom.replace('/5', '')} ${gradientTo.replace('/5', '')} rounded-2xl shadow-xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
        <div className="ml-6 flex-1">
          <p className={`text-sm font-bold ${textColor} tracking-wide uppercase mb-1`}>
            {title}
          </p>
          <p className={`text-3xl font-bold text-slate-900 group-hover:${textColor.replace('600', '700')} transition-colors duration-300`}>
            {value}
          </p>
          <p className="text-xs text-slate-500 mt-1 font-medium">{subtitle}</p>
        </div>
      </div>
    </div>
  );
});

MemoizedKPICard.displayName = 'MemoizedKPICard';

export default MemoizedKPICard;