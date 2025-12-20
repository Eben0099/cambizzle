import * as XLSX from 'xlsx';

/**
 * Export data to Excel file
 * @param {Array} data - Array of objects to export
 * @param {string} filename - Name of the file (without extension)
 * @param {Object} options - Optional configuration
 * @param {Array} options.columns - Array of column definitions { header: 'Display Name', key: 'dataKey' }
 * @param {string} options.sheetName - Name of the sheet (default: 'Data')
 */
export const exportToExcel = (data, filename, options = {}) => {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  const { columns, sheetName = 'Data' } = options;

  let exportData;

  if (columns && columns.length > 0) {
    // Map data using column definitions
    exportData = data.map(item => {
      const row = {};
      columns.forEach(col => {
        const value = col.key.split('.').reduce((obj, key) => obj?.[key], item);
        row[col.header] = formatValue(value);
      });
      return row;
    });
  } else {
    // Use data as-is, format values
    exportData = data.map(item => {
      const row = {};
      Object.keys(item).forEach(key => {
        row[key] = formatValue(item[key]);
      });
      return row;
    });
  }

  // Create workbook and worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(exportData);

  // Auto-size columns
  const colWidths = [];
  if (exportData.length > 0) {
    Object.keys(exportData[0]).forEach((key, i) => {
      const maxLength = Math.max(
        key.length,
        ...exportData.map(row => String(row[key] || '').length)
      );
      colWidths[i] = { wch: Math.min(maxLength + 2, 50) };
    });
    worksheet['!cols'] = colWidths;
  }

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Generate filename with date
  const date = new Date().toISOString().split('T')[0];
  const fullFilename = `${filename}_${date}.xlsx`;

  // Download file
  XLSX.writeFile(workbook, fullFilename);
};

/**
 * Format value for Excel
 */
const formatValue = (value) => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (value instanceof Date) return value.toLocaleDateString();
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'object') return JSON.stringify(value);
  return value;
};

export default exportToExcel;
