"use strict";
/**
 * Test setup file for Jest
 * Configures the testing environment
 */
Object.defineProperty(exports, "__esModule", { value: true });
const storage_1 = require("../storage");
// Clear storage before each test
beforeEach(() => {
    storage_1.storage.clear();
});
// Global test timeout for property-based tests
jest.setTimeout(30000);
//# sourceMappingURL=setup.js.map