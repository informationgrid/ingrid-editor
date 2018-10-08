'use strict';

let url = require('url');


let Codelist = require('./CodelistService');

module.exports.getCodelistById = function get (req, res, next) {
  Codelist.getById(req.swagger.params, res, next);
};
