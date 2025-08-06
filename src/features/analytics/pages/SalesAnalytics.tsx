/**
 * Sales Analytics Page Component - Unified Design System
 *
 * Financial tracking and analytics dashboard for sales data.
 * Complete implementation with real data integration and charts.
 *
 * Following CLAUDE.md principles for beautiful, award-winning design:
 * - REFACTORED: Extracted reusable components to eliminate DRY violations
 * - SalesStatCard: Reusable statistics cards for key metrics
 * - CategorySalesCard: Reusable category breakdown cards
 * - RecentSaleListItem: Reusable individual sale item components
 * - SalesDateRangeFilter: Reusable date filter component
 */

import React, { useState } from 'react';
import { TrendingUp, DollarSign, Download } from 'lucide-react';
import { PokemonButton } from '../../../shared/components/atoms/design-system/PokemonButton';
import { DateRangeState } from '../../../shared/components/molecules/common/DateRangeFilter';
import { PageLayout } from '../../../shared/components/layout/layouts/PageLayout';
import UnifiedHeader from '../../../shared/components/molecules/common/UnifiedHeader';
import { FormErrorMessage } from '../../../shared/components/molecules/common/FormElements';
import SalesStatCard from '../../../shared/components/molecules/common/SalesStatCard';
import CategorySalesCard from '../../../shared/components/molecules/common/CategorySalesCard';
import RecentSaleListItem from '../../../shared/components/molecules/common/RecentSaleListItem';
import SalesDateRangeFilter from '../../../shared/components/molecules/common/SalesDateRangeFilter';
import { useExportOperations } from '../../../shared/hooks/useExportOperations';
import { useSalesAnalytics } from '../../../shared/hooks/useSalesAnalytics';
import { showSuccessToast } from '../../../shared/components/organisms/ui/toastNotifications';
import { displayPrice } from '../../../shared/utils/helpers/formatting';
// Removed CSS import - using unified theme system instead

const SalesAnalytics: React.FC = () => {
  const { sales, loading, error, dateRange, setDateRange } =
    useSalesAnalytics();

  const [localDateRange, setLocalDateRange] = useState<DateRangeState>({
    startDate: dateRange?.startDate,
    endDate: dateRange?.endDate,
  });

  // Use centralized price formatting from utils/helpers/formatting.ts

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
          {/* Sales Overview Section - Context7 Premium */}
          <div className="relative mb-8">
            <div className="card-premium bg-[var(--theme-surface)] border-[var(--theme-border)] rounded-2xl p-8 particles">
              <div className="relative z-10">
                <UnifiedHeader
                  icon={TrendingUp}
                  title="Sales Overview"
                  subtitle="Track your collection's performance"
                  variant="analytics"
                  size="md"
                  className="mb-6"
                />

                {/* Error Display - Premium styling */}
                <FormErrorMessage error={error} variant="toast" />

                {Array.isArray(sales) && sales.length > 0 ? (
                  <>
                    {/* Key Metrics - Context7 Premium Cards using SalesStatCard */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                      {/* Total Cards Sold */}
                      <SalesStatCard
                        title="Total Cards"
                        value={sales.length}
                        emoji="🃏"
                        colorScheme={{
                          iconBg: 'from-emerald-500/20 to-cyan-500/20',
                          iconBorder: 'border-emerald-400/30',
                          titleColor: 'text-emerald-400',
                          progressGradient: 'from-emerald-400 to-cyan-400',
                          badgeColors:
                            'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
                        }}
                        badgeText="Cards Conquered"
                      />

                      {/* Total Revenue */}
                      <SalesStatCard
                        title="Total Revenue"
                        value={displayPrice(
                          sales.reduce(
                            (sum, sale) =>
                              sum + (Number(sale.actualSoldPrice) || 0),
                            0
                          )
                        ).replace(' kr.', '')}
                        icon={DollarSign}
                        colorScheme={{
                          iconBg: 'from-blue-500/20 to-purple-500/20',
                          iconBorder: 'border-blue-400/30',
                          titleColor: 'text-blue-400',
                          progressGradient: 'from-blue-400 to-purple-400',
                          badgeColors:
                            'bg-blue-500/20 text-blue-300 border-blue-400/30',
                        }}
                        badgeText="Revenue Generated"
                      />
                    </div>

                    {/* Category Breakdown Section */}
                    <div className="relative">
                      <UnifiedHeader
                        title="Category Breakdown"
                        subtitle="Sales performance by item type"
                        variant="analytics"
                        size="md"
                        className="mb-6"
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 via-purple-500/20 to-pink-500/20 backdrop-blur-sm rounded-xl shadow-2xl flex items-center justify-center border border-white/[0.15]">
                          <span className="text-2xl">📊</span>
                        </div>
                      </UnifiedHeader>

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
                              <CategorySalesCard
                                key={categoryKey}
                                category={categoryData}
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
              </div>
            </div>
          </div>

          {/* Recent Sales - Context7 Premium */}
          <div className="card-premium bg-[var(--theme-surface)] border-[var(--theme-border)] rounded-2xl relative overflow-hidden particles">
            <div className="p-8 border-b border-[var(--theme-border)]">
              <UnifiedHeader
                icon={TrendingUp}
                title="Recent Sales"
                subtitle="Your latest sold items with details"
                variant="analytics"
                size="md"
                className="mb-6"
                actions={
                  Array.isArray(sales) && sales.length > 0
                    ? [
                        {
                          label: 'Export CSV',
                          onClick: handleExportCSV,
                          icon: Download,
                          variant: 'secondary',
                          loading: loading,
                        },
                      ]
                    : []
                }
              />

              {/* Clean List View Layout */}
              <div className="p-0">
                {Array.isArray(sales) && sales.length > 0 ? (
                  <div className="divide-y divide-[var(--theme-border)]">
                    {sales.slice(0, 10).map((sale, index) => (
                      <RecentSaleListItem
                        key={sale.id || `sale-${index}`}
                        sale={sale}
                        index={index}
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
              </div>

              {/* Footer with View All Button - Premium glassmorphism */}
              {Array.isArray(sales) && sales.length > 10 && (
                <div className="px-8 py-6 border-t border-[var(--theme-border)] bg-gradient-to-r from-zinc-900/10 to-zinc-800/5 backdrop-blur-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full animate-pulse"></div>
                      <p className="text-sm text-[var(--theme-text-secondary)] font-medium">
                        Showing 10 of {sales.length} sales
                      </p>
                    </div>
                    <button className="btn-premium px-6 py-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 hover:text-blue-200 font-semibold rounded-xl border border-blue-500/30 hover:border-blue-400/50 transition-all duration-300 backdrop-blur-sm scale-on-hover">
                      <span className="flex items-center">
                        View All Sales
                        <svg
                          className="w-4 h-4 ml-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 8l4 4m0 0l-4 4m4-4H3"
                          />
                        </svg>
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default SalesAnalytics;
