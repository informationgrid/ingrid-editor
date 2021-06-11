const cypress = require("cypress");
const fse = require("fs-extra");
const { merge } = require("mochawesome-merge");
const generator = require("mochawesome-report-generator");

async function runTests() {
  let opts = {
    reportDir: "cypress/mochawesome-reports",
    reportFilename: "index",
    reportTitle: "ige-ng tests",
  };

  await fse.remove(opts.reportDir); // remove the report folder
  const { totalFailed } = await cypress.run(); // get the number of failed tests
  const jsonReport = await merge(opts); // generate JSON report
  await generator.create(jsonReport, opts);
  process.exit(totalFailed); // exit with the number of failed tests
}

runTests();
