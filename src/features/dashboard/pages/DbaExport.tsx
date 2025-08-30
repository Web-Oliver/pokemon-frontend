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
import { AlertTriangle, Archive, CheckSquare, Clock } from 'lucide-react';
import ErrorBoundary from '@/shared/components/organisms/ui/ErrorBoundary';
import { PageLayout } from '@/shared/components/layout/layouts/PageLayout';
import { PokemonPageContainer, PokemonCard } from '@/shared/components/atoms/design-system';
import { useDbaExport } from '@/shared/hooks/useDbaExport';

// CONSOLIDATED: Direct import instead of lazy to debug the issue
import UnifiedHeader from '@/shared/components/molecules/common/UnifiedHeader';
// Using unified EmptyState component
import EmptyState from '@/shared/components/molecules/common/EmptyState';

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
      <PageLayout>
        <PokemonPageContainer withParticles={true} withNeural={true}>
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <PokemonCard
              variant="glass"
              size="xl"
              className="text-white relative overflow-hidden"
            >
              <div className="relative z-20">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h1 className="text-3xl sm:text-4xl font-black mb-3 tracking-tight bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                      DBA Export
                    </h1>
                    <p className="text-cyan-100/90 text-lg sm:text-xl font-medium">
                      Export your collection items to DBA.dk
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    {headerStats.map((stat, index) => (
                      <div key={index} className="flex items-center bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20">
                        <stat.icon className="w-5 h-5 mr-2 text-cyan-300" />
                        <div>
                          <div className="text-lg font-bold text-white">{stat.value}</div>
                          <div className="text-xs text-cyan-200">{stat.label}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Error Display */}
                {error && (
                  <div className="mt-6 bg-red-900/30 backdrop-blur-sm border border-red-500/50 rounded-2xl p-4 shadow-lg">
                    <div className="flex items-center space-x-3">
                      <div className="text-red-400 text-sm font-medium bg-red-900/50 px-3 py-1 rounded-xl border border-red-500/30">
                        Error
                      </div>
                      <span className="text-red-300 font-medium">
                        {error}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </PokemonCard>

            {/* Loading State */}
            {loading && (
              <PokemonCard variant="glass" size="xl">
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
                </div>
              </PokemonCard>
            )}

            {/* Content */}
            {!loading && (
              <>
                {/* Export Configuration */}
                <Suspense fallback={
                  <PokemonCard variant="glass" size="lg">
                    <div className="flex justify-center py-10">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
                    </div>
                  </PokemonCard>
                }>
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
                </Suspense>

                <DbaExportSuccess exportResult={exportResult} />

                {/* Item Selection - Split into 2 sections */}
                <div className="space-y-8">
                  {/* Section 1: Items with DBA Timers (Previously Selected) */}
                  <Suspense fallback={
                    <PokemonCard variant="glass" size="lg">
                      <div className="flex justify-center py-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
                      </div>
                    </PokemonCard>
                  }>
                    <DbaItemsWithTimers
                      psaCards={psaCards}
                      rawCards={rawCards}
                      sealedProducts={sealedProducts}
                      getDbaInfo={getDbaInfo}
                      renderItemCard={renderItemCard}
                    />
                  </Suspense>

                  {/* Section 2: Items without DBA Timers (Available for Selection) */}
                  <Suspense fallback={
                    <PokemonCard variant="glass" size="lg">
                      <div className="flex justify-center py-10">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
                      </div>
                    </PokemonCard>
                  }>
                    <DbaItemsWithoutTimers
                      psaCards={psaCards}
                      rawCards={rawCards}
                      sealedProducts={sealedProducts}
                      getDbaInfo={getDbaInfo}
                      renderItemCard={renderItemCard}
                    />
                  </Suspense>
                </div>

                {/* Empty State */}
                {(psaCards.length === 0 && rawCards.length === 0 && sealedProducts.length === 0) && (
                  <PokemonCard variant="glass" size="xl">
                    <div className="text-center py-20">
                      <Archive className="w-16 h-16 text-cyan-300/50 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold text-white mb-4">
                        No Items Found
                      </h3>
                      <p className="text-cyan-100/70 max-w-md mx-auto">
                        Add items to your collection to start exporting to DBA.dk
                      </p>
                    </div>
                  </PokemonCard>
                )}
              </>
            )}
          </div>
        </PokemonPageContainer>
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
