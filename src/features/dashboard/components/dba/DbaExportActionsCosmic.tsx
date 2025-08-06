/**
 * DBA Export Actions Component (Cosmic Theme)
 * Layer 3: Components (CLAUDE.md Architecture)
 *
 * SOLID Principles:
 * - SRP: Single responsibility for DBA export actions with cosmic theme
 * - DRY: Uses unified PokemonButton with cosmic variant
 */

import React from 'react';
import { Zap, FileDown } from 'lucide-react';
import { PokemonButton } from '../design-system/PokemonButton';

interface DbaExportActionsCosmicProps {
  onExportToDba: () => void;
  onDownloadZip: () => void;
  isExporting: boolean;
  hasExportResult: boolean;
}

const DbaExportActionsCosmic: React.FC<DbaExportActionsCosmicProps> = ({
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
        variant="cosmic"
        size="lg"
        fullWidth
        loading={isExporting}
        icon={<Zap className="w-5 h-5" />}
        iconPosition="left"
        rounded="xl"
        className="py-5 text-lg font-bold group/btn"
      >
        <div className="w-8 h-8 bg-gradient-to-r from-white/20 to-emerald-200/20 rounded-full flex items-center justify-center mr-3 group-hover/btn:animate-bounce">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <span className="text-white">
          {isExporting ? 'Exporting...' : 'Export to DBA'}
        </span>
      </PokemonButton>

      {hasExportResult && (
        <PokemonButton
          onClick={onDownloadZip}
          disabled={isExporting}
          variant="cosmic"
          size="lg"
          fullWidth
          icon={<FileDown className="w-5 h-5" />}
          iconPosition="left"
          rounded="xl"
          className="py-5 text-lg font-bold group/btn"
        >
          <div className="w-8 h-8 bg-gradient-to-r from-white/20 to-emerald-200/20 rounded-full flex items-center justify-center mr-3 group-hover/btn:animate-bounce">
            <FileDown className="w-5 h-5 text-white" />
          </div>
          <span className="text-white">Download Files</span>
        </PokemonButton>
      )}
    </div>
  );
};

export default DbaExportActionsCosmic;
