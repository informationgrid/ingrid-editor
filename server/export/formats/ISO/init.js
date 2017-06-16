let builder = require('xmlbuilder');

class IsoInit {

  init() {
    return builder.create('gmd:MD_Metadata')
      .att('xmlns:gmd', 'http://www.isotc211.org/2005/gmd')
      .att('xmlns:gco', 'http://www.isotc211.org/2005/gco')
      .att('xmlns:gml', 'http://www.opengis.net/gml')
      .att('xmlns:gts', 'http://www.isotc211.org/2005/gts')
      .att('xmlns:srv', 'http://www.isotc211.org/2005/srv')
      .att('xmlns:xsi', 'http://www.w3.org/2001/XMLSchema-instance')
      .att('xsi:schemaLocation', 'http://www.isotc211.org/2005/gmd http://schemas.opengis.net/csw/2.0.2/profiles/apiso/1.0.0/apiso.xsd');
  }
}

module.exports = new IsoInit();
