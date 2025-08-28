/**
 * Router Component
 * Layer 3: Components (UI Building Blocks) - Router Pattern
 *
 * SOLID-compliant router implementation to eliminate App.tsx SRP violations
 * Replaces 73-line renderPage() function with clean, maintainable routing
 *
 * Following CLAUDE.md principles:
 * - Single Responsibility: Handles only routing logic and component rendering
 * - Open/Closed: Extensible through route configuration, closed for modification
 * - Dependency Inversion: Depends on route configuration abstraction
 * - DRY: Eliminates duplicate route parsing and component selection logic
 */

import React, { lazy } from 'react';
import { RouteConfig, RouteHandler } from './types/RouterTypes';
import { matchRoute } from './utils/routeUtils';

// Context7 Lazy Loading Strategy - Performance Optimized Code Splitting
// Critical path components (loaded immediately with Suspense boundaries)
const Dashboard = lazy(() => import('../../pages/Dashboard'));
const Collection = lazy(() => import('../../pages/Collection'));

// Secondary features (lazy loaded with prefetch hints)
const CollectionItemDetail = lazy(
  () =>
    import(
      /* webpackChunkName: "item-detail" */ '../../pages/CollectionItemDetail'
    )
);
const AddEditItem = lazy(
  () => import(/* webpackChunkName: "forms" */ '../../pages/AddEditItem')
);

// Search features (bundled together for caching)
const SetSearch = lazy(
  () =>
    import(/* webpackChunkName: "search-features" */ '../../pages/SetSearch')
);
const SealedProductSearch = lazy(
  () =>
    import(
      /* webpackChunkName: "search-features" */ '../../pages/SealedProductSearch'
    )
);

// Auction features (bundled together for better caching)
const Auctions = lazy(
  () =>
    import(/* webpackChunkName: "auction-features" */ '../../pages/Auctions')
);
const AuctionDetail = lazy(
  () =>
    import(
      /* webpackChunkName: "auction-features" */ '../../pages/AuctionDetail'
    )
);
const CreateAuction = lazy(
  () =>
    import(
      /* webpackChunkName: "auction-features" */ '../../pages/CreateAuction'
    )
);
const AuctionEdit = lazy(
  () =>
    import(/* webpackChunkName: "auction-features" */ '../../pages/AuctionEdit')
);

// Analytics and heavy features (separate chunks)
const SalesAnalytics = lazy(
  () => import(/* webpackChunkName: "analytics" */ '../../pages/SalesAnalytics')
);
const Activity = lazy(
  () => import(/* webpackChunkName: "activity" */ '../../pages/Activity')
);
const DbaExport = lazy(
  () => import(/* webpackChunkName: "export" */ '../../pages/DbaExport')
);

// OCR Features (separate chunk for specialized functionality)
const OcrWorkflow = lazy(
  () => import(/* webpackChunkName: "ocr-features" */ '../../features/ocr-matching/components/OcrWorkflow')
);

// Matching Features (separate chunk for matching workflow)
const MatchingWorkflow = lazy(
  () => import(/* webpackChunkName: "matching-features" */ '../../features/matching/pages/MatchingWorkflow')
);

// Route Configuration - Single Source of Truth for Routing Logic
// Following Open/Closed Principle - extensible configuration
const ROUTE_CONFIG: RouteConfig[] = [
  // Static Routes
  { path: '/', component: Dashboard, exact: true },
  { path: '/dashboard', component: Dashboard, exact: true },
  { path: '/collection', component: Collection, exact: true },
  { path: '/collection/add', component: AddEditItem, exact: true },
  { path: '/add-item', component: AddEditItem, exact: true },
  { path: '/sets', component: SetSearch, exact: true },
  { path: '/set-search', component: SetSearch, exact: true },
  {
    path: '/sealed-products-search',
    component: SealedProductSearch,
    exact: true,
  },
  { path: '/auctions', component: Auctions, exact: true },
  { path: '/sales-analytics', component: SalesAnalytics, exact: true },
  { path: '/analytics', component: SalesAnalytics, exact: true },
  { path: '/activity', component: Activity, exact: true },
  { path: '/dba-export', component: DbaExport, exact: true },
  { path: '/ocr', component: OcrWorkflow, exact: true },
  { path: '/ocr-matching', component: OcrWorkflow, exact: true },
  { path: '/matching', component: MatchingWorkflow, exact: true },

  // Dynamic Routes - Parameterized with type safety
  {
    path: '/auctions/create',
    component: CreateAuction,
    exact: true,
  },
  {
    path: '/auctions/:id/edit',
    component: AuctionEdit,
    exact: true,
    paramHandler: (params) => ({ auctionId: params.id }),
  },
  {
    path: '/auctions/:id',
    component: AuctionDetail,
    exact: true,
    paramHandler: (params) => ({ auctionId: params.id }),
  },
  {
    path: '/collection/edit/:type/:id',
    component: AddEditItem,
    exact: true,
    validateParams: (params) => {
      const validTypes = ['psa', 'raw', 'sealed'];
      return validTypes.includes(params.type) && !!params.id;
    },
  },
  {
    path: '/collection/:type/:id',
    component: CollectionItemDetail,
    exact: true,
    validateParams: (params) => {
      const validTypes = ['psa', 'raw', 'sealed'];
      return validTypes.includes(params.type) && !!params.id;
    },
  },
];

interface RouterProps {
  currentPath: string;
}

/**
 * Router Component
 * Single Responsibility: Route matching and component rendering
 * Open/Closed: Extensible through ROUTE_CONFIG without modification
 * Dependency Inversion: Depends on RouteConfig abstraction
 */
const Router: React.FC<RouterProps> = ({ currentPath }) => {
  // Route Matching Logic - Single Responsibility Pattern
  const matchedRoute = findMatchingRoute(currentPath);

  if (!matchedRoute) {
    // Default fallback - matches original behavior
    return <Dashboard />;
  }

  const { route, params } = matchedRoute;
  const Component = route.component;

  // Parameter validation if specified
  if (route.validateParams && !route.validateParams(params)) {
    return <Dashboard />;
  }

  // Parameter processing if handler specified
  const componentProps = route.paramHandler ? route.paramHandler(params) : {};

  return <Component {...componentProps} />;
};

/**
 * Route Matching Algorithm
 * Single Responsibility: Find matching route for given path
 * DRY: Eliminates duplicate route parsing logic
 */
function findMatchingRoute(currentPath: string): RouteHandler | null {
  for (const route of ROUTE_CONFIG) {
    const match = matchRoute(route.path, currentPath, route.exact);
    if (match) {
      return {
        route,
        params: match.params,
      };
    }
  }
  return null;
}

export default Router;
