/**
 * DBA.dk Export Page
 * Layer 4: Application Screen (CLAUDE.md Architecture)
 * 
 * SOLID Principles:
 * - SRP: Only handles DBA export page orchestration
 * - OCP: Open for extension via component composition
 * - DIP: Depends on hook abstractions and component interfaces
 */

import React from 'react';
import { PageLayout } from '../components/layouts/PageLayout';
import { useDbaExport } from '../hooks/useDbaExport';

// DBA Components
import DbaCosmicBackground from '../components/dba/DbaCosmicBackground';
import DbaHeaderGalaxy from '../components/dba/DbaHeaderGalaxy';
import DbaHeaderActions from '../components/dba/DbaHeaderActions';
import DbaExportConfiguration from '../components/dba/DbaExportConfiguration';
import DbaExportSuccess from '../components/dba/DbaExportSuccess';
import DbaItemsWithTimers from '../components/dba/DbaItemsWithTimers';
import DbaItemsWithoutTimers from '../components/dba/DbaItemsWithoutTimers';
import DbaEmptyState from '../components/dba/DbaEmptyState';
import DbaCompactCard from '../components/dba/DbaCompactCard';

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
      <DbaCompactCard
        key={itemId}
        item={item}
        type={type}
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

  const headerActions = (
    <DbaHeaderActions onExportAll={() => exportCollectionData(allItems, 'all')} />
  );

  return (
    <PageLayout
      title="DBA Export Galaxy"
      subtitle="Transform your collection items into perfect DBA.dk posts with cosmic precision"
      loading={loading}
      error={error}
      actions={headerActions}
      variant="default"
    >
      <DbaCosmicBackground />

      <div className="relative z-10 p-8">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* 🏆 AWARD-WINNING HEADER GALAXY */}
          <DbaHeaderGalaxy dbaSelections={dbaSelections} selectedItems={selectedItems} />

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
          <DbaEmptyState
            psaCardsLength={psaCards.length}
            rawCardsLength={rawCards.length}
            sealedProductsLength={sealedProducts.length}
          />
        </div>
      </div>
    </PageLayout>
  );
};

export default DbaExport;