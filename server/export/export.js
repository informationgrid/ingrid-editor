'use strict';
const fs = require('fs');
const path = require('path');
const glob = require('glob');
const log = require('log4js').getLogger();

class ExportService {

  constructor() {
    this.mappingRules = {ISO: []};

    // get all export formats
    const formats = glob.sync('*', {cwd: './export/formats/'});

    // load all rules in the subdirectories, but exclude the init-rule
    // which creates the document
    formats.forEach(format => {
      glob.sync('./export/formats/' + format + '/**/*.js', {
        ignore: './**/init.js'
      })
        .forEach(file => {
          log.debug('loading rule: ', file);
          this.mappingRules[format].push(require(path.resolve(file)));
        });

      // sort rules by priority
      this.sortByPriority(this.mappingRules[format]);
    });

  }

  exportToFormat(/*string*/format, /*Object*/doc) {
    if (fs.existsSync('export/formats/' + format)) {

      let result = this.initResultDoc(format);

      this.mappingRules[format].forEach(rule => {
        log.debug('Rule: ', rule);
        rule.run(doc, result);
      });

      log.debug('result: ' + result);
      return result;
    } else {
      throw Error('Format is not supported: ' + format);
    }
  }

  initResultDoc(format) {
    return require('./formats/' + format + '/init').init();
  }

  sortByPriority(array) {
    array.sort((a, b) => {
      if (a.priority === undefined) return 1;
      if (b.priority === undefined) return -1;
      return a.priority > b.priority;
    });
  }
}

module.exports = new ExportService();
