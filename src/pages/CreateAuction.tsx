/**
 * Create Auction Page - Context7 2025 Award-Winning Futuristic Design
 *
 * Breathtaking glassmorphism & neumorphism auction creation with stunning animations.
 * Features ultra-modern form design, neural-network interactions, and immersive visualization.
 *
 * Following CLAUDE.md + Context7 2025 principles:
 * - Award-winning futuristic glassmorphism design with neural micro-interactions
 * - Advanced neumorphism with floating holographic cards and depth layers
 * - Cyberpunk gradients and holographic color palettes with RGB shifting
 * - Context7 2025 futuristic design system compliance
 * - Quantum animations, particle effects, and neural hover transformations
 * - Neo-brutalist elements mixed with soft glassmorphism
 * - Refactored to use proper form components following SOLID and DRY principles
 * - Following CLAUDE.md layered architecture and Context7 design patterns
 *
 * THEME INTEGRATION (Phase 2.2.6 Complete):
 * - Preserves Context7 2025 futuristic system as specialized variant
 * - Uses shared effect utilities (ParticleSystem, NeuralNetworkBackground, FloatingGeometry)
 * - Theme-compatible: Respects glassmorphism intensity and particle effect settings
 * - Specialized patterns documented for potential reuse across components
 */

import React, { useState } from 'react';
import { Gavel, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { PageLayout } from '../components/layouts/PageLayout';
import { SectionContainer } from '../components/common';
import { useAuction } from '../hooks/useAuction';
import { useAuctionFormData, AuctionFormData } from '../hooks/useAuctionFormData';
import { usePageNavigation } from '../hooks/usePageNavigation';
import { log } from '../utils/logger';
import AuctionFormContainer from '../components/forms/containers/AuctionFormContainer';
import AuctionItemSelectionSection from '../components/forms/sections/AuctionItemSelectionSection';
import { useCentralizedTheme } from '../utils/themeConfig';
import {
  ParticleSystem,
  NeuralNetworkBackground,
} from '../components/effects';


const CreateAuction: React.FC = () => {
  const themeConfig = useCentralizedTheme();
  const {
    createAuction,
    loading: auctionLoading,
    error: _error,
    clearError,
  } = useAuction();

  // Use shared auction form data hook (eliminates ~400 lines of duplication)
  const {
    form,
    formErrors,
    allCollectionItems,
    collectionLoading,
    collectionError,
    selectedItemIds,
    selectedItemsByType,
    selectedItemsValue,
    toggleItemSelection,
    selectAllItems,
    clearAllSelections,
    searchFilter,
    setSearchFilter,
    convertToAuctionItems,
  } = useAuctionFormData();

  // Use shared navigation hook
  const { navigateToAuctions } = usePageNavigation();

  // UI state
  const [showPreview, setShowPreview] = useState(false);



  // Handle form submission
  const handleSubmit = async (formData: AuctionFormData) => {
    try {
      clearError();

      // Prepare auction data using shared logic
      const auctionItems = convertToAuctionItems();
      const auctionData = {
        topText: formData.topText.trim(),
        bottomText: formData.bottomText.trim(),
        status: formData.status,
        items: auctionItems,
        totalValue: Number(selectedItemsValue),
        ...(formData.auctionDate && { auctionDate: formData.auctionDate }),
      };

      log('Creating auction with data:', {
        topText: auctionData.topText,
        bottomText: auctionData.bottomText,
        status: auctionData.status,
        itemCount: auctionData.items.length,
        totalValue: auctionData.totalValue,
        hasAuctionDate: !!auctionData.auctionDate,
      });

      const createdAuction = await createAuction(auctionData);

      // Navigate to auction detail page
      const auctionId = createdAuction.id || createdAuction._id;
      if (auctionId) {
        toast.success('✅ Auction created successfully!');
        window.history.pushState({}, '', `/auctions/${auctionId}`);
        window.dispatchEvent(new PopStateEvent('popstate'));
      } else {
        toast.success('✅ Auction created successfully! Redirecting to auctions list.');
        navigateToAuctions();
      }
    } catch (err) {
      log('Error creating auction:', err);
    }
  };

  // Theme-aware background while preserving Context7 2025 futuristic aesthetic
  const backgroundStyles = {
    background:
      themeConfig.visualTheme === 'context7-futuristic'
        ? 'linear-gradient(135deg, rgb(2 6 23) 0%, rgba(88 28 135 / 0.2) 50%, rgba(49 46 129 / 0.3) 100%)'
        : 'linear-gradient(135deg, var(--theme-background-start, rgb(2 6 23)) 0%, var(--theme-background-mid, rgba(88 28 135 / 0.2)) 50%, var(--theme-background-end, rgba(49 46 129 / 0.3)) 100%)',
  };

  return (
    <PageLayout>
      <div
        className="min-h-screen relative overflow-hidden"
        style={backgroundStyles}
      >
        {/* Context7 2025 Futuristic Neural Background - Quantum Field Effect */}
        <NeuralNetworkBackground
          primaryColor="#06b6d4"
          secondaryColor="#a855f7"
          gridColor="#06b6d4"
          opacity={0.2}
          enableQuantumParticles={true}
          enableGrid={true}
          animationSpeed={1}
        />

        {/* Context7 2025 Futuristic Particle Systems */}
        <ParticleSystem
          particleCount={12}
          colors={['#06b6d4', '#a855f7', '#ec4899', '#10b981']}
          sizeRange={[2, 8]}
          durationRange={[3, 7]}
          opacity={0.2}
          animationType="pulse"
        />

        <div className="relative z-10 p-8">
          <div className="max-w-7xl mx-auto space-y-12">
            <SectionContainer
              title="Create Auction"
              subtitle="Neural-powered auction creation for your collection universe"
              variant="glassmorphism"
              size="lg"
              icon={Gavel}
              actions={[
                {
                  icon: ArrowLeft,
                  label: "Back to Auctions",
                  onClick: navigateToAuctions,
                  variant: 'secondary'
                }
              ]}
              className="mb-8"
            />

            {/* Context7 2025 Futuristic Form Container */}
            <div className="relative group overflow-hidden">
              {/* Holographic field effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/5 to-pink-500/10 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-all duration-1000 blur-sm"></div>

              {/* Advanced glassmorphism container - theme-aware */}
              <div
                className="relative backdrop-blur-xl border rounded-[2rem] shadow-[0_16px_40px_0_rgba(31,38,135,0.2)] hover:shadow-[0_20px_50px_0_rgba(6,182,212,0.15)] transition-all duration-500"
                style={{
                  background: `linear-gradient(135deg, 
                    rgba(255, 255, 255, ${0.08 * (themeConfig.glassmorphismIntensity / 100)}) 0%, 
                    rgba(100, 116, 139, ${0.03 * (themeConfig.glassmorphismIntensity / 100)}) 50%, 
                    rgba(168, 85, 247, ${0.08 * (themeConfig.glassmorphismIntensity / 100)}) 100%)`,
                  borderColor: `rgba(255, 255, 255, ${0.12 * (themeConfig.glassmorphismIntensity / 100)})`,
                }}
              >
                {/* Neural network grid pattern */}
                <div
                  className="absolute inset-0 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity duration-500"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23ffffff' stroke-width='0.1'%3E%3Ccircle cx='30' cy='30' r='0.5' fill='%23ffffff' fill-opacity='0.1'/%3E%3Cpath d='M15 15 L45 45 M45 15 L15 45' stroke-dasharray='1,2'/%3E%3C/g%3E%3C/svg%3E")`,
                    backgroundSize: '30px 30px',
                  }}
                ></div>

                {/* Quantum accent line */}
                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent animate-pulse"></div>

                <div className="p-8 relative z-10">
                  <AuctionFormContainer
                    isEditing={false}
                    isSubmitting={auctionLoading}
                    title="Create New Auction"
                    description="Start a new auction for your Pokémon collection"
                    icon={Gavel}
                    primaryColorClass="blue"
                    register={form.register}
                    errors={formErrors}
                    setValue={form.setValue}
                    watch={form.watch}
                    handleSubmit={form.handleSubmit}
                    onSubmit={handleSubmit}
                    onCancel={navigateToAuctions}
                    itemSelectionSection={
                      <AuctionItemSelectionSection
                        items={allCollectionItems}
                        loading={collectionLoading}
                        error={collectionError}
                        selectedItemIds={selectedItemIds}
                        onToggleSelection={toggleItemSelection}
                        onSelectAll={selectAllItems}
                        onClearSelection={clearAllSelections}
                        selectedItemsValue={selectedItemsValue}
                        selectedSetName={searchFilter.selectedSetName}
                        onSetSelection={(setName) => setSearchFilter(prev => ({ ...prev, selectedSetName: setName }))}
                        cardProductSearchTerm={searchFilter.cardProductSearchTerm}
                        onCardProductSearchChange={(term) => setSearchFilter(prev => ({ ...prev, cardProductSearchTerm: term }))}
                        filterType={searchFilter.filterType}
                        onFilterChange={(type) => setSearchFilter(prev => ({ ...prev, filterType: type }))}
                        showPreview={showPreview}
                        onTogglePreview={() => setShowPreview(!showPreview)}
                        selectedItemsByType={selectedItemsByType}
                      />
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default CreateAuction;
