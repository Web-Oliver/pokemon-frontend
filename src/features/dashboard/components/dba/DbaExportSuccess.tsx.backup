/**
 * DBA Export Success Notification Component
 * Layer 3: Components (CLAUDE.md Architecture)
 *
 * SOLID Principles:
 * - SRP: Single responsibility for displaying export success notification
 * - OCP: Open for extension via props interface
 * - DIP: Depends on abstractions via props interface
 *
 * Updated to use unified design system with glassmorphism styling
 */

import React from 'react';
import { CheckCircle } from 'lucide-react';
import { PokemonCard } from '../../../../shared/components/atoms/design-system/PokemonCard';

interface DbaExportSuccessProps {
  exportResult: {
    itemCount: number;
    dataFolder: string;
  } | null;
}

const DbaExportSuccess: React.FC<DbaExportSuccessProps> = ({
  exportResult,
}) => {
  if (!exportResult) {
    return null;
  }

  return (
    <div className="mt-6">
      <PokemonCard 
        variant="glass" 
        size="md" 
        status="success"
        className="border-emerald-400/30 bg-gradient-to-br from-emerald-500/10 via-cyan-500/5 to-emerald-500/10"
      >
        <div className="flex items-center">
          <CheckCircle className="w-5 h-5 text-emerald-400 mr-3 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-1">
              Export Complete
            </h3>
            <p className="text-cyan-200 text-sm mb-2">
              Successfully generated {exportResult.itemCount} DBA posts
            </p>
            <p className="text-white/70 text-xs">
              Files saved to: {exportResult.dataFolder}
            </p>
          </div>
        </div>
      </PokemonCard>
    </div>
  );
};

export default DbaExportSuccess;
