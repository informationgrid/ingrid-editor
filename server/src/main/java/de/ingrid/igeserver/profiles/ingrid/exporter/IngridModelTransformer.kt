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
package de.ingrid.igeserver.profiles.ingrid.exporter

import com.fasterxml.jackson.databind.JsonNode
import de.ingrid.igeserver.ServerException
import de.ingrid.igeserver.exporter.AddressModelTransformer
import de.ingrid.igeserver.exporter.CodelistTransformer
import de.ingrid.igeserver.exporter.TransformationTools
import de.ingrid.igeserver.exporter.model.AddressModel
import de.ingrid.igeserver.exporter.model.AddressRefModel
import de.ingrid.igeserver.exporter.model.CharacterStringModel
import de.ingrid.igeserver.exporter.model.KeyValueModel
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.profiles.ingrid.exporter.model.*
import de.ingrid.igeserver.profiles.ingrid.inVeKoSKeywordMapping
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.igeserver.utils.convertWktToGeoJson
import de.ingrid.igeserver.utils.getBoolean
import de.ingrid.igeserver.utils.getString
import de.ingrid.mdek.upload.Config
import org.jetbrains.kotlin.util.suffixIfNot
import org.unbescape.json.JsonEscape
import java.text.SimpleDateFormat
import java.time.OffsetDateTime
import java.util.*

class TransformerCache {
    val documents = mutableMapOf<String, Document>()
    val models = mutableMapOf<String, IngridModel>()
}

open class IngridModelTransformer(
    val model: IngridModel,
    val catalogIdentifier: String,
    val codelists: CodelistTransformer,
    val config: Config,
    val catalogService: CatalogService,
    val cache: TransformerCache,
    val doc: Document,
    val documentService: DocumentService
) {
    var incomingReferencesCache: List<CrossReference>? = null
    var superiorReferenceCache: SuperiorReference? = null

    var citationURL: String? = null
    val data = model.data
    val isFolder = model.type == "FOLDER"
    val purpose = data.resource?.purpose
    val status = codelists.getValue("523", data.temporal.status, "iso")
    val distributionFormats = data.distribution?.format ?: emptyList()
    val isAtomDownload = data.service?.isAtomDownload == true
    val atomDownloadURL: String?
    val digitalTransferOptions = data.digitalTransferOptions ?: emptyList()

    val isResourceRangeDefined = data.temporal.resourceRange?.start != null && data.temporal.resourceRange.end != null
    val resourceDateType = data.temporal.resourceDateType?.key
    val resourceDateTypeSince = data.temporal.resourceDateTypeSince?.key
    val resourceBeginDate =
        (if (resourceDateType.equals("since")) data.temporal.resourceDate ?: data.temporal.resourceRange?.start
        else data.temporal.resourceRange?.start)
    val resourceEndDate =
        (if (resourceDateType.equals("till")) data.temporal.resourceDate
        else data.temporal.resourceRange?.end)
    val hasAnyResourceDate = listOf(data.temporal.resourceDate, resourceBeginDate, resourceEndDate).any { it != null }
    val resourceBeginIndeterminatePosition =
        if (resourceDateType.equals("till")) "indeterminatePosition=\"unknown\"" else ""
    val resourceEndIndeterminatePosition =
        when (resourceDateTypeSince) {
            "exactDate" -> ""
            "unknown" -> "indeterminatePosition=\"unknown\""
            "requestTime" -> "indeterminatePosition=\"now\""
            else -> ""
        }
    val maintenanceAndUpdateFrequency =
        codelists.getValue("518", data.maintenanceInformation?.maintenanceAndUpdateFrequency, "iso")

    fun getUserDefinedMaintenanceFrequency(): String? {
        val number = data.maintenanceInformation?.userDefinedMaintenanceFrequency?.number
        val unit = codelists.getValue("1230", data.maintenanceInformation?.userDefinedMaintenanceFrequency?.unit, "de")
        return if (number != null && unit != null) getISORepresentation(unit, number) else null
    }

    private fun getISORepresentation(unit: String, number: Int): String {
        return when (unit) {
            "Tage" -> "P${number}D"
            "Jahre" -> "P${number}Y"
            "Monate" -> "P${number}M"
            "Stunden" -> "PT${number}H"
            "Minuten" -> "PT${number}M"
            "Sekunden" -> "PT${number}S"
            else -> throw ServerException.withReason("Unknown unit: $unit")
        }
    }

    val maintenanceNote = data.maintenanceInformation?.description

    val graphicOverviews = data.graphicOverviews ?: emptyList()

    val browseGraphics = generateBrowseGraphics(graphicOverviews)

    private fun generateBrowseGraphics(graphicOverviews: List<GraphicOverview>?): List<BrowseGraphic> =
        graphicOverviews?.map {
            BrowseGraphic(
                if (it.fileName.asLink) it.fileName.uri // TODO encode uri
                else "${config.uploadExternalUrl}$catalogIdentifier/${model.uuid}/${it.fileName.uri}",
                it.fileDescription
            )
        } ?: emptyList()


    data class UseConstraintTemplate(
        val title: CharacterStringModel,
        val source: String?,
        val json: String?,
        val titleKey: String?
    )

    val useConstraints = data.resource?.useConstraints?.map { constraint ->
        if (constraint.title == null) throw ServerException.withReason("Use constraint title is null ${constraint}")

        // special case for "Es gelten keine Bedingungen"
        val link =
            if (constraint.title?.key == "26") "http://inspire.ec.europa.eu/metadata-codelist/ConditionsApplyingToAccessAndUse/noConditionsApply" else null

        val baseJson = codelists.getData("6500", constraint.title?.key)
        val sourceString = ",\"quelle\":\"${constraint.source.orEmpty()}\""

        val json = baseJson?.let {
            if (it.contains(",\"quelle\":\"\"".toRegex()))
            // replace existing source string
                it.replace(",\"quelle\":\"\"".toRegex(), sourceString)
            else
            // add source string
                it.replace("}$".toRegex(), "$sourceString}")
        }

        UseConstraintTemplate(
            CharacterStringModel(codelists.getValue("6500", constraint.title)!!, link),
            constraint.source,
            json,
            constraint.title?.key
        )

    } ?: emptyList()


    val gridSpatialRepresentation = data.gridSpatialRepresentation
    val georectified = gridSpatialRepresentation?.georectified
    val georefenceable = gridSpatialRepresentation?.georeferenceable
    val cellGeometry = codelists.getValue("509", gridSpatialRepresentation?.cellGeometry, "iso")

    val gridType = when (gridSpatialRepresentation?.type?.key) {
        "basis" -> "GridSpatialRepresentation"
        "rectified" -> "Georectified"
        "referenced" -> "Georeferenceable"
        else -> "GridSpatialRepresentation"
    }

    fun wktAsGeoJson() = data.spatial.references?.firstOrNull { it.wkt != null }
        ?.let { convertWktToGeoJson(it.wkt!!) }
        ?.let { Pair(it.replace("\"", "@json@"), it) }

    val spatialReferences = data.spatial.references ?: emptyList()
    private val arsSpatial = spatialReferences.find { !it.ars.isNullOrEmpty() }
    val regionKey = if (arsSpatial == null) null else KeyValueModel(
        arsSpatial.ars,
        padARS(arsSpatial.ars!!).padEnd(12, '0')
    )

    fun padARS(ars: String): String = ars.padEnd(12, '0')

    fun getSpatialReferenceComponents(type: COORD_TYPE): String {
        return spatialReferences
            .filter { it.value != null }
            .map {
                // null check is done above
                when (type) {
                    COORD_TYPE.Lat1 -> it.value!!.lat1
                    COORD_TYPE.Lat2 -> it.value!!.lat2
                    COORD_TYPE.Lon1 -> it.value!!.lon1
                    COORD_TYPE.Lon2 -> it.value!!.lon2
                }.toFloat()
            }
            .joinToString(",", "[", "]")
    }

    fun getSpatialReferenceLocationNames(): String {
        return spatialReferences.filter {
            it.value != null
        }.map {
            // must be escaped first, because we don't want to escape the whole array-string
            JsonEscape.escapeJson(it.title)
        }.joinToString("\",\"", "[\"", "\"]")
    }

    var catalog: Catalog
    var namespace: String

    val formatterISO = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSXXX")
    val formatterOnlyDate = SimpleDateFormat("yyyy-MM-dd")
    val formatterNoSeparator = SimpleDateFormat("yyyyMMddHHmmssSSS")
    var documentType = mapDocumentType(model.type)


    open val hierarchyLevel = "nonGeographicDataset"
    open val hierarchyLevelName: String? = "job"
    open val mdStandardName = "ISO19115"
    open val mdStandardVersion = "2003/Cor.1:2006"
    open val identificationType = "gmd:MD_DataIdentification"
    open val extentType = "gmd:extent"
    val metadataLanguage = TransformationTools.getLanguageISO639_2Value(data.metadata.language)
    val dataLanguages =
        data.dataset?.languages?.map { TransformationTools.getLanguageISO639_2Value(KeyValueModel(it, null)) }
            ?: emptyList()

    val datasetCharacterSet = codelists.getValue("510", data.metadata.characterSet, "iso")
    val topicCategories = data.topicCategories?.map { codelists.getValue("527", it, "iso") } ?: emptyList()


    val spatialRepresentationTypes = data.spatialRepresentationType?.map { codelists.getValue("526", it, "iso") }
        ?: emptyList()
    val spatialResolution = data.resolution ?: emptyList()


    // Always use UTF-8 (see INGRID-2340)
    val metadataCharacterSet = "utf8"
    val vectorSpatialRepresentation = data.vectorSpatialRepresentation ?: emptyList()

    open fun getGeometryContexts(): List<GeometryContext> = emptyList()

    val spatialSystems = data.spatial.spatialSystems?.map {
        val referenceSystem =
            codelists.getValue("100", it) ?: throw ServerException.withReason("Unknown reference system")
        val epsgLink = when {
            // string like "EPSG:25832"
            referenceSystem.startsWith("EPSG:") -> "http://www.opengis.net/def/crs/EPSG/0/${referenceSystem.substring(5)}"
            // string like "EPSG 3857: WGS 84 / Pseudo-Mercator"
            referenceSystem.startsWith("EPSG") -> {
                val endIndex = referenceSystem.indexOf(":")
                if (endIndex > 0) "http://www.opengis.net/def/crs/EPSG/0/${
                    referenceSystem.substring(
                        5,
                        endIndex
                    )
                }" else null
            }
            // could not match string
            else -> null
        }
        CharacterStringModel(referenceSystem, epsgLink)
    }
    open val description = data.description
    val advProductGroups = data.advProductGroups?.mapNotNull { codelists.getValue("8010", it) } ?: emptyList()
    val alternateTitle = data.alternateTitle
    val dateEvents = data.temporal.events ?: emptyList()

    val inspireKeywords = Thesaurus(
        keywords = data.themes?.map {
            KeywordIso(
                name = codelists.getValue("6100", it),
                link = mapToInspireLink(it.key)
            )
        } ?: emptyList(),
        date = "2008-06-01",
        name = "GEMET - INSPIRE themes, version 1.0"
    )

    private fun mapToInspireLink(key: String?): String? {
        return when (key) {
            "304" -> "http://inspire.ec.europa.eu/theme/lu" // land use
            "202" -> "http://inspire.ec.europa.eu/theme/lc" // land cover
            else -> null
        }
    }

    fun getFreeKeywords(): Thesaurus {
        // if openData checkbox is checked, and keyword not already added, add "opendata"
        if (data.isOpenData == true && freeKeywords.keywords.none { it.name == "opendata" }) {
            freeKeywords.keywords += listOf(KeywordIso("opendata"))
        }
        return freeKeywords
    }

    private val freeKeywords = Thesaurus(
        keywords = data.keywords?.free?.map { KeywordIso(name = it.label, link = null) } ?: emptyList(),
        date = null,
        name = null,
    )
    val furtherLegalBasisKeywords = Thesaurus(
        keywords = data.extraInfo?.legalBasicsDescriptions?.map {
            KeywordIso(
                name = codelists.getCatalogCodelistValue("1350", it),
                link = null
            )
        } ?: emptyList(),
        date = "2020-05-05",
        name = "Further legal basis",
        showType = false
    )

    val umthesKeywords = Thesaurus(
        keywords = data.keywords?.umthes?.map { KeywordIso(name = it.label, link = it.id) } ?: emptyList(),
        date = "2009-01-15",
        name = "UMTHES Thesaurus"
    )

    val gemetKeywords = Thesaurus(
        keywords = data.keywords?.gemet?.map { KeywordIso(name = it.label, link = adaptGemetLinks(it.id)) }
            ?: emptyList(),
        date = "2012-07-20",
        name = "GEMET - Concepts, version 3.1"
    )

    private fun adaptGemetLinks(url: String?): String? =
        url?.replace("http:", "https:")?.replace("gemet/concept", "gemet/en/concept")

    val serviceTypeKeywords = Thesaurus(
        keywords = data.service?.classification?.map {
            KeywordIso(
                name = codelists.getValue("5200", it, "iso"),
                link = null
            )
        }
            ?: emptyList(),
        date = "2008-06-01",
        name = "Service Classification, version 1.0"
    )
    val envTopicKeywords = Thesaurus(
        date = "2006-05-01",
        name = "German Environmental Classification - Topic, version 1.0"
    )
    val inspirePriorityKeywords = Thesaurus(
        keywords = data.priorityDatasets?.map {
            KeywordIso(
                name = codelists.getValue("6350", it),
                link = codelists.getDataField("6350", it.key, "url")
            )
        }
            ?: emptyList(),
        date = "2018-04-04",
        name = "INSPIRE priority data set",
        link = "http://inspire.ec.europa.eu/metadata-codelist/PriorityDataset",
        showType = false
    )
    val spatialScopeKeyword = Thesaurus(
        keywords = data.spatialScope?.let {
            listOf(
                KeywordIso(
                    name = codelists.getValue("6360", it),
                    link = codelists.getDataField("6360", it.key, "url")
                )
            )
        }
            ?: emptyList(),
        date = "2019-05-22",
        name = "Spatial scope",
        link = "http://inspire.ec.europa.eu/metadata-codelist/SpatialScope",
        showType = false
    )
    val invekosKeywords = Thesaurus(
        keywords = data.invekosKeywords?.map { KeywordIso(name = mapInVeKoSKeyword(it.key!!), link = it.key) }
            ?: emptyList(),
        date = "2021-06-08",
        name = "IACS data",
        link = "http://inspire.ec.europa.eu/metadata-codelist/IACSData",
        showType = false
    )

    private fun mapInVeKoSKeyword(key: String): String = inVeKoSKeywordMapping[key] ?: key

    val advCompatibleKeyword =
        if (data.isAdVCompatible == true) Thesaurus(keywords = listOf(KeywordIso("AdVMIS"))) else Thesaurus()
    val opendataCategoryKeywords = if (data.isOpenData == true) Thesaurus(
        name = "",
        keywords = this.data.openDataCategories?.map {
            KeywordIso(
                codelists.getData(
                    "6400",
                    it.key,
                )
            )
        } ?: emptyList(),
    ) else Thesaurus()
    val inspireRelevantKeyword =
        if (data.isInspireIdentified == true) Thesaurus(keywords = listOf(KeywordIso("inspireidentifiziert"))) else Thesaurus()

    fun getKeywordsAsList(): List<String> {
        val allKeywords = listOf(
            inspireRelevantKeyword,
            advCompatibleKeyword,
            opendataCategoryKeywords,
            getFreeKeywords(),
            invekosKeywords,
            spatialScopeKeyword,
            inspirePriorityKeywords,
            gemetKeywords,
            umthesKeywords,
            inspireKeywords
        )

        return allKeywords.flatMap { thesaurus -> thesaurus.keywords.mapNotNull { it.name } } + advProductGroups
    }

    fun getReferencesFromDocuments(): List<DocumentReference> {
        // TODO
        return emptyList()
    }

    val specificUsage = data.resource?.specificUsage
    val useLimitation = data.resource?.useLimitation
    val availabilityAccessConstraints = data.resource?.accessConstraints?.map {
        CharacterStringModel(
            "(?<=\\\"de\\\":\\\")[^\\\"]*".toRegex().find(codelists.getData("6010", it.key) ?: "")?.value
                ?: codelists.getValue("6010", it) ?: "",
            "(?<=\\\"url\\\":\\\")[^\\\"]*".toRegex().find(codelists.getData("6010", it.key) ?: "")?.value
        )

    }


    val contentField: MutableList<String> = mutableListOf()

    private fun mapDocumentType(type: String): String {
        return when (type) {
            "InGridSpecialisedTask" -> "0"
            "InGridGeoDataset" -> "1"
            "InGridPublication" -> "2"
            "InGridGeoService" -> "3"
            "InGridProject" -> "4"
            "InGridDataCollection" -> "5"
            "InGridInformationSystem" -> "6"
            else -> throw ServerException.withReason("Could not map document type: ${model.type}")
        }
    }

    // geodataservice
    fun getServiceType(type: KeyValueModel? = null) =
        codelists.getValue(
            if (model.type == "InGridInformationSystem") "5300" else "5100",
            type ?: data.service?.type,
            "iso"
        )

    val serviceTypeVersions = data.service?.version?.map { getVersion(it) } ?: emptyList()
    val couplingType = data.service?.couplingType?.key ?: "loose"

    val operations: List<DisplayOperation>

    private fun getOperationName(name: KeyValueModel?): String? {
        if (name == null) return null

        val serviceType = data.service?.type
        val codelistId = when (serviceType?.key) {
            "1" -> "5105"
            "2" -> "5110"
            "3" -> "5120"
            "4" -> "5130"
            else -> null
        }
        return (if (codelistId == null) null else codelists.getValue(codelistId, name, "de")) ?: name.value
    }

    private fun getVersion(name: KeyValueModel?): String? {
        if (name == null) return null

        val serviceType = data.service?.type
        val codelistId = when (serviceType?.key) {
            "1" -> "5151"
            "2" -> "5152"
            "3" -> "5153"
            "4" -> "5154"
            else -> null
        }
        return (if (codelistId == null) null else codelists.getValue(codelistId, name, "iso")) ?: name.value
    }

    fun getOperatesOn() = data.service?.coupledResources?.map {
        if (it.isExternalRef) {
            OperatesOn(it.uuid, it.identifier)
        } else {
            val identifier = getLastPublishedDocument(it.uuid!!)?.data?.get("identifier")?.asText() ?: it.uuid
            val containsNamespace = identifier.contains("://")
            val completeIdentifier = if (containsNamespace) {
                identifier
            } else {
                val namespaceWithSlash = if (namespace.endsWith("/")) namespace else "$namespace/"
                namespaceWithSlash + identifier
            }
            OperatesOn(it.uuid, completeIdentifier)
        }

    } ?: emptyList()

    // type is "Darstellungsdienste" and operation is "GetCapabilities"
    val capabilitiesUrl =
        if (data.service?.type?.key == "2") data.service.operations?.find { it.name?.key == "1" }?.methodCall
            ?: "" else ""

    fun getCapabilitiesUrlsFromService(): List<String> {
        return if (model.type == "InGridGeoDataset") {
            val doc = getLastPublishedDocument(model.uuid)
            documentService?.getIncomingReferences(doc, catalogIdentifier)
                ?.map { documentService.getLastPublishedDocument(catalogIdentifier, it) }
                ?.filter {
                    it.type == "InGridGeoService" && it.data.get("service").get("type").get("key").asText() == "2"
                }
                ?.mapNotNull {
                    it.data.get("service").get("operations")
                        .firstOrNull { it.get("name").get("key").asText() == "1" }?.get("methodCall")?.asText()
                } ?: emptyList()
        } else emptyList()

    }

    fun getReferingServiceUuid(): String {
        val containsNamespace = model.data.identifier?.contains("://") ?: false
        return if (containsNamespace) {
            "${model.uuid}@@${model.title}@@$capabilitiesUrl@@${model.data.identifier}"
        } else {
            val namespaceWithSlash = if (namespace.endsWith("/")) namespace else "$namespace/"
            "${model.uuid}@@${model.title}@@$capabilitiesUrl@@${namespaceWithSlash}${model.data.identifier}"
        }
    }

    // information system or Literature
    val supplementalInformation = data.explanation ?: data.publication?.explanation

    // literature
    val resourceFormat = data.publication?.documentType?.let { codelists.getValue("3385", it, "en") }


    val references = data.references ?: emptyList()
    val externalReferences = references.filter { it.uuidRef.isNullOrEmpty() }
    val referencesWithUuidRefs = references.filter { it.uuidRef.isNullOrEmpty().not() }

    // information system
    val serviceUrls = data.serviceUrls ?: emptyList()

    // systemEnvironment for GeoService does not exist and will be added to description! (#3462)
    open val systemEnvironment = data.systemEnvironment


    val parentIdentifier: String? = data.parentIdentifier
    val hierarchyParent: String? = data._parent
    val modifiedMetadataDate: String = formatDate(formatterOnlyDate, data.modifiedMetadata ?: model._contentModified)
    var pointOfContact: List<AddressModelTransformer>
    var orderInfoContact: List<AddressModelTransformer>

    var contact: AddressModelTransformer?


    fun formatDate(formatter: SimpleDateFormat, date: OffsetDateTime): String =
        formatter.format(Date.from(date.toInstant()))


    private fun getPersonStringFromJson(address: AddressModel): String {
        return listOfNotNull(
            codelists.getValue(
                "4300",
                address.salutation
            ),
            codelists.getValue(
                "4305",
                address.academicTitle
            ),
            address.firstName,
            address.lastName
        ).joinToString(" ")
    }

    init {
        this.catalog = catalogService.getCatalogById(catalogIdentifier)
        this.namespace = catalog.settings?.config?.namespace ?: "https://registry.gdi-de.org/id/$catalogIdentifier"
        this.citationURL =
            namespace.suffixIfNot("/") + model.uuid // TODO: in classic IDF_UTIL.getUUIDFromString is used
        pointOfContact =
            data.pointOfContact?.filter { addressIsPointContactMD(it).not() && hasKnownAddressType(it) }
                ?.map { toAddressModelTransformer(it) } ?: emptyList()
        // TODO: gmd:contact [1..*] is not supported yet only [1..1]
        contact = data.pointOfContact
            ?.firstOrNull { addressIsPointContactMD(it) && hasKnownAddressType(it) }
            ?.let {toAddressModelTransformer(it)}
        orderInfoContact =
            data.pointOfContact?.filter { addressIsDistributor(it) }?.map { toAddressModelTransformer(it) }
                ?: emptyList()

        atomDownloadURL = catalog.settings?.config?.atomDownloadUrl?.suffixIfNot("/") + model.uuid

        operations = data.service?.operations?.map {
            DisplayOperation(
                getOperationName(it.name),
                it.description,
                it.methodCall,
                citationURL
            )
        } ?: emptyList()
    }

    private fun toAddressModelTransformer(it: AddressRefModel) =
        AddressModelTransformer(
            catalogIdentifier,
            codelists,
            it.type,
            getLastPublishedDocument(it.ref?.uuid!!)!!,
            documentService)

    private fun getCitationFromGeodataset(uuid: String?): String? {
        if (uuid == null) return null

        val doc = getLastPublishedDocument(uuid)
            ?: throw ServerException.withReason("Could not find published reference of coupled resource '$uuid'.")
        return getCitationUrlFromDoc(doc)
    }

    private fun getCitationUrlFromDoc(doc: Document): String {
        val identifier = doc.data.get("identifier")?.asText()
            ?: throw ServerException.withReason("Identifier of coupled document not found: ${doc.uuid}")
        return if (identifier.indexOf("/", 1) == -1) {
            namespace.suffixIfNot("/") + identifier
        } else {
            identifier
        }
    }


    private fun getCoupledCrossReferences() = model.data.service?.coupledResources?.filter { !it.isExternalRef }
        ?.mapNotNull { getCrossReference(it.uuid!!, KeyValueModel("3600", null)) } ?: emptyList()

    private fun getReferencedCrossReferences() =
        model.data.references?.filter { !it.uuidRef.isNullOrEmpty() }
            ?.mapNotNull { getCrossReference(it.uuidRef!!, it.type) }
            ?: emptyList()

    open fun getCrossReferences() =
        getCoupledCrossReferences() + getReferencedCrossReferences() + getIncomingReferencesProxy()

    fun getCoupledServiceUrlsOrGetCapabilitiesUrl() =
        getCoupledServiceUrls() + getGetCapabilitiesUrl() + getExternalCoupledResources()

    fun getSubordinateReferences() = getIncomingReferences().filter { it.isSubordinate }

    private fun getCoupledServiceUrls(): List<ServiceUrl> {
        if (model.type != "InGridGeoDataset") return emptyList()

        return getIncomingReferencesProxy()
            .filter { it.objectType == "3" && it.serviceOperation == "GetCapabilities" }
            .map { ServiceUrl(it.objectName, it.serviceUrl!!, null) }
    }

    private fun getGetCapabilitiesUrl(): List<ServiceUrl> {
        return model.data.service?.operations
            ?.filter { it.name?.key == "1" }
            ?.map { ServiceUrl("Dienst \"${model.title}\" (GetCapabilities)", it.methodCall!!, it.description) }
            ?: emptyList()
    }

    private fun getExternalCoupledResources(): List<ServiceUrl> {
        return model.data.service?.coupledResources
            ?.filter { it.isExternalRef == true }
            ?.map { ServiceUrl(it.title ?: "", it.url!!, null) } ?: emptyList()
    }

    private fun getIncomingReferencesProxy(): List<CrossReference> {
        if (incomingReferencesCache == null) {
            incomingReferencesCache = getIncomingReferences().filter { !it.isSubordinate }
        }

        return incomingReferencesCache ?: emptyList()
    }

    private fun getSuperiorReferenceProxy(): SuperiorReference? {
        if (superiorReferenceCache == null) {
            superiorReferenceCache = getSuperiorReference()
        }

        return superiorReferenceCache
    }

    private fun getSuperiorReference(): SuperiorReference? {
        val uuid = data.parentIdentifier ?: return null
        val doc = getLastPublishedDocument(uuid) ?: return null

        return SuperiorReference(
            uuid = uuid,
            objectName = doc.title ?: "???",
            objectType = mapDocumentType(doc.type),
            description = doc.data.get("description")?.asText(),
            graphicOverview = generateBrowseGraphics(
                listOfNotNull(convertToGraphicOverview(doc.data.get("graphicOverviews")?.get(0)))
            ).firstOrNull()?.uri,
        )
    }

    fun getParentIdentifierReference(): SuperiorReference? = getSuperiorReferenceProxy()

    private fun getCrossReference(
        uuid: String,
        type: KeyValueModel?,
        direction: String = "OUT",
        ignoreNotFound: Boolean = true
    ): CrossReference? {
        val refTrans = getLastPublishedDocument(uuid)
            ?: if (ignoreNotFound) {
                return null
            } else {
                throw ServerException.withReason("Could not find published reference of coupled resource '$uuid'.")
            }
        val service = refTrans.data.get("service")

        val refType = type // type is null only for incoming references and parents, where we don't know the type yet
            ?: if (refTrans.data.getString("parentIdentifier") == this.doc?.uuid) KeyValueModel(null, null) else null
            ?: getRefTypeFromIncomingReference(refTrans.data)
            ?: throw ServerException.withReason("Could not find reference type for '${this.doc?.uuid}' in '$uuid'.")

        // TODO: refType correct?
//        val refType = type
//            ?: if (refTrans.model.data.parentIdentifier == this.model.uuid) KeyValueModel(null, null) else null
//            ?: refTrans.getCoupledCrossReferences().find { it.uuid == this.model.uuid }?.refType
//            ?: refTrans.getReferencedCrossReferences().find { it.uuid == this.model.uuid }?.refType
//            ?: throw ServerException.withReason("Could not find reference type for '${this.model.uuid}' in '$uuid'.")

//        val getCapOperation = refTrans.operations.firstOrNull { it.name == "GetCapabilities" }
        val firstOperation = service?.get("operations")?.get(0)
        return CrossReference(
            direction = direction,
            uuid = uuid,
            objectName = refTrans.title!!,
            objectType = mapDocumentType(refTrans.type),
            refType = refType,
            description = refTrans.data.get("description").asText(),
            graphicOverview = generateBrowseGraphics(
                listOfNotNull(convertToGraphicOverview(refTrans.data.get("graphicOverviews")?.get(0)))
            ).firstOrNull()?.uri,
            serviceType = getServiceType(createKeyValueFromJsonNode(service?.get("type"))),
            serviceOperation =
            getOperationName(createKeyValueFromJsonNode(firstOperation?.get("name"))),
            serviceUrl = service?.get("operations")?.get(0)?.get("identifierLink")?.asText(),
            serviceVersion = getVersion(createKeyValueFromJsonNode(service?.get("version"))),
            hasAccessConstraints = service?.get("hasAccessConstraints")?.asBoolean() ?: false,
            isSubordinate = refTrans.data.get("parentIdentifier")?.asText() == model.uuid
        )
    }

    private fun getRefTypeFromIncomingReference(data: JsonNode): KeyValueModel? {
        val asCoupledResource = data.get("service")?.get("coupledResources")
            ?.filter { !it.get("isExternalRef").asBoolean() }
            ?.find { it.get("uuid").asText() == this.model.uuid }

        if (asCoupledResource != null) return KeyValueModel("3600", null)

        val asReference = data.get("references")
            ?.find { it.get("uuidRef")?.asText() == this.model.uuid }

        return if (asReference != null) {
            createKeyValueFromJsonNode(asReference.get("type"))
        } else null
    }

    private fun createKeyValueFromJsonNode(json: JsonNode?): KeyValueModel {
        return KeyValueModel(json?.get("key")?.asText(), json?.get("value")?.asText())
    }

    private fun convertToGraphicOverview(json: JsonNode?): GraphicOverview? {
        if (json == null || json.isNull) return null
        
        return GraphicOverview(FileName(
            json.getBoolean("fileName.asLink")!!,
            json.getString("fileName.value")!!,
            json.getString("fileName.uri")!!),
            json.getString("fieldDescription")
        )
    }


    private fun getIncomingReferences(): List<CrossReference> {
        val doc = getLastPublishedDocument(model.uuid)
        return documentService.getIncomingReferences(doc, catalogIdentifier).mapNotNull {
            getCrossReference(it, null, "IN")
        }
    }

    fun getLastPublishedDocument(uuid: String): Document? {
        if (cache.documents.containsKey(uuid)) return cache.documents[uuid]
        return try {
            documentService.getLastPublishedDocument(catalogIdentifier, uuid, forExport = true, resolveLinks = true)
                .also { cache.documents[uuid] = it }
        } catch (e: Exception) {
            log.warn("Could not get last published document: $uuid")
            null
        }
    }

    private fun addressIsPointContactMD(it: AddressRefModel) =
        codelists.getValue("505", it.type, "iso").equals("pointOfContactMd")

    private fun addressIsDistributor(it: AddressRefModel) =
        codelists.getValue("505", it.type, "iso").equals("distributor")


    private fun hasKnownAddressType(it: AddressRefModel): Boolean = codelists.getValue("505", it.type, "iso") != null

    fun handleContent(value: String?): String? {
        if (value == null) return null
        contentField.add(value)
        return value
    }

    fun hasDistributionInfo(): Boolean {
        return digitalTransferOptions.isNotEmpty() || distributionFormats.isNotEmpty() || data.orderInfo != null || !data.references.isNullOrEmpty() || isAtomDownload || serviceUrls.isNotEmpty() || getCoupledServiceUrls().isNotEmpty()
    }

    fun hasCompleteVerticalExtent(): Boolean {
        return data.spatial.verticalExtent?.let {
            it.Datum != null && it.minimumValue != null && it.maximumValue != null && it.unitOfMeasure != null
        } ?: false
    }

    open val mapLinkUrl: String? = null
}

enum class COORD_TYPE { Lat1, Lat2, Lon1, Lon2 }

/**
 * convert to values that used for displaying preview on portal
 * @param uri is either an external or internal url.
 */
data class BrowseGraphic(val uri: String, val description: String?)

data class DisplayOperation(
    val name: String?,
    val description: String?,
    val methodCall: String?,
    val identifierLink: String?
)

data class OperatesOn(val uuidref: String?, val href: String?)


data class CrossReference(
    val direction: String,
    val uuid: String,
    val objectName: String,
    val objectType: String,
    val refType: KeyValueModel,
    val description: String?,
    val graphicOverview: String?,
    val serviceType: String? = null,
    val serviceOperation: String? = null,
    val serviceUrl: String? = null,
    val serviceVersion: String? = null,
    val hasAccessConstraints: Boolean = false,
    var mapUrl: String? = null,
    var isSubordinate: Boolean = false
)

data class SuperiorReference(
    val uuid: String,
    val objectName: String,
    val objectType: String,
    val description: String?,
    val graphicOverview: String?
)

data class DocumentReference(
    val uuid: String,
    val docTypeAsClass: Int,
    val title: String,
    val serviceType: String,
    val serviceVersion: String
)

data class GeometryContext(
    val type: String,
    val name: String,
    val featureType: String,
    val featureTypeAttribute: String,
    val featureTypeAttributeContent: String,
    val dataType: String,
    val description: String,
    val attributes: List<GeometryContextAttribute>,
    val minValue: Number?,
    val maxValue: Number?,
    val unit: String?,
)

data class GeometryContextAttribute(
    val key: String,
    val value: String,
)