/**
 * DBA Header Galaxy Component
 * Layer 3: Components (CLAUDE.md Architecture)
 *
 * SOLID Principles:
 * - SRP: Single responsibility for displaying the cosmic header with stats
 * - OCP: Open for extension via props interface
 * - DIP: Depends on abstractions via props interface
 */

import React from 'react';
import { Archive, Clock, AlertTriangle, CheckSquare } from 'lucide-react';

interface DbaHeaderGalaxyProps {
  dbaSelections: any[];
  selectedItems: any[];
}

const DbaHeaderGalaxy: React.FC<DbaHeaderGalaxyProps> = ({
  dbaSelections,
  selectedItems,
}) => {
  const urgentCount =
    dbaSelections?.filter((s) => s.daysRemaining <= 10).length || 0;

  return (
    <div className="bg-zinc-800 rounded-lg border border-zinc-700 p-4 sm:p-6 mb-6">
      {/* Mobile Layout */}
      <div className="block lg:hidden">
        <div className="flex items-center mb-4">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
            <Archive className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">DBA Export</h1>
            <p className="text-sm text-zinc-400">Export to DBA.dk</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="bg-zinc-700 rounded-lg p-3 text-center">
            <Clock className="w-4 h-4 text-blue-400 mx-auto mb-1" />
            <p className="text-xs text-zinc-400">Queue</p>
            <p className="text-lg font-bold text-white">
              {dbaSelections?.length || 0}
            </p>
          </div>

          <div className="bg-red-900/30 rounded-lg p-3 text-center">
            <AlertTriangle className="w-4 h-4 text-red-400 mx-auto mb-1" />
            <p className="text-xs text-red-400">Urgent</p>
            <p className="text-lg font-bold text-white">{urgentCount}</p>
          </div>

          <div className="bg-green-900/30 rounded-lg p-3 text-center">
            <CheckSquare className="w-4 h-4 text-green-400 mx-auto mb-1" />
            <p className="text-xs text-green-400">Selected</p>
            <p className="text-lg font-bold text-white">
              {selectedItems.length}
            </p>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-4">
            <Archive className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">DBA Export</h1>
            <p className="text-zinc-400">
              Export your collection items to DBA.dk
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="bg-zinc-700 rounded-lg p-4 text-center min-w-[80px]">
            <Clock className="w-5 h-5 text-blue-400 mx-auto mb-1" />
            <p className="text-xs text-zinc-400">Queue</p>
            <p className="text-xl font-bold text-white">
              {dbaSelections?.length || 0}
            </p>
          </div>

          <div className="bg-red-900/30 rounded-lg p-4 text-center min-w-[80px]">
            <AlertTriangle className="w-5 h-5 text-red-400 mx-auto mb-1" />
            <p className="text-xs text-red-400">Urgent</p>
            <p className="text-xl font-bold text-white">{urgentCount}</p>
          </div>

          <div className="bg-green-900/30 rounded-lg p-4 text-center min-w-[80px]">
            <CheckSquare className="w-5 h-5 text-green-400 mx-auto mb-1" />
            <p className="text-xs text-green-400">Selected</p>
            <p className="text-xl font-bold text-white">
              {selectedItems.length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DbaHeaderGalaxy;
