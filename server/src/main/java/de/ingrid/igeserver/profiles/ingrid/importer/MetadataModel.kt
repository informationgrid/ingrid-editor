package de.ingrid.igeserver.profiles.ingrid.importer

import de.ingrid.igeserver.ServerException
import de.ingrid.igeserver.exports.iso.Metadata
import de.ingrid.igeserver.exports.iso.RoleCode
import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.utils.udk.TM_PeriodDurationToTimeAlle
import de.ingrid.utils.udk.TM_PeriodDurationToTimeInterval
import org.apache.logging.log4j.kotlin.logger

class MetadataModel(val metadata: Metadata, val codeListService: CodelistHandler) {

    private val log = logger()

    val uuid = metadata.fileIdentifier?.value
    val type =
        if (metadata.hierarchyLevel?.get(0)?.scopeCode?.codeListValue == "service") "InGridGeoService" else "InGridGeoDataset"
    val title = metadata.identificationInfo[0].serviceIdentificationInfo?.citation?.citation?.title?.value
    val isInspireIdentified = containsKeyword("inspireidentifiziert")
    val isAdVCompatible = containsKeyword("AdVMIS")
    val isOpenData = containsKeyword("opendata")
    val parentUuid = metadata.parentIdentifier?.value

    fun getDescription(): String {
        return metadata.identificationInfo[0].serviceIdentificationInfo?.abstract?.value
            ?.split(";")
            ?.asSequence()
            ?.filterNot { it.trim().startsWith("Maßstab:") }
            ?.filterNot { it.trim().startsWith("Bodenauflösung:") }
            ?.filterNot { it.trim().startsWith("Scanauflösung (DPI):") }
            ?.filterNot { it.trim().startsWith("Systemumgebung:") }
            ?.filterNot { it.trim().startsWith("Erläuterung zum Fachbezug:") }
            ?.toList()
            ?.joinToString(";") ?: ""
    }

    fun getPointOfContacts(): List<PointOfContact> {
        return metadata.contact.map {
            PointOfContact(
                it.responsibleParty?.uuid!!,
                mapRoleToContactType(it.responsibleParty?.role!!)
            )
        }
    }

    private fun mapRoleToContactType(role: RoleCode): KeyValue {
        val value = role.codelist?.codeListValue
        val entryId = codeListService.getCodeListEntryId("505", value, "ISO")
            ?: throw ServerException.withReason("Could not map role of contact type: $value")

        return KeyValue(entryId)
    }

    fun getAdvProductGroups(): List<KeyValue> {
        return metadata.identificationInfo[0].serviceIdentificationInfo?.citation?.citation?.alternateTitle
            ?.map { it.value }
            ?.joinToString(";")
            ?.split(";")
            ?.mapNotNull { codeListService.getCodeListEntryId("8010", it, "de") }
            ?.map { KeyValue(it) } ?: emptyList()
    }

    fun getAlternateTitle(): String {
        return metadata.identificationInfo[0].serviceIdentificationInfo?.citation?.citation?.alternateTitle
            ?.map { it.value }
            ?.joinToString(";")
            ?.split(";")
            ?.filter { codeListService.getCodeListEntryId("8010", it, "de") == null }
            ?.joinToString(";") ?: ""
    }

    fun getThemes(): List<KeyValue> {
        return metadata.identificationInfo[0].serviceIdentificationInfo?.descriptiveKeywords
            ?.filter { it.keywords?.thesaurusName?.citation?.title?.value == "GEMET - INSPIRE themes, version 1.0" }
            ?.map { codeListService.getCodeListEntryId("6100", it.keywords?.keyword?.value, null) }
            ?.map { KeyValue(it) } ?: emptyList()
    }

    fun getPriorityDatasets(): List<KeyValue> {
        return metadata.identificationInfo[0].serviceIdentificationInfo?.descriptiveKeywords
            ?.filter { it.keywords?.thesaurusName?.citation?.title?.value == "INSPIRE priority data set" }
            ?.map { codeListService.getCodeListEntryId("6350", it.keywords?.keyword?.value, null) }
            ?.map { KeyValue(it) } ?: emptyList()
    }

    fun getOpenDataCategories(): List<KeyValue> {
        return metadata.identificationInfo[0].serviceIdentificationInfo?.descriptiveKeywords
            ?.asSequence()
            ?.filter { it.keywords?.thesaurusName == null }
            ?.filter { it.keywords?.type?.codelist?.codeListValue == "theme" }
            ?.mapNotNull { it.keywords?.keyword?.value }
            ?.map { codeListService.getCodeListEntryIdMatchingData("6400", it) }
            ?.map { KeyValue(it) }
            ?.toList() ?: emptyList()
    }

    fun getSpatialScope(): KeyValue? {
        return metadata.identificationInfo[0].serviceIdentificationInfo?.descriptiveKeywords
            ?.filter { it.keywords?.thesaurusName?.citation?.title?.value == "Spatial scope" }
            ?.mapNotNull { it.keywords?.keyword?.value }
            ?.map { codeListService.getCodeListEntryId("6360", it, null) }
            ?.map { KeyValue(it) }
            ?.getOrNull(0)
    }

    fun getGraphicOverviews(): List<PreviewGraphic> {
        return metadata.identificationInfo[0].serviceIdentificationInfo?.graphicOverview
            ?.map {
                PreviewGraphic(it.mdBrowseGraphic?.fileName?.value!!, it.mdBrowseGraphic.fileDescription?.value)
            } ?: emptyList()
    }

    data class PreviewGraphic(
        val fileName: String,
        val description: String? = null
    )

    fun getServiceCategories(): List<KeyValue> {
        return emptyList()
    }

    fun getServiceVersions(): List<KeyValue> {
        return metadata.identificationInfo[0].serviceIdentificationInfo?.serviceTypeVersion
            ?.map { codeListService.getCodeListEntryId("5153", it.value, "ISO") }
            ?.map { KeyValue(it) } ?: emptyList()
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

    fun getSpatialSystems(): List<KeyValue> {
        return metadata.referenceSystemInfo
            ?.map { it.referenceSystem?.referenceSystemIdentifier?.identifier?.code?.value }
            ?.map { codeListService.getCodeListEntryId("100", it, "de") }
            ?.map { KeyValue(it) } ?: emptyList()
    }

    fun getSpatialReferences(): List<SpatialReference> {
        val references = mutableListOf<SpatialReference>()

        metadata.identificationInfo[0].serviceIdentificationInfo?.extent?.extend?.geographicElement
            ?.forEach {
                // handle title
                val geoIdentifierCode = it.geographicDescription?.geographicIdentifier?.mdIdentifier?.code
                val title = geoIdentifierCode?.value
                if (title != null) {
                    val isAnchorAndRegionKey = geoIdentifierCode.isAnchor
                    // ignore regional key definition, which is identified by an anchor element
                    if (isAnchorAndRegionKey) return@forEach

                    references.add(SpatialReference("free", title))
                    return@forEach
                }

                // handle coordinates
                val bbox = it.geographicBoundingBox
                references.last().coordinates = BoundingBox(
                    bbox?.southBoundLatitude?.value!!,
                    bbox.westBoundLongitude?.value!!,
                    bbox.northBoundLatitude?.value!!,
                    bbox.eastBoundLongitude?.value!!
                )
                
                // TODO: handle bounding polygons
            }
        return references
    }

    val spatialDescription =
        metadata.identificationInfo[0].serviceIdentificationInfo?.extent?.extend?.description?.value ?: ""

    fun getRegionKey(): String {
        return metadata.identificationInfo[0].serviceIdentificationInfo?.extent?.extend?.geographicElement
            ?.mapNotNull { it.geographicDescription?.geographicIdentifier?.mdIdentifier?.code?.value }
            ?.getOrNull(0) ?: ""
    }

    fun getVerticalExtent(): VerticalExtentModel? {
        return metadata.identificationInfo[0].serviceIdentificationInfo?.extent?.extend?.verticalElement
            ?.mapNotNull {
                val uom =
                    it.verticalElement?.verticalCRS?.verticalCRS?.verticalCS?.verticalCS?.axis?.coordinateSystemAxis?.uom
                val uomId = codeListService.getCodeListEntryId("102", uom, "ISO")
                val min = it.verticalElement?.minimumValue?.value
                val max = it.verticalElement?.maximumValue?.value
                val datum = it.verticalElement?.verticalCRS?.verticalCRS?.verticalDatum?.verticalDatum?.name
                val datumId = codeListService.getCodeListEntryId("101", datum, "de")
                return if (uomId == null || min == null || max == null || datumId == null) null
                else VerticalExtentModel(uomId, min, max, datumId)
            }?.getOrNull(0)
    }

    fun getReferenceDateType(): KeyValue {
        return KeyValue()
    }

    fun getLanguage(): KeyValue {
        val languageKey = mapLanguage(metadata.language?.codelist?.codeListValue!!)
        return KeyValue(languageKey)
    }

    fun getExtraInfoPublishArea(): KeyValue {
        // always map to "Internet" by default, since this information is InGrid-specific
        return KeyValue("1")
    }

    fun getLegalDescriptions(): List<KeyValue> {
        return metadata.identificationInfo[0].serviceIdentificationInfo?.descriptiveKeywords
            ?.filter { it.keywords?.thesaurusName?.citation?.title?.value == "Further legal basis" }
            ?.mapNotNull { it.keywords?.keyword?.value }
            ?.map {
                val entryId = codeListService.getCodeListEntryId("1350", it, "de")
                if (entryId == null) KeyValue(null, it) else KeyValue(entryId)
            } ?: emptyList()
    }

    fun getPurpose() = metadata.identificationInfo[0].serviceIdentificationInfo?.purpose?.value ?: ""
    fun getSpecificUsage() = metadata.identificationInfo[0].serviceIdentificationInfo?.resourceSpecificUsage
        ?.mapNotNull { it.usage?.specificUsage?.value }
        ?.joinToString(";")

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

    fun getTemporalEvents(): List<Event> {
        return metadata.identificationInfo[0].serviceIdentificationInfo?.citation?.citation?.date
            ?.map {
                val typeKey = codeListService.getCodeListEntryId("502", it.date?.dateType?.code?.codeListValue, "ISO")
                Event(KeyValue(typeKey), it?.date?.date?.dateTime ?: "")
            } ?: emptyList()
    }

    fun getTimeRelatedInfo(): TimeInfo? {
        val status = metadata.identificationInfo[0].serviceIdentificationInfo?.status?.code?.codeListValue
        val statusKey = codeListService.getCodeListEntryId("523", status, "ISO")
        return metadata.identificationInfo[0].serviceIdentificationInfo?.extent?.extend?.temporalElement
            ?.mapNotNull {

                val instant = it.extent?.extent?.timeInstant?.timePosition
                if (instant != null) {
                    return TimeInfo(instant, KeyValue("at"), KeyValue(statusKey))
                }
                log.warn("Do not support time info, returning null")
                return null
            }
            ?.getOrNull(0)
    }

    fun getAccessConstraints(): List<KeyValue> {
        return metadata.identificationInfo[0].serviceIdentificationInfo?.resourceConstraints
            ?.filter { it.legalConstraint?.accessConstraints != null }
            ?.flatMap {
                it.legalConstraint?.otherConstraints?.map { constraint ->
                    if (constraint.isAnchor) {
                        // TODO: handle values not found in codelist -> create free entry
                        val key = codeListService.getCodeListEntryId("6010", constraint.value, "de")
                        KeyValue(key)
                    } else {
                        KeyValue(null, constraint.value)
                    }
                } ?: emptyList()
            } ?: emptyList()
    }

    fun getUseLimitation() : String {
        return metadata.identificationInfo[0].serviceIdentificationInfo?.resourceConstraints
            ?.flatMap { it.legalConstraint?.useLimitation?.mapNotNull { use -> use.value } ?: emptyList() }
            ?.joinToString(";") ?: ""
    }
    
    fun getDistributionFormat(): List<DistributionFormat> {
        return metadata.distributionInfo?.mdDistribution?.distributionFormat
            ?.map { it.format }
            ?.map { 
                val nameKey = codeListService.getCodeListEntryId("1320", it?.name?.value, "de")
                val nameKeyValue = if (nameKey == null) KeyValue(null, it?.name?.value) else KeyValue(nameKey)
                DistributionFormat(nameKeyValue, it?.version?.value, it?.fileDecompressionTechnique?.value, it?.specification?.value)
            } ?: emptyList()
    }
    
    fun getMaintenanceInterval(): MaintenanceInterval {
        val maintenanceInformation =
            metadata.identificationInfo[0].serviceIdentificationInfo?.resourceMaintenance?.maintenanceInformation
        val updateFrequency = maintenanceInformation?.maintenanceAndUpdateFrequency?.code?.codeListValue
        val updateFrequencyKey = codeListService.getCodeListEntryId("518", updateFrequency, "ISO")
        val intervalEncoded = maintenanceInformation?.userDefinedMaintenanceFrequency?.periodDuration

        val value = TM_PeriodDurationToTimeAlle().parse(intervalEncoded)
        val intervalUnit = TM_PeriodDurationToTimeInterval().parse(intervalEncoded)
        val intervalUnitKey = codeListService.getCodeListEntryId("1230", intervalUnit, "de")

        val description = maintenanceInformation?.maintenanceNote
            ?.mapNotNull { it.value }
            ?.joinToString(";")

        return MaintenanceInterval(value.toInt(), KeyValue(intervalUnitKey), KeyValue(updateFrequencyKey), description)
    }

    fun getDigitalTransferOptions(): List<DigitalTransferOption> {
        return metadata.distributionInfo?.mdDistribution?.transferOptions
            ?.mapNotNull { it.mdDigitalTransferOptions }
            ?.filter { it.offLine?.mdMedium != null }
            ?.map {
                val value = it.offLine?.mdMedium?.name?.code?.codeListValue
                val nameKey = codeListService.getCodeListEntryId("520", value, "ISO")
                DigitalTransferOption(
                    KeyValue(nameKey),
                    it.transferSize?.value,
                    it.offLine?.mdMedium?.mediumNote?.value
                )
            } ?: emptyList()

    }

    fun getOrderInfo(): String {
        return metadata.distributionInfo?.mdDistribution?.distributor
            ?.flatMap {
                it.mdDistributor.distributionOrderProcess
                    ?.mapNotNull { orderProcess -> orderProcess.mdStandardOrderProcess?.orderingInstructions?.value }
                    ?: emptyList()
            }
            ?.joinToString(";") ?: ""
    }

    fun getReferences(): List<Reference> {
        return metadata.distributionInfo?.mdDistribution?.transferOptions
            ?.flatMap {transferOption ->
                transferOption.mdDigitalTransferOptions?.onLine
                    ?.filter { it.ciOnlineResource?.applicationProfile?.value != "coupled" }
                    ?.mapNotNull { it.ciOnlineResource }
                    ?.map { resource ->
                        val value = resource.function?.code?.codeListValue
                        val typeId =
                            if (value == null) null else codeListService.getCodeListEntryId("2000", value, "ISO")
                        val keyValue = if (typeId == null) KeyValue("9999") else KeyValue(typeId)
                        Reference(keyValue, resource.linkage.url, resource.name?.value, resource.description?.value)
                    } ?: emptyList()
            } ?: emptyList()
    }

    private fun containsKeyword(value: String): Boolean {
        return metadata.identificationInfo[0].serviceIdentificationInfo?.descriptiveKeywords?.any {
            it.keywords?.keyword?.value == value
        } ?: false
    }

    // TODO: use mapper from export by refactoring same functionality
    private fun mapLanguage(languageValue: String): String {
        return when (languageValue) {
            "ger" -> "150"
            "eng" -> "123"
            "bul" -> "65"
            "cze" -> "101"
            "dan" -> "103"
            "spa" -> "401"
            "fin" -> "134"
            "fre" -> "137"
            "gre" -> "164"
            "hun" -> "183"
            "dut" -> "116"
            "pol" -> "346"
            "por" -> "348"
            "rum" -> "360"
            "slo" -> "385"
            "slv" -> "386"
            "ita" -> "202"
            "est" -> "126"
            "lav" -> "247"
            "lit" -> "251"
            "nno" -> "312"
            "rus" -> "363"
            "swe" -> "413"
            "mlt" -> "284"
            "wen" -> "467"
            "hsb" -> "182"
            "dsb" -> "113"
            "fry" -> "142"
            "nds" -> "306"
            else -> throw ServerException.withReason("Could not map document language key: language.key")
        }
    }

}

data class DigitalTransferOption(
    val name: KeyValue?,
    val transferSize: Float?,
    val mediumNote: String?
)

data class Reference(
    val type: KeyValue,
    val url: String?,
    val title: String?,
    val explanation: String?
)

data class DistributionFormat(
    val name: KeyValue,
    val version: String?,
    val compression: String?,
    val specification: String?
)

data class MaintenanceInterval(
    val value: Number?,
    val unit: KeyValue?,
    val interval: KeyValue?,
    val description: String?
)

data class TimeInfo(val date: String, val type: KeyValue, val status: KeyValue)

data class Event(val type: KeyValue, val date: String)

data class VerticalExtentModel(
    val uom: String,
    val min: Number,
    val max: Number,
    val datum: String
)

data class SpatialReference(
    val type: String,
    val title: String?,
    var coordinates: BoundingBox? = null
)

data class BoundingBox(
    val lat1: Float,
    val lon1: Float,
    val lat2: Float,
    val lon2: Float
)

data class CoupledResourceModel(
    val uuid: String?,
    val url: String?,
    val title: String?,
    val isExternalRef: Boolean,
)

data class PointOfContact(
    val refUuid: String,
    val type: KeyValue
)

data class KeyValue(
    val key: String? = null,
    val value: String? = null,
)