package de.ingrid.igeserver.profiles.ingrid.exporter

import de.ingrid.igeserver.ServerException
import de.ingrid.igeserver.exporter.TransformationTools
import de.ingrid.igeserver.exporter.model.AddressModel
import de.ingrid.igeserver.exporter.model.KeyValueModel
import de.ingrid.igeserver.exports.iso19115.Keyword
import de.ingrid.igeserver.exports.iso19115.Thesaurus
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import de.ingrid.igeserver.profiles.ingrid.exporter.model.IngridModel
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.mdek.upload.Config
import org.jetbrains.kotlin.util.suffixIfNot
import org.unbescape.json.JsonEscape
import java.text.SimpleDateFormat
import java.time.OffsetDateTime
import java.util.*

class IngridModelTransformer constructor(
    val model: IngridModel,
    val catalogIdentifier: String,
    val codelistHandler: CodelistHandler,
    val config: Config,
    val catalogService: CatalogService,
) {


    val data = model.data
    val purpose = data.resource?.purpose
    val status = getCodelistValue("523", data.temporal.status, "iso")

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

    val regionKey = if (data.spatial.regionKey != null) KeyValueModel(
        data.spatial.regionKey,
        data.spatial.regionKey.padEnd(12, '0')
    ) else null
    val spatialReferences = data.spatial.references ?: emptyList()

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

    val hierarchyLevel = "nonGeographicDataset"
    val hierarchyLevelName = "job"
    val mdStandardName = "ISO19115"
    val mdStandardVersion = "2003/Cor.1:2006"
    val metadataLanguage = TransformationTools.getLanguageISO639_2Value(data.metadata.language)
    val dataLanguages =
        data.dataset?.languages?.map { TransformationTools.getLanguageISO639_2Value(KeyValueModel(it, null)) }
            ?: emptyList()


    // Always use UTF-8 (see INGRID-2340)
    val characterSetCode = getCodelistValue("510", data.metadata.characterSet) ?: "utf8"
    val spatialSystems = data.spatial.spatialSystems?.map {
        val referenceSystem = getCodelistValue("100", it)
        val epsgCode =
            if (referenceSystem?.startsWith("EPSG") == true)
                referenceSystem.substring(5, referenceSystem.indexOf(":"))
            else null
        KeyValueModel(epsgCode, referenceSystem)
    }
    val description = data.description
    var datasetURL: String
    val advProductGroups = data.advProductGroups?.map { getCodelistValue("8010", it) } ?: emptyList()
    val alternateTitle = data.alternateTitle
    val dateEvents = data.temporal.events ?: emptyList()

    val inspireKeywords = Thesaurus(
        keywords = data.themes?.map { Keyword(name = getCodelistValue("6100", it), link = null) } ?: emptyList(),
        date = "2008-06-01",
        name = "GEMET - INSPIRE themes, version 1.0"
    )
    val freeKeywords = Thesaurus(
        keywords = data.keywords?.map { Keyword(name = it, link = null) } ?: emptyList(),
        date = null,
        name = null,
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
        date = "2008-06-01",
        name = "Service Classification, version 1.0"
    )
    val envTopicKeywords = Thesaurus(
        date = "2006-05-01",
        name = "German Environmental Classification - Topic, version 1.0"
    )
    val inspirePriorityKeywords = Thesaurus(
        date = "2018-04-04",
        name = "INSPIRE priority data set",
        link = "https://inspire.ec.europa.eu/metadata-codelist/PriorityDataset"
    )

    val advCompatibleKeyword =
        if (data.isAdVCompatible == true) Thesaurus(keywords = listOf(Keyword("AdVMIS"))) else Thesaurus()
    val opendataKeyword =
        if (data.isOpenData == true) Thesaurus(keywords = listOf(Keyword("opendata"))) else Thesaurus()
    val opendataCategoryKeywords = if (data.isOpenData == true) Thesaurus(
        name = "",
        keywords = this.data.openDataCategories?.map {
            Keyword(
                this.getCodelistValue(
                    "6400",
                    it
                )
            )
        } ?: emptyList(),
    ) else Thesaurus()
    val inspireRelevantKeyword =
        if (data.isInspireRelevant == true) Thesaurus(keywords = listOf(Keyword("inspireidentifiziert"))) else Thesaurus()

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

    val parentIdentifier: String? = data.parentIdentifier
    val modifiedMetadataDate: String = formatDate(formatterOnlyDate, data.modifiedMetadata ?: model._modified)
    var pointOfContact: AddressModel? = null

    private fun determinePointOfContact(): AddressModel? {

        val ref = data.pointOfContact
            ?.firstOrNull()
            ?.ref ?: return null

        val nonHiddenAddress = ref.getAncestorAddressesIncludingSelf(ref.id)

        return if (nonHiddenAddress.size > 0) {
            nonHiddenAddress.last()
        } else null

    }


    fun getCodelistValue(codelistId: String, entry: KeyValueModel?): String? {
        return getCodelistValue(codelistId, entry, "de")
    }

    fun getCodelistValue(codelistId: String, entry: KeyValueModel?, field: String): String? =
        if (entry?.key != null) codelistHandler.getCodelistValue(codelistId, entry.key, field) else entry?.value


    fun formatDate(formatter: SimpleDateFormat, date: OffsetDateTime): String =
        formatter.format(Date.from(date.toInstant()))

    fun getPostBoxString(): String {
        return "Postbox ${pointOfContact?.address?.poBox}, ${pointOfContact?.address?.zipPoBox ?: pointOfContact?.address?.poBox} ${pointOfContact?.address?.city}"
    }

    fun hasPoBox(): Boolean = !pointOfContact?.address?.poBox.isNullOrEmpty()


    private fun getPersonStringFromJson(address: AddressModel): String {
        return listOfNotNull(
            getCodelistValue(
                "4300",
                address.salutation
            ),
            getCodelistValue(
                "4305",
                address.academicTitle
            ),
            address.firstName,
            address.lastName
        ).joinToString(" ")
    }

    init {
        pointOfContact = determinePointOfContact()
        this.catalog = catalogService.getCatalogById(catalogIdentifier)
        this.datasetURL =
            (catalog.settings?.config?.namespace ?: "https://registry.gdi-de.org/id/${catalogIdentifier}")
                .suffixIfNot("/") + model.uuid
    }

    fun handleContent(value: String?): String? {
        if (value == null) return null
        contentField.add(value)
        return value
    }
}

enum class COORD_TYPE { Lat1, Lat2, Lon1, Lon2 }
