import { API_BASE_URL } from '../config/api';

// API Configuration
export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  API_URL: API_BASE_URL
};

// Theme and colors
export const THEME = {
  colors: {
    primary: '#D6BA69',
    black: '#000000',
    white: '#FFFFFF',
    gray: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827'
    }
  }
};

// Ad categories
export const CATEGORIES = [
  { id: 'vehicules', name: 'Vehicles', icon: 'Car' },
  { id: 'immobilier', name: 'Real Estate', icon: 'Home' },
  { id: 'emploi', name: 'Jobs', icon: 'Briefcase' },
  { id: 'mode', name: 'Fashion', icon: 'Shirt' },
  { id: 'maison', name: 'Home & Garden', icon: 'Sofa' },
  { id: 'loisirs', name: 'Leisure', icon: 'Gamepad2' },
  { id: 'multimedia', name: 'Multimedia', icon: 'Smartphone' },
  { id: 'services', name: 'Services', icon: 'Wrench' }
];

// Ad types
export const AD_TYPES = {
  SELL: 'sell',
  BUY: 'buy',
  RENT: 'rent',
  SERVICE: 'service'
};

// Ad statuses
export const AD_STATUS = {
  DRAFT: 'draft',
  PENDING: 'pending',
  ACTIVE: 'active',
  SOLD: 'sold',
  EXPIRED: 'expired',
  REJECTED: 'rejected'
};

// User types
export const USER_TYPES = {
  BUYER: 'buyer',
  SELLER: 'seller',
  ADMIN: 'admin'
};

// Verification statuses
export const VERIFICATION_STATUS = {
  UNVERIFIED: 'unverified',
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected'
};

// Application configuration
export const APP_CONFIG = {
  name: 'Cambizzle',
  description: 'Classifieds platform',
  maxPhotosPerAd: 10,
  maxFileSize: 5 * 1024 * 1024, // 5MB
  supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
  pagination: {
    defaultLimit: 20,
    maxLimit: 100
  }
};

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Connection error. Please try again.',
  UNAUTHORIZED: 'You must be logged in to perform this action.',
  FORBIDDEN: 'You do not have the necessary permissions.',
  NOT_FOUND: 'Resource not found.',
  VALIDATION_ERROR: 'Invalid data. Please check your information.',
  FILE_TOO_LARGE: 'File is too large (max 5MB).',
  INVALID_FILE_TYPE: 'Unsupported file type.'
};

// Success messages
export const SUCCESS_MESSAGES = {
  AD_CREATED: 'Ad created successfully!',
  AD_UPDATED: 'Ad updated successfully!',
  AD_DELETED: 'Ad deleted successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  EMAIL_SENT: 'Email sent successfully!',
  VERIFICATION_SUBMITTED: 'Verification request submitted!'
};
