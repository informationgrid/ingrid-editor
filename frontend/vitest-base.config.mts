import { defineConfig } from "vitest/config";

// Loaded by the Angular unit-test builder (see "runnerConfig" in angular.json).
// The default timeout of 5s is not enough for specs that compile large
// component trees while the whole suite runs in parallel.
export default defineConfig({
  test: {
    testTimeout: 20000,
    hookTimeout: 20000,
  },
});
