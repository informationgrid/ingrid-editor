'use strict';
let xml2js = require('xml2js'),
  fs = require('fs'),
  log = require('log4js').getLogger();

class CodelistService {


  constructor() {
    this.codelists = [];
    log.info('Init codelists ...');
    let parser = xml2js.Parser();
    fs.readFile('codelists_initial.xml', (err, data) => {
      if (err) {
        log.error(err);
        return;
      }

      let codelists = [];
      parser.parseString(data, (err, result) => {
        // console.dir(result);
        let list = result.list['de.ingrid.codelists.model.CodeList'];
        list.forEach(entry => {
          let item = {};
          item.id = entry.id + '';
          item.name = entry.name + '';
          item.entries = this.getEntries(entry);
          if (entry.defautEntry) item.defaultEntry = entry.defautEntry;
          codelists.push(item);
        });

        // console.log(codelists[0].entries[0].localisations);
        // this.prepareCodelists(codelists);
        this.codelists = codelists;
        log.info('finished!');
      });
    });
  }

  getEntries(codelist) {
    let entries = [];
    codelist.entries[0]['de.ingrid.codelists.model.CodeListEntry'].forEach(clEntry => {
      let entry = {};
      entry.id = clEntry.id + '';
      entry.localisations = this.getLocalisations(clEntry);
      entries.push(entry);
    });
    return entries;
  }

  getLocalisations(entry) {
    let localisations = [];
    entry.localisations[0].entry.forEach(locale => {
      localisations.push(locale.string);
    });
    return localisations;
  }

  /*  prepareCodelists(codelists) {
      let mapCodelist = {};
      codelists.forEach(codelist => {
        mapCodelist[codelist.id] = {
          id: codelist.id,
          values: prepareCodelistValues(codelist.)
        }
      })
    }*/

  getById(args, res, next) {

    let id = args.id.value;

    /*let codelist = {
      id: '8000',
      values: [
        {id: '1', value: 'Eins'},
        {id: '2', value: 'Zwei'},
        {id: '3', value: 'Drei'}
      ]
    };*/

    let result = null;
    this.codelists.some(codelist => {
      if (codelist.id === id) {
        result = codelist;
        return true;
      }
    });

    res.end(JSON.stringify(result, null, 2));

  };

}

module.exports = new CodelistService();
