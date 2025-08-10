import { describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useGenericCrudOperations } from '../crud/useGenericCrudOperations';

// Mock API service
const mockApiService = {
  getAllItems: vi.fn(),
  createItem: vi.fn(),
  updateItem: vi.fn(),
  deleteItem: vi.fn(),
};

describe('useGenericCrudOperations', () => {
  it('should initialize with loading state', () => {
    const { result } = renderHook(() =>
      useGenericCrudOperations({
        entityType: 'test',
        apiService: mockApiService,
        config: { enableAutoFetch: false },
      })
    );

    expect(result.current.loading).toBe(false);
    expect(result.current.items).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('should provide CRUD operations', () => {
    const { result } = renderHook(() =>
      useGenericCrudOperations({
        entityType: 'test',
        apiService: mockApiService,
        config: { enableAutoFetch: false },
      })
    );

    expect(typeof result.current.create).toBe('function');
    expect(typeof result.current.update).toBe('function');
    expect(typeof result.current.delete).toBe('function');
    expect(typeof result.current.fetch).toBe('function');
  });
});
