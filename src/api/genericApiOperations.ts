/**
 * Generic API Operations
 * Layer 1: Core/Foundation/API Client
 *
 * DRY Implementation - Eliminates repetitive CRUD patterns across 13+ API files
 * SOLID Principles:
 * - SRP: Single responsibility for generic CRUD operations
 * - OCP: Open for extension via configuration
 * - LSP: All operations follow consistent interface
 * - ISP: Specific operation interfaces instead of fat interface
 * - DIP: Depends on abstractions (unifiedApiClient)
 */

import { EnhancedRequestConfig, unifiedApiClient } from './unifiedApiClient';

// ========== INTERFACES ==========

/**
 * Generic filter/query parameters
 */
export interface GenericParams {
  [key: string]: any;
}

/**
 * Configuration for API resource operations
 */
export interface ResourceConfig {
  endpoint: string; // e.g., '/auctions', '/cards'
  resourceName: string; // e.g., 'auction', 'card' - for logging/error messages
}

/**
 * Options for API operations
 */
export interface OperationOptions extends Partial<EnhancedRequestConfig> {
  transform?: (data: any) => any; // Optional data transformation
}

// ========== GENERIC CRUD OPERATIONS ==========

/**
 * Generic GET collection operation
 * Eliminates duplicate patterns across 10+ API files
 */
export async function getCollection<T>(
  config: ResourceConfig,
  params?: GenericParams,
  options?: OperationOptions
): Promise<T[]> {
  const { transform, ...requestOptions } = options || {};

  const data = await unifiedApiClient.apiGet<T[]>(
    config.endpoint,
    `${config.resourceName} collection`,
    {
      params,
      ...requestOptions,
    }
  );

  return transform ? transform(data) : data;
}

/**
 * Generic GET single resource operation
 * Eliminates duplicate patterns across 10+ API files
 */
export async function getResource<T>(
  config: ResourceConfig,
  id: string,
  options?: OperationOptions
): Promise<T> {
  const { transform, ...requestOptions } = options || {};

  const data = await unifiedApiClient.apiGet<T>(
    `${config.endpoint}/${id}`,
    `${config.resourceName} by ID`,
    requestOptions
  );

  return transform ? transform(data) : data;
}

/**
 * Generic CREATE resource operation
 * Eliminates duplicate patterns across 10+ API files
 */
export async function createResource<T>(
  config: ResourceConfig,
  resourceData: Partial<T>,
  options?: OperationOptions
): Promise<T> {
  const { transform, ...requestOptions } = options || {};

  const data = await unifiedApiClient.apiCreate<T>(
    config.endpoint,
    resourceData,
    config.resourceName,
    requestOptions
  );

  return transform ? transform(data) : data;
}

/**
 * Generic UPDATE resource operation
 * Eliminates duplicate patterns across 10+ API files
 */
export async function updateResource<T>(
  config: ResourceConfig,
  id: string,
  resourceData: Partial<T>,
  options?: OperationOptions
): Promise<T> {
  const { transform, ...requestOptions } = options || {};

  const data = await unifiedApiClient.apiUpdate<T>(
    `${config.endpoint}/${id}`,
    resourceData,
    config.resourceName,
    requestOptions
  );

  return transform ? transform(data) : data;
}

/**
 * Generic DELETE resource operation
 * Eliminates duplicate patterns across 10+ API files
 */
export async function deleteResource(
  config: ResourceConfig,
  id: string,
  options?: OperationOptions
): Promise<void> {
  const { ...requestOptions } = options || {};

  await unifiedApiClient.apiDelete(
    `${config.endpoint}/${id}`,
    config.resourceName,
    requestOptions
  );
}

/**
 * Generic BULK operations
 */
export async function bulkCreateResources<T>(
  config: ResourceConfig,
  resourcesData: Partial<T>[],
  options?: OperationOptions
): Promise<T[]> {
  const { transform, ...requestOptions } = options || {};

  const data = await unifiedApiClient.post<T[]>(
    `${config.endpoint}/bulk`,
    { items: resourcesData },
    {
      operation: `bulk create ${config.resourceName}s`,
      successMessage: `${resourcesData.length} ${config.resourceName}s created successfully`,
      ...requestOptions,
    }
  );

  return transform ? transform(data) : data;
}

/**
 * Generic search operation
 * Eliminates repetitive search patterns
 */
export async function searchResources<T>(
  config: ResourceConfig,
  searchParams: GenericParams,
  options?: OperationOptions
): Promise<T[]> {
  const { transform, ...requestOptions } = options || {};

  const data = await unifiedApiClient.apiGet<T[]>(
    `${config.endpoint}/search`,
    `search ${config.resourceName}s`,
    {
      params: searchParams,
      ...requestOptions,
    }
  );

  return transform ? transform(data) : data;
}

// ========== SPECIALIZED OPERATIONS ==========

/**
 * Generic mark as sold operation
 * Used by collection items (PSA cards, raw cards, sealed products)
 */
export async function markResourceSold<T>(
  config: ResourceConfig,
  id: string,
  saleDetails: any,
  options?: OperationOptions
): Promise<T> {
  const { transform, ...requestOptions } = options || {};

  const data = await unifiedApiClient.post<T>(
    `${config.endpoint}/${id}/mark-sold`,
    saleDetails,
    {
      operation: `mark ${config.resourceName} as sold`,
      successMessage: `${config.resourceName} marked as sold successfully! 💰`,
      ...requestOptions,
    }
  );

  return transform ? transform(data) : data;
}

/**
 * Generic export operation
 * Used by various export APIs
 */
export async function exportResource<T = Blob>(
  config: ResourceConfig,
  exportParams?: GenericParams,
  options?: OperationOptions
): Promise<T> {
  const { transform, ...requestOptions } = options || {};

  const data = await unifiedApiClient.apiExport<T>(
    `${config.endpoint}/export`,
    config.resourceName,
    {
      params: exportParams,
      ...requestOptions,
    }
  );

  return transform ? transform(data) : data;
}

/**
 * Generic batch operation
 * For operations that need to be performed on multiple resources
 */
export async function batchOperation<T>(
  config: ResourceConfig,
  operation: string,
  ids: string[],
  operationData?: any,
  options?: OperationOptions
): Promise<T[]> {
  const { transform, ...requestOptions } = options || {};

  const data = await unifiedApiClient.post<T[]>(
    `${config.endpoint}/batch/${operation}`,
    { ids, data: operationData },
    {
      operation: `batch ${operation} ${config.resourceName}s`,
      successMessage: `Batch ${operation} completed for ${ids.length} ${config.resourceName}s`,
      ...requestOptions,
    }
  );

  return transform ? transform(data) : data;
}

// ========== UTILITY FUNCTIONS ==========

/**
 * Create resource configuration
 * Helper for consistent resource config creation
 */
export function createResourceConfig(
  endpoint: string,
  resourceName: string
): ResourceConfig {
  return { endpoint, resourceName };
}

/**
 * Create transformation function for ID mapping
 * Common pattern across API files
 */
export function createIdMapper() {
  return (data: any): any => {
    if (!data) {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map(mapSingleId);
    }

    return mapSingleId(data);
  };
}

/**
 * Map _id to id for MongoDB compatibility
 * Extracted from repeated patterns across API files
 */
function mapSingleId(item: any): any {
  if (!item || typeof item !== 'object') {
    return item;
  }

  // Create a new object to avoid mutations
  const mapped = { ...item };

  // Map _id to id if id doesn't exist
  if (mapped._id && !mapped.id) {
    mapped.id = mapped._id;
  }

  // Recursively map nested objects (excluding metadata)
  for (const [key, value] of Object.entries(mapped)) {
    if (shouldMapNestedObject(key, value)) {
      mapped[key] = mapSingleId(value);
    }
  }

  return mapped;
}

/**
 * Determine if nested object should be ID-mapped
 * Extracted from collection API logic
 */
function shouldMapNestedObject(key: string, value: any): boolean {
  // Skip known metadata objects
  const metadataKeys = [
    'saleDetails',
    'psaGrades',
    'psaTotalGradedForCard',
    'priceHistory',
    'metadata',
    'cardInfo',
    'productInfo',
    'setInfo',
  ];

  if (metadataKeys.includes(key)) {
    return false;
  }

  // Only map objects that could have MongoDB _id fields
  return value && typeof value === 'object' && !Array.isArray(value);
}

// ========== RESOURCE OPERATIONS FACTORY ==========

/**
 * Generic resource operations interface
 */
export interface ResourceOperations<
  TResource,
  TCreatePayload = TResource,
  TUpdatePayload = Partial<TResource>,
> {
  getAll: (
    params?: GenericParams,
    options?: OperationOptions
  ) => Promise<TResource[]>;
  getById: (id: string, options?: OperationOptions) => Promise<TResource>;
  create: (
    data: TCreatePayload,
    options?: OperationOptions
  ) => Promise<TResource>;
  update: (
    id: string,
    data: TUpdatePayload,
    options?: OperationOptions
  ) => Promise<TResource>;
  remove: (id: string, options?: OperationOptions) => Promise<void>;
  search: (
    searchParams: GenericParams,
    options?: OperationOptions
  ) => Promise<TResource[]>;
  bulkCreate: (
    items: TCreatePayload[],
    options?: OperationOptions
  ) => Promise<TResource[]>;
  markSold?: (
    id: string,
    saleDetails: any,
    options?: OperationOptions
  ) => Promise<TResource>;
  export?: (
    exportParams?: GenericParams,
    options?: OperationOptions
  ) => Promise<Blob>;
  batchOperation?: (
    operation: string,
    ids: string[],
    operationData?: any,
    options?: OperationOptions
  ) => Promise<TResource[]>;
}

/**
 * Create fully generic resource operations
 * Eliminates boilerplate CRUD patterns across ALL API files
 *
 * @param config - Resource configuration (endpoint, resourceName)
 * @param options - Optional specialized operations configuration
 * @returns Complete CRUD operations interface for the resource type
 */
export function createResourceOperations<
  TResource,
  TCreatePayload = TResource,
  TUpdatePayload = Partial<TResource>,
>(
  config: ResourceConfig,
  options: {
    includeSoldOperations?: boolean;
    includeExportOperations?: boolean;
    includeBatchOperations?: boolean;
  } = {}
): ResourceOperations<TResource, TCreatePayload, TUpdatePayload> {
  const operations: ResourceOperations<
    TResource,
    TCreatePayload,
    TUpdatePayload
  > = {
    // Core CRUD operations
    getAll: (params?: GenericParams, requestOptions?: OperationOptions) =>
      getCollection<TResource>(config, params, requestOptions),

    getById: (id: string, requestOptions?: OperationOptions) =>
      getResource<TResource>(config, id, requestOptions),

    create: (data: TCreatePayload, requestOptions?: OperationOptions) =>
      createResource<TResource>(
        config,
        data as Partial<TResource>,
        requestOptions
      ),

    update: (
      id: string,
      data: TUpdatePayload,
      requestOptions?: OperationOptions
    ) =>
      updateResource<TResource>(
        config,
        id,
        data as Partial<TResource>,
        requestOptions
      ),

    remove: (id: string, requestOptions?: OperationOptions) =>
      deleteResource(config, id, requestOptions),

    search: (searchParams: GenericParams, requestOptions?: OperationOptions) =>
      searchResources<TResource>(config, searchParams, requestOptions),

    bulkCreate: (items: TCreatePayload[], requestOptions?: OperationOptions) =>
      bulkCreateResources<TResource>(
        config,
        items as Partial<TResource>[],
        requestOptions
      ),
  };

  // Optional specialized operations
  if (options.includeSoldOperations) {
    operations.markSold = (
      id: string,
      saleDetails: any,
      requestOptions?: OperationOptions
    ) => markResourceSold<TResource>(config, id, saleDetails, requestOptions);
  }

  if (options.includeExportOperations) {
    operations.export = (
      exportParams?: GenericParams,
      requestOptions?: OperationOptions
    ) => exportResource<Blob>(config, exportParams, requestOptions);
  }

  if (options.includeBatchOperations) {
    operations.batchOperation = (
      operation: string,
      ids: string[],
      operationData?: any,
      requestOptions?: OperationOptions
    ) =>
      batchOperation<TResource>(
        config,
        operation,
        ids,
        operationData,
        requestOptions
      );
  }

  return operations;
}

// ========== RESOURCE-SPECIFIC HELPERS ==========

/**
 * Common configuration for auction resources
 */
export const AUCTION_CONFIG = createResourceConfig('/auctions', 'auction');

/**
 * Common configuration for card resources
 */
export const CARD_CONFIG = createResourceConfig('/cards/enhanced', 'card');

/**
 * Common configuration for set resources
 */
export const SET_CONFIG = createResourceConfig('/sets', 'set');

/**
 * Common configuration for sales resources
 */
export const SALES_CONFIG = createResourceConfig('/sales', 'sale');

/**
 * Common configuration for CardMarket reference products
 */
export const CARDMARKET_REF_PRODUCTS_CONFIG = createResourceConfig(
  '/cardmarket-ref-products',
  'CardMarket reference product'
);

/**
 * Common configuration for DBA selection resources
 */
export const DBA_SELECTION_CONFIG = createResourceConfig(
  '/dba-selection',
  'DBA selection'
);

/**
 * Common configuration for export resources
 */
export const EXPORT_CONFIG = createResourceConfig('/export', 'export');

/**
 * Common configuration for activity resources
 */
export const ACTIVITY_CONFIG = createResourceConfig('/activities', 'activity');

/**
 * Common configuration for collection resources
 */
export const PSA_CARD_CONFIG = createResourceConfig(
  '/psa-graded-cards',
  'PSA card'
);
export const RAW_CARD_CONFIG = createResourceConfig('/raw-cards', 'raw card');
export const SEALED_PRODUCT_CONFIG = createResourceConfig(
  '/sealed-products',
  'sealed product'
);

/**
 * Common ID mapper instance
 */
export const idMapper = createIdMapper();
