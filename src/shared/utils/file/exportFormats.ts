/**
 * Export Format Utilities (JSON, PDF)
 * Split from fileOperations.ts for better maintainability
 * 
 * Following CLAUDE.md principles:
 * - Single Responsibility: Non-CSV export formats
 * - DRY: Centralized export logic
 */

export type ExportFormat = 'csv' | 'json' | 'pdf';

/**
 * Converts data to JSON format and triggers download
 */
export const exportToJSON = <T extends Record<string, any>>(
  data: T[],
  filename: string = 'export.json'
): void => {
  try {
    // Convert data to JSON with proper formatting
    const jsonContent = JSON.stringify(data, null, 2);

    // Create Blob with proper MIME type for JSON
    const blob = new Blob([jsonContent], {
      type: 'application/json;charset=utf-8;',
    });

    // Create download link
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename.endsWith('.json') ? filename : `${filename}.json`;

    // Trigger download
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('JSON Export Error:', error);
    }
    throw new Error('Failed to export JSON file');
  }
};

/**
 * Converts data to PDF format and triggers download
 * Note: This is a placeholder implementation. For full PDF support,
 * consider using libraries like jsPDF or html2pdf
 */
export const exportToPDF = <T extends Record<string, any>>(
  data: T[],
  filename: string = 'export.pdf'
): void => {
  try {
    // For now, convert to a simple text format that can be viewed as PDF
    // In a real implementation, you'd use jsPDF or similar
    const textContent = data
      .map((item) =>
        Object.entries(item)
          .map(([key, value]) => `${key}: ${value}`)
          .join('\n')
      )
      .join('\n\n');

    // Create Blob with text content (placeholder for PDF)
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8;' });

    // Create download link
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename.endsWith('.pdf')
      ? filename.replace('.pdf', '.txt')
      : `${filename}.txt`;

    // Trigger download
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);

    if (process.env.NODE_ENV === 'development') {
      console.warn(
        'PDF export is not fully implemented. Exported as text file instead.'
      );
    }
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('PDF Export Error:', error);
    }
    throw new Error('Failed to export PDF file');
  }
};