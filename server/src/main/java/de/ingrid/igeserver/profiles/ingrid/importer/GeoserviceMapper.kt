package de.ingrid.igeserver.profiles.ingrid.importer

import de.ingrid.igeserver.exports.iso.Metadata
import de.ingrid.igeserver.services.CodelistHandler

class GeoserviceMapper(metadata: Metadata, codeListService: CodelistHandler) : GeneralMapper(metadata, codeListService) {

    fun getServiceCategories(): List<KeyValue> {
        return metadata.identificationInfo[0].serviceIdentificationInfo?.descriptiveKeywords
            ?.mapNotNull { codeListService.getCodeListEntryId("5200", it.keywords?.keyword?.value, "ISO") }
            ?.map { KeyValue(it) } ?: emptyList()
    }

    fun getServiceVersions(): List<KeyValue> {
        return metadata.identificationInfo[0].serviceIdentificationInfo?.serviceTypeVersion
            ?.map { codeListService.getCodeListEntryId("5153", it.value, "ISO") }
            ?.map { KeyValue(it) } ?: emptyList()
    }

    fun getOperations(): List<Operation> {
        return metadata.identificationInfo[0].serviceIdentificationInfo?.containsOperations
            ?.map {
                Operation(
                    it.svOperationMetadata?.operationName?.value,
                    it.svOperationMetadata?.operationDescription?.value,
                    it.svOperationMetadata?.connectPoint?.getOrNull(0)?.ciOnlineResource?.linkage?.url
                )
            } ?: emptyList()
    }

    fun getResolutions(): List<Resolution> {
        val description =
            metadata.identificationInfo[0].serviceIdentificationInfo?.abstract?.value ?: return emptyList()
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

    fun getServiceType(): KeyValue {
        val value = metadata.identificationInfo[0].serviceIdentificationInfo?.serviceType?.value
        val id = codeListService.getCodeListEntryId("5100", value, "ISO")
        return KeyValue(id)
    }

    fun getCouplingType(): KeyValue {
        val id = metadata.identificationInfo[0].serviceIdentificationInfo?.couplingType?.code?.codeListValue
        return KeyValue(id)
    }

    fun getCoupledResources(): List<CoupledResourceModel> {
        val internalLinks = metadata.identificationInfo[0].serviceIdentificationInfo?.operatesOn
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
    
}