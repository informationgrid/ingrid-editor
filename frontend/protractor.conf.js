// Protractor configuration file, see link for more information
// https://github.com/angular/protractor/blob/master/lib/config.ts

const { SpecReporter } = require('jasmine-spec-reporter');
const { JUnitXmlReporter } = require('jasmine-reporters');

exports.config = {
  allScriptsTimeout: 11000,
  specs: [
    './e2e/**/*.e2e-spec.ts'
  ],
  capabilities: {
    'browserName': 'chrome',
    chromeOptions: {
      args: [ "--headless", "--disable-gpu", "--window-size=800x600" ]
    }
  },
  directConnect: true,
  baseUrl: 'http://localhost:4400/',
  framework: 'jasmine',
  jasmineNodeOpts: {
    showColors: true,
    defaultTimeoutInterval: 30000,
    print: function() {}
  },
  beforeLaunch: function() {
    require('ts-node').register({
      project: 'e2e/tsconfig.e2e.json'
    });
  },
  onPrepare() {
    const junitReporter = new JUnitXmlReporter({
      savePath: './e2e/test-results/E2E',
      consolidateAll: false
    });
    jasmine.getEnv().addReporter(junitReporter);

    const specReporter = new SpecReporter({
      spec: { displayStacktrace: true }
    });
    jasmine.getEnv().addReporter(specReporter);
  }
};
