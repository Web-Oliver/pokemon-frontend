/**
 * SOLID/DRY Implementation: OCR Matching Component - Refactored
 * 
 * SOLID Principles Applied:
 * - Single Responsibility: Each component has one clear purpose
 * - Open/Closed: Components are extensible through props and composition
 * - Liskov Substitution: Components can be replaced with compatible implementations
 * - Interface Segregation: Hooks provide specific, focused interfaces
 * - Dependency Inversion: Components depend on abstractions, not concretions
 * 
 * DRY Implementation:
 * - Reusable components eliminate code duplication
 * - Centralized design tokens and styling utilities
 * - Composable hooks for state management
 * - Consistent patterns across all UI elements
 */

import React, { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { PageLayout } from '../../../shared/components/layout/layouts/PageLayout';
import { PokemonPageContainer } from '../../../shared/components/atoms/design-system';
// Import existing shared components instead of duplicated modern-ui
import { PokemonCard, PokemonButton } from '../../../shared/components/atoms/design-system';
import HierarchicalCardSearch from '../../../shared/components/forms/sections/HierarchicalCardSearch';

// Layout Components (Single Responsibility)
import { HeroSection } from './layout/HeroSection';
import { WorkflowBreadcrumbs } from './layout/WorkflowBreadcrumbs';

// State Management Hooks (Interface Segregation)
import { useOcrWorkflowState } from '../hooks/useOcrWorkflowState';
import { useOcrDataState } from '../hooks/useOcrDataState';
import { useOcrMatching } from '../hooks/useOcrMatching';

// Business Logic Components (Dependency Inversion)
import {
  OcrImageUpload,
  ExtractedDataDisplay,
  SetRecommendations,
  MatchResults,
  PsaLabelResults,
  NoResults,
  createOcrMatchingService,
  IOcrMatchingService
} from './index';

// Feature-Specific Components (using existing components)
import { ManualOcrInput } from './sections/ManualOcrInput';
import { PsaBulkProcessing } from './sections/PsaBulkProcessing';
import { CardSearchInterface } from './sections/CardSearchInterface';
import { CardDetailView } from './sections/CardDetailView';

// Service Injection (Dependency Inversion Principle)
const ocrService: IOcrMatchingService = createOcrMatchingService();

export const OcrMatchingRefactored: React.FC = () => {
  // Separated State Management (Single Responsibility + Interface Segregation)
  const workflow = useOcrWorkflowState();
  const dataState = useOcrDataState();
  const { matchOcrText, processAllPsaLabels, loading, error: hookError } = useOcrMatching();
  
  // Form Management
  const form = useForm();

  // Business Logic Handlers (Single Responsibility)
  const handleImageSelect = useCallback(async (file: File) => {
    dataState.setSelectedImage(file);
    dataState.setIsProcessing(true);
    
    try {
      const result = await ocrService.processImage(file);
      dataState.updateProcessingResults(result);
    } catch (error) {
      console.error('Image processing failed:', error);
      dataState.setIsProcessing(false);
    }
  }, [dataState]);

  const handleOcrTextSubmit = useCallback(async () => {
    if (!dataState.ocrText.trim()) return;
    
    dataState.setIsProcessing(true);
    try {
      const result = await matchOcrText(dataState.ocrText);
      dataState.updateProcessingResults(result);
    } catch (error) {
      console.error('OCR text processing failed:', error);
      dataState.setIsProcessing(false);
    }
  }, [dataState.ocrText, matchOcrText, dataState]);

  const handleBulkProcessing = useCallback(async () => {
    dataState.setIsProcessing(true);
    workflow.setWorkflowStep('start');
    
    try {
      const result = await processAllPsaLabels();
      dataState.setPsaLabelResults(result.results || []);
      if (result.results && result.results.length > 0) {
        workflow.setWorkflowStep('results');
      }
    } catch (error) {
      console.error('Bulk processing failed:', error);
    } finally {
      dataState.setIsProcessing(false);
    }
  }, [dataState, workflow, processAllPsaLabels]);

  const handleCardFromSearch = useCallback((selectionData: any) => {
    // Handle hierarchical search results
    let cardData = selectionData.secondary || selectionData;
    if (!cardData) return;

    // Update form fields
    if (cardData.displayName || cardData.cardName) {
      form.setValue('cardName', cardData.displayName || cardData.cardName);
      form.clearErrors('cardName');
    }

    // Auto-fill additional fields
    const cardNumber = cardData.cardNumber || cardData.cardNumb;
    if (cardNumber) {
      form.setValue('cardNumber', cardNumber);
      form.clearErrors('cardNumber');
    }

    if (cardData.variety) {
      form.setValue('variety', cardData.variety);
      form.clearErrors('variety');
    }

    if (cardData._id || cardData.id) {
      form.setValue('cardId', cardData._id || cardData.id);
      form.clearErrors('cardId');
    }

    // Update selected card state
    workflow.setSelectedCard({
      card: {
        cardName: cardData.displayName || cardData.cardName || 'Unknown Card',
        cardNumber: cardNumber || '???',
        variety: cardData.variety || null,
        rarity: cardData.rarity || null,
        _id: cardData._id || cardData.id || null
      }
    });
  }, [form, workflow]);

  // Render Methods (Open/Closed Principle - Extensible through composition)
  const renderUploadTab = () => (
    <>
      <OcrImageUpload
        selectedImage={dataState.selectedImage}
        isProcessing={dataState.isProcessing}
        onImageSelect={handleImageSelect}
        onUseDemo={async () => {/* Demo logic */}}
      />
      
      <ManualOcrInput
        ocrText={dataState.ocrText}
        isProcessing={dataState.isProcessing}
        onTextChange={dataState.setOcrText}
        onSubmit={handleOcrTextSubmit}
        onClear={() => dataState.setOcrText('')}
      />
      
      {dataState.hasResults && (
        <>
          {dataState.extractedData && (
            <ExtractedDataDisplay extractedData={dataState.extractedData} />
          )}
          
          <SetRecommendations
            setRecommendations={dataState.setRecommendations}
            matches={dataState.matches}
            selectedSetName={dataState.selectedSetName}
            onSetSelect={(setName, filtered) => {
              dataState.setSelectedSetName(setName);
              dataState.setFilteredMatches(filtered);
            }}
            onShowAllSets={() => {
              dataState.setSelectedSetName(null);
              dataState.setFilteredMatches(null);
            }}
          />
          
          <MatchResults
            matches={dataState.matches}
            filteredMatches={dataState.filteredMatches}
            selectedMatch={dataState.selectedMatch}
            selectedSetName={dataState.selectedSetName}
            confidence={dataState.confidence}
            setRecommendations={dataState.setRecommendations}
            onMatchSelect={dataState.setSelectedMatch}
            onEditMatch={(match) => {
              dataState.setSelectedMatch(match);
              workflow.setIsEditingCard(true);
            }}
            onManualSelection={() => workflow.setIsEditingCard(true)}
          />
        </>
      )}
      
      {dataState.showNoResults && (
        <NoResults onManualSearch={() => workflow.setIsEditingCard(true)} />
      )}
    </>
  );

  const renderBulkTab = () => (
    <>
      <WorkflowBreadcrumbs
        currentStep={workflow.workflowStep}
        onGoBack={workflow.goBack}
      />
      
      {workflow.workflowStep === 'start' && (
        <PsaBulkProcessing
          isProcessing={dataState.isProcessing}
          resultCount={dataState.psaLabelResults.length}
          onStartProcessing={handleBulkProcessing}
          onClearResults={() => dataState.setPsaLabelResults([])}
        />
      )}
      
      {workflow.workflowStep === 'results' && (
        <PsaLabelResults
          psaLabelResults={dataState.psaLabelResults}
          selectedPsaLabel={null}
          onSelectPsaLabel={workflow.handlePsaCardSelect}
          onEditPsaLabel={(result) => {
            workflow.setSelectedCard({
              card: {
                cardName: 'Unknown Card',
                setName: 'Unknown Set',
                cardNumber: '???',
                variety: null,
                rarity: null,
                _id: null
              },
              psaLabel: result
            });
            workflow.setWorkflowStep('edit-card');
          }}
          onDeletePsaLabel={(psaLabelId) => {
            // Filter out the deleted label
            const updatedResults = dataState.psaLabelResults.filter(
              result => result.psaLabelId !== psaLabelId
            );
            dataState.setPsaLabelResults(updatedResults);
          }}
        />
      )}
      
      {workflow.workflowStep === 'card-detail' && workflow.selectedCard && (
        <CardDetailView
          selectedCard={workflow.selectedCard}
          onEdit={workflow.handleEditCard}
          onProceedToGrading={workflow.proceedToGrading}
        />
      )}
      
      {workflow.workflowStep === 'edit-card' && workflow.selectedCard && (
        <CardSearchInterface
          selectedCard={workflow.selectedCard}
          form={form}
          onCardFromSearch={handleCardFromSearch}
          onReset={() => {
            form.reset();
            Object.keys(form.getValues()).forEach(key => form.clearErrors(key));
          }}
          onConfirm={() => {
            if (form.watch('setName') && form.watch('cardName')) {
              workflow.setWorkflowStep('card-detail');
              workflow.setIsEditingCard(false);
            }
          }}
        />
      )}
      
      {workflow.workflowStep === 'grade-input' && workflow.selectedCard && (
        <GradeInputForm
          selectedCard={workflow.selectedCard}
          gradeValue={dataState.gradeValue}
          priceValue={dataState.priceValue}
          dateValue={dataState.dateValue}
          onGradeChange={dataState.setGradeValue}
          onPriceChange={dataState.setPriceValue}
          onDateChange={dataState.setDateValue}
          onSubmit={() => {
            console.log('Final submission:', {
              card: workflow.selectedCard,
              grade: dataState.gradeValue,
              price: dataState.priceValue,
              date: dataState.dateValue
            });
            workflow.setWorkflowStep('complete');
          }}
        />
      )}
    </>
  );

  return (
    <PageLayout>
      <PokemonPageContainer withParticles={true} withNeural={true}>
        <div className="w-full max-w-none mx-auto space-y-12 relative px-6 sm:px-8 lg:px-12">
          
          {/* Hero Section with Tab Navigation */}
          <HeroSection
            activeTab={workflow.activeTab}
            onTabChange={workflow.setActiveTab}
            psaResultsCount={dataState.psaLabelResults.length}
          />

          {/* Tab Content */}
          {workflow.activeTab === 'upload' && renderUploadTab()}
          {workflow.activeTab === 'bulk' && renderBulkTab()}

          {/* Error Display */}
          {hookError && (
            <PokemonCard variant="outlined" className="bg-red-900/20 border-red-500/30">
              <div className="p-6">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-red-300">Processing Error</h3>
                    <p className="text-red-400 mt-1">{hookError}</p>
                  </div>
                </div>
              </div>
            </PokemonCard>
          )}

        </div>
      </PokemonPageContainer>
    </PageLayout>
  );
};