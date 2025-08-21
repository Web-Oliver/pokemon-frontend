/**
 * SOLID/DRY Implementation: PSA Bulk Processing Section
 * Single Responsibility: Handle PSA bulk processing workflow
 * Open/Closed: Extensible through props
 * DRY: Reusable bulk processing pattern
 */

import React from 'react';
import { Database, CheckCircle } from 'lucide-react';
import { PokemonCard, PokemonButton } from '../../../../shared/components/atoms/design-system';

export interface PsaBulkProcessingProps {
  isProcessing: boolean;
  resultCount: number;
  onStartProcessing: () => void;
  onClearResults: () => void;
}

export const PsaBulkProcessing: React.FC<PsaBulkProcessingProps> = ({
  isProcessing,
  resultCount,
  onStartProcessing,
  onClearResults
}) => {
  return (
    <PokemonCard className="bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-cyan-500/10 backdrop-blur-xl border-emerald-400/30">
      <div className="p-10 space-y-12">
        {/* Enhanced Hero Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 backdrop-blur-sm border border-emerald-300/30 rounded-3xl flex items-center justify-center">
                <Database className="w-10 h-10 text-emerald-300" />
              </div>
              <div>
                <h3 className="text-4xl font-black bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent leading-tight">
                  PSA Bulk Processing
                </h3>
                <div className="text-2xl font-black bg-gradient-to-r from-teal-300 to-cyan-300 bg-clip-text text-transparent">
                  Center
                </div>
              </div>
            </div>
            <p className="text-emerald-100/90 text-xl font-light leading-relaxed max-w-3xl">
              Transform your entire <span className="font-semibold text-emerald-200">PSA collection</span> with 
              <span className="font-semibold text-teal-200"> automated bulk processing</span>, 
              <span className="font-semibold text-cyan-200">intelligent OCR matching</span>, and 
              <span className="font-semibold text-emerald-200">AI-powered card identification</span>
            </p>
          </div>
          
          {resultCount > 0 && (
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-2xl blur-lg"></div>
              <div className="relative backdrop-blur-sm bg-emerald-500/10 border border-emerald-300/30 rounded-2xl px-8 py-6 shadow-xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center">
                    <CheckCircle className="w-7 h-7 text-emerald-300" />
                  </div>
                  <div>
                    <div className="text-2xl font-black text-emerald-200">
                      {resultCount}
                    </div>
                    <div className="text-emerald-300/80 font-medium">Labels Processed</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Workflow Status Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <WorkflowStep
            number="1"
            title="OCR EXTRACTION"
            description="Extract text from PSA label images using advanced OCR technology"
            colorScheme="purple"
          />
          
          <WorkflowStep
            number="2"
            title="SMART MATCHING"
            description="Match extracted data to Pokemon cards using AI algorithms and fuzzy matching"
            colorScheme="cyan"
          />
          
          <WorkflowStep
            number="3"
            title="APPROVAL WORKFLOW"
            description="Review and approve matched cards for collection addition"
            colorScheme="emerald"
          />
        </div>

        {/* Processing Controls */}
        <div className="bg-gradient-to-r from-zinc-800/30 to-zinc-900/30 rounded-xl p-8 border border-zinc-700/30">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            <div className="flex-1 space-y-6">
              <div>
                <h4 className="text-2xl font-black text-emerald-400 mb-3">
                  Bulk Processing Operation
                </h4>
                <p className="text-cyan-100/90 text-lg leading-relaxed">
                  Process all unprocessed PSA labels in the system. This operation will:
                </p>
              </div>
              <ul className="text-base text-cyan-100/80 space-y-3">
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                  Extract text from {resultCount || 'available'} PSA label images
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  Match cards using hierarchical search algorithms
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  Generate confidence scores and recommendations
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                  Queue results for manual review and approval
                </li>
              </ul>
            </div>
        
            {/* Progress Indicator */}
            {isProcessing && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-cyan-300">Processing Progress</span>
                  <span className="text-sm text-cyan-100/70">Step 1 of 3</span>
                </div>
                <div className="w-full bg-zinc-700/50 rounded-full h-2">
                  <div className="bg-gradient-to-r from-emerald-400 to-cyan-400 h-2 rounded-full transition-all duration-500" style={{width: '33%'}}></div>
                </div>
                <p className="text-xs text-cyan-100/70 mt-2">
                  Extracting text from PSA labels... This may take a few minutes.
                </p>
              </div>
            )}
          
            <div className="flex flex-col gap-3">
              <PokemonButton
                variant="primary"
                size="lg"
                onClick={onStartProcessing}
                disabled={isProcessing}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-500/25"
              >
                <Database className="w-5 h-5 mr-2" />
                {isProcessing ? 'Processing Labels...' : 'Start Bulk Processing'}
              </PokemonButton>
              
              {resultCount > 0 && (
                <PokemonButton
                  variant="secondary"
                  size="sm"
                  onClick={onClearResults}
                  disabled={isProcessing}
                  className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500"
                >
                  Clear Results
                </PokemonButton>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        {resultCount > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-emerald-500/10 border border-emerald-400/30 rounded-lg p-3">
              <div className="text-emerald-400 text-2xl font-black">{resultCount}</div>
              <div className="text-emerald-300 text-xs font-medium">Labels Processed</div>
            </div>
            <div className="bg-cyan-500/10 border border-cyan-400/30 rounded-lg p-3">
              <div className="text-cyan-400 text-2xl font-black">--</div>
              <div className="text-cyan-300 text-xs font-medium">Successful Matches</div>
            </div>
            <div className="bg-purple-500/10 border border-purple-400/30 rounded-lg p-3">
              <div className="text-purple-400 text-2xl font-black">--</div>
              <div className="text-purple-300 text-xs font-medium">High Confidence</div>
            </div>
            <div className="bg-pink-500/10 border border-pink-400/30 rounded-lg p-3">
              <div className="text-pink-400 text-2xl font-black">--</div>
              <div className="text-pink-300 text-xs font-medium">Need Review</div>
            </div>
          </div>
        )}
      </div>
    </PokemonCard>
  );
};

interface WorkflowStepProps {
  number: string;
  title: string;
  description: string;
  colorScheme: 'purple' | 'cyan' | 'emerald';
}

const WorkflowStep: React.FC<WorkflowStepProps> = ({
  number,
  title,
  description,
  colorScheme
}) => {
  const colorConfig = {
    purple: {
      gradient: 'from-purple-500/20 via-violet-500/10 to-purple-500/20',
      bg: 'bg-purple-500/5',
      border: 'border-purple-300/20 group-hover:border-purple-300/40',
      numberBg: 'from-purple-500/30 to-violet-500/30 border-purple-300/30',
      textColor: 'text-purple-200',
      accentColor: 'text-purple-100/80',
      lineColor: 'from-purple-400 to-violet-400'
    },
    cyan: {
      gradient: 'from-cyan-500/20 via-blue-500/10 to-cyan-500/20',
      bg: 'bg-cyan-500/5',
      border: 'border-cyan-300/20 group-hover:border-cyan-300/40',
      numberBg: 'from-cyan-500/30 to-blue-500/30 border-cyan-300/30',
      textColor: 'text-cyan-200',
      accentColor: 'text-cyan-100/80',
      lineColor: 'from-cyan-400 to-blue-400'
    },
    emerald: {
      gradient: 'from-emerald-500/20 via-teal-500/10 to-emerald-500/20',
      bg: 'bg-emerald-500/5',
      border: 'border-emerald-300/20 group-hover:border-emerald-300/40',
      numberBg: 'from-emerald-500/30 to-teal-500/30 border-emerald-300/30',
      textColor: 'text-emerald-200',
      accentColor: 'text-emerald-100/80',
      lineColor: 'from-emerald-400 to-teal-400'
    }
  };

  const config = colorConfig[colorScheme];

  return (
    <div className="relative group">
      <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
      <div className={`relative backdrop-blur-xl ${config.bg} border ${config.border} rounded-2xl p-8 space-y-6 transition-all duration-500`}>
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${config.numberBg} backdrop-blur-sm border flex items-center justify-center`}>
            <span className={`${config.textColor} font-black text-2xl`}>{number}</span>
          </div>
          <div>
            <h4 className={`font-black text-xl ${config.textColor} mb-1`}>{title}</h4>
            <div className={`w-12 h-1 bg-gradient-to-r ${config.lineColor} rounded-full`}></div>
          </div>
        </div>
        <p className={`${config.accentColor} text-lg leading-relaxed`}>
          {description}
        </p>
      </div>
    </div>
  );
};