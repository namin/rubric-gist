/**
 * Pure utility functions for formatting data display
 * No side effects, deterministic outputs
 */

import { formatDistanceToNow, format } from 'date-fns';
import type { Gist, GistFile } from '../types/gist.types';

export const DATE_FORMATS = {
  short: 'MMM d, yyyy',
  long: 'MMMM d, yyyy \'at\' h:mm a',
  relative: 'relative',
} as const;

const DATE_FORMAT_CONFIG = {
  short: 'MMM d, yyyy',
  long: 'MMMM d, yyyy \'at\' h:mm a',
  relative: true,
};

const FILE_SIZE_UNITS = ['B', 'KB', 'MB', 'GB'];

/**
 * Formats a date string to a readable format
 * @param dateString - ISO date string
 * @returns Formatted date string
 */
export function formatDate(dateString: string): string {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return format(date, DATE_FORMAT_CONFIG.short);
  } catch {
    return dateString;
  }
}

/**
 * Formats a date string to relative time (e.g., "2 hours ago")
 * @param dateString - ISO date string
 * @returns Relative time string
 */
export function formatRelativeTime(dateString: string): string {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return dateString;
  }
}

/**
 * Formats file size in bytes to human-readable format
 * @param bytes - File size in bytes
 * @returns Formatted file size string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const size = bytes / Math.pow(k, i);
  
  return `${size.toFixed(i === 0 ? 0 : 1)} ${FILE_SIZE_UNITS[i]}`;
}

/**
 * Truncates text to specified length with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

/**
 * Formats language name for display
 * @param language - Language string or null
 * @returns Formatted language name
 */
export function formatLanguage(language: string | null): string {
  if (!language) return 'Plain text';
  return language;
}

/**
 * Formats gist URL for display
 * @param gist - Gist object
 * @returns Formatted URL
 */
export function formatGistUrl(gist: Gist): string {
  return gist.html_url;
}

/**
 * Formats file URL for display
 * @param file - GistFile object
 * @returns Formatted URL
 */
export function formatFileUrl(file: GistFile): string {
  return file.raw_url;
}
