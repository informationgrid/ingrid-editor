package de.ingrid.igeserver.profiles.ingrid.importer

import de.ingrid.igeserver.exports.iso.Metadata
import de.ingrid.igeserver.services.CodelistHandler

class GeoserviceMapper(metadata: Metadata, codeListService: CodelistHandler) :
    GeneralMapper(metadata, codeListService) {

    val info = metadata.identificationInfo[0].identificationInfo

    fun getServiceCategories(): List<KeyValue> {
        return info?.descriptiveKeywords
            ?.mapNotNull { codeListService.getCodeListEntryId("5200", it.keywords?.keyword?.value, "iso") }
            ?.map { KeyValue(it) } ?: emptyList()
    }

    fun getServiceVersions(): List<KeyValue> {
        return info?.serviceTypeVersion
            ?.map { codeListService.getCodeListEntryId("5153", it.value, "iso") }
            ?.map { KeyValue(it) } ?: emptyList()
    }

    fun getOperations(): List<Operation> {
        return info?.containsOperations
            ?.map {
                Operation(
                    it.svOperationMetadata?.operationName?.value,
                    it.svOperationMetadata?.operationDescription?.value,
                    it.svOperationMetadata?.connectPoint?.getOrNull(0)?.ciOnlineResource?.linkage?.url
                )
            } ?: emptyList()
    }

    fun getServiceType(): KeyValue {
        val value = info?.serviceType?.value
        val id = codeListService.getCodeListEntryId("5100", value, "iso")
        return KeyValue(id)
    }

    fun getSystemEnvironment(): String {
        val description = metadata.identificationInfo[0].identificationInfo?.abstract?.value ?: return ""

        val beginOfExtra = description.indexOf("Systemumgebung:")
        return description.substring(beginOfExtra + 15, description.indexOf(";", beginOfExtra)).trim()
    }

    fun getServiceExplanation(): String {
        val description = metadata.identificationInfo[0].identificationInfo?.abstract?.value ?: return ""

        val beginOfExtra = description.indexOf("Erläuterung zum Fachbezug:")
        val end = description.indexOf(";", beginOfExtra)
        return if (end == -1) {
            description.substring(beginOfExtra + 26 ).trim()
        } else {
            description.substring(beginOfExtra + 26, end ).trim()
        }
    }

    fun getImplementationHistory(): String {
        return metadata.dataQualityInfo
            ?.flatMap {
                it.dqDataQuality?.lineage?.liLinage?.processStep
                    ?.map { it.liProcessStep.description.value } ?: emptyList()
            }
            ?.joinToString(";") ?: ""
    }

    fun getCouplingType(): KeyValue {
        val id = info?.couplingType?.code?.codeListValue
        return KeyValue(id)
    }

    fun getCoupledResources(): List<CoupledResourceModel> {
        val internalLinks = info?.operatesOn
            ?.map { CoupledResourceModel(it.uuidref, null, null, false) } ?: emptyList()

        val externalLinks = metadata.distributionInfo?.mdDistribution?.transferOptions
            ?.filter {
                it.mdDigitalTransferOptions?.onLine?.any { online -> online.ciOnlineResource?.applicationProfile?.value == "coupled" }
                    ?: false
            }
            ?.flatMap { it.mdDigitalTransferOptions?.onLine?.map { online -> online.ciOnlineResource } ?: emptyList() }
            ?.map { CoupledResourceModel(null, it?.linkage?.url, it?.name?.value, true) } ?: emptyList()

        return internalLinks + externalLinks
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
                scale.getOrNull(it)?.split(":")?.getOrNull(1)?.trim()?.toInt(), // "1:1000"
                groundResolution.getOrNull(it)?.substring(0, groundResolution.getOrNull(it)?.length?.minus(1)!!)?.trim()
                    ?.toInt(),
                scanResolution.getOrNull(it)?.trim()?.toInt()
            )
        }
    }

}