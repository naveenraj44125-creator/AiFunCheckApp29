/**
 * Test setup file for Jest
 * Configures the testing environment
 */

import { storage } from '../storage';

// Clear storage before each test
beforeEach(() => {
  storage.clear();
});

// Global test timeout for property-based tests
jest.setTimeout(30000);
