'use strict';

class CodelistService {
  getById(args, res, next) {

    let codelist = {
      id: '8000',
      values: [
        {id: '1', value: 'Eins'},
        {id: '2', value: 'Zwei'},
        {id: '3', value: 'Drei'}
      ]
    };
    res.end(JSON.stringify(codelist, null, 2));

  };

}

module.exports = new CodelistService();