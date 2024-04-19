package de.ingrid.igeserver.profiles.ingrid_lfubayern.importer

import de.ingrid.igeserver.model.KeyValue
import de.ingrid.igeserver.profiles.ingrid.importer.GeoserviceMapper
import de.ingrid.igeserver.profiles.ingrid.importer.IsoImportData

class GeoserviceMapperLfUBayern(isoData: IsoImportData) : GeoserviceMapper(isoData) {

    val geolink: String = isoData.data.dataSetURI?.value ?: ""
    val fees: String = isoData.data.distributionInfo?.mdDistribution?.distributor?.get(0)?.mdDistributor?.distributionOrderProcess?.get(0)?.mdStandardOrderProcess?.fees?.value ?: ""
    val useConstraintComments: String = getUseConstraints()[0].note ?: ""

    override fun getKeywords(): List<String> {
        return super.getKeywords(listOf("LfU Bayern Geological Keywords", "LfU Bayern Internal Keywords"))
    }

    fun getGeologicalKeywords(): List<KeyValue> {
        return metadata.identificationInfo[0].identificationInfo?.descriptiveKeywords
            ?.filter { it.keywords?.thesaurusName?.citation?.title?.value == "LfU Bayern Geological Keywords" }
            ?.flatMap { it.keywords?.keyword?.map { it.value } ?: emptyList() }
            ?.mapNotNull { it }
            ?.map {
                val entryId = codeListService.getCatalogCodelistKey(catalogId, "20000", it)
                if (entryId == null) KeyValue(null, it) else KeyValue(entryId)
            } ?: emptyList()
    }
    
    fun getInternalKeywords(): List<KeyValue> {
        return metadata.identificationInfo[0].identificationInfo?.descriptiveKeywords
            ?.filter { it.keywords?.thesaurusName?.citation?.title?.value == "LfU Bayern Internal Keywords" }
            ?.flatMap { it.keywords?.keyword?.map { it.value } ?: emptyList() }
            ?.mapNotNull { it }
            ?.map {
                val entryId = codeListService.getCatalogCodelistKey(catalogId, "20001", it)
                if (entryId == null) KeyValue(null, it) else KeyValue(entryId)
            } ?: emptyList()
    }

    fun getInternalComments() = metadata.identificationInfo[0].dataIdentificationInfo?.supplementalInformation?.value ?: ""
}