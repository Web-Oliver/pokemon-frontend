/**
 * DBA Export Actions Component
 * Layer 3: Components (CLAUDE.md Architecture)
 */

import React from 'react';
import { Zap, FileDown } from 'lucide-react';
import { PokemonButton } from '../design-system/PokemonButton';

interface DbaExportActionsProps {
  onExportToDba: () => void;
  onDownloadZip: () => void;
  isExporting: boolean;
  hasExportResult: boolean;
}

const DbaExportActions: React.FC<DbaExportActionsProps> = ({
  onExportToDba,
  onDownloadZip,
  isExporting,
  hasExportResult,
}) => {
  return (
    <div className="flex gap-4 pt-6 border-t border-zinc-700/50">
      <PokemonButton
        onClick={onExportToDba}
        disabled={isExporting}
        className="group/btn relative flex-1 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-700 text-white px-8 py-5 rounded-2xl transition-all duration-500 inline-flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.3)] hover:shadow-[0_0_60px_rgba(16,185,129,0.5)] hover:scale-105 border border-emerald-400/20 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-bold"
      >
        <div className="w-8 h-8 bg-gradient-to-r from-white/20 to-emerald-200/20 rounded-full flex items-center justify-center mr-3 group-hover/btn:animate-bounce">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <span className="text-white">
          {isExporting ? 'Exporting...' : 'Export to DBA'}
        </span>
      </PokemonButton>

      {hasExportResult && (
        <button
          onClick={onDownloadZip}
          disabled={isExporting}
          className="relative w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-700 hover:via-teal-700 hover:to-cyan-700 text-white px-8 py-5 rounded-2xl transition-all duration-500 inline-flex items-center justify-center shadow-[0_0_40px_rgba(16,185,129,0.3)] hover:shadow-[0_0_60px_rgba(16,185,129,0.5)] hover:scale-105 border border-emerald-400/20 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-bold"
        >
          <div className="w-8 h-8 bg-gradient-to-r from-white/20 to-emerald-200/20 rounded-full flex items-center justify-center mr-3 group-hover/btn:animate-bounce">
            <FileDown className="w-5 h-5 text-white" />
          </div>
          <span className="text-white">Download Files</span>
        </button>
      )}
    </div>
  );
};

export default DbaExportActions;
