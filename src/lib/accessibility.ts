/**
 * Accessibility utilities and guidelines for the application
 */

export const ARIA_LABELS = {
  // Navigation
  MAIN_NAVIGATION: 'Main navigation',
  USER_MENU: 'User account menu',
  CLOSE_MENU: 'Close menu',
  
  // Forms
  DATE_PICKER: 'Choose date',
  FILE_UPLOAD: 'Upload files',
  SEARCH_INPUT: 'Search',
  
  // Actions
  DELETE_ITEM: 'Delete item',
  EDIT_ITEM: 'Edit item',
  VIEW_ITEM: 'View item details',
  
  // Status
  LOADING: 'Loading content',
  ERROR: 'Error message',
  SUCCESS: 'Success message',
} as const;

export const SCREEN_READER_ONLY = 'sr-only';

/**
 * Provides accessible descriptions for common UI patterns
 */
export const getAccessibleDescription = (type: keyof typeof ARIA_LABELS): string => {
  return ARIA_LABELS[type];
};

/**
 * Creates accessible file size description
 */
export const getFileSizeDescription = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Creates accessible date description
 */
export const getDateDescription = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};
