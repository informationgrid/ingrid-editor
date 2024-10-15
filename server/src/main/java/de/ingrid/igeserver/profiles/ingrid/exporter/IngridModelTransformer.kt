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
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.ServerException
import de.ingrid.igeserver.exporter.AddressModelTransformer
import de.ingrid.igeserver.exporter.AddressTransformerConfig
import de.ingrid.igeserver.exporter.CodelistTransformer
import de.ingrid.igeserver.exporter.TransformationTools
import de.ingrid.igeserver.exporter.model.AddressModel
import de.ingrid.igeserver.exporter.model.AddressRefModel
import de.ingrid.igeserver.exporter.model.CharacterStringModel
import de.ingrid.igeserver.model.KeyValue
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.profiles.ingrid.exporter.model.AttachedField
import de.ingrid.igeserver.profiles.ingrid.exporter.model.CoupledResource
import de.ingrid.igeserver.profiles.ingrid.exporter.model.FileName
import de.ingrid.igeserver.profiles.ingrid.exporter.model.FileReferenceTransferOption
import de.ingrid.igeserver.profiles.ingrid.exporter.model.GraphicOverview
import de.ingrid.igeserver.profiles.ingrid.exporter.model.IngridModel
import de.ingrid.igeserver.profiles.ingrid.exporter.model.KeywordIso
import de.ingrid.igeserver.profiles.ingrid.exporter.model.Operation
import de.ingrid.igeserver.profiles.ingrid.exporter.model.Reference
import de.ingrid.igeserver.profiles.ingrid.exporter.model.ServiceUrl
import de.ingrid.igeserver.profiles.ingrid.exporter.model.Thesaurus
import de.ingrid.igeserver.profiles.ingrid.hvdKeywordMapping
import de.ingrid.igeserver.profiles.ingrid.importer.iso19139.DigitalTransferOption
import de.ingrid.igeserver.profiles.ingrid.importer.iso19139.UnitField
import de.ingrid.igeserver.profiles.ingrid.inVeKoSKeywordMapping
import de.ingrid.igeserver.profiles.ingrid.utils.FieldToCodelist
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.igeserver.utils.checkPublicationTags
import de.ingrid.igeserver.utils.convertWktToGeoJson
import de.ingrid.igeserver.utils.getBoolean
import de.ingrid.igeserver.utils.getDouble
import de.ingrid.igeserver.utils.getString
import de.ingrid.mdek.upload.Config
import org.jetbrains.kotlin.util.suffixIfNot
import org.unbescape.json.JsonEscape
import java.text.SimpleDateFormat
import java.time.OffsetDateTime
import java.util.*

class TransformerCache {
    val documents = mutableMapOf<String, Document>()
}

data class TransformerConfig(
    val model: IngridModel,
    val catalogIdentifier: String,
    val codelists: CodelistTransformer,
    val config: Config,
    val catalogService: CatalogService,
    val cache: TransformerCache,
    val doc: Document,
    val documentService: DocumentService,
    val tags: List<String>,
)

open class IngridModelTransformer(
    transformerConfig: TransformerConfig,
) {
    val model = transformerConfig.model
    val catalogIdentifier = transformerConfig.catalogIdentifier
    val codelists = transformerConfig.codelists
    val config = transformerConfig.config
    val catalogService = transformerConfig.catalogService
    val cache = transformerConfig.cache
    val doc = transformerConfig.doc
    val documentService = transformerConfig.documentService
    val tags = transformerConfig.tags

    val fieldToCodelist = FieldToCodelist()

    var incomingReferencesCache: List<CrossReference>? = null
    var superiorReferenceCache: SuperiorReference? = null

    var citationURL: String? = null
    val data = model.data
    val isFolder = model.type == "FOLDER"
    val purpose = data.resource?.purpose
    val status = codelists.getValue("523", data.temporal.status, "iso")
    val distributionFormats = data.distribution?.format ?: emptyList()
    val isAtomDownload = data.service.isAtomDownload == true
    val atomDownloadURL: String?
    open val digitalTransferOptions = doc.data.get("digitalTransferOptions")?.map {
        DigitalTransferOption(
            createSimpleKeyValueFromJsonNode(it.get("name")),
            UnitField(it.getString("transferSize.value"), createSimpleKeyValueFromJsonNode(it.get("transferSize")?.get("unit"))),
            it.getString("mediumNote"),
        )
    } ?: emptyList()

    val isResourceRangeDefined = data.temporal.resourceRange?.start != null && data.temporal.resourceRange.end != null
    val resourceDateType = data.temporal.resourceDateType?.key
    val resourceDateTypeSince = data.temporal.resourceDateTypeSince?.key
    val resourceBeginDate =
        (
            if (resourceDateType.equals("since")) {
                data.temporal.resourceDate ?: data.temporal.resourceRange?.start
            } else {
                data.temporal.resourceRange?.start
            }
            )
    val resourceEndDate =
        (
            if (resourceDateType.equals("till")) {
                data.temporal.resourceDate
            } else {
                data.temporal.resourceRange?.end
            }
            )
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

    private fun getISORepresentation(unit: String, number: Int): String = when (unit) {
        "Tage" -> "P${number}D"
        "Jahre" -> "P${number}Y"
        "Monate" -> "P${number}M"
        "Stunden" -> "PT${number}H"
        "Minuten" -> "PT${number}M"
        "Sekunden" -> "PT${number}S"
        else -> throw ServerException.withReason("Unknown unit: $unit")
    }

    val maintenanceNote = data.maintenanceInformation?.description

    val graphicOverviews = data.graphicOverviews ?: emptyList()

    val browseGraphics = generateBrowseGraphics(graphicOverviews, model.uuid)

    private fun getDownloadLink(datasetUuid: String, fileName: String): String = "${config.uploadExternalUrl}$catalogIdentifier/$datasetUuid/$fileName"

    private fun generateBrowseGraphics(graphicOverviews: List<GraphicOverview>?, datasetUuid: String): List<BrowseGraphic> =
        graphicOverviews?.map {
            BrowseGraphic(
                if (it.fileName.asLink) {
                    it.fileName.uri // TODO encode uri
                } else {
                    getDownloadLink(datasetUuid, it.fileName.uri)
                },
                it.fileDescription,
            )
        } ?: emptyList()

    data class UseConstraintTemplate(
        val title: CharacterStringModel,
        val source: String?,
        val json: String?,
        val titleKey: String?,
        var note: String? = null,
    )

    open val useConstraints = data.resource?.useConstraints?.map { constraint ->
        if (constraint.title == null) throw ServerException.withReason("Use constraint title is null $constraint")

        // special case for "Es gelten keine Bedingungen"
        val link =
            if (constraint.title?.key == "26") "http://inspire.ec.europa.eu/metadata-codelist/ConditionsApplyingToAccessAndUse/noConditionsApply" else null

        val baseJson = codelists.getData("6500", constraint.title?.key)
        val sourceString = ",\"quelle\":\"${constraint.source.orEmpty().replace("\"", "\\\\\"")}\""

        val json = baseJson?.let {
            if (it.contains(",\"quelle\":\"\"".toRegex())) {
                // replace existing source string
                it.replace(",\"quelle\":\"\"".toRegex(), sourceString)
            } else {
                // add source string
                it.replace("}$".toRegex(), "$sourceString}")
            }
        }

        UseConstraintTemplate(
            CharacterStringModel(
                codelists.getValue("6500", constraint.title) ?: throw ServerException.withReason("Unknown use constraints key: ${constraint.title}"),
                link,
            ),
            constraint.source,
            json,
            constraint.title?.key,
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
    val regionKey = if (arsSpatial == null) {
        null
    } else {
        KeyValue(
            arsSpatial.ars,
            padARS(arsSpatial.ars!!),
        )
    }

    fun padARS(ars: String): String = ars.padEnd(12, '0')

    fun getSpatialReferenceComponents(type: CoordinateType): String = spatialReferences
        .filter { it.value != null }
        .map {
            // null check is done above
            when (type) {
                CoordinateType.Lat1 -> it.value!!.lat1
                CoordinateType.Lat2 -> it.value!!.lat2
                CoordinateType.Lon1 -> it.value!!.lon1
                CoordinateType.Lon2 -> it.value!!.lon2
            }.toFloat()
        }
        .joinToString(",", "[", "]")

    fun getSpatialReferenceLocationNames(): String = spatialReferences.filter {
        it.value != null
    }.map {
        // must be escaped first, because we don't want to escape the whole array-string
        JsonEscape.escapeJson(it.title)
    }.joinToString("\",\"", "[\"", "\"]")

    fun getSpatialReferenceArs(): List<String> = spatialReferences.mapNotNull { it.ars }

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
    open val datasetUri: String? = null
    open val identificationType = "gmd:MD_DataIdentification"
    open val extentType = "gmd:extent"
    fun hasEnglishKeywords() = gemetKeywords.keywords.any { it.alternateValue != null } // see issue #363
    val metadataLanguage = if (data.metadata != null) TransformationTools.getLanguageISO639v2Value(data.metadata.language) else null
    val dataLanguages =
        data.dataset?.languages?.map { TransformationTools.getLanguageISO639v2Value(KeyValue(it, null)) }
            ?: emptyList()

    val datasetCharacterSet = codelists.getValue("510", data.metadata?.characterSet, "iso")
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
                if (endIndex > 0) {
                    "http://www.opengis.net/def/crs/EPSG/0/${
                        referenceSystem.substring(
                            5,
                            endIndex,
                        )
                    }"
                } else {
                    null
                }
            }
            // could not match string
            else -> null
        }
        CharacterStringModel(referenceSystem, epsgLink)
    } ?: emptyList()
    open val description = data.description
    val advProductGroups = data.advProductGroups?.mapNotNull { codelists.getValue("8010", it) } ?: emptyList()
    val alternateTitle = data.alternateTitle
    val dateEvents = data.temporal.events ?: emptyList()

    val inspireKeywords = Thesaurus(
        keywords = data.themes?.map {
            KeywordIso(
                name = codelists.getValue("6100", it),
                link = mapToInspireLink(it.key),
            )
        } ?: emptyList(),
        date = "2008-06-01",
        name = "GEMET - INSPIRE themes, version 1.0",
    )

    private fun mapToInspireLink(key: String?): String? = when (key) {
        "304" -> "http://inspire.ec.europa.eu/theme/lu" // land use
        "202" -> "http://inspire.ec.europa.eu/theme/lc" // land cover
        else -> null
    }

    open fun getFreeKeywords(): Thesaurus {
        // if openData checkbox is checked, and keyword not already added, add "opendata"
        if (data.isOpenData == true && freeKeywordsThesaurus.keywords.none { it.name == "opendata" }) {
            freeKeywordsThesaurus.keywords += listOf(KeywordIso("opendata"))
        }
        return freeKeywordsThesaurus
    }

    private val freeKeywordsThesaurus = Thesaurus(
        keywords = data.keywords?.free?.map { KeywordIso(name = it.label, link = null) } ?: emptyList(),
        date = null,
        name = null,
    )
    val furtherLegalBasisKeywords = Thesaurus(
        keywords = data.extraInfo?.legalBasicsDescriptions?.map {
            KeywordIso(
                name = codelists.getCatalogCodelistValue("1350", it),
                link = null,
            )
        } ?: emptyList(),
        date = "2020-05-05",
        name = "Further legal basis",
        showType = false,
    )

    val umthesKeywords = Thesaurus(
        keywords = data.keywords?.umthes?.map { KeywordIso(name = it.label, link = it.id) } ?: emptyList(),
        date = "2009-01-15",
        name = "UMTHES Thesaurus",
    )

    val gemetKeywords = Thesaurus(
        keywords = data.keywords?.gemet?.map { KeywordIso(it.label, adaptGemetLinks(it.id), it.alternativeLabel) }
            ?: emptyList(),
        date = "2012-07-20",
        name = "GEMET - Concepts, version 3.1",
    )

    private fun adaptGemetLinks(url: String?): String? =
        url?.replace("http:", "https:")?.replace("gemet/concept", "gemet/en/concept")

    val serviceTypeKeywords = Thesaurus(
        keywords = data.service.classification?.map {
            KeywordIso(
                name = codelists.getValue("5200", it, "iso"),
                link = null,
            )
        }
            ?: emptyList(),
        date = "2008-06-01",
        name = "Service Classification, version 1.0",
    )
    val envTopicKeywords = Thesaurus(
        date = "2006-05-01",
        name = "German Environmental Classification - Topic, version 1.0",
    )
    val inspirePriorityKeywords = Thesaurus(
        keywords = data.priorityDatasets?.map {
            KeywordIso(
                name = codelists.getValue("6350", it),
                link = codelists.getDataField("6350", it.key, "url"),
            )
        }
            ?: emptyList(),
        date = "2018-04-04",
        name = "INSPIRE priority data set",
        link = "http://inspire.ec.europa.eu/metadata-codelist/PriorityDataset",
        showType = false,
    )
    val spatialScopeKeyword = Thesaurus(
        keywords = data.spatialScope?.let {
            listOf(
                KeywordIso(
                    name = codelists.getValue("6360", it),
                    link = codelists.getDataField("6360", it.key, "url"),
                ),
            )
        }
            ?: emptyList(),
        date = "2019-05-22",
        name = "Spatial scope",
        link = "http://inspire.ec.europa.eu/metadata-codelist/SpatialScope",
        showType = false,
    )

    val opendataCategoryKeywords = Thesaurus(
        name = "",
        keywords = data.openDataCategories?.map {
            KeywordIso(
                codelists.getData(
                    "6400",
                    it.key,
                ),
            )
        } ?: emptyList(),
    )

    val invekosKeywords = Thesaurus(
        keywords = data.invekosKeywords?.map { KeywordIso(name = mapInVeKoSKeyword(it.key ?: throw ServerException.withReason("Unknown InVeKoS-key: $it")), link = it.key) }
            ?: emptyList(),
        date = "2021-06-08",
        name = "IACS data",
        link = "http://inspire.ec.europa.eu/metadata-codelist/IACSData",
        showType = false,
    )

    val hvdCategories = Thesaurus(
        keywords = data.hvdCategories?.map { KeywordIso(name = mapHVDKeyword(it.key ?: throw ServerException.withReason("Unknown HvD-key: $it")), link = it.key) }
            ?: emptyList(),
        date = "2023-09-27",
        name = "High-value dataset categories",
        link = "http://data.europa.eu/bna/asd487ae75",
        showType = true,
    )

    private fun mapInVeKoSKeyword(key: String): String = inVeKoSKeywordMapping[key] ?: key
    private fun mapHVDKeyword(key: String): String = hvdKeywordMapping[key] ?: key

    val advCompatibleKeyword =
        if (data.isAdVCompatible == true) Thesaurus(keywords = listOf(KeywordIso("AdVMIS"))) else Thesaurus()
    val inspireRelevantKeyword =
        if (data.isInspireIdentified == true) Thesaurus(keywords = listOf(KeywordIso("inspireidentifiziert"))) else Thesaurus()

    open fun getKeywordsAsList(): List<String> {
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
            inspireKeywords,
            hvdCategories,
        )

        return allKeywords.flatMap { thesaurus -> thesaurus.keywords.mapNotNull { it.name } } + advProductGroups
    }

    open fun getDescriptiveKeywords(): List<Thesaurus> = listOf(
        inspireKeywords,
        serviceTypeKeywords,
        getFreeKeywords(),
        inspirePriorityKeywords,
        spatialScopeKeyword,
        opendataCategoryKeywords,
        advCompatibleKeyword,
        inspireRelevantKeyword,
        furtherLegalBasisKeywords,
        umthesKeywords,
        gemetKeywords,
        invekosKeywords,
        hvdCategories,
    )

    val specificUsage = data.resource?.specificUsage
    val useLimitation = data.resource?.useLimitation
    val availabilityAccessConstraints = data.resource?.accessConstraints?.map {
        CharacterStringModel(
            "(?<=\\\"de\\\":\\\")[^\\\"]*".toRegex().find(codelists.getData("6010", it.key) ?: "")?.value
                ?: codelists.getValue("6010", it) ?: "",
            "(?<=\\\"url\\\":\\\")[^\\\"]*".toRegex().find(codelists.getData("6010", it.key) ?: "")?.value,
        )
    } ?: emptyList()

    val contentField: MutableList<String> = mutableListOf()

    private fun mapDocumentType(type: String): String = when (type) {
        "InGridSpecialisedTask" -> "0"
        "InGridGeoDataset" -> "1"
        "InGridPublication" -> "2"
        "InGridGeoService" -> "3"
        "InGridProject" -> "4"
        "InGridDataCollection" -> "5"
        "InGridInformationSystem" -> "6"
        else -> throw ServerException.withReason("Could not map document type: ${model.type}")
    }

    // geodataservice
    fun getServiceType(type: KeyValue? = null) =
        codelists.getValue(
            if (model.type == "InGridInformationSystem") "5300" else "5100",
            type ?: data.service.type,
            "iso",
        )

    val serviceTypeVersions = data.service.version?.map { getVersion(it, data.service.type?.key) } ?: emptyList()
    val couplingType = data.service.couplingType?.key ?: "loose"

    val operations: List<DisplayOperation>

    private fun getOperationName(name: KeyValue?): String? {
        if (name == null) return null

        val serviceType = data.service.type
        val codelistId = when (serviceType?.key) {
            "1" -> "5105"
            "2" -> "5110"
            "3" -> "5120"
            "4" -> "5130"
            else -> "5110"
        }
        return codelists.getValue(codelistId, name, "de") ?: name.value
    }

    private fun getVersion(name: KeyValue?, serviceTypeKey: String?): String? {
        if (name == null) return null

        val codelistId = when (serviceTypeKey) {
            "1" -> "5151"
            "2" -> "5152"
            "3" -> "5153"
            "4" -> "5154"
            else -> null
        }
        return (if (codelistId == null) null else codelists.getValue(codelistId, name, "iso")) ?: name.value
    }

    fun getOperatesOn() = data.service.coupledResources?.flatMap {
        val finalIdentifier = getCoupledResourceIdentifier(it)

        // for each layername create an operatesOn-element
        if (it.layerNames.isNullOrEmpty()) {
            listOf(OperatesOn(it.uuid, finalIdentifier, null))
        } else {
            it.layerNames.map { layername: String -> OperatesOn(it.uuid, finalIdentifier, layername) }
        }
    } ?: emptyList()

    fun getCoupledResourceIdentifiers() = model.data.service.coupledResources?.map { getCoupledResourceIdentifier(it) } ?: emptyList()

    private fun getCoupledResourceIdentifier(
        it: CoupledResource,
    ) = if (it.isExternalRef) {
        it.identifier
    } else {
        // TODO: when document not yet published (ISO-view of draft) then do not generate operatesOn-element (#6241)
        val identifier = getLastPublishedDocument(it.uuid!!)?.data?.getString("identifier") ?: it.uuid
        addNamespaceIfNeeded(identifier)
    }

    // type is "Darstellungsdienste" and operation is "GetCapabilities"
    val capabilitiesUrl =
        if (data.service.type?.key == "2") {
            data.service.operations?.find { isCapabilitiesEntry(it) }?.methodCall
                ?: ""
        } else {
            ""
        }

    fun getCapabilitiesUrlsFromService(): List<String> = if (model.type == "InGridGeoDataset") {
        val doc = getLastPublishedDocument(model.uuid)
        documentService.getIncomingReferences(doc, catalogIdentifier)
            .map { documentService.getLastPublishedDocument(catalogIdentifier, it) }
            .filter {
                it.type == "InGridGeoService" && it.data.getString("service.type.key") == "2"
            }
            .mapNotNull { ref ->
                ref.data.get("service").get("operations")
                    .firstOrNull { isCapabilitiesEntry(it) }?.getString("methodCall")
            }
    } else {
        emptyList()
    }

    fun getReferingServiceUuid(service: CrossReference): String = "${service.uuid}@@${service.objectName}@@${service.serviceUrl.orEmpty()}@@${this.citationURL}"

    // TODO: move to specific doc types
    // information system or publication
    open val supplementalInformation = data.explanation ?: data.publication?.explanation

    // TODO: move to specific doc type
    // literature
    val resourceFormat = data.publication?.documentType?.let { codelists.getValue("3385", it, "en") }

    val references = data.references ?: emptyList()
    private val externalReferences: List<ServiceUrl> by lazy {
        references.filter { it.uuidRef.isNullOrEmpty() }.map {
            // if type not in codelist, use "information" #6017
            val functionValue = codelists.getValue("2000", KeyValue(it.type.key), "iso") ?: "information"
            val applicationProfile = codelists.getValue(fieldToCodelist.referenceFileFormat, it.urlDataType, "de")
            val attachedField = if (it.type.key == null) {
                null
            } else {
                val attachedToFieldText = codelists.getValue("2000", it.type) ?: ""
                AttachedField("2000", it.type.key ?: throw ServerException.withReason("Unknown reference type-key: ${it.type}"), attachedToFieldText)
            }
            ServiceUrl(it.title, it.url ?: "", it.explanation, attachedField, applicationProfile, functionValue)
        }
    }
    val referencesWithUuidRefs: List<Reference> by lazy {
        references
            .filter { !it.uuidRef.isNullOrEmpty() }
            .map { applyRefInfos(it) }
    }

    val fileReferenceTransferOptions: List<FileReferenceTransferOption> by lazy {
        val fileReferences = data.fileReferences ?: emptyList()
        fileReferences.map {
            FileReferenceTransferOption(
                link = it.link,
                title = it.title,
                description = it.description,
                applicationProfile = codelists.getValue(fieldToCodelist.referenceFileFormat, it.format, "de"),
                format = it.format,
                url = getDownloadLink(model.uuid, it.link.uri),
            )
        }
    }

    private fun applyRefInfos(it: Reference): Reference {
        val refClass = getLastPublishedDocument(it.uuidRef ?: throw ServerException.withReason("UUID of a reference is NULL")) ?: return it
        it.uuidRefClass = mapDocumentType(refClass.type)
        val service = refClass.data.get("service")
        it.uuidRefVersion = getVersion(
            createKeyValueFromJsonNode(service?.get("version")?.firstOrNull()),
            service?.getString("type.key"),
        ) ?: ""
        it.uuidRefServiceType = createKeyValueFromJsonNode(service?.get("type"))
        return it
    }

    val getCoupledServicesForGeodataset = getIncomingReferencesProxy(true).filter { it.refType.key == "3600" }
    val referencesWithCoupledServicesAndFileReferences: List<Reference> by lazy {
        references.map {
            it.urlDataType = KeyValue(codelists.getValue(fieldToCodelist.referenceFileFormat, it.urlDataType, "de"), null)
            it
        } +
            getCoupledServicesForGeodataset.map {
                Reference(
                    it.objectName,
                    it.refType,
                    it.description,
                    it.serviceUrl,
                    null,
                    null,
                )
            } +
            fileReferenceTransferOptions.map {
                Reference(
                    it.title ?: it.url,
                    KeyValue("9990", null),
                    null,
                    it.url,
                    null,
                    KeyValue(it.applicationProfile, null),
                )
            }
    }

    // information system
    val serviceUrls = data.serviceUrls?.map {
        it.attachedToField = AttachedField("2000", "5066", "Link to Service")
        it.functionValue = "information"
        it
    } ?: emptyList()

    // systemEnvironment for GeoService does not exist and will be added to description! (#3462)
    open val systemEnvironment = data.systemEnvironment

    fun getServiceUrlsAndCoupledServiceAndAtomAndExternalRefs(): List<ServiceUrl> = externalReferences + serviceUrls + getCoupledServiceUrlsOrGetCapabilitiesUrl() + getAtomAsServiceUrl()

    private fun getAtomAsServiceUrl(): List<ServiceUrl> = if (isAtomDownload) {
        listOf(ServiceUrl("Get Download Service Metadata", atomDownloadURL ?: throw ServerException.withReason("Atom Download URL is NULL"), null, isIdfResource = false, functionValue = "information"))
    } else {
        emptyList()
    }

    val parentIdentifier: String? = data.parentIdentifier
    val hierarchyParent: String? = data._parent
    val modifiedMetadataDate: String = formatDate(formatterOnlyDate, data.modifiedMetadata ?: model._contentModified)
    var pointOfContact: List<AddressModelTransformer> = emptyList()
    var orderInfoContact: List<AddressModelTransformer>
    fun getAddressesToUuids() = pointOfContact.flatMap { model ->
        model.getSubordinatedParties().map { it.uuid }
    }

    var contact: AddressModelTransformer?
    var contacts: List<AddressModelTransformer>

    fun formatDate(formatter: SimpleDateFormat, date: OffsetDateTime?): String =
        if (date == null) "" else formatter.format(Date.from(date.toInstant()))

    private fun getPersonStringFromJson(address: AddressModel): String = listOfNotNull(
        codelists.getValue(
            "4300",
            address.salutation,
        ),
        codelists.getValue(
            "4305",
            address.academicTitle,
        ),
        address.firstName,
        address.lastName,
    ).joinToString(" ")

    init {
        this.catalog = catalogService.getCatalogById(catalogIdentifier)
        this.namespace = if (catalog.settings.config.namespace.isNullOrEmpty()) "https://registry.gdi-de.org/id/$catalogIdentifier/" else catalog.settings.config.namespace!!
        this.citationURL = addNamespaceIfNeeded(model.data.identifier ?: model.uuid)

        pointOfContact =
            data.pointOfContact?.filter { addressIsPointContactMD(it).not() && hasKnownAddressType(it) }
                ?.mapNotNull { toAddressModelTransformer(it) } ?: emptyList()
        contacts = data.pointOfContact?.filter { addressIsPointContactMD(it) && hasKnownAddressType(it) }
            ?.mapNotNull { toAddressModelTransformer(it) } ?: emptyList()
        // TODO: gmd:contact [1..*] is not supported everywhere yet only [1..1]
        contact = contacts.firstOrNull()

        orderInfoContact =
            data.pointOfContact?.filter { addressIsDistributor(it) }?.mapNotNull { toAddressModelTransformer(it) }
                ?: emptyList()

        atomDownloadURL = (catalog.settings.config.atomDownloadUrl ?: "") + model.uuid

        operations = data.service.operations?.map {
            DisplayOperation(
                getOperationName(it.name),
                it.description,
                it.methodCall,
            )
        } ?: emptyList()
    }

    private fun toAddressModelTransformer(it: AddressRefModel): AddressModelTransformer? {
        val lastPublishedDoc = getLastPublishedDocument(it.ref ?: throw ServerException.withReason("Address-Reference UUID is NULL"))

        // filter out addresses with wrong tags
        if (lastPublishedDoc != null) {
            kotlin.runCatching { checkPublicationTags(documentService.getWrapperById(lastPublishedDoc.wrapperId!!).tags, tags) }
                .onFailure { return null }
        }

        // if no lastPublishedDoc is found, create a dummy address with the type "null-address"
        val doc = lastPublishedDoc ?: Document().apply {
            data = jacksonObjectMapper().createObjectNode()
            type = "null-address"
            modified = OffsetDateTime.now()
            wrapperId = -1
        }
        return AddressModelTransformer(
            AddressTransformerConfig(
                catalogIdentifier,
                codelists,
                // Map pointOfContactMD type to pointOfContact for ISO Exports
                if (it.type?.key != "12") it.type else KeyValue("7", "pointOfContact"),
                doc,
                documentService,
                config,
                tags,
            ),
        )
    }

    private fun getCitationFromGeodataset(uuid: String?): String? {
        if (uuid == null) return null

        val doc = getLastPublishedDocument(uuid)
            ?: throw ServerException.withReason("Could not find published reference of coupled resource '$uuid'.")
        return getCitationUrlFromDoc(doc)
    }

    private fun getCitationUrlFromDoc(doc: Document): String {
        val identifier = doc.data.getString("identifier")
            ?: throw ServerException.withReason("Identifier of coupled document not found: ${doc.uuid}")
        return addNamespaceIfNeeded(identifier)
    }

    open fun addNamespaceIfNeeded(identifier: String): String =
        // if identifier is a URI, don't add namespace
        if (identifier.contains("://")) {
            identifier
        } else {
            namespace.suffixIfNot("/") + identifier
        }

    private fun getCoupledCrossReferences() = model.data.service.coupledResources?.filter { !it.isExternalRef }
        ?.mapNotNull { getCrossReference(it.uuid ?: throw ServerException.withReason("Coupled resource UUID is NULL"), KeyValue("3600", null)) } ?: emptyList()

    private fun getReferencedCrossReferences() =
        model.data.references?.filter { !it.uuidRef.isNullOrEmpty() }
            ?.mapNotNull { getCrossReference(it.uuidRef ?: throw ServerException.withReason("UUID of reference is NULL"), it.type) }
            ?: emptyList()

    open fun getCrossReferences() =
        getCoupledCrossReferences() + getReferencedCrossReferences() + getIncomingReferencesProxy(true)

    private fun getCoupledServiceUrlsOrGetCapabilitiesUrl() =
        getCoupledServiceUrls() + getGetCapabilitiesUrl() + getExternalCoupledResources()

    fun getSubordinateReferences() = getIncomingReferencesProxy().filter { it.isSubordinate }

    private fun getCoupledServiceUrls(): List<ServiceUrl> {
        if (model.type != "InGridGeoDataset") return emptyList()

        return getIncomingReferencesProxy(true)
            .filter { it.objectType == "3" && it.serviceOperation == "GetCapabilities" }
            .map { ServiceUrl(it.objectName, it.serviceUrl ?: throw ServerException.withReason("Service URL is NULL"), null) }
    }

    private fun getGetCapabilitiesUrl(): List<ServiceUrl> = model.data.service.operations
        ?.filter { isCapabilitiesEntry(it) }
        ?.map { ServiceUrl("Dienst \"${model.title}\" (GetCapabilities)", it.methodCall ?: throw ServerException.withReason("Operation URL is NULL"), it.description) }
        ?: emptyList()

    private fun getExternalCoupledResources(): List<ServiceUrl> = model.data.service.coupledResources
        ?.filter { it.isExternalRef }
        ?.map { ServiceUrl(it.title ?: "", it.url ?: throw ServerException.withReason("External coupled resource URL is NULL"), null) } ?: emptyList()

    private fun getIncomingReferencesProxy(excludeSubordinate: Boolean = false): List<CrossReference> {
        if (incomingReferencesCache == null) {
            incomingReferencesCache = getIncomingReferences()
        }

        return if (excludeSubordinate) {
            incomingReferencesCache!!.filter { !it.isSubordinate }
        } else {
            incomingReferencesCache ?: emptyList()
        }
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
            description = doc.data.getString("description"),
            graphicOverview = generateBrowseGraphics(
                listOfNotNull(convertToGraphicOverview(doc.data.get("graphicOverviews")?.get(0))),
                uuid,
            ).firstOrNull()?.uri,
        )
    }

    fun getParentIdentifierReference(): SuperiorReference? = getSuperiorReferenceProxy()

    open fun getCrossReference(
        uuid: String,
        type: KeyValue?,
        direction: String = "OUT",
        ignoreNotFound: Boolean = true,
    ): CrossReference? {
        val refTrans = getLastPublishedDocument(uuid)
            ?: if (ignoreNotFound) {
                return null
            } else {
                throw ServerException.withReason("Could not find published reference of coupled resource '$uuid'.")
            }
        val service: JsonNode? = refTrans.data.get("service")

        val refType = type // type is null only for incoming references and parents, where we don't know the type yet
            ?: if (refTrans.data.getString("parentIdentifier") == this.doc.uuid) {
                KeyValue(null, null)
            } else {
                null
                    ?: getRefTypeFromIncomingReference(refTrans.data)
                    ?: throw ServerException.withReason("Could not find reference type for '${this.doc.uuid}' in '$uuid'.")
            }

        val firstOperation = service?.get("operations")?.get(0)
        return CrossReference(
            direction = direction,
            uuid = uuid,
            objectName = refTrans.title ?: throw ServerException.withReason("Title of referenced dataset is NULL"),
            objectType = mapDocumentType(refTrans.type),
            refType = refType,
            description = refTrans.data.getString("description"),
            graphicOverview = generateBrowseGraphics(
                listOfNotNull(convertToGraphicOverview(refTrans.data.get("graphicOverviews")?.get(0))),
                uuid,
            ).firstOrNull()?.uri,
            serviceType = getServiceType(createKeyValueFromJsonNode(service?.get("type"))),
            serviceOperation =
            getOperationName(createKeyValueFromJsonNode(firstOperation?.get("name"))),
            serviceUrl = service?.get("operations")?.find { isCapabilitiesEntry(it) }?.getString("methodCall"),
            serviceVersion = getVersion(
                createKeyValueFromJsonNode(service?.get("version")?.firstOrNull()),
                service?.getString("type.key"),
            ),
            hasAccessConstraints = service?.getBoolean("hasAccessConstraints") ?: false,
            isSubordinate = refTrans.data.getString("parentIdentifier") == model.uuid,
        )
    }

    private fun getRefTypeFromIncomingReference(data: JsonNode): KeyValue? {
        val asCoupledResource = data.get("service")?.get("coupledResources")
            ?.filter { !it.get("isExternalRef").asBoolean() }
            ?.find { it.get("uuid").asText() == this.model.uuid }

        if (asCoupledResource != null) return KeyValue("3600", null)

        val asReference = data.get("references")
            ?.find { it.getString("uuidRef") == this.model.uuid }

        return if (asReference != null) {
            createKeyValueFromJsonNode(asReference.get("type"))
        } else {
            null
        }
    }

    private fun createKeyValueFromJsonNode(json: JsonNode?): KeyValue? {
        if (json?.get("key")?.isNull == true && json.get("value")?.isNull!!) return null

        return KeyValue(json?.getString("key"), json?.getString("value"))
    }

    private fun createSimpleKeyValueFromJsonNode(json: JsonNode?): KeyValue? {
        if (json?.get("key")?.isNull == true && json.get("value")?.isNull!!) return null

        return KeyValue(json?.getString("key"), json?.getString("value"))
    }

    private fun convertToGraphicOverview(json: JsonNode?): GraphicOverview? {
        if (json == null || json.isNull) return null

        return GraphicOverview(
            FileName(
                json.getBoolean("fileName.asLink") ?: throw ServerException.withReason("Preview image 'asLink'-property is NULL"),
                json.getString("fileName.value") ?: throw ServerException.withReason("Preview image 'value'-property is NULL"),
                json.getString("fileName.uri") ?: throw ServerException.withReason("Preview image 'uri'-property is NULL"),
                json.getDouble("fileName.sizeInBytes") ?: null,
            ),
            json.getString("fieldDescription"),
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
            documentService.getLastPublishedDocument(catalogIdentifier, uuid, forExport = true)
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

    fun hasDistributionInfo(): Boolean = digitalTransferOptions.isNotEmpty() ||
        distributionFormats.isNotEmpty() ||
        hasDistributorInfo() ||
        !data.references.isNullOrEmpty() ||
        !data.fileReferences.isNullOrEmpty() ||
        isAtomDownload ||
        // TODO Refactor after usage clarification #6322
        // || serviceUrls.isNotEmpty()
        // || getCoupledServiceUrls().isNotEmpty()
        getServiceUrlsAndCoupledServiceAndAtomAndExternalRefs().isNotEmpty()

    fun hasDistributorInfo(): Boolean = data.orderInfo?.isNotEmpty() == true || data.fees?.isNotEmpty() == true

    fun hasCompleteVerticalExtent(): Boolean = data.spatial.verticalExtent?.let {
        it.Datum != null && it.minimumValue != null && it.maximumValue != null && it.unitOfMeasure != null
    } ?: false

    private fun isCapabilitiesEntry(entry: JsonNode): Boolean = entry.getString("name.key") == "1" || entry.getString("name.value") == "GetCapabilities"
    private fun isCapabilitiesEntry(op: Operation): Boolean = op.name?.key == "1" || op.name?.value == "GetCapabilities"

    open val mapLinkUrl: String? = null
}

enum class CoordinateType { Lat1, Lat2, Lon1, Lon2 }

/**
 * convert to values that used for displaying preview on portal
 * @param uri is either an external or internal url.
 */
data class BrowseGraphic(val uri: String, val description: String?)

data class DisplayOperation(
    val name: String?,
    val description: String?,
    val methodCall: String?,
)

data class OperatesOn(val uuidref: String?, val href: String?, val title: String?)

data class CrossReference(
    val direction: String,
    val uuid: String,
    val objectName: String,
    val objectType: String,
    val refType: KeyValue,
    val description: String?,
    val graphicOverview: String?,
    val serviceType: String? = null,
    val serviceOperation: String? = null,
    val serviceUrl: String? = null,
    val serviceVersion: String? = null,
    val hasAccessConstraints: Boolean = false,
    var mapUrl: String? = null,
    var isSubordinate: Boolean = false,
)

data class SuperiorReference(
    val uuid: String,
    val objectName: String,
    val objectType: String,
    val description: String?,
    val graphicOverview: String?,
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
