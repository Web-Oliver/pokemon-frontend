/**
 * Environment switcher for migration testing
 * Allows running same tests against old vs new frontend
 */

export interface TestEnvironment {
  name: 'old' | 'new';
  baseURL: string;
  apiBaseURL: string;
  description: string;
}

export const environments: Record<string, TestEnvironment> = {
  old: {
    name: 'old',
    baseURL: 'http://localhost:5173',
    apiBaseURL: 'http://localhost:3000/api',
    description: 'Original frontend (pokemon-collection-frontend)',
  },
  new: {
    name: 'new',
    baseURL: 'http://localhost:3001',
    apiBaseURL: 'http://localhost:3000/api', // Same backend
    description: 'New frontend (frontend)',
  },
};

export const getCurrentEnvironment = (): TestEnvironment => {
  const target = process.env.TEST_TARGET as 'old' | 'new';

  if (!target || !environments[target]) {
    throw new Error(
      'TEST_TARGET environment variable must be "old" or "new". ' +
        'Run: TEST_TARGET=old npm run test:regression'
    );
  }

  return environments[target];
};

export const getBaseURL = (): string => {
  return getCurrentEnvironment().baseURL;
};

export const getApiBaseURL = (): string => {
  return getCurrentEnvironment().apiBaseURL;
};

export const isOldFrontend = (): boolean => {
  return getCurrentEnvironment().name === 'old';
};

export const isNewFrontend = (): boolean => {
  return getCurrentEnvironment().name === 'new';
};

export const getEnvironmentDescription = (): string => {
  return getCurrentEnvironment().description;
};
