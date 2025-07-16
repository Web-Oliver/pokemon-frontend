/**
 * CSV Export Utility
 * Following Context7 best practices for file generation and download
 * CLAUDE.md Layer 1 (Core/Foundation) - Application-agnostic utility
 */

export interface CSVColumn {
  key: string;
  header: string;
  formatter?: (value: any) => string;
}

export interface CSVExportOptions {
  filename?: string;
  columns: CSVColumn[];
  delimiter?: string;
  includeHeaders?: boolean;
}

/**
 * Converts data to CSV format and triggers download
 * Following Context7 best practices with Blob and URL.createObjectURL
 */
export const exportToCSV = <T extends Record<string, any>>(
  data: T[],
  options: CSVExportOptions
): void => {
  const {
    filename = 'export.csv',
    columns,
    delimiter = ',',
    includeHeaders = true,
  } = options;

  try {
    // Generate CSV content
    const csvContent = generateCSVContent(data, columns, delimiter, includeHeaders);
    
    // Create Blob with proper MIME type for CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // Use Context7 best practice: URL.createObjectURL for download
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Cleanup: remove link and revoke URL to free memory
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    
  } catch (error) {
    console.error('CSV Export Error:', error);
    throw new Error('Failed to export CSV file');
  }
};

/**
 * Generates CSV content string from data array
 * Private utility function
 */
const generateCSVContent = <T extends Record<string, any>>(
  data: T[],
  columns: CSVColumn[],
  delimiter: string,
  includeHeaders: boolean
): string => {
  const lines: string[] = [];

  // Add headers if requested
  if (includeHeaders) {
    const headers = columns.map(col => escapeCSVField(col.header));
    lines.push(headers.join(delimiter));
  }

  // Add data rows
  data.forEach(item => {
    const row = columns.map(col => {
      const value = item[col.key];
      const formattedValue = col.formatter ? col.formatter(value) : String(value ?? '');
      return escapeCSVField(formattedValue);
    });
    lines.push(row.join(delimiter));
  });

  return lines.join('\n');
};

/**
 * Escapes CSV field values to handle special characters
 * Follows CSV RFC 4180 specification
 */
const escapeCSVField = (value: string): string => {
  // If value contains delimiter, newlines, or quotes, wrap in quotes and escape internal quotes
  if (value.includes(',') || value.includes('\n') || value.includes('\r') || value.includes('"')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

/**
 * Pre-defined column configurations for common data types
 */
export const commonCSVColumns = {
  sales: [
    { key: 'itemName', header: 'Item Name' },
    { key: 'itemCategory', header: 'Category' },
    { key: 'myPrice', header: 'Original Price (DKK)', formatter: (value: number) => value?.toFixed(2) || '0.00' },
    { key: 'actualSoldPrice', header: 'Sold Price (DKK)', formatter: (value: number) => value?.toFixed(2) || '0.00' },
    { key: 'profit', header: 'Profit (DKK)', formatter: (value: number) => value?.toFixed(2) || '0.00' },
    { key: 'profitMargin', header: 'Profit Margin (%)', formatter: (value: number) => value?.toFixed(1) || '0.0' },
    { key: 'dateSold', header: 'Date Sold', formatter: (value: string) => {
      if (!value) return '';
      return new Date(value).toLocaleDateString('da-DK');
    }},
    { key: 'source', header: 'Sales Source' },
  ] as CSVColumn[],
};