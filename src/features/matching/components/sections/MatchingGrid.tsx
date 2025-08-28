import React, { useState } from 'react';
import { Search, Zap, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { PokemonCard } from '../../../../shared/components/atoms/design-system/PokemonCard';
import { PokemonButton } from '../../../../shared/components/atoms/design-system/PokemonButton';
import { ImageProductView } from '../../../../shared/components/molecules/common/ImageProductView';

interface MatchingGridProps {
  scans: any[];
  selectedScan: any | null;
  onScanSelect: (scan: any) => void;
  isMatching: boolean;
  onPerformMatching: (imageHashes: string[]) => Promise<void>;
}

export const MatchingGrid: React.FC<MatchingGridProps> = ({
  scans,
  selectedScan,
  onScanSelect,
  isMatching,
  onPerformMatching
}) => {
  const [selectedScans, setSelectedScans] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<'all' | 'pending' | 'matched' | 'failed'>('all');

  const getStatusInfo = (scan: any) => {
    switch (scan.processingStatus) {
      case 'matched':
        return {
          status: 'Ready for PSA Creation',
          color: 'text-green-400',
          bgColor: 'bg-green-500/20',
          icon: CheckCircle
        };
      default:
        return {
          status: 'Matched',
          color: 'text-green-400',
          bgColor: 'bg-green-500/20',
          icon: CheckCircle
        };
    }
  };

  const filteredScans = scans.filter(scan => {
    switch (filter) {
      case 'pending':
        return scan.processingStatus === 'ocr_completed';
      case 'matched':
        return scan.processingStatus === 'matched';
      case 'failed':
        return scan.processingStatus === 'matching_failed';
      default:
        return true;
    }
  });

  const handleScanToggle = (scan: any) => {
    const newSelected = new Set(selectedScans);
    if (newSelected.has(scan.imageHash)) {
      newSelected.delete(scan.imageHash);
    } else {
      newSelected.add(scan.imageHash);
    }
    setSelectedScans(newSelected);
  };

  const handleSelectAll = () => {
    const pendingScans = filteredScans.filter(s => s.processingStatus === 'ocr_completed');
    const allPendingHashes = new Set(pendingScans.map(s => s.imageHash));
    setSelectedScans(allPendingHashes);
  };

  const handleClearSelection = () => {
    setSelectedScans(new Set());
  };

  const handlePerformMatching = async () => {
    const hashesToMatch = Array.from(selectedScans);
    if (hashesToMatch.length === 0) return;
    
    await onPerformMatching(hashesToMatch);
    setSelectedScans(new Set());
  };

  const pendingCount = filteredScans.filter(s => s.processingStatus === 'ocr_completed').length;
  const selectedCount = selectedScans.size;

  return (
    <div className="space-y-6">
      {/* Controls */}
      <PokemonCard className="p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Filter Buttons */}
          <div className="flex gap-2 flex-wrap">
            {[
              { key: 'all', label: 'All', count: filteredScans.length },
              { key: 'pending', label: 'Ready for Matching', count: scans.filter(s => s.processingStatus === 'ocr_completed').length },
              { key: 'matched', label: 'Matched', count: scans.filter(s => s.processingStatus === 'matched').length },
              { key: 'failed', label: 'No Match', count: scans.filter(s => s.processingStatus === 'matching_failed').length },
            ].map(({ key, label, count }) => (
              <PokemonButton
                key={key}
                variant={filter === key ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setFilter(key as any)}
                className="text-xs"
              >
                {label} ({count})
              </PokemonButton>
            ))}
          </div>

          {/* Bulk Actions */}
          {pendingCount > 0 && (
            <div className="flex gap-2 items-center">
              {selectedCount > 0 && (
                <span className="text-sm text-gray-300">
                  {selectedCount} selected
                </span>
              )}
              
              <PokemonButton
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                disabled={pendingCount === 0}
              >
                Select All Pending
              </PokemonButton>
              
              {selectedCount > 0 && (
                <>
                  <PokemonButton
                    variant="outline"
                    size="sm"
                    onClick={handleClearSelection}
                  >
                    Clear
                  </PokemonButton>
                  
                  <PokemonButton
                    variant="primary"
                    size="sm"
                    onClick={handlePerformMatching}
                    disabled={isMatching}
                    loading={isMatching}
                  >
                    <Zap className="w-4 h-4 mr-1" />
                    Match Selected ({selectedCount})
                  </PokemonButton>
                </>
              )}
            </div>
          )}
        </div>
      </PokemonCard>

      {/* Scans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredScans.map((scan) => {
          const statusInfo = getStatusInfo(scan);
          const StatusIcon = statusInfo.icon;
          const isSelected = selectedScan?.imageHash === scan.imageHash;
          const isChecked = selectedScans.has(scan.imageHash);
          const canSelect = scan.processingStatus === 'ocr_completed';

          return (
            <PokemonCard
              key={scan.imageHash}
              className={`cursor-pointer transition-all transform hover:scale-105 ${
                isSelected 
                  ? 'ring-2 ring-cyan-400 bg-cyan-500/10' 
                  : 'hover:bg-white/5'
              }`}
              onClick={() => onScanSelect(scan)}
            >
              {/* Image */}
              <div className="aspect-[3/4] mb-4 bg-gray-800/30 rounded-lg overflow-hidden">
                <ImageProductView
                  images={[scan.fullImageUrl].filter(Boolean)}
                  title={scan.originalFileName}
                  subtitle="OCR Scan"
                  imageSource="psa-label"
                  variant="detail"
                  size="md"
                  showBadge={false}
                  showPrice={false}
                  enableInteractions={false}
                />
              </div>

              {/* Status Badge */}
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-3 ${statusInfo.bgColor} ${statusInfo.color}`}>
                <StatusIcon className="w-3 h-3" />
                {statusInfo.status}
              </div>

              {/* File Info */}
              <div className="mb-3">
                <h4 className="font-medium text-white truncate mb-1">
                  {scan.originalFileName}
                </h4>
                {scan.ocrText && (
                  <p className="text-xs text-gray-400 line-clamp-2">
                    {scan.ocrText.substring(0, 60)}...
                  </p>
                )}
              </div>

              {/* Confidence Score */}
              {scan.ocrConfidence && (
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>OCR Confidence</span>
                    <span>{(scan.ocrConfidence * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-1">
                    <div 
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 h-1 rounded-full transition-all duration-300"
                      style={{ width: `${scan.ocrConfidence * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Match Selection Checkbox */}
              {canSelect && (
                <div
                  className="flex items-center gap-2 mt-2 p-2 rounded-lg hover:bg-white/5"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleScanToggle(scan);
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => {}} // Controlled by onClick above
                    className="w-4 h-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500 focus:ring-2"
                  />
                  <span className="text-xs text-gray-300">
                    Select for matching
                  </span>
                </div>
              )}

              {/* Match Results Preview */}
              {scan.cardMatches && scan.cardMatches.length > 0 && (
                <div className="mt-3 pt-3 border-t border-white/10">
                  <p className="text-xs text-gray-400 mb-2">
                    Best Match:
                  </p>
                  <p className="text-sm text-white font-medium truncate">
                    {scan.cardMatches[0].cardName}
                  </p>
                  <p className="text-xs text-gray-400">
                    {scan.cardMatches[0].setName} #{scan.cardMatches[0].cardNumber}
                  </p>
                </div>
              )}
            </PokemonCard>
          );
        })}
      </div>

      {/* Empty State */}
      {filteredScans.length === 0 && (
        <PokemonCard className="p-12 text-center">
          <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">
            No scans found
          </h3>
          <p className="text-gray-400">
            No scans match the current filter. Try selecting a different filter.
          </p>
        </PokemonCard>
      )}
    </div>
  );
};