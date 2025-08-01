/**
 * React Query Cache Debug Utilities
 * Use these functions in browser console to inspect cache
 */

import { queryClient } from '../lib/queryClient';

// Add to window for console access
declare global {
  interface Window {
    debugCache: typeof debugCache;
    clearCache: typeof clearCache;
    showCacheStats: typeof showCacheStats;
  }
}

export const debugCache = () => {
  console.log('🔍 REACT QUERY CACHE CONTENTS:');
  console.log('=====================================');
  
  const allQueries = queryClient.getQueryCache().getAll();
  
  allQueries.forEach((query, index) => {
    const { queryKey, state } = query;
    const status = state.status;
    const dataUpdatedAt = new Date(state.dataUpdatedAt).toLocaleTimeString();
    
    console.log(`${index + 1}. ${JSON.stringify(queryKey)}`);
    console.log(`   Status: ${status}`);
    console.log(`   Updated: ${dataUpdatedAt}`);
    console.log(`   Data exists: ${!!state.data}`);
    console.log(`   Is Stale: ${state.isStale}`);
    console.log('   ──────────────────────');
  });
  
  console.log(`Total queries in cache: ${allQueries.length}`);
  return allQueries;
};

export const clearCache = () => {
  queryClient.clear();
  console.log('🗑️ Cache cleared!');
};

export const showCacheStats = () => {
  const allQueries = queryClient.getQueryCache().getAll();
  const fresh = allQueries.filter(q => !q.state.isStale);
  const stale = allQueries.filter(q => q.state.isStale);
  const loading = allQueries.filter(q => q.state.status === 'pending');
  
  console.log('📊 CACHE STATISTICS:');
  console.log(`Total: ${allQueries.length}`);
  console.log(`Fresh: ${fresh.length} 🟢`);
  console.log(`Stale: ${stale.length} 🟡`);
  console.log(`Loading: ${loading.length} 🔴`);
};

// Make available in console
if (typeof window !== 'undefined') {
  window.debugCache = debugCache;
  window.clearCache = clearCache;
  window.showCacheStats = showCacheStats;
}