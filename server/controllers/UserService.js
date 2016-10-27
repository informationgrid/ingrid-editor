

exports.login = function (args, res, next) {
  var doc = { token: 'my-token'};
  res.end(JSON.stringify(doc, null, 2));
};

