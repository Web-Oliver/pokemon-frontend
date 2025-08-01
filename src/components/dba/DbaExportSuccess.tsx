/**
 * DBA Export Success Notification Component
 * Layer 3: Components (CLAUDE.md Architecture)
 * 
 * SOLID Principles:
 * - SRP: Single responsibility for displaying export success notification
 * - OCP: Open for extension via props interface
 * - DIP: Depends on abstractions via props interface
 */

import React from 'react';
import { CheckCircle } from 'lucide-react';

interface DbaExportSuccessProps {
  exportResult: {
    itemCount: number;
    dataFolder: string;
  } | null;
}

const DbaExportSuccess: React.FC<DbaExportSuccessProps> = ({ exportResult }) => {
  if (!exportResult) {
    return null;
  }

  return (
    <div className="mt-6">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center">
          <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
          <div>
            <h3 className="text-lg font-semibold text-green-800">
              Export Complete
            </h3>
            <p className="text-green-700 text-sm mt-1">
              Successfully generated {exportResult.itemCount} DBA posts
            </p>
            <p className="text-green-600 text-xs mt-1">
              Files saved to: {exportResult.dataFolder}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DbaExportSuccess;