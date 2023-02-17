package de.ingrid.igeserver.profiles.ingrid.importer

import de.ingrid.igeserver.exports.iso.Metadata
import de.ingrid.igeserver.services.CodelistHandler

class GeoserviceMapper(metadata: Metadata, codeListService: CodelistHandler) : GeneralMapper(metadata, codeListService) {

    fun getServiceCategories(): List<KeyValue> {
        return metadata.identificationInfo[0].identificationInfo?.descriptiveKeywords
            ?.mapNotNull { codeListService.getCodeListEntryId("5200", it.keywords?.keyword?.value, "ISO") }
            ?.map { KeyValue(it) } ?: emptyList()
    }

    fun getServiceVersions(): List<KeyValue> {
        return metadata.identificationInfo[0].identificationInfo?.serviceTypeVersion
            ?.map { codeListService.getCodeListEntryId("5153", it.value, "ISO") }
            ?.map { KeyValue(it) } ?: emptyList()
    }

    fun getOperations(): List<Operation> {
        return metadata.identificationInfo[0].identificationInfo?.containsOperations
            ?.map {
                Operation(
                    it.svOperationMetadata?.operationName?.value,
                    it.svOperationMetadata?.operationDescription?.value,
                    it.svOperationMetadata?.connectPoint?.getOrNull(0)?.ciOnlineResource?.linkage?.url
                )
            } ?: emptyList()
    }
    
    fun getServiceType(): KeyValue {
        val value = metadata.identificationInfo[0].identificationInfo?.serviceType?.value
        val id = codeListService.getCodeListEntryId("5100", value, "ISO")
        return KeyValue(id)
    }

    fun getCouplingType(): KeyValue {
        val id = metadata.identificationInfo[0].identificationInfo?.couplingType?.code?.codeListValue
        return KeyValue(id)
    }

    fun getCoupledResources(): List<CoupledResourceModel> {
        val internalLinks = metadata.identificationInfo[0].identificationInfo?.operatesOn
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