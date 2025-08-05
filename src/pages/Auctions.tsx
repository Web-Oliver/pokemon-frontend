/**
 * Auctions Page - Context7 2025 Award-Winning Futuristic Design
 *
 * Breathtaking glassmorphism & neumorphism auction management with stunning animations.
 * Features ultra-modern filtering, neural-network interactions, and immersive visualization.
 *
 * Following CLAUDE.md + Context7 2025 principles:
 * - Award-winning futuristic glassmorphism design with neural micro-interactions
 * - Advanced neumorphism with floating holographic cards and depth layers
 * - Cyberpunk gradients and holographic color palettes with RGB shifting
 * - Context7 2025 futuristic design system compliance
 * - Quantum animations, particle effects, and neural hover transformations
 * - Neo-brutalist elements mixed with soft glassmorphism
 * - Phase 9.1 - Auction List & Detail Pages implementation
 */

import { 
  Calendar, 
  DollarSign, 
  Filter, 
  Package, 
  Plus, 
  X, 
  ArrowLeft,
  Sparkles,
  Cpu,
  Zap,
  Target,
  TrendingUp,
  Award,
  Clock
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Select from '../components/common/Select';
import { PageLayout } from '../components/layouts/PageLayout';
import { useAuction } from '../hooks/useAuction';
import { getStatusColor, getStatusPriority } from '../utils/constants';
import { formatDateWithTime } from '../utils/formatting';
import { navigationHelper } from '../utils/navigation';

const Auctions: React.FC = () => {
  const { auctions, loading, error, fetchAuctions, clearError } = useAuction();

  // Filter state
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Navigation state (using simple URL management for now)
  const navigateToAuctionDetail = (auctionId: string) => {
    navigationHelper.navigateToAuctionDetail(auctionId);
  };

  const navigateToCreateAuction = () => {
    navigationHelper.navigateToCreate.auction();
  };

  // Filter auctions based on status
  const filteredAuctions = auctions.filter((auction) => {
    if (!statusFilter) {
      return true;
    }
    return auction.status === statusFilter;
  });

  // Handle status filter change
  const handleStatusFilterChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const value = event.target.value;
    setStatusFilter(value);
    if (value) {
      fetchAuctions({ status: value });
    } else {
      fetchAuctions();
    }
  };

  // Clear filters
  const clearFilters = () => {
    setStatusFilter('');
    fetchAuctions();
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    const formatted = new Intl.NumberFormat('da-DK', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
    return `${formatted} kr.`;
  };

  // Sort auctions by status priority and date
  const sortedAuctions = [...filteredAuctions].sort((a, b) => {
    const statusDiff =
      getStatusPriority(a.status) - getStatusPriority(b.status);
    if (statusDiff !== 0) {
      return statusDiff;
    }
    return (
      new Date(b.auctionDate).getTime() - new Date(a.auctionDate).getTime()
    );
  });

  // Calculate stats for display
  const activeAuctions = auctions.filter((a) => a.status === 'active').length;
  const draftAuctions = auctions.filter((a) => a.status === 'draft').length;
  const completedAuctions = auctions.filter((a) => a.status === 'sold').length;

  // Auto-refresh auctions when the page becomes visible (for better UX)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchAuctions();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchAuctions]);

  // Debug current auctions state
  useEffect(() => {
    console.log('[Auctions] Current auctions count:', auctions.length);
    console.log(
      '[Auctions] Current auctions:',
      auctions.map((a) => ({
        id: a.id || a._id,
        topText: a.topText,
        status: a.status,
      }))
    );
  }, [auctions]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(clearError, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  // Handle navigation
  const handleNavigation = (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <PageLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-indigo-950/30 relative overflow-hidden">
        {/* Context7 2025 Futuristic Neural Background - Quantum Field Effect */}
        <div className="absolute inset-0 opacity-20">
          {/* Primary Neural Network Pattern */}
          <div
            className="absolute inset-0 animate-pulse"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='120' height='120' viewBox='0 0 120 120' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cfilter id='glow'%3E%3CfeGaussianBlur stdDeviation='3' result='coloredBlur'/%3E%3CfeMerge%3E%3CfeMergeNode in='coloredBlur'/%3E%3CfeMergeNode in='SourceGraphic'/%3E%3C/feMerge%3E%3C/filter%3E%3C/defs%3E%3Cg fill='none' stroke='%2306b6d4' stroke-width='0.5' filter='url(%23glow)'%3E%3Ccircle cx='60' cy='60' r='2'/%3E%3Cline x1='60' y1='30' x2='60' y2='90'/%3E%3Cline x1='30' y1='60' x2='90' y2='60'/%3E%3Cline x1='40' y1='40' x2='80' y2='80'/%3E%3Cline x1='80' y1='40' x2='40' y2='80'/%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
          {/* Secondary Quantum Particles */}
          <div
            className="absolute inset-0 animate-bounce"
            style={{
              animationDuration: '6s',
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23a855f7' fill-opacity='0.05'%3E%3Ccircle cx='100' cy='50' r='1.5'/%3E%3Ccircle cx='50' cy='100' r='1'/%3E%3Ccircle cx='150' cy='100' r='1.5'/%3E%3Ccircle cx='100' cy='150' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
          {/* Holographic Grid Overlay */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `linear-gradient(90deg, transparent 98%, rgba(6, 182, 212, 0.1) 100%), linear-gradient(transparent 98%, rgba(168, 85, 247, 0.1) 100%)`,
              backgroundSize: '40px 40px',
            }}
          />
        </div>

        {/* Floating Particle Systems */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Floating particles */}
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full opacity-20 animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 6 + 2}px`,
                height: `${Math.random() * 6 + 2}px`,
                background: `radial-gradient(circle, ${['#06b6d4', '#a855f7', '#ec4899', '#10b981'][Math.floor(Math.random() * 4)]}, transparent)`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${Math.random() * 4 + 3}s`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 p-8">
          <div className="max-w-7xl mx-auto space-y-12">
            {/* Context7 2025 Futuristic Glassmorphism Header */}
            <div className="relative group">
              {/* Glassmorphism card with neumorphism elements */}
              <div className="backdrop-blur-xl bg-gradient-to-br from-white/[0.15] via-cyan-500/[0.12] to-purple-500/[0.15] border border-white/[0.20] rounded-[2rem] shadow-2xl text-white p-12 relative overflow-hidden">
                {/* Neural network glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-purple-500/15 to-pink-500/20 opacity-70 blur-3xl"></div>

                {/* Holographic border animation */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent opacity-30 group-hover:opacity-100 transition-all duration-1000 animate-pulse"></div>

                {/* Top accent line with RGB shifting */}
                <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 opacity-80 animate-pulse"></div>

                {/* Floating geometric elements */}
                <div
                  className="absolute top-8 right-8 w-20 h-20 border-2 border-cyan-400/50 rounded-2xl rotate-45 animate-spin opacity-40 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                  style={{ animationDuration: '20s' }}
                ></div>
                <div className="absolute bottom-8 left-8 w-16 h-16 border-2 border-purple-400/50 rounded-full animate-pulse opacity-40 shadow-[0_0_20px_rgba(168,85,247,0.3)]"></div>

                <div className="relative z-10">
                  <div className="flex items-center mb-8">
                    {/* Neumorphism back button */}
                    <button
                      onClick={() => handleNavigation('/dashboard')}
                      className="mr-6 p-4 rounded-2xl bg-white/[0.08] backdrop-blur-sm border border-white/[0.12] hover:bg-white/[0.12] hover:border-cyan-400/30 transition-all duration-500 group/btn shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(6,182,212,0.3)]"
                    >
                      <ArrowLeft className="w-6 h-6 group-hover/btn:scale-110 group-hover/btn:-translate-x-1 transition-all duration-300 text-cyan-300" />
                    </button>

                    {/* Holographic icon container */}
                    <div className="relative mr-8">
                      <div className="w-20 h-20 bg-gradient-to-br from-cyan-500/20 via-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-[1.5rem] shadow-2xl flex items-center justify-center border border-white/[0.15] group-hover:scale-105 transition-all duration-500">
                        {/* Inner glow */}
                        <div className="absolute inset-2 bg-gradient-to-br from-cyan-400/10 to-purple-500/10 rounded-xl blur-lg"></div>
                        <DollarSign className="w-10 h-10 text-cyan-300 relative z-10 animate-pulse" />
                        {/* Orbiting elements */}
                        <div
                          className="absolute inset-0 animate-spin opacity-40"
                          style={{ animationDuration: '15s' }}
                        >
                          <div className="w-2 h-2 bg-cyan-400 rounded-full absolute -top-1 left-1/2 transform -translate-x-1/2"></div>
                          <div className="w-1.5 h-1.5 bg-purple-400 rounded-full absolute -bottom-1 left-1/2 transform -translate-x-1/2"></div>
                        </div>
                      </div>
                    </div>

                    {/* Title section with cyberpunk styling */}
                    <div className="flex-1">
                      <h1 className="text-5xl font-black mb-3 tracking-tight bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(6,182,212,0.5)]">
                        Auction Hub
                      </h1>
                      <p className="text-cyan-100/90 text-xl font-medium leading-relaxed flex items-center gap-3">
                        <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
                        Neural-powered auction management for your collection universe
                      </p>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => {
                          console.log('[Auctions] Manual refresh triggered');
                          fetchAuctions();
                        }}
                        className="p-4 rounded-2xl bg-white/[0.08] backdrop-blur-sm border border-white/[0.12] hover:bg-white/[0.12] hover:border-cyan-400/30 transition-all duration-500 group/btn shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(6,182,212,0.3)]"
                      >
                        <Zap className="w-6 h-6 group-hover/btn:scale-110 group-hover/btn:rotate-180 transition-all duration-300 text-cyan-300" />
                      </button>
                      <button
                        onClick={navigateToCreateAuction}
                        className="px-6 py-4 rounded-2xl bg-gradient-to-r from-cyan-500/20 to-purple-500/20 backdrop-blur-sm border border-cyan-400/30 hover:border-cyan-400/50 text-cyan-300 hover:text-white transition-all duration-500 group/btn shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] flex items-center"
                      >
                        <Plus className="w-5 h-5 mr-3 group-hover/btn:scale-110 transition-all duration-300" />
                        Create Auction
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Premium floating elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-zinc-800/20 rounded-full animate-pulse"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-zinc-800/10 rounded-full animate-pulse delay-75"></div>
            </div>

            {/* Context7 2025 Futuristic Neural Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Active Auctions - Cyberpunk Quantum Card */}
              <div className="group relative overflow-hidden">
                {/* Holographic border animation */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-pink-500/20 rounded-[1.5rem] opacity-0 group-hover:opacity-100 transition-all duration-1000 animate-pulse blur-sm"></div>

                {/* Main card with advanced glassmorphism */}
                <div className="relative backdrop-blur-xl bg-gradient-to-br from-white/[0.12] via-cyan-500/[0.08] to-purple-500/[0.12] border border-white/[0.15] rounded-[1.5rem] p-6 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] hover:shadow-[0_12px_40px_0_rgba(6,182,212,0.3)] transition-all duration-500 group-hover:scale-[1.02] group-hover:-translate-y-1">
                  {/* Neural network pattern overlay */}
                  <div
                    className="absolute inset-0 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity duration-500"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23ffffff' stroke-width='0.1'%3E%3Ccircle cx='30' cy='30' r='0.5' fill='%23ffffff' fill-opacity='0.1'/%3E%3Cpath d='M15 15 L45 45 M45 15 L15 45' stroke-dasharray='1,2'/%3E%3C/g%3E%3C/svg%3E")`,
                      backgroundSize: '30px 30px',
                    }}
                  ></div>

                  {/* Quantum glow effect */}
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60 animate-pulse"></div>

                  <div className="relative z-10 flex items-center">
                    {/* Advanced neumorphic icon container */}
                    <div className="relative mr-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/30 via-purple-500/20 to-pink-500/30 backdrop-blur-sm rounded-[1.2rem] shadow-[inset_0_2px_4px_0_rgba(255,255,255,0.1),inset_0_-2px_4px_0_rgba(0,0,0,0.1)] flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                        {/* Inner holographic glow */}
                        <div className="absolute inset-2 bg-gradient-to-br from-cyan-400/20 to-purple-500/20 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <Zap className="w-8 h-8 text-cyan-300 relative z-10 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)] animate-pulse" />

                        {/* Orbiting quantum particles */}
                        <div
                          className="absolute inset-0 animate-spin opacity-60 group-hover:opacity-100 transition-opacity duration-500"
                          style={{ animationDuration: '20s' }}
                        >
                          <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full absolute -top-0.5 left-1/2 transform -translate-x-1/2 blur-sm"></div>
                          <div className="w-1 h-1 bg-purple-400 rounded-full absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 blur-sm"></div>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1">
                      <p className="text-sm font-semibold text-cyan-200/90 mb-2 tracking-wider uppercase">
                        Neural Active
                      </p>
                      <p className="text-3xl font-black bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(6,182,212,0.3)] group-hover:scale-105 transition-transform duration-300">
                        {activeAuctions}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Draft Auctions - Holographic Temporal Card */}
              <div className="group relative overflow-hidden">
                {/* Holographic border animation */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-orange-500/20 rounded-[1.5rem] opacity-0 group-hover:opacity-100 transition-all duration-1000 animate-pulse blur-sm"></div>

                {/* Main card with advanced glassmorphism */}
                <div className="relative backdrop-blur-xl bg-gradient-to-br from-white/[0.12] via-purple-500/[0.08] to-pink-500/[0.12] border border-white/[0.15] rounded-[1.5rem] p-6 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] hover:shadow-[0_12px_40px_0_rgba(168,85,247,0.3)] transition-all duration-500 group-hover:scale-[1.02] group-hover:-translate-y-1">
                  {/* Temporal wave pattern overlay */}
                  <div
                    className="absolute inset-0 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity duration-500"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23ffffff' stroke-width='0.1'%3E%3Ccircle cx='30' cy='30' r='0.5' fill='%23ffffff' fill-opacity='0.1'/%3E%3Cpath d='M15 15 L45 45 M45 15 L15 45' stroke-dasharray='1,2'/%3E%3C/g%3E%3C/svg%3E")`,
                      backgroundSize: '30px 30px',
                    }}
                  ></div>

                  {/* Quantum glow effect */}
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple-400 to-transparent opacity-60 animate-pulse"></div>

                  <div className="relative z-10 flex items-center">
                    {/* Advanced neumorphic icon container */}
                    <div className="relative mr-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500/30 via-pink-500/20 to-orange-500/30 backdrop-blur-sm rounded-[1.2rem] shadow-[inset_0_2px_4px_0_rgba(255,255,255,0.1),inset_0_-2px_4px_0_rgba(0,0,0,0.1)] flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                        {/* Inner holographic glow */}
                        <div className="absolute inset-2 bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <Clock className="w-8 h-8 text-purple-300 relative z-10 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)] animate-pulse" />

                        {/* Temporal ripple effect */}
                        <div className="absolute inset-0 rounded-[1.2rem] border border-purple-400/30 animate-ping opacity-40"></div>
                        <div
                          className="absolute inset-2 rounded-xl border border-pink-400/20 animate-ping opacity-30"
                          style={{ animationDelay: '0.5s' }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex-1">
                      <p className="text-sm font-semibold text-purple-200/90 mb-2 tracking-wider uppercase">
                        Temporal Draft
                      </p>
                      <p className="text-3xl font-black bg-gradient-to-r from-purple-300 via-pink-300 to-orange-300 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(168,85,247,0.3)] group-hover:scale-105 transition-transform duration-300">
                        {draftAuctions}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Completed Auctions - Quantum Success Card */}
              <div className="group relative overflow-hidden">
                {/* Holographic border animation */}
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-blue-500/20 rounded-[1.5rem] opacity-0 group-hover:opacity-100 transition-all duration-1000 animate-pulse blur-sm"></div>

                {/* Main card with advanced glassmorphism */}
                <div className="relative backdrop-blur-xl bg-gradient-to-br from-white/[0.12] via-emerald-500/[0.08] to-cyan-500/[0.12] border border-white/[0.15] rounded-[1.5rem] p-6 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] hover:shadow-[0_12px_40px_0_rgba(16,185,129,0.3)] transition-all duration-500 group-hover:scale-[1.02] group-hover:-translate-y-1">
                  {/* Success pattern overlay */}
                  <div
                    className="absolute inset-0 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity duration-500"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23ffffff' stroke-width='0.1'%3E%3Ccircle cx='30' cy='30' r='0.5' fill='%23ffffff' fill-opacity='0.1'/%3E%3Cpath d='M15 15 L45 45 M45 15 L15 45' stroke-dasharray='1,2'/%3E%3C/g%3E%3C/svg%3E")`,
                      backgroundSize: '30px 30px',
                    }}
                  ></div>

                  {/* Quantum glow effect */}
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent opacity-60 animate-pulse"></div>

                  <div className="relative z-10 flex items-center">
                    {/* Advanced neumorphic icon container */}
                    <div className="relative mr-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/30 via-cyan-500/20 to-blue-500/30 backdrop-blur-sm rounded-[1.2rem] shadow-[inset_0_2px_4px_0_rgba(255,255,255,0.1),inset_0_-2px_4px_0_rgba(0,0,0,0.1)] flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                        {/* Inner holographic glow */}
                        <div className="absolute inset-2 bg-gradient-to-br from-emerald-400/20 to-cyan-500/20 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <Award className="w-8 h-8 text-emerald-300 relative z-10 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse" />

                        {/* Success flow animation */}
                        <div className="absolute inset-0 opacity-50 group-hover:opacity-80 transition-opacity duration-500">
                          <div className="w-1 h-1 bg-emerald-400 rounded-full absolute top-2 left-2 animate-ping"></div>
                          <div
                            className="w-1 h-1 bg-cyan-400 rounded-full absolute top-2 right-2 animate-ping"
                            style={{ animationDelay: '0.3s' }}
                          ></div>
                          <div
                            className="w-1 h-1 bg-blue-400 rounded-full absolute bottom-2 left-2 animate-ping"
                            style={{ animationDelay: '0.6s' }}
                          ></div>
                          <div
                            className="w-1 h-1 bg-emerald-400 rounded-full absolute bottom-2 right-2 animate-ping"
                            style={{ animationDelay: '0.9s' }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1">
                      <p className="text-sm font-semibold text-emerald-200/90 mb-2 tracking-wider uppercase">
                        Quantum Success
                      </p>
                      <p className="text-3xl font-black bg-gradient-to-r from-emerald-300 via-cyan-300 to-blue-300 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(16,185,129,0.3)] group-hover:scale-105 transition-transform duration-300">
                        {completedAuctions}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Context7 2025 Futuristic Neural Filter Hub */}
            <div className="group relative overflow-hidden">
              {/* Holographic field effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/5 to-pink-500/10 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-all duration-1000 blur-sm"></div>

              {/* Advanced glassmorphism container */}
              <div className="relative backdrop-blur-xl bg-gradient-to-br from-white/[0.08] via-slate-500/[0.03] to-purple-500/[0.08] border border-white/[0.12] rounded-[2rem] shadow-[0_16px_40px_0_rgba(31,38,135,0.2)] hover:shadow-[0_20px_50px_0_rgba(6,182,212,0.15)] transition-all duration-500">
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
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      {/* Holographic icon container */}
                      <div className="relative mr-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/30 via-purple-500/20 to-pink-500/30 backdrop-blur-sm rounded-[1rem] shadow-xl flex items-center justify-center border border-white/[0.15] group-hover:scale-105 transition-all duration-500">
                          {/* Inner glow */}
                          <div className="absolute inset-2 bg-gradient-to-br from-cyan-400/10 to-purple-500/10 rounded-lg blur-md"></div>
                          <Filter className="w-6 h-6 text-cyan-300 relative z-10 animate-pulse" />
                        </div>
                      </div>

                      <h2 className="text-2xl font-black bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                        Neural Filters
                      </h2>
                    </div>

                    {statusFilter && (
                      <button
                        onClick={clearFilters}
                        className="px-4 py-2 rounded-xl bg-white/[0.08] backdrop-blur-sm border border-white/[0.12] hover:bg-white/[0.12] hover:border-red-400/30 text-red-300 hover:text-white transition-all duration-500 group/btn shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(239,68,68,0.3)] flex items-center"
                      >
                        <X className="w-4 h-4 mr-2 group-hover/btn:scale-110 transition-all duration-300" />
                        Clear Filters
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-cyan-200/90 mb-3 tracking-wider uppercase">
                        Status Filter
                      </label>
                      <div className="relative">
                        <Select
                          value={statusFilter}
                          onChange={handleStatusFilterChange}
                          placeholder="All Statuses"
                          options={[
                            { value: '', label: 'All Statuses' },
                            { value: 'draft', label: 'Draft' },
                            { value: 'active', label: 'Active' },
                            { value: 'sold', label: 'Sold' },
                            { value: 'expired', label: 'Expired' },
                          ]}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Context7 2025 Futuristic Error Message */}
            {error && (
              <div className="group relative overflow-hidden">
                {/* Error glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-pink-500/15 to-orange-500/20 rounded-[1.5rem] opacity-0 group-hover:opacity-100 transition-all duration-1000 blur-sm"></div>

                {/* Advanced glassmorphism error container */}
                <div className="relative backdrop-blur-xl bg-gradient-to-br from-white/[0.12] via-red-500/[0.08] to-pink-500/[0.12] border border-red-400/[0.20] rounded-[1.5rem] p-6 shadow-[0_8px_32px_0_rgba(239,68,68,0.37)] transition-all duration-500">
                  {/* Error pattern overlay */}
                  <div
                    className="absolute inset-0 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity duration-500"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23ef4444' stroke-width='0.1'%3E%3Ccircle cx='30' cy='30' r='0.5' fill='%23ef4444' fill-opacity='0.1'/%3E%3Cpath d='M15 15 L45 45 M45 15 L15 45' stroke-dasharray='1,2'/%3E%3C/g%3E%3C/svg%3E")`,
                      backgroundSize: '30px 30px',
                    }}
                  ></div>

                  <div className="flex items-center relative z-10">
                    <div className="flex-shrink-0 mr-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-red-500/30 via-pink-500/20 to-orange-500/30 backdrop-blur-sm rounded-[1rem] shadow-xl flex items-center justify-center border border-red-400/[0.20]">
                        <X className="h-6 w-6 text-red-300 animate-pulse" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-red-200 font-medium">{error}</p>
                    </div>
                    <button
                      onClick={clearError}
                      className="ml-4 p-2 rounded-xl bg-white/[0.08] backdrop-blur-sm border border-white/[0.12] hover:bg-white/[0.12] hover:border-red-400/30 text-red-300 hover:text-white transition-all duration-500 group/btn"
                    >
                      <X className="h-4 w-4 group-hover/btn:scale-110 transition-all duration-300" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Context7 2025 Futuristic Loading State */}
            {loading && (
              <div className="group relative overflow-hidden">
                {/* Loading glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-purple-500/15 to-pink-500/20 rounded-[2rem] opacity-0 group-hover:opacity-100 transition-all duration-1000 blur-sm animate-pulse"></div>

                {/* Advanced glassmorphism loading container */}
                <div className="relative backdrop-blur-xl bg-gradient-to-br from-white/[0.08] via-slate-500/[0.03] to-purple-500/[0.08] border border-white/[0.12] rounded-[2rem] shadow-[0_16px_40px_0_rgba(31,38,135,0.2)] p-12">
                  {/* Loading pattern overlay */}
                  <div
                    className="absolute inset-0 opacity-[0.02] animate-pulse transition-opacity duration-500"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23ffffff' stroke-width='0.1'%3E%3Ccircle cx='30' cy='30' r='0.5' fill='%23ffffff' fill-opacity='0.1'/%3E%3Cpath d='M15 15 L45 45 M45 15 L15 45' stroke-dasharray='1,2'/%3E%3C/g%3E%3C/svg%3E")`,
                      backgroundSize: '30px 30px',
                    }}
                  ></div>

                  {/* Quantum accent line */}
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent animate-pulse"></div>

                  <div className="relative z-10">
                    <LoadingSpinner text="Loading auctions..." />
                  </div>
                </div>
              </div>
            )}

            {/* Context7 2025 Futuristic Auction Timeline */}
            {!loading && (
            <div className="bg-zinc-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-zinc-700/20 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500/3 via-orange-500/3 to-red-500/3"></div>
              <div className="relative z-10">
                <div className="px-8 py-6 border-b border-slate-200/50 dark:border-zinc-700/50 dark:border-zinc-700/50">
                  <h2 className="text-2xl font-bold text-zinc-100 tracking-wide">
                    Auctions ({sortedAuctions.length})
                  </h2>
                </div>

                {sortedAuctions.length === 0 ? (
                  <div className="p-16 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-slate-100 to-gray-200 rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-6">
                      <Package className="w-10 h-10 text-slate-500 dark:text-zinc-500 dark:text-zinc-400" />
                    </div>
                    <h3 className="text-xl font-bold text-zinc-100 mb-3">
                      No auctions found
                    </h3>
                    <p className="text-slate-600 dark:text-zinc-400 dark:text-zinc-300 font-medium max-w-md mx-auto leading-relaxed mb-8">
                      {statusFilter
                        ? `No auctions found with status "${statusFilter}". Try adjusting your filters.`
                        : 'Get started by creating your first auction.'}
                    </p>
                    <Button
                      onClick={navigateToCreateAuction}
                      className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 hover:from-amber-700 hover:via-orange-700 hover:to-red-700 text-white px-6 py-3 rounded-2xl transition-all duration-300 inline-flex items-center shadow-lg hover:shadow-xl hover:scale-105"
                    >
                      <Plus className="w-5 h-5 mr-3" />
                      Create First Auction
                    </Button>
                  </div>
                ) : (
                  <div className="p-8 space-y-6">
                    {sortedAuctions.map((auction, index) => (
                      <div
                        key={auction.id || auction._id || `auction-${index}`}
                        className="group bg-zinc-800/60 backdrop-blur-sm rounded-2xl shadow-lg border border-zinc-600/40 p-6 hover:bg-zinc-800/80 hover:shadow-xl hover:scale-102 transition-all duration-300 cursor-pointer relative overflow-hidden"
                        onClick={() =>
                          navigateToAuctionDetail(auction.id || auction._id)
                        }
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-orange-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative z-10">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-3 mb-3">
                                <h3 className="text-xl font-bold text-zinc-100 truncate group-hover:text-amber-300 transition-colors duration-300">
                                  {auction.topText || 'Untitled Auction'}
                                </h3>
                                <span
                                  className={`inline-flex items-center px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wide ${getStatusColor(auction.status)}`}
                                >
                                  {auction.status.charAt(0).toUpperCase() +
                                    auction.status.slice(1)}
                                </span>
                              </div>

                              <p className="text-sm text-slate-600 dark:text-zinc-400 dark:text-zinc-300 mb-4 line-clamp-2 font-medium">
                                {auction.bottomText ||
                                  'No description available'}
                              </p>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div className="flex items-center text-slate-600 dark:text-zinc-400 dark:text-zinc-300">
                                  <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                                    <Calendar className="w-3 h-3 text-white" />
                                  </div>
                                  <span className="font-medium">
                                    {formatDateWithTime(auction.auctionDate)}
                                  </span>
                                </div>

                                <div className="flex items-center text-slate-600 dark:text-zinc-400 dark:text-zinc-300">
                                  <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center mr-3">
                                    <Package className="w-3 h-3 text-white" />
                                  </div>
                                  <span className="font-medium">
                                    {auction.items.length} item
                                    {auction.items.length !== 1 ? 's' : ''}
                                  </span>
                                </div>

                                <div className="flex items-center text-slate-600 dark:text-zinc-400 dark:text-zinc-300">
                                  <div className="w-6 h-6 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center mr-3">
                                    <DollarSign className="w-3 h-3 text-white" />
                                  </div>
                                  <span className="font-medium">
                                    Total: {formatCurrency(auction.totalValue)}
                                  </span>
                                </div>

                                {auction.soldValue > 0 && (
                                  <div className="flex items-center text-emerald-600">
                                    <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center mr-3">
                                      <DollarSign className="w-3 h-3 text-white" />
                                    </div>
                                    <span className="font-bold">
                                      Sold: {formatCurrency(auction.soldValue)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="ml-4">
                              <div className="text-right">
                                <p className="text-sm text-slate-500 dark:text-zinc-500 dark:text-zinc-400 font-medium">
                                  Last updated
                                </p>
                                <p className="text-sm font-bold text-zinc-100">
                                  {formatDateWithTime(auction.updatedAt)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Auctions;
