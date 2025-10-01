/**
 * ==================================================
 * Copyright (C) 2023-2025 wemove digital solutions GmbH
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

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.dataformat.xml.XmlMapper
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import de.ingrid.igeserver.ServerException
import de.ingrid.igeserver.exports.iso.Address
import de.ingrid.igeserver.exports.iso.CIContact
import de.ingrid.igeserver.exports.iso.Contact
import de.ingrid.igeserver.exports.iso.TimePeriod
import de.ingrid.igeserver.model.KeyValue
import de.ingrid.igeserver.profiles.ingrid.inVeKoSKeywordMapping
import de.ingrid.igeserver.profiles.ingrid.iso639LanguageMapping
import de.ingrid.igeserver.profiles.ingrid.utils.FieldToCodelist
import de.ingrid.igeserver.services.BwastrLocatorService
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

open class GeneralMapper(val isoData: IsoImportData) {

    open val splitSpatialSystems = false

    private val log = logger()

    val fieldToCodelist = FieldToCodelist()

    val metadata = isoData.data
    val catalogLanguage = isoData.catalogLanguage
    val codeListService: CodelistHandler = isoData.codelistService
    val catalogId: String = isoData.catalogId
    val documentService: DocumentService = isoData.documentService
    val bwastrLocatorService: BwastrLocatorService = isoData.bwastrLocatorService

    val uuid = metadata.fileIdentifier?.value
    open val type = when (metadata.hierarchyLevel?.get(0)?.scopeCode?.codeListValue) {
        "service" -> "InGridGeoService"
        "application" -> "InGridInformationSystem"
        else -> "InGridGeoDataset"
    }
    val title = metadata.identificationInfo[0].identificationInfo?.citation?.citation?.title?.value
    val isInspireIdentified = containsKeyword("inspireidentifiziert")
    val isAdVCompatible = containsKeyword("AdVMIS")
    val isHvd = getHvdCategories().isNotEmpty()
    val isOpenData = containsKeyword("opendata")
    val parentUuid = metadata.parentIdentifier?.value

    fun getDescription(): String {
        val description = metadata.identificationInfo[0].identificationInfo?.abstract?.value ?: return ""

        val beginOfExtra = listOf(
            "Maßstab:",
            "Bodenauflösung:",
            "Scanauflösung (DPI):",
            "Systemumgebung:",
            "Erläuterung zum Fachbezug:",
        )
            .map { description.indexOf(it) }
            .filter { it != -1 }
            .sortedBy { it }
            .getOrNull(0) ?: description.length

        return description.substring(0, beginOfExtra).trim()
    }

    private val pointOfContacts: List<PointOfContact> by lazy {
        val mainContact = metadata.contact
        val additionalContacts = metadata.identificationInfo[0].identificationInfo?.pointOfContact ?: emptyList()
        val distributors = metadata.distributionInfo?.mdDistribution?.distributor?.map {
            it.mdDistributor.distributorContact
        } ?: emptyList()
        val featureCatalogContacts =
            metadata.contentInfo?.get(0)?.mdFeatureCatalogueDescription?.featureCatalogueCitation?.get(0)?.citation?.citedResponsibleParty
                ?: emptyList()
        val domainConsistencyContacts = metadata.dataQualityInfo?.get(0)?.dqDataQuality?.report?.get(0)?.let {
            listOf(
                it.dqTemporalValidity,
                it.dqTemporalConsistency,
                it.dqAccuracyOfATimeMeasurement,
                it.dqQuantitativeAttributeAccuracy,
                it.dqNonQuantitativeAttributeAccuracy,
                it.dqThematicClassificationCorrectness,
                it.dqRelativeInternalPositionalAccuracy,
                it.dqGriddedDataPositionalAccuracy,
                it.dqAbsoluteExternalPositionalAccuracy,
                it.dqTopologicalConsistency,
                it.dqFormatConsistency,
                it.dqDomainConsistency,
                it.dqConceptualConsistency,
                it.dqCompletenessOmission,
                it.dqCompletenessCommission,
            ).flatMap { item ->
                item?.result?.dqConformanceResult?.specification?.citation?.citedResponsibleParty ?: emptyList()
            }
        } ?: emptyList()

        (mainContact + additionalContacts + distributors + featureCatalogContacts + domainConsistencyContacts).flatMapIndexed { index: Int, contact: Contact ->
            val individualName = extractPersonInfo(contact.responsibleParty?.individualName?.value)
            val organization = contact.responsibleParty?.organisationName?.value
            val communications = getCommunications(contact.responsibleParty?.contactInfo?.ciContact)
            val addressInfo = getAddressInfo(contact.responsibleParty?.contactInfo?.ciContact?.address?.address)
            val positionName = contact.responsibleParty?.positionName?.value ?: ""
            val hoursOfService = contact.responsibleParty?.contactInfo?.ciContact?.hoursOfService?.value ?: ""

            // if role is PointOfContact, and it comes from main contact element
            // then it gets special role: pointOfContactMd (key=12)
            val roleIso = contact.responsibleParty?.role?.codelist?.codeListValue!!
            val role: KeyValue = if (roleIso == "pointOfContact" && index < mainContact.size) {
                KeyValue("12", codeListService.getCodelistValue("505", "12", catalogLanguage), "505")
            } else {
                mapRoleToContactType(roleIso)
            }

            // add parent organisation if exists
            var parentAddressUuid: String? = null
            val parents: MutableList<PointOfContact> = if (organization != null && individualName != null) {
                val parentOrganisation = findOrganisationUuid(organization)
                parentAddressUuid = parentOrganisation ?: UUID.randomUUID().toString().also { newUuid ->
                    isoData.addressMaps[organization] = newUuid
                }

                // if the parent address is already present, it's not necessary to be added
                if (parentOrganisation == null) {
                    mutableListOf(
                        PointOfContact(
                            parentAddressUuid,
                            "InGridOrganisationDoc",
                            communications,
                            KeyValue(_codelistId = "505"),
                            true,
                            organization,
                            address = addressInfo,
                        ),
                    )
                } else {
                    mutableListOf()
                }
            } else {
                mutableListOf()
            }

            var uuid = contact.responsibleParty?.uuid
            if (uuid == null || !uuidExists(uuid)) {
                if (individualName == null) {
                    // sometimes a distributor was not correctly exported, since only order information was needed,
                    // so we skip this "empty" address
                    if (organization == null) return@flatMapIndexed parents
                    uuid = findOrganisationUuid(organization)
                        ?: uuid ?: UUID.randomUUID().toString()
                        .also { newUuid -> isoData.addressMaps[organization] = newUuid }
                } else {
                    uuid = findPersonUuid(individualName)
                        ?: uuid ?: UUID.randomUUID().toString()
                        .also { newUuid -> isoData.addressMaps[getPersonIdentifier(individualName)] = newUuid }
                }
            } else {
                val identifier = if (individualName != null) getPersonIdentifier(individualName) else organization
                if (identifier != null) isoData.addressMaps[identifier] = uuid
            }

            val pointOfContact = PointOfContact(
                uuid,
                if (individualName == null) "InGridOrganisationDoc" else "InGridPersonDoc",
                communications,
                role,
                individualName == null,
                organization,
                individualName,
                addressInfo,
                positionName,
                hoursOfService,
                parentAddressUuid,
            )
            parents.add(pointOfContact)
            parents
        }
    }

    fun getUniquePointOfContacts(): List<PointOfContact> = pointOfContacts.distinctBy { it.refUuid }

    fun getPointOfContactReferences(): List<PointOfContact> {
        // references with no type are additional/parent addresses, which need to be created in another step
        return pointOfContacts
            .filterNot { it.type.key == null && it.type.value == null }
    }

    private fun uuidExists(uuid: String?) = try {
        if (uuid == null) {
            false
        } else {
            documentService.getWrapperByCatalogAndDocumentUuid(catalogId, uuid)
            true
        }
    } catch (e: Exception) {
        false
    }

    private fun findOrganisationUuid(name: String): String? = isoData.addressMaps[name] ?: documentService.docRepo.findAddressByOrganisationName(catalogId, name)
        .firstOrNull()

    private fun findPersonUuid(person: PersonInfo): String? = isoData.addressMaps[getPersonIdentifier(person)]
        ?: documentService.docRepo.findAddressByPerson(catalogId, person.firstName ?: "", person.lastName ?: "")
            .firstOrNull()

    private fun getPersonIdentifier(person: PersonInfo): String = "${person.firstName} ${person.lastName}"

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
            ?.let { value ->
                val key = codeListService.getCatalogCodelistKey(catalogId, "6250", value)
                key?.let { KeyValue(key, value, "6250") }
            }
        val countryCode = address?.country?.value
            ?.let { UtilsCountryCodelist.getCodeFromShortcut3(it) }
            ?.let { KeyValue(it.toString(), codeListService.getCodelistValue("6200", it.toString(), catalogLanguage), "6200") }

        return if (listOfNotNull(
                city,
                postbox,
                street,
                countryCode,
                zipCode,
                zipPostbox,
                administrativeArea,
            ).isEmpty()
        ) {
            null
        } else {
            AddressInfo(
                city,
                postbox,
                street,
                countryCode,
                zipCode,
                zipPostbox,
                administrativeArea,
            )
        }
    }

    private fun getCommunications(ciContact: CIContact?): List<Communication> {
        val list = mutableListOf<Communication>()
        // Mail addresses
        ciContact?.address?.address?.electronicMailAddress?.mapNotNull { it.value }
            ?.forEach { list.add(Communication(KeyValue("3", codeListService.getCodelistValue("4430", "3", "de"), "4430"), it)) }
        // Phone numbers
        ciContact?.phone?.phone?.voice?.mapNotNull { it.value }?.forEach { list.add(Communication(KeyValue("1", codeListService.getCodelistValue("4430", "3", "de"), "4430"), it)) }
        // Fax numbers
        ciContact?.phone?.phone?.facsimile?.mapNotNull { it.value }
            ?.forEach { list.add(Communication(KeyValue("2"), it)) }
        // Homepage
        ciContact?.onlineResource?.onlineResource?.linkage?.url?.let { list.add(Communication(KeyValue("4", codeListService.getCodelistValue("4430", "3", "de"), "4430"), it)) }

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
        // TODO: use catalog language
        val salutationKey = value.trim().let { codeListService.getCodeListEntryId("4300", it, "de") }
        return KeyValue(salutationKey, value.trim(), "4300")
    }

    private fun mapRoleToContactType(value: String): KeyValue {
        val entryId = codeListService.getCodeListEntryId("505", value, "iso")
        return KeyValue(entryId, entryId?.let { codeListService.getCodelistValue("505", entryId, catalogLanguage) } ?: value, "505")
    }

    fun getAdvProductGroups(): List<KeyValue> = metadata.identificationInfo[0].identificationInfo?.citation?.citation?.alternateTitle
        ?.map { it.value }
        ?.joinToString(";")
        ?.split(";")
        ?.mapNotNull { value ->
            val key = codeListService.getCodeListEntryId("8010", value, "de")
            key?.let { KeyValue(key, value, "8010") }
        } ?: emptyList()

    fun getAlternateTitle(): String = metadata.identificationInfo[0].identificationInfo?.citation?.citation?.alternateTitle
        ?.map { it.value }
        ?.joinToString(";")
        ?.split(";")
        ?.filter { codeListService.getCodeListEntryId("8010", it, "de") == null }
        ?.joinToString(";") ?: ""

    fun getThemes(): List<KeyValue> = metadata.identificationInfo[0].identificationInfo?.descriptiveKeywords
        ?.filter { it.keywords?.thesaurusName?.citation?.title?.value == "GEMET - INSPIRE themes, version 1.0" }
        ?.flatMap { it.keywords?.keyword?.map { it.value } ?: emptyList() }
        ?.mapNotNull { value ->
            val key = codeListService.getCodeListEntryId("6100", value, "de")
            key?.let { KeyValue(key, value, "6100") }
        } ?: emptyList()

    fun getPriorityDatasets(): List<KeyValue> = metadata.identificationInfo[0].identificationInfo?.descriptiveKeywords
        ?.filter { it.keywords?.thesaurusName?.citation?.title?.value == "INSPIRE priority data set" }
        ?.flatMap { it.keywords?.keyword?.map { it.value } ?: emptyList() }
        ?.mapNotNull { value ->
            val key = codeListService.getCodeListEntryId("6350", value, "de")
            key?.let { KeyValue(key, value, "6350") }
        } ?: emptyList()

    fun getInVeKoSKeywords(): List<KeyValue> = metadata.identificationInfo[0].identificationInfo?.descriptiveKeywords
        ?.filter { it.keywords?.thesaurusName?.citation?.title?.value == "IACS data" }
        ?.flatMap { it.keywords?.keyword?.map { item -> item.value } ?: emptyList() }
        ?.map {
            val key = inVeKoSKeywordMapping.filter { item -> item.value == it }.keys.first()
            key.let { KeyValue(key, it, null) }
        } ?: emptyList()

    fun getHvdCategories(): List<KeyValue> = metadata.identificationInfo[0].identificationInfo?.descriptiveKeywords
        ?.filter { it.keywords?.thesaurusName?.citation?.title?.value == "High-value dataset categories" }
        ?.flatMap { it.keywords?.keyword?.map { item -> item.value } ?: emptyList() }
        ?.map { it?.removePrefix("http://data.europa.eu/bna/") }
        ?.mapNotNull { value ->
            val key = codeListService.getCodeListEntryId("hvdCategories", value, "de")
            key?.let { KeyValue(key, value, "hvdCategories") }
        } ?: emptyList()

    fun getOpenDataCategories(): List<KeyValue> = metadata.identificationInfo[0].identificationInfo?.descriptiveKeywords
        ?.asSequence()
        ?.filter { it.keywords?.thesaurusName == null }
        ?.filter { it.keywords?.type?.codelist?.codeListValue == "theme" }
        ?.flatMap { it.keywords?.keyword?.map { it.value } ?: emptyList() }
        ?.mapNotNull { it }
        ?.mapNotNull { value ->
            val key = codeListService.getCodeListEntryIdMatchingData("6400", value)
            key?.let { KeyValue(key, codeListService.getCodelistValue("6400", key, catalogLanguage), "6400") }
        }
        ?.toList() ?: emptyList()

    fun getSpatialScope(): KeyValue? = metadata.identificationInfo[0].identificationInfo?.descriptiveKeywords
        ?.filter { it.keywords?.thesaurusName?.citation?.title?.value == "Spatial scope" }
        ?.flatMap { it.keywords?.keyword?.map { it.value } ?: emptyList() }
        ?.mapNotNull { it }
        ?.mapNotNull { value ->
            val key = codeListService.getCodeListEntryId("6360", value, "de")
            key?.let { KeyValue(key, value, "6360") }
        }
        ?.getOrNull(0)

    fun getGraphicOverviews(): List<PreviewGraphic> = metadata.identificationInfo[0].identificationInfo?.graphicOverview
        ?.map {
            val isInternalStorage: Boolean = it.mdBrowseGraphic?.fileName?.value?.contains(isoData.uploadConfig.uploadExternalUrl ?: "/documents/") ?: false
            val fileName = if (isInternalStorage) {
                it.mdBrowseGraphic?.fileName?.value?.substringAfterLast('/')
            } else {
                it.mdBrowseGraphic?.fileName?.value
            }
            PreviewGraphic(fileName?.trim(), it.mdBrowseGraphic?.fileDescription?.value, !isInternalStorage)
        } ?: emptyList()

    data class PreviewGraphic(
        val fileName: String?,
        val description: String? = null,
        val asLink: Boolean,
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
            "IACS data",
            "High-value dataset categories",
        ) + ignoreAdditional
        val ignoreKeywords = listOf("inspireidentifiziert", "opendata", "AdVMIS")
        return metadata.identificationInfo[0].identificationInfo?.descriptiveKeywords
            ?.asSequence()
            ?.filter {
                val thesaurusName = it.keywords?.thesaurusName?.citation?.title?.value
                val type = it.keywords?.type?.codelist?.codeListValue
                (thesaurusName == null && type != "theme") ||
                    (
                        thesaurusName != null &&
                            !ignoreThesaurus.contains(
                                thesaurusName,
                            )
                        )
            }
            ?.flatMap { it.keywords?.keyword?.map { it.value } ?: emptyList() }
            ?.mapNotNull { it }
            ?.filter { !ignoreKeywords.contains(it) }
            ?.filter { codeListService.getCodeListEntryId("5200", it, "iso") == null }
            ?.map { it }
            ?.toList() ?: emptyList()
    }

    fun getSpatialSystems(): List<KeyValue> = metadata.referenceSystemInfo
        ?.map { it.referenceSystem?.referenceSystemIdentifier?.identifier?.code?.value }
        // if splitSpatialSystems is true, we filter out vertical spatial systems
        ?.filter { splitSpatialSystems.not() || codeListService.getCatalogCodelistKey(catalogId, "verticalSpatialSystems", it, "de") == null }
        ?.mapNotNull { value ->
            val key = codeListService.getCodeListEntryId("100", value, "de")
            key?.let { KeyValue(key, value, "100") }
        } ?: emptyList()

    fun getVerticalSpatialSystems(): List<KeyValue> = metadata.referenceSystemInfo
        ?.map { it.referenceSystem?.referenceSystemIdentifier?.identifier?.code?.value }
        ?.mapNotNull { value -> codeListService.getCatalogCodelistKey(catalogId, "verticalSpatialSystems", value, "de")?.let { KeyValue(it) } }
        ?: emptyList()

    fun getSpatialReferences(): List<SpatialReference> {
        val references = mutableListOf<SpatialReference>()

        metadata.identificationInfo[0].identificationInfo?.extent
            ?.flatMap { it.extend?.geographicElement ?: emptyList() }
            ?.forEach {
                // handle title
                val geoIdentifierCode = it.geographicDescription?.geographicIdentifier?.mdIdentifier?.code
                val titleOrArs = geoIdentifierCode?.value

                if (titleOrArs != null) {
                    val isBwastr = it.geographicDescription.geographicIdentifier.mdIdentifier.authority?.citation?.title?.value == "VV-WSV 1103"
                    val isAnchorAndRegionKey = geoIdentifierCode.isAnchor
                    if (isBwastr) {
                        references.add(getBwastrSpatial(titleOrArs))
                    } else if (isAnchorAndRegionKey) {
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
                        bbox.eastBoundLongitude?.value!!,
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

    private fun getBwastrSpatial(title: String): SpatialReference {
        val extractedBwastrId: String
        var start: Double? = null
        var end: Double? = null
        if (title.count { it == '-' } == 2) {
            // like 0108-7-9 (ID-START-END)
            title.split("-").let {
                extractedBwastrId = it[0]
                start = it[1].toDouble()
                end = it[2].toDouble()
            }
        } else {
            extractedBwastrId = title.replace("[^$0-9]".toRegex(), "")
        }

        return if (bwastrLocatorService.customBWASTRMap.containsKey(extractedBwastrId)) {
            val bwastr = bwastrLocatorService.customBWASTRMap[extractedBwastrId]!!
            SpatialReference(
                type = "bwastr",
                bwastr = Bwastr(
                    bwastrid = bwastr.bwastrid,
                    bwastr_name = bwastr.bwastr_name,
                    strecken_name = bwastr.strecken_name,
                    concat_name = bwastr.concat_name,
                    start = null,
                    end = null,
                ),
                title = bwastr.concat_name,
            )
        } else {
            val idForSearch = if (extractedBwastrId.endsWith("00")) extractedBwastrId.dropLast(2) + "01" else extractedBwastrId
            val bwastr = bwastrLocatorService.search(idForSearch).firstOrNull()
                ?: throw ServerException.withReason("Could not find Bwastr with id: $idForSearch")
            SpatialReference(
                type = "bwastr",
                bwastr = Bwastr(
                    bwastrid = bwastr.bwastrid,
                    bwastr_name = bwastr.bwastr_name,
                    strecken_name = bwastr.strecken_name,
                    concat_name = bwastr.concat_name,
                    start = end,
                    end = start,
                ),
                title = bwastr.concat_name,
            )
        }
    }

    val spatialDescription =
        metadata.identificationInfo[0].identificationInfo?.extent?.mapNotNull { it.extend }
            ?.mapNotNull { it.description?.value }
            ?.joinToString(";")

    fun getRegionKey(): String = metadata.identificationInfo[0].identificationInfo?.extent
        ?.flatMap { it.extend?.geographicElement?.map { it.geographicDescription } ?: emptyList() }
        ?.filter { it?.geographicIdentifier?.mdIdentifier?.code?.isAnchor ?: false }
        ?.mapNotNull { it?.geographicIdentifier?.mdIdentifier?.code?.value }
        ?.getOrNull(0) ?: ""

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
                return if (uomId == null || min == null || max == null || datumId == null) {
                    null
                } else {
                    VerticalExtentModel(
                        KeyValue(uomId, codeListService.getCodelistValue("102", uomId, catalogLanguage), "102"),
                        min,
                        max,
                        KeyValue(datumId, codeListService.getCodelistValue("101", datumId, catalogLanguage), "101"),
                    )
                }
            }?.getOrNull<VerticalExtentModel>(0)
    }

    fun getLanguage(): KeyValue {
        val value = metadata.language?.codelist?.codeListValue!!
        val languageKey = iso639LanguageMapping[value]
            ?: throw ServerException.withReason("Could not map document language key: ${metadata.language?.codelist?.codeListValue}")
        return KeyValue(languageKey, codeListService.getCodelistValue("99999999", languageKey, catalogLanguage), "99999999")
    }

    fun getLegalDescriptions(): List<KeyValue> = metadata.identificationInfo[0].identificationInfo?.descriptiveKeywords
        ?.filter { it.keywords?.thesaurusName?.citation?.title?.value == "Further legal basis" }
        ?.flatMap { it.keywords?.keyword?.map { it.value } ?: emptyList() }
        ?.mapNotNull { it }
        ?.map {
            val entryId = codeListService.getCatalogCodelistKey(catalogId, "1350", it)
            KeyValue(entryId, it, "1350")
        } ?: emptyList()

    fun getPurpose() = metadata.identificationInfo[0].identificationInfo?.purpose?.value ?: ""
    fun getSpecificUsage() = metadata.identificationInfo[0].identificationInfo?.resourceSpecificUsage
        ?.mapNotNull { it.usage?.specificUsage?.value }
        ?.joinToString(";")

    fun getTemporalEvents(): List<Event> = metadata.identificationInfo[0].identificationInfo?.citation?.citation?.date
        ?.map {
            val value = it.date?.dateType?.code?.codeListValue
            val typeKey = codeListService.getCodeListEntryId("502", value, "iso")
            val date = it.date?.date?.dateTime?.let { parseDateTime(it) }
                ?: it.date?.date?.date?.let { parseDate(it) }
                ?: ""
            Event(KeyValue(typeKey, typeKey?.let { codeListService.getCodelistValue("502", typeKey, catalogLanguage) } ?: value, "502"), date)
        } ?: emptyList()

    private fun parseDateTime(value: String): String = OffsetDateTime.parse(value).toInstant().toString()

    private fun parseDate(value: String): String = LocalDate.parse(value, DateTimeFormatter.ISO_LOCAL_DATE)
        .atStartOfDay(ZoneId.systemDefault())
        .toInstant()
        .toString()

    fun getTimeRelatedInfo(): TimeInfo? {
        val status = metadata.identificationInfo[0].identificationInfo?.status?.code?.codeListValue
        val statusKey = if (status == null) null else codeListService.getCodeListEntryId("523", status, "iso")
        val statusValue = statusKey?.let { codeListService.getCodelistValue("523", it, catalogLanguage) } ?: status
        return metadata.identificationInfo[0].identificationInfo?.extent
            ?.flatMap { it.extend?.temporalElement ?: emptyList() }
            ?.map {
                val timeValue = it.extent?.extent?.timeInstant?.timePosition
                val instant = timeValue?.let { parseDateTime(timeValue) }
                if (instant != null) {
                    return TimeInfo(instant, KeyValue("at", "am"), KeyValue(statusKey, statusValue, "523"))
                }

                val period = it.extent?.extent?.timePeriod
                if (period != null) {
                    val type = determineTemporalType(period)
                    val typeSince = determineTemporalTypeSince(period)
                    return TimeInfo(
                        period.beginPosition?.value,
                        type,
                        if (status == null) null else KeyValue(statusKey, statusValue, "523"),
                        period.endPosition?.value,
                        typeSince,
                    )
                }

                log.warn("Do not support time info, returning null")
                return null
            }
            ?.getOrNull<TimeInfo>(0) ?: TimeInfo(status = if (status == null) null else KeyValue(statusKey, statusValue, "523"))
    }

    private fun determineTemporalType(period: TimePeriod): KeyValue? {
        if (period.beginPosition?.value != null && period.endPosition?.value != null) {
            return KeyValue("since", "seit") // von
        } else if (period.beginPosition?.indeterminatePosition == "unknown") {
            return KeyValue("until", "bis")
        } else if (period.endPosition?.indeterminatePosition == "unknown") {
            return KeyValue("since", "seit")
        } else if (period.endPosition?.indeterminatePosition == "now") {
            return KeyValue("since", "seit")
        }

        return null
    }

    private fun determineTemporalTypeSince(period: TimePeriod): KeyValue? {
        if (period.beginPosition?.value != null && period.endPosition?.value != null) return KeyValue("exactDate", "bis: genaues Datum")
        if (period.endPosition?.indeterminatePosition == "now") return KeyValue("requestTime", "bis: gegenwärtig aktuell")
        if (period.endPosition?.indeterminatePosition == "unknown") return KeyValue("unknown", "bis: gegenwärtige Aktualität unklar")

        return null
    }

    fun getAccessConstraints(): List<KeyValue> = metadata.identificationInfo[0].identificationInfo?.resourceConstraints
        ?.filter { it.legalConstraint?.accessConstraints != null }
        ?.flatMap {
            it.legalConstraint?.otherConstraints?.map { constraint ->
                if (constraint.isAnchor) {
                    val key = codeListService.getCodeListEntryId("6010", constraint.value, "de")
                    KeyValue(key, constraint.value, "6010")
                } else {
                    KeyValue(null, constraint.value, "6010")
                }
            } ?: emptyList()
        } ?: emptyList()

    fun getUseLimitation(): String = metadata.identificationInfo[0].identificationInfo?.resourceConstraints
        ?.flatMap { it.legalConstraint?.useLimitation?.mapNotNull { use -> use.value?.trim() } ?: emptyList() }
        ?.joinToString(";") ?: ""

    fun getDistributionFormat(): List<DistributionFormat> = metadata.distributionInfo?.mdDistribution?.distributionFormat
        ?.map { it.format }
        ?.mapNotNull {
            val nameKey = codeListService.getCodeListEntryId("1320", it?.name?.value, "de")
            val nameKeyValue = KeyValue(nameKey, it?.name?.value, "1320")
            val result = DistributionFormat(
                nameKeyValue,
                it?.version?.value,
                it?.fileDecompressionTechnique?.value,
                it?.specification?.value,
            )
            if (result.isNull()) null else result
        } ?: emptyList()

    fun getMaintenanceInterval(): MaintenanceInterval {
        val maintenanceInformation =
            metadata.identificationInfo[0].identificationInfo?.resourceMaintenance?.maintenanceInformation
        val updateFrequency = maintenanceInformation?.maintenanceAndUpdateFrequency?.code?.codeListValue
        val updateFrequencyKey = codeListService.getCodeListEntryId("518", updateFrequency, "iso")
        val updateFrequencyValue = updateFrequencyKey?.let { codeListService.getCodelistValue("518", updateFrequencyKey, catalogLanguage) } ?: updateFrequency
        val intervalEncoded = maintenanceInformation?.userDefinedMaintenanceFrequency?.periodDuration

        val value = TM_PeriodDurationToTimeAlle().parse(intervalEncoded)
        val intervalUnit = TM_PeriodDurationToTimeInterval().parse(intervalEncoded)
        val intervalUnitKey = codeListService.getCodeListEntryId("1230", intervalUnit, "de")

        val description = maintenanceInformation?.maintenanceNote
            ?.mapNotNull { it.value }
            ?.joinToString(";")

        return MaintenanceInterval(
            value?.toInt(),
            intervalUnitKey?.let { KeyValue(intervalUnitKey, intervalUnit, "1230") },
            updateFrequencyKey?.let { KeyValue(updateFrequencyKey, updateFrequencyValue, "518") },
            description,
        )
    }

    fun getDigitalTransferOptions(): List<DigitalTransferOption> = metadata.distributionInfo?.mdDistribution?.transferOptions
        ?.mapNotNull { it.mdDigitalTransferOptions }
        ?.filter { it.offLine?.mdMedium != null }
        ?.map {
            val value = it.offLine?.mdMedium?.name?.code?.codeListValue
            val nameKey = codeListService.getCodeListEntryId("520", value, "iso")
            DigitalTransferOption(
                KeyValue(nameKey, nameKey?.let { codeListService.getCodelistValue("520", it, catalogLanguage) } ?: value, "520"),
                if (it.transferSize?.value == null) {
                    null
                } else {
                    UnitField(
                        it.transferSize.value.toString(),
                        KeyValue("MB", "MB"),
                    )
                },
                it.offLine?.mdMedium?.mediumNote?.value,
            )
        } ?: emptyList()

    fun getOrderInfo(): String = metadata.distributionInfo?.mdDistribution?.distributor
        ?.flatMap {
            it.mdDistributor.distributionOrderProcess
                ?.mapNotNull { orderProcess -> orderProcess.mdStandardOrderProcess?.orderingInstructions?.value }
                ?: emptyList()
        }
        ?.joinToString(";") ?: ""

    fun getFileReferences(): List<FileReference> = metadata.distributionInfo?.mdDistribution?.transferOptions
        ?.flatMap { transferOption ->
            transferOption.mdDigitalTransferOptions?.onLine
                ?.filter { transferOption.mdDigitalTransferOptions.unitsOfDistribution?.value == "MB" }
                ?.mapNotNull { it.ciOnlineResource }
                ?.map { resource ->
                    val fileFormatCode = resource.applicationProfile?.value
                    val typeId =
                        if (fileFormatCode == null) null else codeListService.getCodeListEntryId("1320", fileFormatCode, "de")
                    val keyValue = KeyValue(typeId, fileFormatCode, "1320")
                    val fileName = resource.linkage.url?.substringAfterLast('/')?.trim() ?: ""
                    val sizeInBytes = transferOption.mdDigitalTransferOptions.transferSize?.value?.times(1_000_000)
                    val fileReferenceLink = FileReferenceLink(
                        asLink = false,
                        value = fileName,
                        uri = fileName,
                        lastModified = null,
                        sizeInBytes = sizeInBytes,
                    )
                    FileReference(
                        title = resource.name?.value,
                        description = resource.description?.value,
                        format = keyValue,
                        link = fileReferenceLink,
                    )
                } ?: emptyList()
        } ?: emptyList()

    fun getReferences(): List<Reference> = metadata.distributionInfo?.mdDistribution?.transferOptions
        ?.flatMap { transferOption ->
            transferOption.mdDigitalTransferOptions?.onLine
                ?.filter { it.ciOnlineResource?.applicationProfile?.value != "coupled" }
                ?.filter { transferOption.mdDigitalTransferOptions.unitsOfDistribution?.value != "MB" }
                ?.mapNotNull { it.ciOnlineResource }
                ?.map { resource ->
                    val value = resource.function?.code?.codeListValue
                    val typeId =
                        if (value == null) "9999" else codeListService.getCodeListEntryId("2000", value, "iso") ?: "9999"
                    val keyValue = KeyValue(typeId, codeListService.getCodelistValue("2000", typeId, catalogLanguage), "2000")
                    val applicationValue = resource.applicationProfile?.value
                    val applicationId = if (applicationValue == null) {
                        null
                    } else {
                        codeListService.getCodeListEntryId(
                            fieldToCodelist.referenceFileFormat,
                            applicationValue,
                            "de",
                        ) ?: codeListService.getCatalogCodelistKey(
                            catalogId,
                            fieldToCodelist.referenceFileFormat,
                            applicationValue,
                        )
                    }
                    val applicationFinalValue = applicationValue?.let { KeyValue(applicationId, applicationValue) }
                    Reference(
                        keyValue,
                        resource.linkage.url,
                        applicationFinalValue,
                        resource.name?.value,
                        resource.description?.value,
                    )
                } ?: emptyList()
        } ?: emptyList()

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
                val specificationKeyValue = KeyValue(specificationEntryId, specification, "6005")
                val dateObject = it.specification.citation.date?.getOrNull(0)?.date?.date
                val publicationDate = dateObject?.dateTime?.let { parseDateTime(it) }
                    ?: dateObject?.date?.let { parseDate(it) }
                    ?: ""
                ConformanceResult(
                    pass,
                    specificationEntryId != null,
                    it.explanation.value,
                    specificationKeyValue,
                    publicationDate,
                )
            } ?: emptyList()
    }

    private fun determineConformanceResultPass(value: Boolean?): KeyValue = when (value) {
        true -> KeyValue("1", codeListService.getCodelistValue("6000", "1", "de"), "6000")
        false -> KeyValue("2", codeListService.getCodelistValue("6000", "2", "de"), "6000")
        null -> KeyValue("3", codeListService.getCodelistValue("6000", "3", "de"), "6000")
    }

    fun getUseConstraints(): List<UseConstraint> {
        val otherConstraints = metadata.identificationInfo[0].identificationInfo?.resourceConstraints
            ?.map { it.legalConstraint }
            ?.filter { it?.useConstraints != null }
            ?.flatMap { legalConstraint -> legalConstraint?.otherConstraints?.mapNotNull { it.value?.trim() } ?: emptyList() }
            ?: emptyList()

        val result = mutableListOf<UseConstraint>()

        // otherConstraints for use-constraints can have the following order/groups
        // LicenseText
        // LicenseText, JSON
        // LicenseText, Note
        // LicenseText, Note, Source
        // LicenseText, Note, JSON
        // LicenseText, Source
        // LicenseText, Source, JSON
        // LicenseText, Note, Source, JSON
        // -----
        // when JSON exists, then the use constraints is created from "name" and "quelle" and the otherContraint "Note" if available
        var index = 0
        var groupStartIndex = 0
        while (index < otherConstraints.size) {
            val value = otherConstraints[index]
            if (isJsonString(value)) {
                val node = jacksonObjectMapper().readValue<JsonNode>(value)
                val text = node.get("name").asText()
                val keyValue = convertUserConstraintToKeyValue(text)
                val note = getUseConstraintNoteWhenJsonExists(otherConstraints, index, groupStartIndex)
                result.add(UseConstraint(keyValue, node.get("quelle").asText(), note))
                index++
                continue
            }

            val nextValue = otherConstraints.getOrNull(index + 1)
            val secondNextValue = otherConstraints.getOrNull(index + 2)
            val thirdNextValue = otherConstraints.getOrNull(index + 3)

            // when JSON is available skip item since JSON will be used
            if (isJsonString(nextValue) || isJsonString(secondNextValue) || isJsonString(thirdNextValue)) {
                groupStartIndex = index
                index += when {
                    isJsonString(nextValue) -> 1
                    isJsonString(secondNextValue) -> 2
                    else -> 3
                }
                continue
            }

            if (isSourceNote(nextValue)) {
                result.add(
                    UseConstraint(
                        convertUserConstraintToKeyValue(value),
                        nextValue?.replace("Quellenvermerk: ", ""),
                    ),
                )
                index += 2
                continue
            }

            if (isSourceNote(secondNextValue)) {
                result.add(
                    UseConstraint(
                        convertUserConstraintToKeyValue(value),
                        secondNextValue?.replace("Quellenvermerk: ", ""),
                        nextValue,
                    ),
                )
                index += 3
                continue
            }

            // is last constraint or next one is another one/group
            result.add(UseConstraint(convertUserConstraintToKeyValue(value), null))
            index++
        }

        return result
    }

    fun getPublication(): Publication? {
        metadata.identificationInfo[0].identificationInfo?.citation?.citation?.identifier?.forEach loop@{ identifier ->
            val code = identifier.mdIdentifier?.code?.value
            if (code?.startsWith("https://doi.org/") == true) {
                val doi = code.replace("https://doi.org/", "")
                val authorityCode = identifier.mdIdentifier.authority?.citation?.identifier?.get(0)?.mdIdentifier?.code?.value
                val generalResourceType = convertToCatalogKeyValue("3390", authorityCode?.substringBefore("/"))
                val resourceType = convertToCatalogKeyValue("3386", authorityCode?.substringAfter("/"), "en")
                return Publication(doi, generalResourceType, resourceType)
            }
        }
        // is only being used in "literature", which cannot be imported currently - ignore for now
        val documentType = convertToCatalogKeyValue(
            "3385",
            metadata.identificationInfo[0].identificationInfo?.resourceFormat?.mdFormat?.name?.value,
            "en",
        )
        return null
    }

    private fun getUseConstraintNoteWhenJsonExists(
        otherConstraints: List<String>,
        index: Int,
        groupStartIndex: Int,
    ): String? {
        if (index - 1 <= groupStartIndex) return null
        val note = otherConstraints.getOrNull(index - 1)
        if (note != null) {
            return if (isSourceNote(note)) {
                if (index - 2 <= groupStartIndex) return null
                otherConstraints.getOrNull(index - 2)
            } else {
                note
            }
        }
        return null
    }

    private fun isSourceNote(value: String?): Boolean = value?.startsWith("Quellenvermerk: ") ?: false

    private fun convertUserConstraintToKeyValue(text: String?): KeyValue? {
        if (text == null) return null
        val id = codeListService.getCodeListEntryId("6500", text, "de")
        return KeyValue(id, text, "6500")
    }

    private fun convertToCatalogKeyValue(codelistId: String, value: String?, language: String = "de"): KeyValue? {
        if (value == null) return null
        val id = codeListService.getCatalogCodelistKey(catalogId, codelistId, value, language)
        return KeyValue(id, value, codelistId)
    }

    private fun isJsonString(useConstraint: String?): Boolean {
        if (useConstraint == null) return false
        return useConstraint.startsWith("{") && useConstraint.endsWith("}")
    }

    protected fun containsKeyword(value: String): Boolean = metadata.identificationInfo[0].identificationInfo?.descriptiveKeywords
        ?.flatMap { it.keywords?.keyword?.map { it.value } ?: emptyList() }
        ?.any { it == value } ?: false
}

data class UseConstraint(
    val title: KeyValue?,
    val source: String?,
    val note: String? = null,
)

data class ConformanceResult(
    val pass: KeyValue,
    val isInspire: Boolean,
    val explanation: String?,
    val specification: KeyValue?,
    val publicationDate: String?,
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
    val mediumNote: String?,
)

data class UnitField(
    val value: String?,
    val unit: KeyValue?,
)

data class Reference(
    val type: KeyValue,
    val url: String?,
    val urlDataType: KeyValue?,
    val title: String?,
    val explanation: String?,
)

data class FileReference(
    val title: String?,
    val description: String?,
    val format: KeyValue?,
    val link: FileReferenceLink,
)

data class FileReferenceLink(
    val asLink: Boolean = false,
    val value: String,
    val uri: String,
    val lastModified: Date?,
    val sizeInBytes: Number?,
)

data class DistributionFormat(
    val name: KeyValue,
    val version: String?,
    val compression: String?,
    val specification: String?,
) {
    fun isNull(): Boolean = version.isNullOrEmpty() && compression.isNullOrEmpty() && specification.isNullOrEmpty() && name.key.isNullOrEmpty() && name.value.isNullOrEmpty()
}

data class MaintenanceInterval(
    val value: Number?,
    val unit: KeyValue?,
    val interval: KeyValue?,
    val description: String?,
)

data class TimeInfo(
    val date: String? = null,
    val type: KeyValue? = null,
    var status: KeyValue? = null,
    val untilDate: String? = null,
    val dateTypeSince: KeyValue? = null,
)

data class Event(val type: KeyValue, val date: String)

data class VerticalExtentModel(
    val uom: KeyValue,
    val min: Number,
    val max: Number,
    val datum: KeyValue,
)

data class SpatialReference(
    val type: String,
    val title: String?,
    var coordinates: BoundingBox? = null,
    var wkt: String? = null,
    val bwastr: Bwastr? = null,
    var ars: String? = null,
)

data class Bwastr(
    val bwastrid: String?,
    val bwastr_name: String?,
    val strecken_name: String?,
    val concat_name: String?,
    val start: Double?,
    val end: Double?,
)

data class BoundingBox(
    val lat1: Double,
    val lon1: Double,
    val lat2: Double,
    val lon2: Double,
)

data class CoupledResourceModel(
    val uuid: String?,
    val url: String?,
    val title: String?,
    val isExternalRef: Boolean,
    val identifier: String? = null,
    val layerNames: List<String> = emptyList(),
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
    val parent: String? = null,
) {
    fun getTitle(): String = if (personInfo?.lastName != null) {
        if (personInfo.firstName.isNullOrEmpty()) {
            personInfo.lastName
        } else {
            "${personInfo.lastName}, ${personInfo.firstName}"
        }
    } else {
        organization ?: ""
    }
}

data class Communication(
    val type: KeyValue,
    val connection: String,
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
    val administrativeArea: KeyValue?,
)

data class Publication(
    val doi: String?,
    val generalResourceType: KeyValue?,
    val resourceType: KeyValue?,
)
