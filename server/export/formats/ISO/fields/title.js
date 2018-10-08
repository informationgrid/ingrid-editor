/**
 * <gmd:identificationInfo>
 *   <srv:SV_ServiceIdentification uuid="HMDK/7bb52ba1-1e0e-3378-8c60-f98604182f56">
 *     <gmd:citation>
 *       <gmd:CI_Citation>
 *         <gmd:title>
 *           <gco:CharacterString>wemove Test: Downloaddienst 3D-Stadtmodell Hamburg</gco:CharacterString>
 */
const utils = require("../../../utils");

class IsoTitle {

  constructor() {
    this.priority = 10;
  }

  run(src, /*XMLDocument*/target) {
    // get or create parent node
    let citation = utils.getOrCreatePosition(target, 'gmd:identificationInfo', 'srv:SV_ServiceIdentification','gmd:citation', 'gmd:CI_Citation');

    // make sure to insert in the right order

    // add mapped field
    citation
      .ele('gmd:title')
      .ele('gco:CharacterString', src.title);
  }

}

module.exports = new IsoTitle();
