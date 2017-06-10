'use strict';
const fs = require('fs');
const path = require('path');
const glob = require('glob');
const log = require('log4js').getLogger();

class ExportService {

  constructor() {
    this.mappingRules = { ISO: [] };

    glob.sync('./export/ISO/fields/**/*.js').forEach(file => {
      log.debug('loading rule: ', file);
      this.mappingRules.ISO.push( require(path.resolve(file)) );
    });
  }

  exportToFormat(/*string*/format, /*Object*/doc) {
    if (fs.existsSync('export/' + format)) {

      let result = this.initResultDoc(format);

      this.mappingRules[format].forEach( rule => {
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
    let start = require('./' + format + '/init');
    return start.init();
  }
}

module.exports = new ExportService();
