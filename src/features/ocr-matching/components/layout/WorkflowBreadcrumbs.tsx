/**
 * SOLID/DRY Implementation: Workflow Breadcrumbs Component
 * Single Responsibility: Display current workflow step and navigation
 * Open/Closed: Extensible through step configuration
 * DRY: Reusable breadcrumb pattern
 */

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { PokemonCard, PokemonButton } from '../../../../shared/components/atoms/design-system';
import { WorkflowStep } from '../../hooks/useOcrWorkflowState';

export interface WorkflowBreadcrumbsProps {
  currentStep: WorkflowStep;
  onGoBack: () => void;
}

interface StepConfig {
  label: string;
  color: string;
  description: string;
}

// Step configuration (Open/Closed principle - easy to extend)
const stepConfig: Record<WorkflowStep, StepConfig> = {
  start: {
    label: 'Start',
    color: 'text-cyan-400',
    description: 'Initialize processing'
  },
  results: {
    label: 'PSA Cards',
    color: 'text-cyan-400',
    description: 'Review results'
  },
  'card-detail': {
    label: 'Card Details',
    color: 'text-emerald-400', 
    description: 'Confirm selection'
  },
  'edit-card': {
    label: 'Edit Card',
    color: 'text-orange-400',
    description: 'Search and select'
  },
  'grade-input': {
    label: 'Set Grade & Price',
    color: 'text-purple-400',
    description: 'Final details'
  },
  complete: {
    label: 'Complete',
    color: 'text-emerald-400',
    description: 'Success!'
  }
};

// Step progression mapping
const stepProgression: Record<WorkflowStep, WorkflowStep[]> = {
  start: [],
  results: ['results'],
  'card-detail': ['results', 'card-detail'],
  'edit-card': ['results', 'card-detail', 'edit-card'],
  'grade-input': ['results', 'card-detail', 'grade-input'],
  complete: ['results', 'card-detail', 'grade-input', 'complete']
};

const getStepNumber = (step: WorkflowStep): string => {
  const stepOrder: WorkflowStep[] = ['results', 'card-detail', 'grade-input'];
  const index = stepOrder.indexOf(step);
  return index >= 0 ? `${index + 1}` : '1';
};

const getTotalSteps = (): string => '3';

export const WorkflowBreadcrumbs: React.FC<WorkflowBreadcrumbsProps> = ({
  currentStep,
  onGoBack
}) => {
  if (currentStep === 'start' || currentStep === 'complete') {
    return null;
  }

  const progression = stepProgression[currentStep];
  const currentConfig = stepConfig[currentStep];

  return (
    <PokemonCard className="mb-6 bg-gradient-to-r from-slate-800/20 to-slate-900/20 backdrop-blur-xl border-slate-600/30">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <PokemonButton
              variant="secondary"
              size="sm"
              onClick={onGoBack}
              className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-500 hover:to-slate-600"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Previous
            </PokemonButton>
            
            <div className="flex items-center gap-2 text-sm">
              {progression.map((step, index) => (
                <React.Fragment key={step}>
                  {index > 0 && (
                    <span className="text-zinc-400">→</span>
                  )}
                  <span 
                    className={step === currentStep 
                      ? `${stepConfig[step].color} font-bold` 
                      : 'text-zinc-400'
                    }
                  >
                    {stepConfig[step].label}
                  </span>
                </React.Fragment>
              ))}
            </div>
          </div>
          
          <div className="text-right">
            <div className={`text-lg font-bold ${currentConfig.color} mb-1`}>
              {currentConfig.label}
            </div>
            <div className="text-xs text-zinc-400">
              Step {getStepNumber(currentStep)} of {getTotalSteps()}
            </div>
          </div>
        </div>
      </div>
    </PokemonCard>
  );
};