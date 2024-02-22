package de.ingrid.igeserver.profiles.ingrid_krzn.importer

import de.ingrid.igeserver.exports.iso.Metadata
import de.ingrid.igeserver.profiles.ingrid.importer.GeodatasetMapper
import de.ingrid.igeserver.profiles.ingrid.importer.ISOImportProfile
import de.ingrid.igeserver.profiles.ingrid.importer.ImportProfileData
import de.ingrid.igeserver.services.CodelistHandler
import org.springframework.stereotype.Service

@Service
class ISOImportKRZN(val codelistHandler: CodelistHandler) : ISOImportProfile {
    override fun handle(catalogId: String, data: Metadata): ImportProfileData? {

        return when (data.hierarchyLevel?.get(0)?.scopeCode?.codeListValue) {
            "dataset" -> {
                ImportProfileData(
                    "imports/ingrid-krzn/geodataset.jte",
                    GeodatasetMapper(data, codelistHandler, catalogId)
                )
            }

            else -> null
        }
    }

}