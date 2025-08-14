/**
 * Pure Time Utilities - Layer 1 Core
 * Following CLAUDE.md SOLID principles
 * 
 * SRP: Handles only time/date formatting and manipulation
 * DRY: Single source for time utilities
 * No external dependencies - pure functions only
 */

/**
 * Calculate relative time from timestamp
 */
export const getRelativeTime = (timestamp: string | Date): string => {
  const now = new Date();
  const past = new Date(timestamp);
  const diffInMs = now.getTime() - past.getTime();

  const minutes = Math.floor(diffInMs / 60000);
  const hours = Math.floor(diffInMs / 3600000);
  const days = Math.floor(diffInMs / 86400000);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (weeks < 4) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`;
  return `${years} year${years > 1 ? 's' : ''} ago`;
};

/**
 * Format timestamp - relative if recent, date otherwise
 */
export const formatTimestamp = (timestamp: string | Date): string => {
  const now = new Date();
  const past = new Date(timestamp);
  const diffInDays = Math.floor((now.getTime() - past.getTime()) / 86400000);

  if (diffInDays < 7) return getRelativeTime(timestamp);

  return past.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: past.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
};

/**
 * Format date only
 */
export const formatDate = (timestamp: string | Date): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Format time only
 */
export const formatTime = (timestamp: string | Date): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Format date and time
 */
export const formatDateTime = (timestamp: string | Date): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Format date with time for auction display
 */
export const formatDateWithTime = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Invalid Date';
  }
};