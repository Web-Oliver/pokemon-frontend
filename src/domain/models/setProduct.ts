/**
 * SetProduct TypeScript interfaces
 * Corresponds to SetProduct Mongoose schema from new backend architecture
 */

// SetProduct interface - NEW hierarchical structure
export interface ISetProduct {
  id: string;
  setProductName: string; // e.g., "Pokemon Scarlet & Violet"
  uniqueSetProductId: number; // Unique identifier for database rebuilding
}

// Database document type (with _id from MongoDB)
export interface ISetProductDocument extends ISetProduct {
  _id: string;
}