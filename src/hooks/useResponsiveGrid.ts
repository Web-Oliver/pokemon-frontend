/**
 * Responsive Grid Hook
 * Layer 2: Services/Hooks/Store (Business Logic & Data Orchestration)
 * Calculates optimal grid parameters based on screen size
 */

import { useState, useEffect } from 'react';

interface GridConfig {
  columns: number;
  itemWidth: number;
  containerWidth: number;
}

export const useResponsiveGrid = (): GridConfig => {
  const [config, setConfig] = useState<GridConfig>({
    columns: 3,
    itemWidth: 300,
    containerWidth: 900
  });

  useEffect(() => {
    const updateConfig = () => {
      const screenWidth = window.innerWidth;
      
      let columns: number;
      let itemWidth: number;

      if (screenWidth >= 1024) {
        // Desktop: 3 columns, fixed width that works well
        columns = 3;
        itemWidth = 300;
      } else if (screenWidth >= 768) {
        // Tablet: 2 columns
        columns = 2;
        itemWidth = 350;
      } else {
        // Mobile: 1 column
        columns = 1;
        itemWidth = 400;
      }

      setConfig({
        columns,
        itemWidth,
        containerWidth: columns * itemWidth
      });
    };

    // Initial calculation
    updateConfig();

    // Listen for resize events
    window.addEventListener('resize', updateConfig);

    return () => {
      window.removeEventListener('resize', updateConfig);
    };
  }, []);

  return config;
};