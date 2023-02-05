package de.ingrid.igeserver.profiles.ingrid.importer

import de.ingrid.igeserver.exports.iso.Metadata

class MetadataModel(val metadata: Metadata) {
    val uuid = metadata.fileIdentifier?.text
    val title = metadata.identificationInfo?.serviceIdentificationInfo?.citation?.citation?.title?.text
}