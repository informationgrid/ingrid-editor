const utils = require('../../../utils');

/**
 * <gmd:date>
 *   <gmd:CI_Date>
 *     <gmd:date>
 *       <gco:DateTime>2015-01-30T00:00:00.000+01:00</gco:DateTime>
 *     </gmd:date>
 *     <gmd:dateType>
 *       <gmd:CI_DateTypeCode codeList="http://standards.iso.org/ittf/PubliclyAvailableStandards/ISO_19139_Schemas/resources/codelist/ML_gmxCodelists.xml#CI_DateTypeCode" codeListValue="publication"/>
 */
class IsoDate {

  constructor() {
    this.priority = 20;
  }

  run(src, /*XMLDocument*/target) {
    // get or create parent node
    let citation = utils.getOrCreatePosition(target, 'gmd:identificationInfo', 'srv:SV_ServiceIdentification','gmd:citation', 'gmd:CI_Citation');

    // make sure to insert in the right order

    // add mapped field
    citation
      .ele('gmd:date')
      .ele('gco:gmd:CI_Date')
      .ele('gmd:date')
      .ele('gmd:DateTime', '2017')
      .up().up()
      .ele('gmd:dateType')
      .ele('gmd:CI_DateTypeCode', {
        codeList: 'aaa',
        codeListValue: 'publication'
      })
  }

}

module.exports = new IsoDate();
