/**
 * Time Utilities - Context7 Time Formatting
 * 
 * Utility functions for displaying time in a user-friendly format.
 * Calculates relative time dynamically for accurate "time ago" display.
 */

/**
 * Calculate relative time from a timestamp
 * Returns human-readable relative time like "2 minutes ago", "1 hour ago", etc.
 */
export const getRelativeTime = (timestamp: string | Date): string => {
  const now = new Date();
  const past = new Date(timestamp);
  const diffInMs = now.getTime() - past.getTime();
  
  // Convert to different time units
  const minutes = Math.floor(diffInMs / 60000);
  const hours = Math.floor(diffInMs / 3600000);
  const days = Math.floor(diffInMs / 86400000);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);
  
  // Return appropriate format based on time elapsed
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (weeks < 4) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`;
  return `${years} year${years > 1 ? 's' : ''} ago`;
};

/**
 * Format timestamp for display
 * Returns relative time if recent, otherwise formatted date
 */
export const formatTimestamp = (timestamp: string | Date): string => {
  const now = new Date();
  const past = new Date(timestamp);
  const diffInDays = Math.floor((now.getTime() - past.getTime()) / 86400000);
  
  // Use relative time for recent activities (within 7 days)
  if (diffInDays < 7) {
    return getRelativeTime(timestamp);
  }
  
  // Use formatted date for older activities
  return past.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: past.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
};

/**
 * Get formatted date string
 */
export const formatDate = (timestamp: string | Date): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Get formatted time string
 */
export const formatTime = (timestamp: string | Date): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Get formatted date and time string
 */
export const formatDateTime = (timestamp: string | Date): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};