/**
 * <gmd:fileIdentifier>
 *   <gco:CharacterString>E6044602-F59B-4DC0-815D-F25BB34BAEF6</gco:CharacterString>
 * </gmd:fileIdentifier>
 */
class IsoId {
  constructor() {
    this.priority = 5;
  }

  run(src, /*XMLDocument*/target) {
    return target
      .ele('gmd:fileIdentifier')
      .ele('gco:CharacterString', src._id);
  }
}

module.exports = new IsoId();
