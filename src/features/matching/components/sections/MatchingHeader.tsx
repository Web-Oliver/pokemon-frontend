import React from 'react';
import { Target, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { PokemonCard } from '../../../../shared/components/atoms/design-system/PokemonCard';

interface MatchingHeaderProps {
  totalScans: number;
  matchedScans: number;
  pendingScans: number;
}

export const MatchingHeader: React.FC<MatchingHeaderProps> = ({
  totalScans,
  matchedScans,
  pendingScans
}) => {
  const matchingRate = totalScans > 0 ? (matchedScans / totalScans) * 100 : 0;

  return (
    <div className="mb-8">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Target className="w-8 h-8 text-cyan-400" />
          PSA Card Creation
        </h1>
        <p className="text-gray-300">
          Create PSA graded cards from matched scans and add them to your collection.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total Scans */}
        <PokemonCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400 mb-1">Total Scans</p>
              <p className="text-2xl font-bold text-white">{totalScans}</p>
            </div>
            <div className="p-3 bg-blue-500/20 rounded-xl">
              <Target className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </PokemonCard>

        {/* PSA Cards Created */}
        <PokemonCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400 mb-1">PSA Cards Created</p>
              <p className="text-2xl font-bold text-white">0</p>
            </div>
            <div className="p-3 bg-yellow-500/20 rounded-xl">
              <Clock className="w-6 h-6 text-yellow-400" />
            </div>
          </div>
        </PokemonCard>

        {/* Ready for PSA Creation */}
        <PokemonCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400 mb-1">Ready for PSA Creation</p>
              <p className="text-2xl font-bold text-white">{matchedScans}</p>
            </div>
            <div className="p-3 bg-green-500/20 rounded-xl">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </PokemonCard>

        {/* Success Rate */}
        <PokemonCard className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400 mb-1">Success Rate</p>
              <p className="text-2xl font-bold text-white">{matchingRate.toFixed(1)}%</p>
            </div>
            <div className="p-3 bg-cyan-500/20 rounded-xl">
              <TrendingUp className="w-6 h-6 text-cyan-400" />
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-3">
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${matchingRate}%` }}
              />
            </div>
          </div>
        </PokemonCard>
      </div>

      {/* Quick Actions */}
      {pendingScans > 0 && (
        <div className="mt-6">
          <PokemonCard className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-white">
                  {pendingScans} scan{pendingScans !== 1 ? 's' : ''} ready for matching
                </p>
                <p className="text-xs text-gray-400">
                  Select cards from the grid below to perform matching or view details
                </p>
              </div>
              <div className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-xs font-medium">
                Ready
              </div>
            </div>
          </PokemonCard>
        </div>
      )}
    </div>
  );
};