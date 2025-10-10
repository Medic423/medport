/**
 * Utility functions for safe numeric operations
 */

/**
 * Safely converts a value to a number with a default fallback
 * @param value - The value to convert
 * @param defaultValue - Default value if conversion fails
 * @returns The converted number or default value
 */
export const asNumber = (value: any, defaultValue: number = 0): number => {
  if (value === null || value === undefined || value === '') {
    return defaultValue;
  }
  
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
};

/**
 * Safely formats a number to a fixed decimal places
 * @param value - The value to format
 * @param decimals - Number of decimal places (default: 2)
 * @param defaultValue - Default value if formatting fails
 * @returns Formatted number string or default value
 */
export const toFixed = (value: any, decimals: number = 2, defaultValue: string = '0.00'): string => {
  const num = asNumber(value, 0);
  return num.toFixed(decimals);
};

/**
 * Safely calculates percentage
 * @param value - The value to convert to percentage
 * @param decimals - Number of decimal places (default: 1)
 * @returns Percentage string
 */
export const toPercentage = (value: any, decimals: number = 1): string => {
  const num = asNumber(value, 0);
  return `${(num * 100).toFixed(decimals)}%`;
};

/**
 * Safely formats currency
 * @param value - The value to format as currency
 * @param decimals - Number of decimal places (default: 2)
 * @returns Currency formatted string
 */
export const toCurrency = (value: any, decimals: number = 2): string => {
  const num = asNumber(value, 0);
  return `$${num.toFixed(decimals)}`;
};

/**
 * Safely formats file size
 * @param bytes - Size in bytes
 * @returns Formatted file size string
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
