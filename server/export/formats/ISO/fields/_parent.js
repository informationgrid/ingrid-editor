/**
 * <gmd:parentIdentifier>
 *   <gco:CharacterString>9367616F-AC86-4A3D-A91D-51EA28382EFB</gco:CharacterString>
 * </gmd:parentIdentifier>
 */
class IsoId {

  constructor() {
    this.priority = 8;
  }

  run(src, /*XMLDocument*/target) {
    return target
      .ele('gmd:parentIdentifier')
      .ele('gco:CharacterString', src._parent);
  }
}

module.exports = new IsoId();
