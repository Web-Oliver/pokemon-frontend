/**
 * API Endpoints Display Page - SOLID/DRY Implementation
 * 
 * Following CLAUDE.md principles:
 * - Single Responsibility: Displays API endpoint documentation in organized format
 * - Open/Closed: Uses existing page structure patterns and unified design system
 * - DRY: Leverages PageLayout, PokemonCard, and other unified components
 * - Layer 4: Application Screen - orchestrates Layer 3 components
 */

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Server, 
  Code, 
  Database, 
  Search, 
  Zap,
  Globe,
  ChevronRight,
  Copy,
  ExternalLink
} from 'lucide-react';

// Import unified design system components following CLAUDE.md patterns
import { PageLayout } from '@/shared/components/layout/layouts/PageLayout';
import {
  PokemonCard,
  PokemonPageContainer,
  PokemonButton,
} from '@/shared/components/atoms/design-system';
import GenericLoadingState from '@/shared/components/molecules/common/GenericLoadingState';

// Service import following SOLID principles
import { statusService, StatusResponse } from '../services/EndpointsService';

/**
 * ApiEndpoints Page Component
 * Follows existing page structure patterns with unified design system integration
 */
const ApiEndpoints: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);

  const {
    data: statusData,
    isLoading,
    error,
  } = useQuery<StatusResponse>({
    queryKey: ['api-status'],
    queryFn: () => statusService.getApiStatus(),
    refetchOnWindowFocus: false,
  });

  // Loading state following existing patterns
  if (isLoading) {
    return (
      <PageLayout title="API Endpoints" subtitle="Loading endpoint documentation...">
        <GenericLoadingState message="Fetching API endpoints..." />
      </PageLayout>
    );
  }

  // Error state following existing patterns
  if (error) {
    return (
      <PageLayout title="API Endpoints" subtitle="Error loading endpoints">
        <PokemonCard className="max-w-2xl mx-auto">
          <div className="text-center p-6">
            <div className="text-red-500 mb-4">
              <Server size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Failed to Load Endpoints
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              {error instanceof Error ? error.message : 'Unknown error occurred'}
            </p>
          </div>
        </PokemonCard>
      </PageLayout>
    );
  }

  if (!statusData) {
    return (
      <PageLayout title="API Endpoints" subtitle="No data available">
        <PokemonCard className="max-w-2xl mx-auto">
          <div className="text-center p-6">
            <p className="text-gray-600 dark:text-gray-300">No endpoint data available</p>
          </div>
        </PokemonCard>
      </PageLayout>
    );
  }

  // Filter endpoints based on search and category
  const filteredEndpoints = Object.entries(statusData.endpoints).reduce(
    (acc, [category, endpoints]) => {
      if (selectedCategory !== 'all' && selectedCategory !== category) {
        return acc;
      }

      const filteredCategoryEndpoints = Object.entries(endpoints).filter(([endpoint, description]) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          endpoint.toLowerCase().includes(searchLower) ||
          description.toLowerCase().includes(searchLower) ||
          category.toLowerCase().includes(searchLower)
        );
      });

      if (filteredCategoryEndpoints.length > 0) {
        acc[category] = Object.fromEntries(filteredCategoryEndpoints);
      }

      return acc;
    },
    {} as Record<string, Record<string, string>>
  );

  const categories = Object.keys(statusData.endpoints);
  const categoryIcons = getCategoryIcon();

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedEndpoint(text);
      setTimeout(() => setCopiedEndpoint(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <PageLayout 
      title="API Endpoints Documentation" 
      subtitle={statusData.system.description}
    >
      <PokemonPageContainer>
        {/* System Overview Card */}
        <PokemonCard className="mb-8 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Server className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {statusData.system.name}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Version {statusData.system.version}
                </p>
              </div>
            </div>

            {/* System Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {statusData.summary.totalEndpoints}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Total Endpoints</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {statusData.summary.totalCategories}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Categories</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {statusData.summary.totalFeatures}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Features</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {statusData.system.architecture.patterns.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Patterns</div>
              </div>
            </div>

            {/* Architecture Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-semibold text-gray-700 dark:text-gray-300">Framework:</span>
                <span className="ml-1 text-gray-600 dark:text-gray-400">
                  {statusData.system.architecture.framework}
                </span>
              </div>
              <div>
                <span className="font-semibold text-gray-700 dark:text-gray-300">Database:</span>
                <span className="ml-1 text-gray-600 dark:text-gray-400">
                  {statusData.system.architecture.database}
                </span>
              </div>
              <div>
                <span className="font-semibold text-gray-700 dark:text-gray-300">Search:</span>
                <span className="ml-1 text-gray-600 dark:text-gray-400">
                  {statusData.system.architecture.search}
                </span>
              </div>
            </div>
          </div>
        </PokemonCard>

        {/* Search and Filter Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search endpoints, descriptions, or categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
            />
          </div>
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {formatCategoryName(category)} ({Object.keys(statusData.endpoints[category]).length})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Endpoints Display */}
        <div className="space-y-6">
          {Object.entries(filteredEndpoints).map(([category, endpoints]) => (
            <PokemonCard key={category} className="overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-600">
                <div className="flex items-center gap-3">
                  {categoryIcons[category] || <Code className="h-5 w-5 text-gray-500" />}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {formatCategoryName(category)}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {Object.keys(endpoints).length} endpoints available
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {Object.entries(endpoints).map(([endpoint, description]) => {
                  const method = extractMethod(endpoint);
                  const path = extractPath(endpoint);
                  
                  return (
                    <div
                      key={endpoint}
                      className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`inline-flex px-2 py-1 text-xs font-bold rounded ${getMethodColor(method)}`}>
                              {method}
                            </span>
                            <code className="text-sm font-mono text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                              {path}
                            </code>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {description}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <PokemonButton
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(path)}
                            className="opacity-70 hover:opacity-100"
                          >
                            {copiedEndpoint === path ? (
                              <span className="text-green-500 text-xs">Copied!</span>
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </PokemonButton>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </PokemonCard>
          ))}
        </div>

        {/* No Results */}
        {Object.keys(filteredEndpoints).length === 0 && (
          <PokemonCard className="text-center py-12">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No endpoints found
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Try adjusting your search terms or category filter.
            </p>
          </PokemonCard>
        )}

        {/* Features List */}
        <PokemonCard className="mt-8">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              System Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {statusData.system.features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <ChevronRight className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </PokemonCard>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Last updated: {new Date(statusData.timestamp).toLocaleString()}
          </p>
        </div>
      </PokemonPageContainer>
    </PageLayout>
  );
};

/**
 * Helper Functions - SOLID Single Responsibility
 */
function getCategoryIcon(): Record<string, React.ReactNode> {
  return {
    status: <Server className="h-5 w-5 text-blue-500" />,
    health: <Zap className="h-5 w-5 text-green-500" />,
    search: <Search className="h-5 w-5 text-purple-500" />,
    cards: <Code className="h-5 w-5 text-yellow-500" />,
    sets: <Database className="h-5 w-5 text-indigo-500" />,
    products: <Globe className="h-5 w-5 text-pink-500" />,
    collection: <Database className="h-5 w-5 text-teal-500" />,
    activities: <ExternalLink className="h-5 w-5 text-orange-500" />,
    icr: <Code className="h-5 w-5 text-red-500" />,
    marketplace: <Globe className="h-5 w-5 text-cyan-500" />,
    uploads: <ExternalLink className="h-5 w-5 text-lime-500" />,
    workflow: <Zap className="h-5 w-5 text-amber-500" />,
    management: <Server className="h-5 w-5 text-gray-500" />,
  };
}

function formatCategoryName(category: string): string {
  return category
    .split(/(?=[A-Z])/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function extractMethod(endpoint: string): string {
  const match = endpoint.match(/^(GET|POST|PUT|PATCH|DELETE)\s/);
  return match ? match[1] : 'GET';
}

function extractPath(endpoint: string): string {
  return endpoint.replace(/^(GET|POST|PUT|PATCH|DELETE)\s/, '');
}

function getMethodColor(method: string): string {
  switch (method.toUpperCase()) {
    case 'GET':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'POST':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'PUT':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'PATCH':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    case 'DELETE':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
}

export default ApiEndpoints;