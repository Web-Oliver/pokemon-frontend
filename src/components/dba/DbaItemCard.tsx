/**
 * DBA Item Card Component
 * Layer 3: Components (CLAUDE.md Architecture)
 * 
 * SOLID Principles:
 * - SRP: Single responsibility for rendering individual DBA item cards
 * - OCP: Open for extension via props interface
 * - DIP: Depends on abstractions via props interface
 */

import React from 'react';
import { CheckCircle, Timer } from 'lucide-react';
import { ImageProductView } from '../common/ImageProductView';

interface DbaItemCardProps {
  item: any;
  type: 'psa' | 'raw' | 'sealed';
  isSelected: boolean;
  dbaInfo?: any;
  displayName: string;
  subtitle?: string;
  onToggle: (item: any, type: 'psa' | 'raw' | 'sealed') => void;
}

const DbaItemCard: React.FC<DbaItemCardProps> = ({
  item,
  type,
  isSelected,
  dbaInfo,
  displayName,
  subtitle,
  onToggle,
}) => {
  const itemId = item.id || item._id;
  const price = parseFloat(item.myPrice?.toString() || '0');

  const getCountdownColor = (daysRemaining: number) => {
    if (daysRemaining > 30) {
      return 'text-green-300 bg-green-900/30 border-green-600';
    }
    if (daysRemaining > 10) {
      return 'text-yellow-300 bg-yellow-900/30 border-yellow-600';
    }
    return 'text-red-300 bg-red-900/30 border-red-600';
  };

  return (
    <div
      key={itemId}
      className={`relative p-3 border-2 rounded-xl cursor-pointer transition-all duration-300 flex flex-col h-full ${
        isSelected 
          ? 'border-cyan-500 bg-cyan-900/30' 
          : 'border-zinc-600 bg-zinc-800 hover:border-cyan-400 hover:bg-cyan-900/20'
      }`}
      onClick={() => onToggle(item, type)}
    >
      {/* Selection Indicator */}
      <div className="absolute top-3 right-3">
        {isSelected ? (
          <CheckCircle className="w-6 h-6 text-indigo-600" />
        ) : (
          <div
            className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
              isSelected 
                ? 'bg-indigo-500 border-indigo-500' 
                : 'border-slate-300'
            }`}
          >
            {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
          </div>
        )}
      </div>

      {/* DBA Countdown Badge */}
      {dbaInfo && (
        <div className="absolute top-3 left-3">
          <div
            className={`px-2 py-1 rounded-lg text-xs font-medium border ${getCountdownColor(dbaInfo.daysRemaining)}`}
          >
            <Timer className="w-3 h-3 inline mr-1" />
            {dbaInfo.daysRemaining}d left
          </div>
        </div>
      )}

      {/* Standardized Image Product View */}
      <div className="w-full mb-2 pointer-events-none">
        <ImageProductView
          images={item.images || []}
          title={displayName}
          subtitle={subtitle}
          price={price}
          type={type}
          grade={type === 'psa' ? item.grade : undefined}
          condition={type === 'raw' ? item.condition : undefined}
          category={type === 'sealed' ? item.category : undefined}
          sold={false}
          variant="card"
          size="md"
          aspectRatio="card"
          showBadge={true}
          showPrice={true}
          showActions={false}
          enableInteractions={false}
          className="w-full h-48"
        />
      </div>

      {/* DBA Selection Info */}
      <div className="mt-auto">
        {dbaInfo ? (
          <div className="bg-gradient-to-r from-blue-900/50 to-cyan-900/50 rounded-lg p-2 border border-blue-600">
            <div className="text-center">
              <div className="text-xs font-semibold text-blue-200 uppercase tracking-wide mb-1">
                DBA Timer Active
              </div>
              <div className="text-sm text-cyan-300 font-bold">
                {dbaInfo.daysRemaining} days remaining
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-zinc-700/50 rounded-lg p-2 border border-zinc-600">
            <div className="text-center">
              <div className="text-xs font-medium text-zinc-400">
                Not selected for DBA
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DbaItemCard;