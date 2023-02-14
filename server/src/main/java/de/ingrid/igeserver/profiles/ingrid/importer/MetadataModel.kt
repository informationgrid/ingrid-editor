package de.ingrid.igeserver.profiles.ingrid.importer

import de.ingrid.igeserver.ServerException
import de.ingrid.igeserver.exports.iso.Address
import de.ingrid.igeserver.exports.iso.CIContact
import de.ingrid.igeserver.exports.iso.Metadata
import de.ingrid.igeserver.exports.iso.RoleCode
import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.utils.udk.TM_PeriodDurationToTimeAlle
import de.ingrid.utils.udk.TM_PeriodDurationToTimeInterval
import de.ingrid.utils.udk.UtilsCountryCodelist
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
        val description = metadata.identificationInfo[0].serviceIdentificationInfo?.abstract?.value ?: return ""

        val beginOfExtra = listOf(
            "Maßstab:",
            "Bodenauflösung:",
            "Scanauflösung (DPI):",
            "Systemumgebung:",
            "Erläuterung zum Fachbezug:"
        )
            .map { description.indexOf(it) }
            .filter { it != -1 }
            .sortedBy { it }
            .getOrNull(0) ?: description.length

        return description.substring(0, beginOfExtra).trim()
    }

    fun getPointOfContacts(): List<PointOfContact> {
        val mainContact = metadata.contact
        val additionalContacts = metadata.identificationInfo[0].serviceIdentificationInfo?.pointOfContact ?: emptyList()
        return (mainContact + additionalContacts).map {
            val individualName = extractPersonInfo(it.responsibleParty?.individualName?.value)
            val organization = it.responsibleParty?.organisationName?.value
            val communications = getCommunications(it.responsibleParty?.contactInfo?.ciContact)
            val addressInfo = getAddressInfo(it.responsibleParty?.contactInfo?.ciContact?.address?.address)
            PointOfContact(
                it.responsibleParty?.uuid!!,
                if (individualName == null) "InGridOrganisationDoc" else "InGridPersonDoc",
                communications,
                mapRoleToContactType(it.responsibleParty?.role!!),
                individualName == null,
                organization,
                individualName,
                addressInfo
            )
        }
    }

    private fun getAddressInfo(address: Address?): AddressInfo? {
        val city = address?.city?.value
        val street = address?.deliveryPoint
            ?.filter { it.value?.startsWith("Postbox ") != true }
            ?.mapNotNull { it.value }
            ?.joinToString(";")
        val postbox = address?.deliveryPoint
            ?.filter { it.value?.startsWith("Postbox ") == true }
            ?.mapNotNull { it.value }
            ?.getOrNull(0)
            ?.split(",")
            ?.getOrNull(0)
            ?.substring(8)
        val zipPostbox = address?.deliveryPoint
            ?.filter { it.value?.startsWith("Postbox ") == true }
            ?.mapNotNull { it.value }
            ?.getOrNull(0)
            ?.split(",")
            ?.getOrNull(1)
            ?.split(" ")
            ?.getOrNull(0)
        val zipCode = address?.postalCode?.value
        val administrativeArea = address?.administrativeArea?.value
            ?.let { codeListService.getCodeListEntryId("110", it, "de") }
            ?.let { KeyValue(it) }
        val countryCode = address?.country?.value
            ?.let { UtilsCountryCodelist.getCodeFromShortcut3(it) }
            ?.let { KeyValue(it.toString()) }

        return if (listOfNotNull(city, postbox, street, countryCode, zipCode, zipPostbox, administrativeArea).isEmpty()) null
        else {
            AddressInfo(
                city,
                postbox,
                street,
                countryCode,
                zipCode,
                zipPostbox,
                administrativeArea
            )
        }
    }

    private fun getCommunications(ciContact: CIContact?): List<Communication> {
        val list = mutableListOf<Communication>()
        ciContact?.address?.address?.electronicMailAddress?.mapNotNull { it.value }?.forEach { list.add(Communication(KeyValue("3"), it)) }
        ciContact?.phone?.value?.let { list.add(Communication(KeyValue("1"), it)) }
        return list
    }

    private fun extractPersonInfo(value: String?): PersonInfo? {
        value?.split(",")?.let { nameSplit ->
            val salutationKey = nameSplit[2].trim().let { codeListService.getCodeListEntryId("4300", it, "de") }
            val salutationKeyValue = if (salutationKey == null) null else KeyValue(salutationKey)
            return PersonInfo(nameSplit[1].trim(), nameSplit[0].trim(), salutationKeyValue)
        }
        return null
    }

    private fun mapRoleToContactType(role: RoleCode): KeyValue {
        val value = role.codelist?.codeListValue
        val entryId = codeListService.getCodeListEntryId("505", value, "ISO")

        return if (entryId == null) KeyValue(null, value) else KeyValue(entryId)
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

    fun getKeywords(): List<String> {
        val ignoreThesaurus = listOf(
            "German Environmental Classification - Topic, version 1.0",
            "GEMET - INSPIRE themes, version 1.0",
            "Service Classification, version 1.0",
            "INSPIRE priority data set",
            "Spatial scope",
            "Further legal basis"
        )
        val ignoreKeywords = listOf("inspireidentifiziert", "opendata", "AdVMIS")
        return metadata.identificationInfo[0].serviceIdentificationInfo?.descriptiveKeywords
            ?.asSequence()
            ?.filter {
                val thesaurusName = it.keywords?.thesaurusName?.citation?.title?.value
                val type = it.keywords?.type?.codelist?.codeListValue
                (thesaurusName == null && type != "theme") || (thesaurusName != null && !ignoreThesaurus.contains(
                    thesaurusName
                ))
            }
            ?.mapNotNull { it.keywords?.keyword?.value }
            ?.filter { !ignoreKeywords.contains(it) }
            ?.filter { codeListService.getCodeListEntryId("5200", it, "ISO") == null }
            ?.map { it }
            ?.toList() ?: emptyList()
    }

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

    fun getUseLimitation(): String {
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
                DistributionFormat(
                    nameKeyValue,
                    it?.version?.value,
                    it?.fileDecompressionTechnique?.value,
                    it?.specification?.value
                )
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
            ?.flatMap { transferOption ->
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

data class Operation(
    val name: String?,
    val description: String?,
    val methodCall: String?,
)

data class Resolution(
    val denominator: Number?,
    val distanceMeter: Number?,
    val distanceDPI: Number?,
)

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
    val addressType: String,
    val communications: List<Communication>,
    val type: KeyValue,
    val isOrganization: Boolean = true,
    val organization: String? = null,
    val personInfo: PersonInfo? = null,
    val address: AddressInfo? = null
)

data class Communication(
    val type: KeyValue,
    val connection: String
)

data class KeyValue(
    val key: String? = null,
    val value: String? = null,
)

data class PersonInfo(
    val firstName: String?,
    val lastName: String?,
    val salutation: KeyValue?,
)

data class AddressInfo(
    val city: String?,
    val pOBox: String?,
    val street: String?,
    val country: KeyValue?,
    val zipCode: String?,
    val zipPOBox: String?,
    val administrativeArea: KeyValue?
)
