package de.ingrid.igeserver.profiles.ingrid_up_sh.importer

import de.ingrid.igeserver.exports.iso.Metadata
import de.ingrid.igeserver.profiles.ingrid.importer.GeodatasetMapper
import de.ingrid.igeserver.profiles.ingrid.importer.ISOImportProfile
import de.ingrid.igeserver.profiles.ingrid.importer.ImportProfileData
import de.ingrid.igeserver.services.CodelistHandler
import org.springframework.stereotype.Service

@Service
class ISOImportUPSH(val codelistHandler: CodelistHandler) : ISOImportProfile {
    override fun handle(catalogId: String, data: Metadata): ImportProfileData? {

        return when (data.hierarchyLevel?.get(0)?.scopeCode?.codeListValue) {
            "dataset" -> {
                ImportProfileData(
                    "ingrid-up-sh/geodataset.jte",
                    GeodatasetMapper(data, codelistHandler, catalogId)
                )
            }

            else -> null
        }
    }
}