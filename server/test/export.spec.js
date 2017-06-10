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
      title: 'This is my title'
    };
    let result = '' + exportService.exportToFormat('ISO', doc); // .then( result => {
    expect(result).to.equal('<xml><title>This is my title</title></xml>');
    // });
  });
});
