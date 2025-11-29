/**
 * Date and time utility functions
 * Centralized to eliminate duplication across the codebase
 */

import { format, parseISO, isValid } from 'date-fns';

/**
 * Safely format a date with fallback for invalid inputs
 * @param {Date|string|number|null|undefined} input - Date input
 * @param {string} pattern - date-fns format pattern
 * @returns {string} Formatted date or 'Invalid Date'
 */
export function safeFormatDate(input, pattern = 'MMM d, yyyy p') {
  if (!input) return 'Invalid Date';
  
  try {
    let date;
    if (typeof input === 'string') {
      date = parseISO(input);
    } else if (input instanceof Date) {
      date = input;
    } else if (typeof input === 'number') {
      date = new Date(input);
    } else {
      return 'Invalid Date';
    }
    
    if (!isValid(date)) return 'Invalid Date';
    return format(date, pattern);
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid Date';
  }
}

/**
 * Convert date to ISO 8601 string (UTC)
 * @param {Date|string|number} date - Date input
 * @returns {string|null} ISO string or null if invalid
 */
export function toIsoZ(date) {
  try {
    const d = new Date(date);
    if (!isValid(d)) return null;
    return d.toISOString();
  } catch (error) {
    return null;
  }
}

/**
 * Get relative time string (e.g., "2 hours ago")
 * @param {Date|string|number} date - Date input
 * @returns {string} Relative time string
 */
export function getRelativeTime(date) {
  try {
    const d = new Date(date);
    if (!isValid(d)) return 'Unknown time';
    
    const now = new Date();
    const diffMs = now - d;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffSecs < 60) return 'just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    
    return format(d, 'MMM d, yyyy');
  } catch (error) {
    return 'Unknown time';
  }
}