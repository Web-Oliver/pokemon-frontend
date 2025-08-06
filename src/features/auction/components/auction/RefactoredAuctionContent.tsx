/**
 * Refactored Auction Content Component
 * Layer 3: Components (CLAUDE.md Architecture)
 *
 * MAJOR DRY AND SOLID COMPLIANCE REFACTORING
 * 
 * Following CLAUDE.md principles:
 * - Single Responsibility: Each section has one clear purpose
 * - Open/Closed: Extensible through SectionContainer variants
 * - DRY: Eliminates all duplicate glassmorphism patterns
 * - Reusability: Uses existing SectionContainer, UnifiedHeader, and effect components
 * - Not Over-Engineered: Leverages established design system
 *
 * CONSOLIDATION ACHIEVED:
 * - Background patterns: Context7Background component
 * - Glassmorphism containers: GlassmorphismContainer + SectionContainer
 * - Header sections: UnifiedHeader component
 * - Stats/Progress: SectionContainer with 'stats' variant
 * - Export tools: SectionContainer with 'default' variant
 * - Metadata: SectionContainer with 'form' variant
 */

import React from 'react';
import { X, DollarSign, Download, Facebook, FileText } from 'lucide-react';
import { UnifiedHeader, SectionContainer } from '../common';
import { Context7Background } from '../effects';
import { PokemonButton } from '../design-system';

interface RefactoredAuctionContentProps {
  // Auction data
  auction: any;
  loading: boolean;
  error?: string;
  
  // Event handlers
  handleGenerateFacebookPost: () => void;
  handleDownloadTextFile: () => void;
  
  // State
  soldValue: number;
  totalValue: number;
}

export const RefactoredAuctionContent: React.FC<RefactoredAuctionContentProps> = ({
  auction,
  loading,
  error,
  handleGenerateFacebookPost,
  handleDownloadTextFile,
  soldValue,
  totalValue,
}) => {
  // Calculate progress percentage
  const progressPercentage = totalValue > 0 ? (soldValue / totalValue) * 100 : 0;
  
  // Render error state using UnifiedHeader
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/50 to-cyan-900/30 relative overflow-hidden">
        <Context7Background opacity={0.3} color="purple" />
        
        <div className="relative z-10 p-8">
          <div className="max-w-7xl mx-auto">
            <UnifiedHeader
              title="Auction Not Found"
              subtitle="The requested auction could not be found"
              variant="cosmic"
              size="lg"
              showBackButton
              onBack={() => window.history.back()}
            >
              <SectionContainer variant="default" className="mt-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl shadow-lg flex items-center justify-center">
                      <X className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-red-600 dark:text-red-400 font-medium">
                      {error}
                    </p>
                  </div>
                </div>
              </SectionContainer>
            </UnifiedHeader>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/50 to-cyan-900/30 relative overflow-hidden">
      <Context7Background opacity={0.3} color="purple" />
      
      <div className="relative z-10 p-8">
        <div className="max-w-7xl mx-auto space-y-10">
          
          {/* Premium Header using UnifiedHeader */}
          <UnifiedHeader
            title={auction?.topText || "Auction Details"}
            subtitle={auction?.bottomText || "Premium auction management"}
            variant="glassmorphism"
            size="xl"
            stats={[
              {
                icon: DollarSign,
                label: "Total Value",
                value: `${totalValue} kr`,
                variant: 'default'
              },
              {
                icon: DollarSign,
                label: "Sold Value", 
                value: `${soldValue} kr`,
                variant: 'success'
              }
            ]}
            showBackButton
            onBack={() => window.history.back()}
          />

          {/* Progress and Stats using SectionContainer stats variant */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <SectionContainer
              title="Sales Progress"
              variant="stats"
              size="lg"
              icon={DollarSign}
              badges={[
                {
                  label: `${progressPercentage.toFixed(1)}%`,
                  variant: progressPercentage > 80 ? 'success' : progressPercentage > 50 ? 'warning' : 'default'
                }
              ]}
            >
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{progressPercentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-blue-200/20 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 h-3 rounded-full transition-all duration-500 shadow-lg"
                    style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                  />
                </div>
              </div>
            </SectionContainer>

            <SectionContainer
              title="Total Value"
              variant="stats"
              size="lg"
              icon={DollarSign}
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {totalValue} kr
                </div>
                <div className="text-sm text-zinc-500">
                  Complete auction value
                </div>
              </div>
            </SectionContainer>

            <SectionContainer
              title="Sold Amount"
              variant="stats"
              size="lg"
              icon={DollarSign}
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                  {soldValue} kr
                </div>
                <div className="text-sm text-zinc-500">
                  Revenue generated
                </div>
              </div>
            </SectionContainer>
          </div>

          {/* Export and Social Media Tools using SectionContainer */}
          <SectionContainer
            title="Export & Social Media"
            subtitle="Generate posts and export auction data"
            variant="default"
            size="lg"
            showDivider
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Facebook Post Generation */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-blue-600 dark:text-blue-400 tracking-wide uppercase">
                  Facebook Post
                </h4>
                <PokemonButton
                  onClick={handleGenerateFacebookPost}
                  disabled={loading}
                  variant="primary"
                  className="w-full"
                >
                  <Facebook className="w-4 h-4 mr-2" />
                  Generate Post
                </PokemonButton>
              </div>

              {/* Text File Export */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-green-600 dark:text-green-400 tracking-wide uppercase">
                  Text File Export
                </h4>
                <PokemonButton
                  onClick={handleDownloadTextFile}
                  disabled={loading}
                  variant="success"
                  className="w-full"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Export Text
                </PokemonButton>
              </div>

              {/* Additional Export Options */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-purple-600 dark:text-purple-400 tracking-wide uppercase">
                  More Options
                </h4>
                <PokemonButton
                  onClick={() => {/* Add more export functionality */}}
                  disabled={loading}
                  variant="secondary"
                  className="w-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download All
                </PokemonButton>
              </div>
              
            </div>
          </SectionContainer>

          {/* Auction Metadata using SectionContainer form variant */}
          <SectionContainer
            title="Auction Details"
            variant="form"
            size="lg"
            showDivider
          >
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  Auction Date
                </dt>
                <dd className="mt-1 text-lg font-semibold text-zinc-900 dark:text-white">
                  {auction?.auctionDate ? new Date(auction.auctionDate).toLocaleDateString() : 'Not set'}
                </dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  Status
                </dt>
                <dd className="mt-1">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    auction?.status === 'active' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : auction?.status === 'sold'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'  
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                  }`}>
                    {auction?.status || 'Draft'}
                  </span>
                </dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  Items Count
                </dt>
                <dd className="mt-1 text-lg font-semibold text-zinc-900 dark:text-white">
                  {auction?.items?.length || 0} items
                </dd>
              </div>
              
              <div>
                <dt className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                  Facebook Post
                </dt>
                <dd className="mt-1 text-lg font-semibold text-zinc-900 dark:text-white">
                  {auction?.generatedFacebookPost ? 'Generated' : 'Not generated'}
                </dd>
              </div>
            </dl>
          </SectionContainer>

        </div>
      </div>
    </div>
  );
};

export default RefactoredAuctionContent;