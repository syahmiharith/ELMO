/**
 * @file Main API Index
 * Unified API that switches between real and mock implementations
 * Uses lazy loading to avoid Firebase initialization when in mock mode
 */

import { API_MODE, API_CONFIG, ApiMode } from './config';

/**
 * Lazy-loaded API implementations to avoid Firebase initialization issues
 */
let _realApi: any = null;
let _mockApi: any = null;

/**
 * Get real API implementation with lazy loading
 */
function getRealApi() {
  if (!_realApi) {
    try {
      const realModule = require('./real');
      _realApi = realModule.realApi;
    } catch (error) {
      console.warn('Failed to load real API (Firebase may not be configured):', error);
      // Fallback to mock API if real API fails to load
      return getMockApi();
    }
  }
  return _realApi;
}

/**
 * Get mock API implementation with lazy loading
 */
function getMockApi() {
  if (!_mockApi) {
    const mockModule = require('./mock');
    _mockApi = mockModule.mockApi;
  }
  return _mockApi;
}

/**
 * Get the appropriate API implementation based on configuration
 */
function getApiImplementation() {
  if (API_MODE === 'mock') {
    return getMockApi();
  } else {
    return getRealApi();
  }
}

/**
 * Main API interface that switches between real and mock implementations
 * based on the API_MODE configuration with lazy loading
 */
export const api = new Proxy({} as any, {
  get(target, prop) {
    const impl = getApiImplementation();
    if (impl && prop in impl) {
      return impl[prop];
    }
    return undefined;
  }
});

/**
 * Legacy exports for backward compatibility
 * These are lazily loaded to avoid Firebase initialization issues
 */
export const listClubs = (...args: any[]) => getApiImplementation().listClubs(...args);
export const getClub = (...args: any[]) => getApiImplementation().getClub(...args);
export const listEvents = (...args: any[]) => getApiImplementation().listEvents(...args);
export const getEvent = (...args: any[]) => getApiImplementation().getEvent(...args);
export const listUsers = (...args: any[]) => getApiImplementation().listUsers(...args);
export const getUser = (...args: any[]) => getApiImplementation().getUser(...args);

// Re-export types for convenience
export type * from './types';

// Re-export configuration
export { API_MODE, API_CONFIG, type ApiMode } from './config';

/**
 * Direct access to implementations (lazy loaded)
 */
export const realApi = new Proxy({} as any, {
  get(target, prop) {
    const impl = getRealApi();
    if (impl && prop in impl) {
      return impl[prop];
    }
    return undefined;
  }
});

export const mockApi = new Proxy({} as any, {
  get(target, prop) {
    const impl = getMockApi();
    if (impl && prop in impl) {
      return impl[prop];
    }
    return undefined;
  }
});

export default api;
