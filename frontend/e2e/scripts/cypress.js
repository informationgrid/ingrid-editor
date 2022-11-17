const cypress = require('cypress');
const fse = require('fs-extra');
const { merge } = require('mochawesome-merge');
const generator = require('mochawesome-report-generator');

async function runTests() {
  let opts = {
    reportDir: './cypress/mochawesome-reports',
    files: ['./cypress/mochawesome-reports/mochawesome*.json'],
    reportFilename: 'index',
    reportTitle: 'IGE-NG'
  };

  await fse.remove(opts.files[0]); // remove the report folder
  const { totalFailed } = await cypress.run({ env: { ELECTRON_ENABLE_LOGGING: 'electron.log' } }); // get the number of failed tests
  const jsonReport = await merge(opts); // generate JSON report
  await generator.create(jsonReport, opts);
  process.exit(totalFailed); // exit with the number of failed tests
}

runTests();
