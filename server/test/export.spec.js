const assert = require('chai').assert;
const expect = require('chai').expect;
let exportService = require('../export/export');

describe('Export', function () {

  beforeEach(function () {
  });

  it('should throw an error if export format is not supported', function () {
    expect(() => exportService.exportToFormat('unknown', {})).to.throw();
  });

  it('should not throw an error if export format is supported', function () {
    expect(() => exportService.exportToFormat('ISO', {})).to.not.throw();
  });

  it('should convert a given document to ISO', function () {
    let doc = {
      _id: 'E6044602-F59B-4DC0-815D-F25BB34BAEF6',
      title: 'This is my title',
      description: 'Some description goes here ...'
    };
    let result = exportService.exportToFormat('ISO', doc); // .then( result => {
    console.log(result.end({ pretty: true }));
    expect(result+'').to.contain('<gmd:title><gco:CharacterString>This is my title</gco:CharacterString></gmd:title>');
    // });
  });
});
