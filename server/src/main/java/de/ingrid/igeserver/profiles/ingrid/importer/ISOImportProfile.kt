package de.ingrid.igeserver.profiles.ingrid.importer

import de.ingrid.igeserver.exports.iso.Metadata

interface ISOImportProfile {
    fun handle(catalogId: String, data: Metadata): ImportProfileData?
}

data class ImportProfileData(
    val template: String,
    val mapper: GeneralMapper
)