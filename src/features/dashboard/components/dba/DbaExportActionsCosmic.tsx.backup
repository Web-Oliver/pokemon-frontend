/**
 * DBA Export Actions Component (Cosmic Theme)
 * Layer 3: Components (CLAUDE.md Architecture)
 *
 * SOLID Principles:
 * - SRP: Single responsibility for DBA export actions with cosmic theme
 * - DRY: Uses unified PokemonButton with cosmic variant
 */

import React from 'react';
import { FileDown, Zap } from 'lucide-react';
import { PokemonButton } from '../../../../shared/components/atoms/design-system/PokemonButton';

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
    <div className="flex gap-4 pt-6 border-t border-white/20">
      <PokemonButton
        onClick={onExportToDba}
        disabled={isExporting}
        variant="primary"
        size="lg"
        fullWidth
        loading={isExporting}
        className="py-5 text-lg font-bold"
      >
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mr-3 group-hover/btn:animate-bounce border border-cyan-400/30">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="text-white relative z-10">
            {isExporting ? 'Exporting...' : 'Export to DBA'}
          </span>
        </div>
      </PokemonButton>

      {hasExportResult && (
        <PokemonButton
          onClick={onDownloadZip}
          disabled={isExporting}
          variant="success"
          size="lg"
          fullWidth
          className="py-5 text-lg font-bold"
        >
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mr-3 group-hover/btn:animate-bounce border border-cyan-400/30">
              <FileDown className="w-5 h-5 text-cyan-200" />
            </div>
            <span className="text-cyan-200 relative z-10">Download Files</span>
          </div>
        </PokemonButton>
      )}
    </div>
  );
};

export default DbaExportActionsCosmic;
