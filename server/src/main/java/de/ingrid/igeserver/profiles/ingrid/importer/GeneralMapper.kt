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
package de.ingrid.igeserver.profiles.ingrid.importer

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.dataformat.xml.XmlMapper
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import de.ingrid.igeserver.ServerException
import de.ingrid.igeserver.exports.iso.*
import de.ingrid.igeserver.model.KeyValue
import de.ingrid.igeserver.profiles.ingrid.inVeKoSKeywordMapping
import de.ingrid.igeserver.profiles.ingrid.iso639LanguageMapping
import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.igeserver.utils.convertGml32ToWkt
import de.ingrid.utils.udk.TM_PeriodDurationToTimeAlle
import de.ingrid.utils.udk.TM_PeriodDurationToTimeInterval
import de.ingrid.utils.udk.UtilsCountryCodelist
import org.apache.logging.log4j.kotlin.logger
import java.time.LocalDate
import java.time.OffsetDateTime
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import java.util.*


open class GeneralMapper(
    val metadata: Metadata,
    val codeListService: CodelistHandler,
    val catalogId: String,
    val documentService: DocumentService
) {

    private val log = logger()

    val uuid = metadata.fileIdentifier?.value
    val type =
        if (metadata.hierarchyLevel?.get(0)?.scopeCode?.codeListValue == "service") "InGridGeoService" else "InGridGeoDataset"
    val title = metadata.identificationInfo[0].identificationInfo?.citation?.citation?.title?.value
    val isInspireIdentified = containsKeyword("inspireidentifiziert")
    val isAdVCompatible = containsKeyword("AdVMIS")
    val isOpenData = containsKeyword("opendata")
    val parentUuid = metadata.parentIdentifier?.value

    private val addressMaps = mutableMapOf<String, String>()

    fun getDescription(): String {
        val description = metadata.identificationInfo[0].identificationInfo?.abstract?.value ?: return ""

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
        val additionalContacts = metadata.identificationInfo[0].identificationInfo?.pointOfContact ?: emptyList()
        val distributors = metadata.distributionInfo?.mdDistribution?.distributor?.map {
            it.mdDistributor.distributorContact
        } ?: emptyList()
        return (mainContact + additionalContacts + distributors).flatMapIndexed { index: Int, contact: Contact ->
            val individualName = extractPersonInfo(contact.responsibleParty?.individualName?.value)
            val organization = contact.responsibleParty?.organisationName?.value
            val communications = getCommunications(contact.responsibleParty?.contactInfo?.ciContact)
            val addressInfo = getAddressInfo(contact.responsibleParty?.contactInfo?.ciContact?.address?.address)
            val positionName = contact.responsibleParty?.positionName?.value ?: ""
            val hoursOfService = contact.responsibleParty?.contactInfo?.ciContact?.hoursOfService?.value ?: ""

            // if role is PointOfContact, and it comes from main contact element
            // then it gets special role: pointOfContactMd (key=12)
            val roleIso = contact.responsibleParty?.role?.codelist?.codeListValue!!
            val role: KeyValue = if (roleIso == "pointOfContact" && index < mainContact.size) KeyValue("12")
            else {
                mapRoleToContactType(roleIso)
            }

            // add parent organisation if exists
            val parents: MutableList<PointOfContact> = if (organization != null && individualName != null) {
                val parentOrganisation = findParentOrganisation(organization)
                val parentAddressUuid = parentOrganisation ?: UUID.randomUUID().toString().also { newUuid ->
                    addressMaps[organization] = newUuid
                }

                if (parentOrganisation == null) {
                    mutableListOf(
                        PointOfContact(
                            parentAddressUuid,
                            "InGridOrganisationDoc",
                            communications,
                            KeyValue(),
                            true,
                            organization,
                            address = addressInfo
                        )
                    )
                } else mutableListOf()
            } else mutableListOf()

            val pointOfContact = PointOfContact(
                contact.responsibleParty?.uuid ?: UUID.randomUUID().toString(),
                if (individualName == null) "InGridOrganisationDoc" else "InGridPersonDoc",
                communications,
                role,
                individualName == null,
                organization,
                individualName,
                addressInfo,
                positionName,
                hoursOfService,
                parents.lastOrNull()?.refUuid
            )
            parents.add(pointOfContact)
            parents
        }
    }

    private fun findParentOrganisation(name: String): String? {
        return addressMaps[name] ?: documentService.docRepo.findAddressByOrganisationName(name)
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
            ?.let { codeListService.getCatalogCodelistKey(catalogId, "6250", it) }
            ?.let { KeyValue(it) }
        val countryCode = address?.country?.value
            ?.let { UtilsCountryCodelist.getCodeFromShortcut3(it) }
            ?.let { KeyValue(it.toString()) }

        return if (listOfNotNull(
                city,
                postbox,
                street,
                countryCode,
                zipCode,
                zipPostbox,
                administrativeArea
            ).isEmpty()
        ) null
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
        ciContact?.address?.address?.electronicMailAddress?.mapNotNull { it.value }
            ?.forEach { list.add(Communication(KeyValue("3"), it)) }
        ciContact?.phone?.value?.let { list.add(Communication(KeyValue("1"), it)) }
        return list
    }

    private fun extractPersonInfo(value: String?): PersonInfo? {
        if (value?.contains(",") == true) {
            value.split(",").let { nameSplit ->
                return when (nameSplit.size) {
                    1 -> PersonInfo(null, nameSplit[0].trim(), null)
                    2 -> PersonInfo(nameSplit[1].trim(), nameSplit[0].trim(), null)
                    else -> PersonInfo(nameSplit[1].trim(), nameSplit[0].trim(), getSalutationKeyValue(nameSplit[2]))
                }
            }
        }
        value?.split(" ")?.let { nameSplit ->
            return when (nameSplit.size) {
                1 -> PersonInfo(null, nameSplit[0].trim(), null)
                2 -> PersonInfo(nameSplit[0].trim(), nameSplit[1].trim(), null)
                else -> PersonInfo(nameSplit[1].trim(), nameSplit[2].trim(), getSalutationKeyValue(nameSplit[0]))
            }
        }
        return null
    }

    private fun getSalutationKeyValue(value: String): KeyValue? {
        val salutationKey = value.trim().let { codeListService.getCodeListEntryId("4300", it, "de") }
        return if (salutationKey == null) null else KeyValue(salutationKey)
    }

    private fun mapRoleToContactType(value: String): KeyValue {
        val entryId = codeListService.getCodeListEntryId("505", value, "iso")
        return if (entryId == null) KeyValue(null, value) else KeyValue(entryId)
    }

    fun getAdvProductGroups(): List<KeyValue> {
        return metadata.identificationInfo[0].identificationInfo?.citation?.citation?.alternateTitle
            ?.map { it.value }
            ?.joinToString(";")
            ?.split(";")
            ?.mapNotNull { codeListService.getCodeListEntryId("8010", it, "de") }
            ?.map { KeyValue(it) } ?: emptyList()
    }

    fun getAlternateTitle(): String {
        return metadata.identificationInfo[0].identificationInfo?.citation?.citation?.alternateTitle
            ?.map { it.value }
            ?.joinToString(";")
            ?.split(";")
            ?.filter { codeListService.getCodeListEntryId("8010", it, "de") == null }
            ?.joinToString(";") ?: ""
    }

    fun getThemes(): List<KeyValue> {
        return metadata.identificationInfo[0].identificationInfo?.descriptiveKeywords
            ?.filter { it.keywords?.thesaurusName?.citation?.title?.value == "GEMET - INSPIRE themes, version 1.0" }
            ?.flatMap { it.keywords?.keyword?.map { it.value } ?: emptyList() }
            ?.mapNotNull { codeListService.getCodeListEntryId("6100", it, "de") }
            ?.map { KeyValue(it) } ?: emptyList()
    }

    fun getPriorityDatasets(): List<KeyValue> {
        return metadata.identificationInfo[0].identificationInfo?.descriptiveKeywords
            ?.filter { it.keywords?.thesaurusName?.citation?.title?.value == "INSPIRE priority data set" }
            ?.flatMap { it.keywords?.keyword?.map { it.value } ?: emptyList() }
            ?.map { codeListService.getCodeListEntryId("6350", it, "de") }
            ?.map { KeyValue(it) } ?: emptyList()
    }

    fun getInVeKoSKeywords(): List<KeyValue> {
        return metadata.identificationInfo[0].identificationInfo?.descriptiveKeywords
            ?.filter { it.keywords?.thesaurusName?.citation?.title?.value == "IACS data" }
            ?.flatMap { it.keywords?.keyword?.map { item -> item.value } ?: emptyList() }
            ?.map { inVeKoSKeywordMapping.filter { item -> item.value == it }.keys.first() }
            ?.map { KeyValue(it) } ?: emptyList()
    }

    fun getOpenDataCategories(): List<KeyValue> {
        return metadata.identificationInfo[0].identificationInfo?.descriptiveKeywords
            ?.asSequence()
            ?.filter { it.keywords?.thesaurusName == null }
            ?.filter { it.keywords?.type?.codelist?.codeListValue == "theme" }
            ?.flatMap { it.keywords?.keyword?.map { it.value } ?: emptyList() }
            ?.mapNotNull { it }
            ?.map { codeListService.getCodeListEntryIdMatchingData("6400", it) }
            ?.map { KeyValue(it) }
            ?.toList() ?: emptyList()
    }

    fun getSpatialScope(): KeyValue? {
        return metadata.identificationInfo[0].identificationInfo?.descriptiveKeywords
            ?.filter { it.keywords?.thesaurusName?.citation?.title?.value == "Spatial scope" }
            ?.flatMap { it.keywords?.keyword?.map { it.value } ?: emptyList() }
            ?.mapNotNull { it }
            ?.map { codeListService.getCodeListEntryId("6360", it, "de") }
            ?.map { KeyValue(it) }
            ?.getOrNull(0)
    }

    fun getGraphicOverviews(): List<PreviewGraphic> {
        return metadata.identificationInfo[0].identificationInfo?.graphicOverview
            ?.map {
                PreviewGraphic(it.mdBrowseGraphic?.fileName?.value!!, it.mdBrowseGraphic.fileDescription?.value)
            } ?: emptyList()
    }

    data class PreviewGraphic(
        val fileName: String,
        val description: String? = null
    )

    open fun getKeywords() = getKeywords(emptyList())
    fun getKeywords(ignoreAdditional: List<String> = emptyList()): List<String> {
        val ignoreThesaurus = listOf(
            "German Environmental Classification - Topic, version 1.0",
            "GEMET - INSPIRE themes, version 1.0",
            "Service Classification, version 1.0",
            "INSPIRE priority data set",
            "Spatial scope",
            "Further legal basis",
            "IACS data"
        ) + ignoreAdditional
        val ignoreKeywords = listOf("inspireidentifiziert", "opendata", "AdVMIS")
        return metadata.identificationInfo[0].identificationInfo?.descriptiveKeywords
            ?.asSequence()
            ?.filter {
                val thesaurusName = it.keywords?.thesaurusName?.citation?.title?.value
                val type = it.keywords?.type?.codelist?.codeListValue
                (thesaurusName == null && type != "theme") || (thesaurusName != null && !ignoreThesaurus.contains(
                    thesaurusName
                ))
            }
            ?.flatMap { it.keywords?.keyword?.map { it.value } ?: emptyList() }
            ?.mapNotNull { it }
            ?.filter { !ignoreKeywords.contains(it) }
            ?.filter { codeListService.getCodeListEntryId("5200", it, "iso") == null }
            ?.map { it }
            ?.toList() ?: emptyList()
    }

    fun getSpatialSystems(): List<KeyValue> {
        return metadata.referenceSystemInfo
            ?.map { it.referenceSystem?.referenceSystemIdentifier?.identifier?.code?.value }
            ?.map { codeListService.getCodeListEntryId("100", it, "de")?.let { KeyValue(it) } ?: KeyValue(null, it) }
            ?: emptyList()
    }

    fun getSpatialReferences(): List<SpatialReference> {
        val references = mutableListOf<SpatialReference>()

        metadata.identificationInfo[0].identificationInfo?.extent
            ?.flatMap { it.extend?.geographicElement ?: emptyList() }
            ?.forEach {
                // handle title
                val geoIdentifierCode = it.geographicDescription?.geographicIdentifier?.mdIdentifier?.code
                val titleOrArs = geoIdentifierCode?.value

                if (titleOrArs != null) {
                    val isAnchorAndRegionKey = geoIdentifierCode.isAnchor
                    // ignore regional key definition, which is identified by an anchor element
                    if (isAnchorAndRegionKey) {
                        references.add(SpatialReference("free", title = null, ars = titleOrArs))
                    } else {
                        references.add(SpatialReference("free", title = titleOrArs))
                    }
                    return@forEach
                }

                // handle coordinates
                it.geographicBoundingBox?.let { bbox ->
                    if (references.isEmpty()) references.add(SpatialReference("free", null))
                    references.last().coordinates = BoundingBox(
                        bbox.southBoundLatitude?.value!!,
                        bbox.westBoundLongitude?.value!!,
                        bbox.northBoundLatitude?.value!!,
                        bbox.eastBoundLongitude?.value!!
                    )
                }

                // TODO: handle bounding polygons
                it.boundingPolygon?.polygon?.let { polygon ->
                    val xmlMapper = XmlMapper()
                    val xml = xmlMapper.writer().withoutRootName().writeValueAsString(it.boundingPolygon.polygon)
                    val convertedWKT = convertGml32ToWkt(xml.substring(2, xml.length - 3))
                    references.add(SpatialReference(type = "wkt", title = null, wkt = convertedWKT))
                }
            }

        return references
    }

    val spatialDescription =
        metadata.identificationInfo[0].identificationInfo?.extent?.mapNotNull { it.extend }
            ?.mapNotNull { it.description?.value }
            ?.joinToString(";")

    fun getRegionKey(): String {
        return metadata.identificationInfo[0].identificationInfo?.extent
            ?.flatMap { it.extend?.geographicElement?.map { it.geographicDescription } ?: emptyList() }
            ?.filter { it?.geographicIdentifier?.mdIdentifier?.code?.isAnchor ?: false }
            ?.mapNotNull { it?.geographicIdentifier?.mdIdentifier?.code?.value }
            ?.getOrNull(0) ?: ""
    }

    fun getVerticalExtent(): VerticalExtentModel? {
        return metadata.identificationInfo[0].identificationInfo?.extent
            ?.flatMap { it.extend?.verticalElement ?: emptyList() }
            ?.mapNotNull {
                val uom =
                    it.verticalElement?.verticalCRS?.verticalCRS?.verticalCS?.verticalCS?.axis?.coordinateSystemAxis?.uom
                val uomId = codeListService.getCodeListEntryId("102", uom, "iso")
                val min = it.verticalElement?.minimumValue?.value
                val max = it.verticalElement?.maximumValue?.value
                val datum = it.verticalElement?.verticalCRS?.verticalCRS?.verticalDatum?.verticalDatum?.name
                val datumId = codeListService.getCodeListEntryId("101", datum, "de")
                return if (uomId == null || min == null || max == null || datumId == null) null
                else VerticalExtentModel(uomId, min, max, datumId)
            }?.getOrNull<VerticalExtentModel>(0)
    }

    fun getLanguage(): KeyValue {
        val languageKey = iso639LanguageMapping[metadata.language?.codelist?.codeListValue!!]
            ?: throw ServerException.withReason("Could not map document language key: ${metadata.language?.codelist?.codeListValue}")
        return KeyValue(languageKey)
    }

    fun getLegalDescriptions(): List<KeyValue> {
        return metadata.identificationInfo[0].identificationInfo?.descriptiveKeywords
            ?.filter { it.keywords?.thesaurusName?.citation?.title?.value == "Further legal basis" }
            ?.flatMap { it.keywords?.keyword?.map { it.value } ?: emptyList() }
            ?.mapNotNull { it }
            ?.map {
                val entryId = codeListService.getCatalogCodelistKey(catalogId, "1350", it)
                if (entryId == null) KeyValue(null, it) else KeyValue(entryId)
            } ?: emptyList()
    }

    fun getPurpose() = metadata.identificationInfo[0].identificationInfo?.purpose?.value ?: ""
    fun getSpecificUsage() = metadata.identificationInfo[0].identificationInfo?.resourceSpecificUsage
        ?.mapNotNull { it.usage?.specificUsage?.value }
        ?.joinToString(";")

    fun getTemporalEvents(): List<Event> {
        return metadata.identificationInfo[0].identificationInfo?.citation?.citation?.date
            ?.map {
                val typeKey = codeListService.getCodeListEntryId("502", it.date?.dateType?.code?.codeListValue, "iso")
                val date = it.date?.date?.dateTime?.let { parseDateTime(it) }
                    ?: it.date?.date?.date?.let { parseDate(it) }
                    ?: ""
                Event(KeyValue(typeKey), date)
            } ?: emptyList()
    }

    private fun parseDateTime(value: String): String {
        return OffsetDateTime.parse(value).toInstant().toString()
    }

    private fun parseDate(value: String): String {
        return LocalDate.parse(value, DateTimeFormatter.ISO_LOCAL_DATE)
            .atStartOfDay(ZoneId.systemDefault())
            .toInstant()
            .toString()
    }

    fun getTimeRelatedInfo(): TimeInfo? {
        val status = metadata.identificationInfo[0].identificationInfo?.status?.code?.codeListValue
        val statusKey = if (status == null) null else codeListService.getCodeListEntryId("523", status, "iso")
        return metadata.identificationInfo[0].identificationInfo?.extent
            ?.flatMap { it.extend?.temporalElement ?: emptyList() }
            ?.map {

                val instant = it.extent?.extent?.timeInstant?.timePosition
                if (instant != null) {
                    return TimeInfo(instant, KeyValue("at"), KeyValue(statusKey))
                }

                val period = it.extent?.extent?.timePeriod
                if (period != null) {
                    val type = determineTemporalType(period)
                    val typeSince = determineTemporalTypeSince(period)
                    return TimeInfo(
                        period.beginPosition?.value,
                        type,
                        if (status == null) null else KeyValue(statusKey),
                        period.endPosition?.value,
                        typeSince
                    )
                }

                log.warn("Do not support time info, returning null")
                return null
            }
            ?.getOrNull<TimeInfo>(0) ?: TimeInfo(status = if (status == null) null else KeyValue(statusKey))
    }

    private fun determineTemporalType(period: TimePeriod): KeyValue? {
        if (period.beginPosition?.value != null && period.endPosition?.value != null) {
            return KeyValue("since") // von
        } else if (period.beginPosition?.indeterminatePosition == "unknown") {
            return KeyValue("until")
        } else if (period.endPosition?.indeterminatePosition == "unknown") {
            return KeyValue("since")
        } else if (period.endPosition?.indeterminatePosition == "now") {
            return KeyValue("since")
        }

        return null
    }

    private fun determineTemporalTypeSince(period: TimePeriod): KeyValue? {
        if (period.beginPosition?.value != null && period.endPosition?.value != null) return KeyValue("exactDate")
        if (period.endPosition?.indeterminatePosition == "now") return KeyValue("requestTime")
        if (period.endPosition?.indeterminatePosition == "unknown") return KeyValue("unknown")

        return null
    }

    fun getAccessConstraints(): List<KeyValue> {
        return metadata.identificationInfo[0].identificationInfo?.resourceConstraints
            ?.filter { it.legalConstraint?.accessConstraints != null }
            ?.flatMap {
                it.legalConstraint?.otherConstraints?.map { constraint ->
                    if (constraint.isAnchor) {
                        val key = codeListService.getCodeListEntryId("6010", constraint.value, "de")
                        if (key == null) KeyValue(null, constraint.value) else KeyValue(key)
                    } else {
                        KeyValue(null, constraint.value)
                    }
                } ?: emptyList()
            } ?: emptyList()
    }

    fun getUseLimitation(): String {
        return metadata.identificationInfo[0].identificationInfo?.resourceConstraints
            ?.flatMap { it.legalConstraint?.useLimitation?.mapNotNull { use -> use.value } ?: emptyList() }
            ?.joinToString(";") ?: ""
    }

    fun getDistributionFormat(): List<DistributionFormat> {
        return metadata.distributionInfo?.mdDistribution?.distributionFormat
            ?.map { it.format }
            ?.mapNotNull {
                val nameKey = codeListService.getCodeListEntryId("1320", it?.name?.value, "de")
                val nameKeyValue = if (nameKey == null) KeyValue(null, it?.name?.value) else KeyValue(nameKey)
                val result = DistributionFormat(
                    nameKeyValue,
                    it?.version?.value,
                    it?.fileDecompressionTechnique?.value,
                    it?.specification?.value
                )
                if (result.isNull()) null else result
            } ?: emptyList()
    }

    fun getMaintenanceInterval(): MaintenanceInterval {
        val maintenanceInformation =
            metadata.identificationInfo[0].identificationInfo?.resourceMaintenance?.maintenanceInformation
        val updateFrequency = maintenanceInformation?.maintenanceAndUpdateFrequency?.code?.codeListValue
        val updateFrequencyKey = codeListService.getCodeListEntryId("518", updateFrequency, "iso")
        val intervalEncoded = maintenanceInformation?.userDefinedMaintenanceFrequency?.periodDuration

        val value = TM_PeriodDurationToTimeAlle().parse(intervalEncoded)
        val intervalUnit = TM_PeriodDurationToTimeInterval().parse(intervalEncoded)
        val intervalUnitKey = codeListService.getCodeListEntryId("1230", intervalUnit, "de")

        val description = maintenanceInformation?.maintenanceNote
            ?.mapNotNull { it.value }
            ?.joinToString(";")

        return MaintenanceInterval(value?.toInt(), KeyValue(intervalUnitKey), KeyValue(updateFrequencyKey), description)
    }

    fun getDigitalTransferOptions(): List<DigitalTransferOption> {
        return metadata.distributionInfo?.mdDistribution?.transferOptions
            ?.mapNotNull { it.mdDigitalTransferOptions }
            ?.filter { it.offLine?.mdMedium != null }
            ?.map {
                val value = it.offLine?.mdMedium?.name?.code?.codeListValue
                val nameKey = codeListService.getCodeListEntryId("520", value, "iso")
                DigitalTransferOption(
                    KeyValue(nameKey),
                    if (it.transferSize?.value == null) null else UnitField(
                        it.transferSize.value.toString(),
                        KeyValue("MB")
                    ),
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
                            if (value == null) null else codeListService.getCodeListEntryId("2000", value, "iso")
                        val keyValue = if (typeId == null) KeyValue("9999") else KeyValue(typeId)
                        val applicationValue = resource.applicationProfile?.value
                        val applicationId = if (applicationValue == null) null else codeListService.getCodeListEntryId(
                            "1320",
                            applicationValue,
                            "iso"
                        )
                        val applicationFinalValue = when {
                            applicationValue == null -> null
                            applicationId == null -> KeyValue(null, applicationValue)
                            else -> KeyValue(applicationId)
                        }
                        Reference(
                            keyValue,
                            resource.linkage.url,
                            applicationFinalValue,
                            resource.name?.value,
                            resource.description?.value
                        )
                    } ?: emptyList()
            } ?: emptyList()
    }

    fun getConformanceResult(): List<ConformanceResult> {
        return metadata.dataQualityInfo
            ?.filter { it.dqDataQuality?.report != null }
            ?.flatMap {
                it.dqDataQuality?.report?.map { report -> report.dqDomainConsistency?.result?.dqConformanceResult }
                    ?: emptyList()
            }
            ?.mapNotNull {
                val pass = determineConformanceResultPass(it?.pass?.boolean?.value)
                val specification = it?.specification?.citation?.title?.value ?: return@mapNotNull null

                val specificationEntryId = codeListService.getCodeListEntryId("6005", specification, "iso")
                val specificationKeyValue =
                    if (specificationEntryId == null) KeyValue(null, specification) else KeyValue(specificationEntryId)
                val dateObject = it.specification.citation.date.getOrNull(0)?.date?.date
                val publicationDate = dateObject?.dateTime?.let { parseDateTime(it) }
                    ?: dateObject?.date?.let { parseDate(it) }
                    ?: ""
                ConformanceResult(
                    pass,
                    specificationEntryId != null,
                    it.explanation.value,
                    specificationKeyValue,
                    publicationDate
                )
            } ?: emptyList()
    }

    private fun determineConformanceResultPass(value: Boolean?): KeyValue {
        return when (value) {
            true -> KeyValue("1")
            false -> KeyValue("2")
            null -> KeyValue("3")
        }
    }

    fun getUseConstraints(): List<UseConstraint> {
        val otherConstraints = metadata.identificationInfo[0].identificationInfo?.resourceConstraints
            ?.map { it.legalConstraint }
            ?.filter { it?.useConstraints != null }
            ?.flatMap { legalConstraint -> legalConstraint?.otherConstraints?.mapNotNull { it.value } ?: emptyList() }
            ?: emptyList()

        val result = mutableListOf<UseConstraint>()

        // otherConstraints for use-constraints can have the following order/groups
        // LicenseText
        // LicenseText, Source
        // LicenseText, Source, JSON
        otherConstraints.forEachIndexed { index, value ->
            if (isJsonString(value)) {
                val node = jacksonObjectMapper().readValue<JsonNode>(value)
                val text = node.get("name").asText()
                val keyValue = convertUserConstraintToKeyValue(text)
                result.add(UseConstraint(keyValue, node.get("quelle").asText()))
                return@forEachIndexed
            }

            if (isSourceNote(value)) {
                // already handled
                return@forEachIndexed
            }

            val nextValue = otherConstraints.getOrNull(index + 1)
            val secondNextValue = otherConstraints.getOrNull(index + 2)

            if (isJsonString(nextValue) || isJsonString(secondNextValue)) {
                // skip item since JSON will be used
                return@forEachIndexed
            }

            if (isSourceNote(nextValue)) {
                result.add(
                    UseConstraint(
                        convertUserConstraintToKeyValue(value),
                        nextValue?.replace("Quellenvermerk: ", "")
                    )
                )
                return@forEachIndexed
            }

            // is last constraint or next one is another one/group
            result.add(UseConstraint(convertUserConstraintToKeyValue(value), null))

        }

        return result
    }

    private fun isSourceNote(value: String?): Boolean {
        return value?.startsWith("Quellenvermerk: ") ?: false
    }

    private fun convertUserConstraintToKeyValue(text: String?): KeyValue? {
        if (text == null) return null
        val id = codeListService.getCodeListEntryId("6500", text, "de")
        return if (id == null) KeyValue(null, text) else KeyValue(id)
    }

    private fun isJsonString(useConstraint: String?): Boolean {
        if (useConstraint == null) return false
        return useConstraint.startsWith("{") && useConstraint.endsWith("}")
    }


    protected fun containsKeyword(value: String): Boolean {
        return metadata.identificationInfo[0].identificationInfo?.descriptiveKeywords
            ?.flatMap { it.keywords?.keyword?.map { it.value } ?: emptyList() }
            ?.any { it == value } ?: false
    }

}

data class UseConstraint(
    val title: KeyValue?,
    val source: String?
)

data class ConformanceResult(
    val pass: KeyValue,
    val isInspire: Boolean,
    val explanation: String?,
    val specification: KeyValue?,
    val publicationDate: String?
)

data class Operation(
    val name: KeyValue?,
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
    val transferSize: UnitField?,
    val mediumNote: String?
)

data class UnitField(
    val value: String?,
    val unit: KeyValue?
)

data class Reference(
    val type: KeyValue,
    val url: String?,
    val urlDataType: KeyValue?,
    val title: String?,
    val explanation: String?
)

data class DistributionFormat(
    val name: KeyValue,
    val version: String?,
    val compression: String?,
    val specification: String?
) {
    fun isNull(): Boolean {
        return version.isNullOrEmpty() && compression.isNullOrEmpty() && specification.isNullOrEmpty() && name.key.isNullOrEmpty() && name.value.isNullOrEmpty()
    }
}

data class MaintenanceInterval(
    val value: Number?,
    val unit: KeyValue?,
    val interval: KeyValue?,
    val description: String?
)

data class TimeInfo(
    val date: String? = null,
    val type: KeyValue? = null,
    var status: KeyValue? = null,
    val untilDate: String? = null,
    val dateTypeSince: KeyValue? = null
)

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
    var coordinates: BoundingBox? = null,
    var wkt: String? = null,
    var ars: String? = null
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
    val identifier: String? = null,
)

data class PointOfContact(
    val refUuid: String,
    val addressType: String,
    val communications: List<Communication>,
    val type: KeyValue,
    val isOrganization: Boolean = true,
    val organization: String? = null,
    val personInfo: PersonInfo? = null,
    val address: AddressInfo? = null,
    val positionName: String = "",
    val hoursOfService: String = "",
    val parent: String? = null
)

data class Communication(
    val type: KeyValue,
    val connection: String
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
