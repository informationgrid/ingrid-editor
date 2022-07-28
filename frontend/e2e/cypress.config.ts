import { defineConfig } from 'cypress';

export default defineConfig({
  reporter: 'mochawesome',
  reporterOptions: {
    reportDir: './cypress/mochawesome-reports',
    files: ['./cypress/mochawesome-reports'],
    overwrite: false,
    html: false,
    json: true,
    timestamp: 'yyyymmdd_HHMMss'
  },
  env: {
    auth_base_url: 'http://192.168.0.228:8080',
    auth_realm: 'InGrid',
    auth_client_id: 'ige-ng-frontend'
  },
  screenshotsFolder: 'cypress/mochawesome-reports/assets',
  videosFolder: 'cypress/mochawesome-reports/assets',
  video: true,
  videoUploadOnPasses: false,
  viewportHeight: 1080,
  viewportWidth: 1920,
  videoCompression: 32,
  chromeWebSecurity: false,
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      return require('./cypress/plugins/index.js')(on, config);
    },
    baseUrl: 'http://192.168.0.228',
    excludeSpecPattern: '**/*.local.ts'
  }
});
