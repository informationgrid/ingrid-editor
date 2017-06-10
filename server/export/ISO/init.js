let builder = require('xmlbuilder');

class IsoInit {
  init() {
    return builder.create('xml');
  }
}

module.exports = new IsoInit();
