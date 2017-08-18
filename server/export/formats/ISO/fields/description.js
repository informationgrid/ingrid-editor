/**
 * <gmd:identificationInfo>
 *   <srv:SV_ServiceIdentification uuid="HMDK/7bb52ba1-1e0e-3378-8c60-f98604182f56">
 *     <gmd:abstract>
 *       <gco:CharacterString>Dieser ATOM-Downloaddienst stellt den Datensatz "3D-Stadtmodell Hamburg" bereit.</gco:CharacterString>
 */
const utils = require("../../../utils");

class IsoTitle {

  constructor() {
    this.priority = 30;
  }

  run(src, /*XMLDocument*/target) {
    // get or create parent node
    let citation = utils.getOrCreatePosition(target, 'gmd:identificationInfo', 'srv:SV_ServiceIdentification');

    // make sure to insert in the right order

    // add mapped field
    citation
      .ele('gmd:abstract')
      .ele('gco:CharacterString', src.description);
  }

}

module.exports = new IsoTitle();
