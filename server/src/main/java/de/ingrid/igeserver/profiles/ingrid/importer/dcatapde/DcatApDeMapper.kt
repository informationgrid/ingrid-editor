package de.ingrid.igeserver.profiles.ingrid.importer.dcatapde

import de.ingrid.igeserver.profiles.ingrid.importer.dcatapde.model.RecordPLUProperties

class DcatApDeMapper(val model: RecordPLUProperties) {
    val title = model.title
    val uuid = model.identifier
    val parentUuid: String? = null
    val type = "InGridGeoDataset"
    val description = model.description?.trim()
}