package de.ingrid.igeserver.profiles.ingrid.exporter

import de.ingrid.igeserver.ServerException
import de.ingrid.igeserver.exporter.AddressModelTransformer
import de.ingrid.igeserver.exporter.CodelistTransformer
import de.ingrid.igeserver.exporter.TransformationTools
import de.ingrid.igeserver.exporter.model.AddressModel
import de.ingrid.igeserver.exporter.model.CharacterStringModel
import de.ingrid.igeserver.exporter.model.KeyValueModel
import de.ingrid.igeserver.exports.iso19139.Keyword
import de.ingrid.igeserver.exports.iso19139.Thesaurus
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import de.ingrid.igeserver.profiles.ingrid.exporter.model.IngridModel
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.mdek.upload.Config
import org.jetbrains.kotlin.util.suffixIfNot
import org.unbescape.json.JsonEscape
import java.text.SimpleDateFormat
import java.time.OffsetDateTime
import java.util.*

open class IngridModelTransformer constructor(
    val model: IngridModel,
    val catalogIdentifier: String,
    val codelists: CodelistTransformer,
    val config: Config,
    val catalogService: CatalogService,
) {

    var citationURL: String? = null
    val data = model.data
    val purpose = data.resource?.purpose
    val status = codelists.getValue("523", data.temporal.status, "iso")
    val distributionFormats = data.distribution?.format ?: emptyList()
    val digitalTransferOptions = data.digitalTransferOptions ?: emptyList()

    val resourceDateType = data.temporal.resourceDateType?.key
    val resourceDateTypeSince = data.temporal.resourceDateTypeSince?.key
    val resourceBeginDate =
        (if (resourceDateType.equals("since")) data.temporal.resourceDate ?: data.temporal.resourceRange?.start
        else data.temporal.resourceRange?.start)
    val resourceEndDate =
        (if (resourceDateType.equals("till")) data.temporal.resourceDate
        else data.temporal.resourceRange?.end)
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

    data class UseConstraintTemplate(val title: CharacterStringModel, val source: String?, val json: String? )

    val useConstraints = data.resource?.useConstraints?.map {
        // special case for "Es gelten keine Bedingungen"
        val link =
            if (it.title?.key == "26") "http://inspire.ec.europa.eu/metadata-codelist/ConditionsApplyingToAccessAndUse/noConditionsApply" else null

        UseConstraintTemplate(
            CharacterStringModel(codelists.getValue("6500", it.title)!!, link),
            it.source,
            codelists.getData("6500", it.title?.key)?.replace("quelle\":\"\"", "quelle\":\"${it.source.orEmpty()}\"")
        )

    }


    val gridSpatialRepresentation = data.gridSpatialRepresentation
    val cellGeometry = codelists.getValue("509", gridSpatialRepresentation?.cellGeometry, "iso")
    val spatialReferences = data.spatial.references ?: emptyList()
    private val arsSpatial = spatialReferences.find { it.ars != null }
    val regionKey = if (arsSpatial == null) null else KeyValueModel(
        arsSpatial.ars,
        arsSpatial.ars!!.padEnd(12, '0')
    )

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

    val formatterISO = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSXXX")
    val formatterOnlyDate = SimpleDateFormat("yyyy-MM-dd")
    val formatterNoSeparator = SimpleDateFormat("yyyyMMddHHmmssSSS")
    var documentType = mapDocumentType()


    open val hierarchyLevel = "nonGeographicDataset"
    open val hierarchyLevelName: String? = "job"
    open val mdStandardName = "ISO19115"
    open val mdStandardVersion = "2003/Cor.1:2006"
    open val identificationType =  "gmd:MD_DataIdentification"
    val metadataLanguage = TransformationTools.getLanguageISO639_2Value(data.metadata.language)
    val dataLanguages =
        data.dataset?.languages?.map { TransformationTools.getLanguageISO639_2Value(KeyValueModel(it, null)) }
            ?: emptyList()

    val datasetCharacterSet = codelists.getValue("510", data.metadata.characterSet, "iso")
    val topicCategories = data.topicCategories?.map { codelists.getValue("527", it, "iso") } ?: emptyList()


    val spatialRepresentationTypes = data.spatialRepresentationType?.map { codelists.getValue("526", it, "iso")} ?: emptyList()
    val spatialResolution = data.resolution ?: emptyList()


    // Always use UTF-8 (see INGRID-2340)
    val metadataCharacterSet = "utf8"
    val spatialSystems = data.spatial.spatialSystems?.map {
        val referenceSystem =
            codelists.getValue("100", it) ?: throw ServerException.withReason("Unknown reference system")
        val epsgLink = when {
            // string like "EPSG:25832"
            referenceSystem.startsWith("EPSG:") -> "http://www.opengis.net/def/crs/EPSG/0/${referenceSystem.substring(5)}"
            // string like "EPSG 3857: WGS 84 / Pseudo-Mercator"
            referenceSystem.startsWith("EPSG") -> {
                val endIndex = referenceSystem.indexOf(":")
                if (endIndex > 0) "http://www.opengis.net/def/crs/EPSG/0/${referenceSystem.substring(5, endIndex)}" else null
            }
            // could not match string
            else -> null
        }
        CharacterStringModel(referenceSystem, epsgLink)
    }
    open val description = data.description
    val advProductGroups = data.advProductGroups?.map { codelists.getValue("8010", it) } ?: emptyList()
    val alternateTitle = data.alternateTitle
    val dateEvents = data.temporal.events ?: emptyList()

    val inspireKeywords = Thesaurus(
        keywords = data.themes?.map { Keyword(name = codelists.getValue("6100", it), link = null) } ?: emptyList(),
        date = "2008-06-01",
        name = "GEMET - INSPIRE themes, version 1.0"
    )
    val freeKeywords = Thesaurus(
        keywords = data.keywords?.free?.map { Keyword(name = it.label, link = null) } ?: emptyList(),
        date = null,
        name = null,
    )
    val furtherLegalBasisKeywords = Thesaurus(
        keywords = data.extraInfo?.legalBasicsDescriptions?.map {
            Keyword(
                name = codelists.getValue("1350", it),
                link = null
            )
        } ?: emptyList(),
        date = "2020-05-05",
        name = "Further legal basis",
        showType = false
    )

    // TODO after thesauri are added
    val umthesKeywords = Thesaurus(
        date = "2009-01-15",
        name = "UMTHES Thesaurus"
    )
    val gemetKeywords = Thesaurus(
        date = "2012-07-20",
        name = "GEMET - Concepts, version 3.1"
    )

    val serviceTypeKeywords = Thesaurus(
        keywords = data.service?.classification?.map { Keyword(name = codelists.getValue("5200", it, "iso"), link = null) } ?: emptyList(),
        date = "2008-06-01",
        name = "Service Classification, version 1.0"
    )
    val envTopicKeywords = Thesaurus(
        date = "2006-05-01",
        name = "German Environmental Classification - Topic, version 1.0"
    )
    val inspirePriorityKeywords = Thesaurus(
        keywords = data.priorityDatasets?.map { Keyword(name = codelists.getValue("6350", it), link = codelists.getDataField("6350", it.key, "url")) } ?: emptyList(),
        date = "2018-04-04",
        name = "INSPIRE priority data set",
        link = "http://inspire.ec.europa.eu/metadata-codelist/PriorityDataset",
        showType = false
    )
    val spatialScopeKeyword = Thesaurus(
        keywords = data.spatialScope?.let { listOf(Keyword(name = codelists.getValue("6360", it),link = codelists.getDataField("6360", it.key, "url")))  } ?: emptyList(),
        date = "2019-05-22",
        name = "Spatial scope",
        link = "http://inspire.ec.europa.eu/metadata-codelist/SpatialScope",
        showType = false
    )

    val advCompatibleKeyword =
        if (data.isAdVCompatible == true) Thesaurus(keywords = listOf(Keyword("AdVMIS"))) else Thesaurus()
    val opendataKeyword =
        if (data.isOpenData == true) Thesaurus(keywords = listOf(Keyword("opendata"))) else Thesaurus()
    val opendataCategoryKeywords = if (data.isOpenData == true) Thesaurus(
        name = "",
        keywords = this.data.openDataCategories?.map {
            Keyword(
                codelists.getValue(
                    "6400",
                    it
                )
            )
        } ?: emptyList(),
    ) else Thesaurus()
    val inspireRelevantKeyword =
        if (data.isInspireIdentified == true) Thesaurus(keywords = listOf(Keyword("inspireidentifiziert"))) else Thesaurus()

    val specificUsage = data.resource?.specificUsage
    val useLimitation = data.resource?.useLimitation


    val contentField: MutableList<String> = mutableListOf()

    private fun mapDocumentType(): String {
        return when (model.type) {
            "InGridSpecialisedTask" -> "0"
            "InGridGeoDataset" -> "1"
            "InGridLiterature" -> "2"
            "InGridGeoService" -> "3"
            "InGridProject" -> "4"
            "InGridDataCollection" -> "5"
            "InGridInformationSystem" -> "6"
            else -> throw ServerException.withReason("Could not map document type: ${model.type}")
        }
    }

    // geodataservice
    val serviceType = codelists.getValue("5300", data.service?.type, "iso")
    val serviceTypeVersions = data.service?.version?.map { codelists.getValue("5153", it, "iso") } ?: emptyList()
    val couplingType = data.service?.couplingType?.key
    val operations = data.service?.operations ?: emptyList()
    val references = data.references ?: emptyList()




    val parentIdentifier: String? = data.parentIdentifier
    val modifiedMetadataDate: String = formatDate(formatterOnlyDate, data.modifiedMetadata ?: model._contentModified)
    var pointOfContact =
        data.pointOfContact?.map { AddressModelTransformer(it.ref!!, codelists, it.type) } ?: emptyList()

    var contact =
        data.pointOfContact?.firstOrNull { codelists.getValue("505", it.type, "iso").equals("pointOfContactMd") }?.ref


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
        val namespace = catalog.settings?.config?.namespace ?: "https://registry.gdi-de.org/id/$catalogIdentifier"
        this.citationURL = namespace.suffixIfNot("/") + model.uuid // TODO: in classic IDF_UTIL.getUUIDFromString is used
    }

    fun handleContent(value: String?): String? {
        if (value == null) return null
        contentField.add(value)
        return value
    }

    fun hasDistributionInfo(): Boolean {
        return digitalTransferOptions.isNotEmpty() || distributionFormats.isNotEmpty() || data.orderInfo != null || data.references != null
    }

    fun hasCompleteVerticalExtent(): Boolean {
        return data.spatial.verticalExtent?.let {
            it.Datum != null && it.minimumValue != null && it.maximumValue != null && it.unitOfMeasure != null
        } ?: false
    }
}

enum class COORD_TYPE { Lat1, Lat2, Lon1, Lon2 }
