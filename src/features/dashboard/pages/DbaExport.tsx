/**
 * DBA.dk Export Page
 * Layer 4: Application Screen (CLAUDE.md Architecture)
 *
 * SOLID Principles:
 * - SRP: Only handles DBA export page orchestration
 * - OCP: Open for extension via component composition
 * - DIP: Depends on hook abstractions and component interfaces
 * - CONSOLIDATED: Now uses UnifiedHeader instead of DbaHeaderGalaxyCosmic
 */

import React, { lazy, Suspense } from 'react';
import { Archive, Clock, AlertTriangle, CheckSquare } from 'lucide-react';
import ErrorBoundary from '../../../shared/components/organisms/ui/ErrorBoundary';
import { PageLayout } from '../../../shared/components/layout/layouts/PageLayout';
import { useDbaExport } from '../../../shared/hooks/useDbaExport';
import GenericLoadingState from '../../../shared/components/molecules/common/GenericLoadingState';
import { PokemonCard } from '../../../shared/components/atoms/design-system/PokemonCard';

// CONSOLIDATED: Direct import instead of lazy to debug the issue
import UnifiedHeader from '../../../shared/components/molecules/common/UnifiedHeader';

// Dynamic imports for heavy DBA components (code splitting optimization)
const DbaCosmicBackground = lazy(
  () =>
    import(
      /* webpackChunkName: "dba-heavy" */ '../components/dba/DbaCosmicBackground'
    )
);

const DbaHeaderActions = lazy(
  () =>
    import(
      /* webpackChunkName: "dba-heavy" */ '../components/dba/DbaHeaderActions'
    )
);
const DbaExportConfiguration = lazy(
  () =>
    import(
      /* webpackChunkName: "dba-heavy" */ '../components/dba/DbaExportConfiguration'
    )
);
const DbaExportSuccess = lazy(
  () =>
    import(
      /* webpackChunkName: "dba-heavy" */ '../components/dba/DbaExportSuccess'
    )
);
const DbaItemsWithTimers = lazy(
  () =>
    import(
      /* webpackChunkName: "dba-heavy" */ '../components/dba/DbaItemsWithTimers'
    )
);
const DbaItemsWithoutTimers = lazy(
  () =>
    import(
      /* webpackChunkName: "dba-heavy" */ '../components/dba/DbaItemsWithoutTimers'
    )
);
// Using unified EmptyState component
import EmptyState from '../../../shared/components/molecules/common/EmptyState';

const DbaExport: React.FC = () => {
  // Production: Debug statement removed for security
  const {
    psaCards,
    rawCards,
    sealedProducts,
    loading,
    selectedItems,
    customDescription,
    setCustomDescription,
    isExporting,
    exportResult,
    dbaSelections,
    error,
    getDbaInfo,
    getItemDisplayName,
    generateDefaultTitle,
    generateDefaultDescription,
    handleItemToggle,
    updateItemCustomization,
    handleExportToDba,
    downloadZip,
  } = useDbaExport();

  // Production: Debug statement removed for security

  // CONSOLIDATED: Stats calculation matching original DbaHeaderGalaxyCosmic
  const urgentCount =
    dbaSelections?.filter((s) => s.daysRemaining <= 10).length || 0;

  // CONSOLIDATED: Header stats configuration for UnifiedHeader
  const headerStats = [
    {
      icon: Clock,
      label: 'Queue',
      value: dbaSelections?.length || 0,
      variant: 'default' as const,
    },
    {
      icon: AlertTriangle,
      label: 'Urgent',
      value: urgentCount,
      variant: 'danger' as const,
    },
    {
      icon: CheckSquare,
      label: 'Selected',
      value: selectedItems.length,
      variant: 'success' as const,
    },
  ];

  // Render item card with DBA item card component
  const renderItemCard = (item: any, type: 'psa' | 'raw' | 'sealed') => {
    const itemId = item.id || item._id;
    const isSelected = selectedItems.some((selected) => selected.id === itemId);
    const displayName = getItemDisplayName(item, type);
    const dbaInfo = getDbaInfo(itemId, type);

    let subtitle = '';
    if (type === 'psa' && item.grade) {
      subtitle = `PSA ${item.grade}`;
    } else if (type === 'raw' && item.condition) {
      subtitle = item.condition;
    } else if (type === 'sealed' && item.category) {
      subtitle = item.category;
    }

    return (
      <PokemonCard
        key={itemId}
        cardType="dba"
        compact={true}
        cosmic={true}
        item={item}
        itemType={type}
        isSelected={isSelected}
        dbaInfo={dbaInfo}
        displayName={displayName}
        subtitle={subtitle}
        onToggle={handleItemToggle}
      />
    );
  };

  const allItems = [...psaCards, ...rawCards, ...sealedProducts];
  const exportCollectionData = (items: any[], mode: string) => {
    // Production: Debug statement removed for security
    // Implement export all logic
  };

  try {
    // Production: Debug statement removed for security
    
    return (
      <PageLayout loading={loading} error={error} variant="default">
        <Suspense fallback={<div className="fixed inset-0 bg-black/90" />}>
          <DbaCosmicBackground />
        </Suspense>

        {/* CONSOLIDATED: UnifiedHeader replaces DbaHeaderGalaxyCosmic */}
        <ErrorBoundary fallback={<div className="p-4 bg-yellow-100 text-yellow-800">UnifiedHeader failed to load</div>}>
          <UnifiedHeader
            title="DBA Export"
            subtitle="Export your collection items to DBA.dk"
            icon={Archive}
            variant="cosmic"
            size="lg"
            stats={headerStats}
            className="mb-6"
          />
        </ErrorBoundary>

      {/* Content wrapper with original cosmic background styling */}
      <div className="relative z-10 p-8">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* 🎛️ QUANTUM EXPORT CONFIGURATION */}
          <DbaExportConfiguration
            selectedItems={selectedItems}
            customDescription={customDescription}
            setCustomDescription={setCustomDescription}
            updateItemCustomization={updateItemCustomization}
            generateTitle={generateDefaultTitle}
            generateDescription={generateDefaultDescription}
            exportCollectionData={handleExportToDba}
            downloadZip={downloadZip}
            isExporting={isExporting}
            exportResult={exportResult}
          />

          <DbaExportSuccess exportResult={exportResult} />

          {/* Item Selection - Split into 2 sections */}
          <div className="space-y-8">
            {/* Section 1: Items with DBA Timers (Previously Selected) */}
            <DbaItemsWithTimers
              psaCards={psaCards}
              rawCards={rawCards}
              sealedProducts={sealedProducts}
              getDbaInfo={getDbaInfo}
              renderItemCard={renderItemCard}
            />

            {/* Section 2: Items without DBA Timers (Available for Selection) */}
            <DbaItemsWithoutTimers
              psaCards={psaCards}
              rawCards={rawCards}
              sealedProducts={sealedProducts}
              getDbaInfo={getDbaInfo}
              renderItemCard={renderItemCard}
            />
          </div>

          {/* 🌌 COSMIC EMPTY STATE */}
          <EmptyState
            variant="cosmic"
            size="xl"
            title="No Items Found"
            psaCardsLength={psaCards.length}
            rawCardsLength={rawCards.length}
            sealedProductsLength={sealedProducts.length}
          />
        </div>
      </div>
    </PageLayout>
  );
  } catch (error) {
    // Production: Debug statement removed for security
    return (
      <div className="p-8 bg-red-100 text-red-800">
        <h2>DbaExport Error</h2>
        <pre>{String(error)}</pre>
      </div>
    );
  }
};

export default DbaExport;