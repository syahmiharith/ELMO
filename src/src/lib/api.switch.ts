/**
 * @file API switch.
 * This file exports either the mock API or the real API stubs based on a flag.
 * This allows for easy switching between local development and a real backend.
 */

// Set this to false to use the real (stubbed) API.
const USE_MOCK_API = true;

// Conditionally export the modules
if (USE_MOCK_API) {
  module.exports = require('./mock-api');
} else {
  module.exports = require('./api.stub');
}
