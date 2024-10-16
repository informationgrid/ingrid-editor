/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
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
package de.ingrid.igeserver.profiles.ingrid.importer.iso19139

import de.ingrid.igeserver.exports.iso.OperatesOn
import de.ingrid.igeserver.model.KeyValue

open class GeoserviceMapper(isoData: IsoImportData) : GeneralMapper(isoData) {

    val info = metadata.identificationInfo[0].identificationInfo

    fun getServiceCategories(): List<KeyValue> = info?.descriptiveKeywords
        ?.flatMap { it.keywords?.keyword?.map { it.value } ?: emptyList() }
        ?.mapNotNull { codeListService.getCodeListEntryId("5200", it, "iso") }
        ?.map { KeyValue(it) } ?: emptyList()

    fun getServiceVersions(): List<KeyValue> = info?.serviceTypeVersion
        ?.map {
            codeListService.getCodeListEntryId("5153", it.value, "iso")
                ?.let { id -> KeyValue(id) }
                ?: KeyValue(null, it.value)
        } ?: emptyList()

    fun getOperations(): List<Operation> = info?.containsOperations
        ?.map {
            Operation(
                getOperationName(it.svOperationMetadata?.operationName?.value),
                it.svOperationMetadata?.operationDescription?.value,
                it.svOperationMetadata?.connectPoint?.getOrNull(0)?.ciOnlineResource?.linkage?.url,
            )
        } ?: emptyList()

    private fun getOperationName(value: String?): KeyValue? {
        if (value == null) return null

        val serviceType = getServiceType()
        val codelistId = when (serviceType.key) {
            "1" -> "5105"
            "2" -> "5110"
            "3" -> "5120"
            "4" -> "5130"
            else -> null
        }
        val id = if (codelistId == null) null else codeListService.getCodeListEntryId(codelistId, value, "de")
        return if (id == null) KeyValue(null, value) else KeyValue(id)
    }

    fun getServiceType(): KeyValue {
        val value = info?.serviceType?.value
        val id = codeListService.getCodeListEntryId("5100", value, "iso")
        return KeyValue(id)
    }

    fun getSystemEnvironment(): String {
        val description = metadata.identificationInfo[0].identificationInfo?.abstract?.value ?: return ""

        val beginOfExtra = description.indexOf("Systemumgebung:")
        if (beginOfExtra == -1) return ""

        val endIndex = description.indexOf(";", beginOfExtra)
        return if (endIndex == -1) {
            description.substring(beginOfExtra + 15).trim()
        } else {
            description.substring(beginOfExtra + 15, endIndex).trim()
        }
    }

    fun getServiceExplanation(): String {
        val description = metadata.identificationInfo[0].identificationInfo?.abstract?.value ?: return ""

        val beginOfExtra = description.indexOf("Erläuterung zum Fachbezug:")
        if (beginOfExtra == -1) return ""

        val end = description.indexOf(";", beginOfExtra)
        return if (end == -1) {
            description.substring(beginOfExtra + 26).trim()
        } else {
            description.substring(beginOfExtra + 26, end).trim()
        }
    }

    fun getImplementationHistory(): String = metadata.dataQualityInfo
        ?.flatMap {
            it.dqDataQuality?.lineage?.liLinage?.processStep
                ?.map { it.liProcessStep.description.value } ?: emptyList()
        }
        ?.joinToString(";") ?: ""

    fun getCouplingType(): KeyValue {
        val id = info?.couplingType?.code?.codeListValue
        return KeyValue(id)
    }

    fun getCoupledResources(): List<CoupledResourceModel> {
        val internalLinks = groupItemsByUuid(info?.operatesOn)

        val externalLinks = metadata.distributionInfo?.mdDistribution?.transferOptions
            ?.filter {
                it.mdDigitalTransferOptions?.onLine?.any { online -> online.ciOnlineResource?.applicationProfile?.value == "coupled" }
                    ?: false
            }
            ?.flatMap { it.mdDigitalTransferOptions?.onLine?.map { online -> online.ciOnlineResource } ?: emptyList() }
            ?.map {
                CoupledResourceModel(
                    null,
                    it?.linkage?.url,
                    it?.name?.value,
                    true,
//                    layerNames = it.title?.split(",") ?: emptyList()) } ?: emptyList()
                )
            } ?: emptyList()

        return internalLinks + externalLinks
    }

    private fun groupItemsByUuid(items: List<OperatesOn>?): List<CoupledResourceModel> {
        if (items == null) return emptyList()

        val groupedMap = mutableMapOf<String, MutableList<String>>()

        for (item in items) {
            val texts = groupedMap.getOrPut(item.uuidref!!) { mutableListOf() }
            if (!item.title.isNullOrEmpty()) texts.add(item.title)
        }

        return groupedMap.map { (uuid, layerNames) ->
            CoupledResourceModel(uuid, null, null, false, layerNames = layerNames)
        }
    }

    fun getResolutions(): List<Resolution> {
        val description = info?.abstract?.value ?: return emptyList()
        var scale = listOf<String>()
        var groundResolution = listOf<String>()
        var scanResolution = listOf<String>()

        description.split(";").forEach {
            if (it.indexOf("Maßstab:") != -1) {
                scale = it.substring(it.indexOf("Maßstab:") + 8).split(",")
            } else if (it.indexOf("Bodenauflösung:") != -1) {
                groundResolution = it.substring(it.indexOf("Bodenauflösung:") + 15).split(",")
            } else if (it.indexOf("Scanauflösung (DPI):") != -1) {
                scanResolution = it.substring(it.indexOf("Scanauflösung (DPI):") + 20).split(",")
            }
        }

        val biggestListSize = listOf(scale, groundResolution, scanResolution)
            .map { it.size }
            .sortedDescending()
            .getOrNull(0) ?: 0

        return (0 until biggestListSize).map {
            Resolution(
                scale.getOrNull(it)?.split(":")?.getOrNull(1)?.trim()?.toFloat(),
                groundResolution.getOrNull(it)?.substring(0, groundResolution.getOrNull(it)?.length?.minus(1)!!)?.trim()
                    ?.toFloat(),
                scanResolution.getOrNull(it)?.trim()?.toFloat(),
            )
        }
    }
}
