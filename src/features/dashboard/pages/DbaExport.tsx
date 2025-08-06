/**
 * DBA.dk Export Page
 * Layer 4: Application Screen (CLAUDE.md Architecture)
 *
 * SOLID Principles:
 * - SRP: Only handles DBA export page orchestration
 * - OCP: Open for extension via component composition
 * - DIP: Depends on hook abstractions and component interfaces
 */

import React, { lazy, Suspense } from 'react';
import { PageLayout } from '../../../shared/components/layout/layouts/PageLayout';
import { useDbaExport } from '../../../shared/hooks/useDbaExport';
import LoadingSpinner from '../../../shared/components/molecules/common/LoadingSpinner';
import { PokemonCard } from '../../../shared/components/atoms/design-system/PokemonCard';

// Dynamic imports for heavy DBA components (code splitting optimization)
const DbaCosmicBackground = lazy(
  () =>
    import(
      /* webpackChunkName: "dba-heavy" */ '../components/dba/DbaCosmicBackground'
    )
);
const DbaHeaderGalaxyCosmic = lazy(
  () =>
    import(
      /* webpackChunkName: "dba-heavy" */ '../components/dba/DbaHeaderGalaxyCosmic'
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
const DbaEmptyStateCosmic = lazy(
  () =>
    import(
      /* webpackChunkName: "dba-heavy" */ '../components/dba/DbaEmptyStateCosmic'
    )
);

const DbaExport: React.FC = () => {
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
    console.log('Export all items:', items, mode);
    // Implement export all logic
  };

  return (
    <PageLayout loading={loading} error={error} variant="default">
      <Suspense fallback={<div className="fixed inset-0 bg-black/90" />}>
        <DbaCosmicBackground />
      </Suspense>

      {/* Use the new cosmic header component that wraps content */}
      <Suspense fallback={<LoadingSpinner size="lg" />}>
        <DbaHeaderGalaxyCosmic
          dbaSelections={dbaSelections}
          selectedItems={selectedItems}
        >
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
              <DbaEmptyStateCosmic
                psaCardsLength={psaCards.length}
                rawCardsLength={rawCards.length}
                sealedProductsLength={sealedProducts.length}
              />
            </div>
          </div>
        </DbaHeaderGalaxyCosmic>
      </Suspense>
    </PageLayout>
  );
};

export default DbaExport;
