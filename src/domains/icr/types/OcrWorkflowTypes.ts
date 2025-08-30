/**
 * OCR WORKFLOW TYPES - SOLID ARCHITECTURE
 * Single Responsibility: Define all workflow-related types
 * Open/Closed: Extensible for new step types
 * Interface Segregation: Separate interfaces for different concerns
 */

// STEP MANAGEMENT - SOLID: Single Responsibility
export enum OcrStep {
  UPLOAD = 'upload',
  EXTRACT = 'extract',
  STITCH = 'stitch',
  OCR_UPDATE = 'ocr_update',
  MATCH_DISPLAY = 'match_display'
}

// STEP STATE - DRY: Reusable state pattern
export interface StepState {
  isActive: boolean;
  isCompleted: boolean;
  isDisabled: boolean;
  data?: unknown;
  errors?: string[];
}

// STEP CONFIGURATION - Open/Closed: Extensible for new steps
export interface StepConfig {
  id: OcrStep;
  title: string;
  description: string;
  icon: string;
  component: React.ComponentType<StepComponentProps>;
  validation?: (data: unknown) => boolean;
  dependencies?: OcrStep[];
}

// COMPONENT PROPS - Interface Segregation
export interface StepComponentProps {
  data?: unknown;
  onComplete: (data: unknown) => void;
  onError: (error: string) => void;
  isActive: boolean;
}

// WORKFLOW STATE - Single Responsibility
export interface WorkflowState {
  currentStep: OcrStep;
  steps: Record<OcrStep, StepState>;
  globalData: Record<string, unknown>;
}

// NAVIGATION - DRY: Reusable navigation interface
export interface StepNavigation {
  canGoNext: boolean;
  canGoPrevious: boolean;
  nextStep?: OcrStep;
  previousStep?: OcrStep;
}