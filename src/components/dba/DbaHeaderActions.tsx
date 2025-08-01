/**
 * DBA Header Actions Component
 * Layer 3: Components (CLAUDE.md Architecture)
 */

import React from 'react';
import { Download } from 'lucide-react';

interface DbaHeaderActionsProps {
  onExportAll: () => void;
}

const DbaHeaderActions: React.FC<DbaHeaderActionsProps> = ({ onExportAll }) => {
  return (
    <button
      onClick={onExportAll}
      className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-6 py-3 rounded-2xl transition-all duration-300 inline-flex items-center shadow-lg hover:shadow-xl hover:scale-105"
    >
      <Download className="w-5 h-5 mr-2" />
      Export All
    </button>
  );
};

export default DbaHeaderActions;