import React, { useState, useEffect } from 'react';
import { Search, Check, ArrowRight, Award, Eye, Edit3 } from 'lucide-react';
import { useMatchingWorkflow } from '@/domains/icr/hooks/useMatchingWorkflow';
import { MatchingGrid } from './sections/MatchingGrid';
import { MatchingDetailsPanel } from './sections/MatchingDetailsPanel';
import { PokemonCard } from '@/shared/components/atoms/design-system/PokemonCard';
import { PokemonButton } from '@/shared/components/atoms/design-system/PokemonButton';
import EmptyState from '@/shared/components/molecules/common/EmptyState';
import NetworkErrorState from '@/shared/components/molecules/common/NetworkErrorState';
import GenericLoadingState from '@/shared/components/molecules/common/GenericLoadingState';
import { ImageProductView } from '@/shared/components/molecules/common/ImageProductView';

// STEP TYPES - SIMPLIFIED TO 2 STEPS (2025 UX BEST PRACTICE)
enum MatchingStep {
  SELECT_CARD = 'select_card',
  CREATE_PSA = 'create_psa'
}

// STEP DEFINITIONS - SIMPLIFIED TO 2 STEPS (2025 UX BEST PRACTICE)
const STEP_DEFINITIONS = [
  {
    id: MatchingStep.SELECT_CARD,
    title: '1. Select & Review',
    description: 'Choose card and review OCR details',
    icon: Search
  },
  {
    id: MatchingStep.CREATE_PSA,
    title: '2. Create PSA Card',
    description: 'Complete PSA graded card entry',
    icon: Award
  }
];

/**
 * PROGRESSIVE DISCLOSURE WORKFLOW
 * Following UX best practices with step-by-step guidance
 */
export const MatchingInterface: React.FC = () => {
  const {
    scansReadyForMatching,
    isLoading,
    error,
    selectedScan,
    setSelectedScan,
    createPsaCard,
    isCreating,
    getScanDetails
  } = useMatchingWorkflow();

  const [currentStep, setCurrentStep] = useState<MatchingStep>(MatchingStep.SELECT_CARD);
  const [completedSteps, setCompletedSteps] = useState<Set<MatchingStep>>(new Set());
  const [detailedScan, setDetailedScan] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Debug state changes
  useEffect(() => {
    console.log('🔥 STEP CHANGED TO:', currentStep);
    console.log('🔥 AVAILABLE STEPS:', Object.values(MatchingStep));
  }, [currentStep]);

  // LOADING STATE
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <GenericLoadingState message="Loading matched cards ready for PSA creation..." />
      </div>
    );
  }

  // ERROR STATE
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <NetworkErrorState 
          message="Failed to load matching data"
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  // EMPTY STATE
  if (!scansReadyForMatching?.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="container mx-auto px-6 py-12">
          <EmptyState
            icon={Search}
            title="No Matched Cards Available"
            description="Complete the full OCR workflow (Upload → Extract → Stitch → OCR → Match) first to have matched cards ready for PSA creation."
            actionLabel="Go to OCR Workflow"
            onAction={() => window.location.href = '/ocr'}
          />
        </div>
      </div>
    );
  }

  // STEP NAVIGATION
  const goToStep = (step: MatchingStep) => {
    setCurrentStep(step);
  };

  const goNext = () => {
    const stepOrder = Object.values(MatchingStep);
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex < stepOrder.length - 1) {
      const nextStep = stepOrder[currentIndex + 1];
      setCurrentStep(nextStep);
      
      // Mark current step as completed when moving forward
      setCompletedSteps(prev => new Set([...prev, currentStep]));
    }
  };

  const goPrevious = () => {
    const stepOrder = Object.values(MatchingStep);
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  };

  // Load detailed scan data when needed
  const loadScanDetails = async (scan: any) => {
    if (!scan?.id) return;
    
    setLoadingDetails(true);
    try {
      const details = await getScanDetails(scan.id);
      setDetailedScan(details);
    } catch (error) {
      console.error('Failed to load scan details:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  // STEP INDICATOR COMPONENT
  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-8 space-x-4">
      {STEP_DEFINITIONS.map((step, index) => {
        const isActive = currentStep === step.id;
        const isCompleted = completedSteps.has(step.id);
        const Icon = step.icon;

        return (
          <React.Fragment key={step.id}>
            <button
              onClick={() => goToStep(step.id)}
              className={`
                flex flex-col items-center p-4 rounded-lg transition-all duration-200
                ${isActive 
                  ? 'bg-cyan-600 text-white shadow-lg transform scale-105' 
                  : isCompleted 
                    ? 'bg-green-600 text-white cursor-pointer hover:bg-green-700' 
                    : 'bg-gray-800 text-gray-300 cursor-pointer hover:bg-gray-700'
                }
              `}
            >
              <Icon className="w-6 h-6 mb-2" />
              <div className="text-sm font-semibold">{step.title}</div>
              <div className="text-xs opacity-75">{step.description}</div>
            </button>
            {index < STEP_DEFINITIONS.length - 1 && (
              <div className={`
                h-1 w-8 transition-colors duration-200
                ${isCompleted ? 'bg-green-500' : 'bg-gray-600'}
              `} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );

  // STEP CONTENT RENDERER - SIMPLIFIED 2-STEP WORKFLOW
  const renderStepContent = () => {
    console.log('🔄 Rendering step content for:', currentStep);
    
    switch (currentStep) {
      case MatchingStep.SELECT_CARD:
        if (loadingDetails && selectedScan) {
          return (
            <div className="text-center py-12">
              <GenericLoadingState message="Loading detailed scan information..." />
            </div>
          );
        }

        return (
          <div>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">Select Card to Process</h2>
              <p className="text-gray-300">Choose a matched card to create PSA graded card entry</p>
              <div className="text-sm text-cyan-400 mt-2">
                {scansReadyForMatching.length} cards ready
              </div>
            </div>
            <MatchingGrid 
              scans={scansReadyForMatching}
              selectedScan={selectedScan}
              onScanSelect={async (scan) => {
                setSelectedScan(scan);
                await loadScanDetails(scan);
                // IMMEDIATELY go to CREATE PSA - no intermediate steps
                setCurrentStep('create_psa');
              }}
              isMatching={false}
              onPerformMatching={() => {}}
            />
          </div>
        );

      case MatchingStep.CREATE_PSA:
        console.log('🎨 Rendering CREATE_PSA step with scan:', detailedScan || selectedScan);
        return selectedScan ? (
          <div>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Create PSA Graded Card</h2>
              <p className="text-gray-300 text-sm">Complete the PSA card entry with pricing and certification details</p>
            </div>
            <div className="max-w-5xl mx-auto">
              <MatchingDetailsPanel
                scan={detailedScan || selectedScan} // Use detailedScan with OCR data if available
                matchResults={detailedScan ? { cardMatches: detailedScan.cardMatches || [] } : null}
                onClose={() => {
                  console.log('🔙 Closing CREATE_PSA, returning to SELECT_CARD');
                  setCurrentStep(MatchingStep.SELECT_CARD);
                  setSelectedScan(null);
                }}
                onCreatePsaCard={createPsaCard}
                isCreating={isCreating}
              />
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-400">No scan selected. Please return to card selection.</p>
            <PokemonButton 
              variant="outline" 
              onClick={() => setCurrentStep(MatchingStep.SELECT_CARD)}
              className="mt-4"
            >
              Back to Card Selection
            </PokemonButton>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-6 py-8">
        {/* HEADER */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">PSA Card Creation Workflow</h1>
          <p className="text-gray-400 text-lg">Transform matched OCR scans into PSA graded card entries</p>
        </div>

        {/* STEP INDICATOR */}
        <StepIndicator />

        {/* STEP CONTENT */}
        <div className="w-full">
          {renderStepContent()}
        </div>
      </div>
    </div>
  );
};

export default MatchingInterface;