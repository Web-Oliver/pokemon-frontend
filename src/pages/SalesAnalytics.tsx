/**
 * Sales Analytics Page Component - Unified Design System
 *
 * Financial tracking and analytics dashboard for sales data.
 * Complete implementation with real data integration and charts.
 *
 * Following CLAUDE.md principles for beautiful, award-winning design:
 * - REFACTORED: Extracted reusable components to eliminate DRY violations
 * - PokemonCard: Unified card component for all metric, category, and sale displays
 * - SalesDateRangeFilter: Reusable date filter component
 */

import React, { useState } from 'react';
import { TrendingUp, DollarSign, Download } from 'lucide-react';
import { PokemonButton } from '../components/design-system/PokemonButton';
import { DateRangeState } from '../components/common/DateRangeFilter';
import { PageLayout } from '../components/layouts/PageLayout';
import { SectionContainer } from '../components/common';
import { PokemonCard } from '../components/design-system/PokemonCard';
import SalesDateRangeFilter from '../components/common/SalesDateRangeFilter';
import { useExportOperations } from '../hooks/useExportOperations';
import { useSalesAnalytics } from '../hooks/useSalesAnalytics';
import { showSuccessToast } from '../ui/toastNotifications';
import { displayPrice } from '../utils/formatting';
import '../styles/unified-design-system.css';

const SalesAnalytics: React.FC = () => {
  const { sales, loading, error, dateRange, setDateRange } =
    useSalesAnalytics();

  const [localDateRange, setLocalDateRange] = useState<DateRangeState>({
    startDate: dateRange?.startDate,
    endDate: dateRange?.endDate,
  });

  // Use centralized price formatting from utils/formatting.ts

  const { exportSalesData } = useExportOperations();

  // Handle CSV export with error handling and user feedback
  const handleExportCSV = async () => {
    try {
      if (!sales || sales.length === 0) {
        showSuccessToast('No sales data to export');
        return;
      }
      await exportSalesData(sales, dateRange);
      showSuccessToast('Sales data exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      showSuccessToast('Export completed despite some formatting issues');
    }
  };

  // Context7 Premium Date Range Filter using SalesDateRangeFilter component
  const headerActions = (
    <SalesDateRangeFilter
      localDateRange={localDateRange}
      setLocalDateRange={setLocalDateRange}
      setDateRange={setDateRange}
    />
  );

  return (
    <PageLayout
      title="Sales Analytics"
      subtitle="Financial tracking and analytics dashboard for sales data"
      loading={loading && (!Array.isArray(sales) || sales.length === 0)}
      error={error}
      actions={headerActions}
      variant="default"
    >
      <div className="relative z-10 p-8">
        <div className="max-w-7xl mx-auto space-y-10">
          {/* Sales Overview Section */}
          <SectionContainer
            title="Sales Overview"
            subtitle="Track your collection's performance"
            variant="glassmorphism"
            size="lg"
            icon={TrendingUp}
          >

                {/* Error Display - Premium styling */}
                {error && (
                  <div className="mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-xl backdrop-blur-sm">
                    <p className="text-sm text-red-300 font-medium">{error}</p>
                  </div>
                )}

                {Array.isArray(sales) && sales.length > 0 ? (
                  <>
                    {/* Key Metrics - Context7 Premium Cards using PokemonCard */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                      {/* Total Cards Sold */}
                      <PokemonCard
                        cardType="metric"
                        variant="glass"
                        size="md"
                        title="Total Cards"
                        value={sales.length}
                        colorScheme="success"
                      />

                      {/* Total Revenue */}
                      <PokemonCard
                        cardType="metric"
                        variant="glass"
                        size="md"
                        title="Total Revenue"
                        value={displayPrice(
                          sales.reduce(
                            (sum, sale) =>
                              sum + (Number(sale.actualSoldPrice) || 0),
                            0
                          )
                        ).replace(' kr.', '')}
                        icon={DollarSign}
                        colorScheme="primary"
                      />
                    </div>

                    {/* Category Breakdown Section */}
                    <div className="relative">
                      <div className="mb-6">
                        <h3 className="text-xl font-bold text-zinc-100 mb-2">Category Breakdown</h3>
                        <p className="text-zinc-400">Sales performance by item type</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {(() => {
                          const categoryStats = {
                            'PSA Graded Card': {
                              name: 'PSA Graded Card',
                              count: 0,
                              revenue: 0,
                              icon: '🏆',
                              color: 'bg-yellow-600',
                              textColor: 'text-yellow-300',
                              bgColor: 'bg-yellow-500/20',
                              borderColor: 'border-yellow-400/30',
                            },
                            'Raw Card': {
                              name: 'Raw Card',
                              count: 0,
                              revenue: 0,
                              icon: '🃏',
                              color: 'bg-blue-600',
                              textColor: 'text-blue-300',
                              bgColor: 'bg-blue-500/20',
                              borderColor: 'border-blue-400/30',
                            },
                            'Sealed Product': {
                              name: 'Sealed Product',
                              count: 0,
                              revenue: 0,
                              icon: '📦',
                              color: 'bg-purple-600',
                              textColor: 'text-purple-300',
                              bgColor: 'bg-purple-500/20',
                              borderColor: 'border-purple-400/30',
                            },
                          };

                          sales.forEach((sale) => {
                            const category = sale.itemCategory;
                            if (categoryStats[category]) {
                              categoryStats[category].count += 1;
                              categoryStats[category].revenue +=
                                Number(sale.actualSoldPrice) || 0;
                            }
                          });

                          return Object.entries(categoryStats).map(
                            ([categoryKey, categoryData]) => (
                              <PokemonCard
                                key={categoryKey}
                                cardType="metric"
                                variant="glass"
                                size="md"
                                title={categoryData.name}
                                value={categoryData.count}
                                subtitle={`Total Revenue: $${categoryData.revenue.toFixed(2)}`}
                                colorScheme="success"
                              />
                            )
                          );
                        })()}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-20">
                    <div className="w-24 h-24 bg-gradient-to-r from-zinc-700/20 to-zinc-600/10 rounded-full mx-auto mb-8 flex items-center justify-center border border-[var(--theme-border)] backdrop-blur-sm float">
                      <TrendingUp className="w-12 h-12 text-[var(--theme-text-muted)]" />
                    </div>
                    <h3 className="text-2xl font-bold text-[var(--theme-text-primary)] mb-4">
                      No Sales Data Yet
                    </h3>
                    <p className="text-[var(--theme-text-secondary)] max-w-md mx-auto">
                      Your sales analytics will appear here once you start
                      selling items from your collection.
                    </p>
                  </div>
                )}
          </SectionContainer>

          {/* Recent Sales */}
          <SectionContainer
            title="Recent Sales"
            subtitle="Your latest sold items with details"
            variant="glassmorphism"
            size="lg"
            icon={TrendingUp}
            actions={
              Array.isArray(sales) && sales.length > 0 ? [
                {
                  icon: Download,
                  label: "Export CSV",
                  onClick: handleExportCSV,
                  variant: 'secondary' as const,
                  loading: loading
                }
              ] : []
            }
          >

            <div>
                {Array.isArray(sales) && sales.length > 0 ? (
                  <div className="divide-y divide-[var(--theme-border)]">
                    {sales.slice(0, 10).map((sale, index) => (
                      <PokemonCard
                        key={sale.id || `sale-${index}`}
                        cardType="sale"
                        variant="glass"
                        size="sm"
                        title={sale.itemName || 'Unknown Item'}
                        subtitle={sale.itemCategory || 'Unknown Category'}
                        price={Number(sale.actualSoldPrice) || 0}
                        saleDate={sale.dateSold}
                        images={sale.images}
                        sold={true}
                        interactive={false}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <div className="w-16 h-16 bg-gradient-to-r from-zinc-700/20 to-zinc-600/10 rounded-xl mx-auto mb-6 flex items-center justify-center border border-[var(--theme-border)] backdrop-blur-sm float">
                      <TrendingUp className="w-8 h-8 text-[var(--theme-text-muted)]" />
                    </div>
                    <h3 className="text-lg font-bold text-[var(--theme-text-primary)] mb-3">
                      No Sales Yet
                    </h3>
                    <p className="text-[var(--theme-text-secondary)] max-w-md mx-auto">
                      Your recent sales will appear here once you start selling
                      items.
                    </p>
                  </div>
                )}
                
                {/* Footer with View All Button */}
                {Array.isArray(sales) && sales.length > 10 && (
                  <div className="pt-4 mt-6 border-t border-zinc-700/50">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-zinc-400 font-medium">
                        Showing 10 of {sales.length} sales
                      </p>
                      <PokemonButton
                        variant="ghost"
                        size="sm"
                      >
                        View All Sales
                      </PokemonButton>
                    </div>
                  </div>
                )}
            </div>
          </SectionContainer>
        </div>
      </div>
    </PageLayout>
  );
};

export default SalesAnalytics;
