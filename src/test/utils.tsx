import { render as rtlRender, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a custom render function that includes providers
function render(ui: ReactElement, options?: RenderOptions) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Disable retries for tests
        gcTime: 0, // Disable caching for tests
      },
    },
  });

  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{children}</BrowserRouter>
    </QueryClientProvider>
  );

  return rtlRender(ui, { wrapper: Wrapper, ...options });
}

// Mock API service for tests
export const mockApiService = {
  collection: {
    getItems: vi.fn(),
    createItem: vi.fn(),
    updateItem: vi.fn(),
    deleteItem: vi.fn(),
  },
  search: {
    searchCards: vi.fn(),
    searchSets: vi.fn(),
    searchProducts: vi.fn(),
  },
  auctions: {
    getAuctions: vi.fn(),
    createAuction: vi.fn(),
    updateAuction: vi.fn(),
  },
};

// Re-export everything
export * from '@testing-library/react';
export { render };
export { default as userEvent } from '@testing-library/user-event';
