/**
 * ==================================================
 * Copyright (C) 2024 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
package de.ingrid.igeserver.profiles.ingrid_lfubayern.importer

import de.ingrid.igeserver.model.KeyValue
import de.ingrid.igeserver.profiles.ingrid.importer.iso19139.GeodatasetMapper
import de.ingrid.igeserver.profiles.ingrid.importer.iso19139.IsoImportData

class GeodatasetMapperLfUBayern(isoData: IsoImportData) : GeodatasetMapper(isoData) {

    init {
        fieldToCodelist.referenceFileFormat = "20002"
    }

    val geolink: String = isoData.data.dataSetURI?.value ?: ""
    val fees: String = isoData.data.distributionInfo?.mdDistribution?.distributor?.get(0)?.mdDistributor?.distributionOrderProcess?.get(0)?.mdStandardOrderProcess?.fees?.value ?: ""
    val useConstraintComments: String = if (getUseConstraints().isNotEmpty()) getUseConstraints()[0].note ?: "" else ""

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
