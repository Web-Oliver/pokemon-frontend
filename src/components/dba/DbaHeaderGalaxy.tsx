/**
 * DBA Header Galaxy Component - MIGRATED TO UNIFIED SYSTEM
 * Layer 3: Components (CLAUDE.md Architecture)
 *
 * SOLID Principles:
 * - SRP: Single responsibility for DBA stats display (now uses UnifiedHeader)
 * - OCP: Open for extension via UnifiedHeader props system
 * - DIP: Depends on UnifiedHeader abstraction
 * - DRY: Eliminates duplicate header styling code
 */

import React from 'react';
import { Archive, Clock, AlertTriangle, CheckSquare } from 'lucide-react';
import UnifiedHeader, { HeaderStat } from '../common/UnifiedHeader';

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

  // Create stats for UnifiedHeader
  const stats: HeaderStat[] = [
    {
      icon: Clock,
      label: 'Queue',
      value: dbaSelections?.length || 0,
      variant: 'default',
    },
    {
      icon: AlertTriangle,
      label: 'Urgent',
      value: urgentCount,
      variant: 'danger',
    },
    {
      icon: CheckSquare,
      label: 'Selected',
      value: selectedItems?.length || 0,
      variant: 'success',
    },
  ];

  return (
    <UnifiedHeader
      title="DBA Export"
      subtitle="Export your collection items to DBA.dk"
      icon={Archive}
      variant="card"
      size="md"
      stats={stats}
      className="mb-6"
    />
  );
};

export default DbaHeaderGalaxy;
