package de.ingrid.igeserver.profiles.ingrid_hmdk.importer

import de.ingrid.igeserver.exports.iso.Metadata
import de.ingrid.igeserver.model.KeyValue
import de.ingrid.igeserver.profiles.ingrid.importer.GeneralMapper
import de.ingrid.igeserver.profiles.ingrid.importer.GeodatasetMapper
import de.ingrid.igeserver.profiles.ingrid.importer.GeoserviceMapper
import de.ingrid.igeserver.services.CodelistHandler

class GeoserviceMapperHMDK(metadata: Metadata, codeListService: CodelistHandler, catalogId: String) :
    GeoserviceMapper(metadata, codeListService, catalogId) {

    val publicationHmbTG = containsKeyword("hmbtg")


    fun getInformationHmbTG(): List<KeyValue> {
        return metadata.identificationInfo[0].identificationInfo?.descriptiveKeywords
            ?.filter { it.keywords?.thesaurusName?.citation?.title?.value == "HmbTG-Informationsgegenstand" }
            ?.flatMap { it.keywords?.keyword?.mapNotNull { it.value } ?: emptyList() }
//            ?.map { codeListService.getCodelistEntry("informationsgegenstand", it) }
            ?.map { KeyValue(it) } ?: emptyList()
    }





    }