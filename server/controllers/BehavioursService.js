'use strict';
let db = require('../db/BehaviourDao');

exports.get = function(args, res, next) {

  db.getBehaviours().then(function (data) {
    res.end(JSON.stringify(data, null, 2));
  }).catch(function (err) {
    console.error('Error during getting behaviours:', err);
    res.statusCode = 500;
    res.end(err.message);
  })

};

exports.set = function(args, res, next) {

  let behaviour = args.behaviour.value;

  db.setBehaviour(behaviour).then(function (data) {
    res.end();
  }).catch(function (err) {
    console.error('Error during setting behaviours:', err);
    res.statusCode = 500;
    res.end(err.message);
  })

};