package de.ingrid.igeserver.profiles.ingrid.exporter.model

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.annotation.JsonProperty
import com.fasterxml.jackson.databind.annotation.JsonDeserialize
import de.ingrid.igeserver.ServerException
import de.ingrid.igeserver.exporter.TransformationTools
import de.ingrid.igeserver.exporter.model.AddressModel
import de.ingrid.igeserver.exporter.model.KeyValueModel
import de.ingrid.igeserver.exports.iso19115.Keyword
import de.ingrid.igeserver.exports.iso19115.Thesaurus
import de.ingrid.igeserver.persistence.postgresql.jpa.mapping.DateDeserializer
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.igeserver.utils.SpringContext
import de.ingrid.mdek.upload.Config
import org.apache.commons.text.StringEscapeUtils
import org.jetbrains.kotlin.util.suffixIfNot
import java.text.SimpleDateFormat
import java.time.OffsetDateTime
import java.util.*

@JsonIgnoreProperties(ignoreUnknown = true)
data class IngridModel(
    @JsonProperty("_uuid") val uuid: String,
    @JsonProperty("_type") val type: String,
    val title: String,
    val data: DataModel,
    @JsonDeserialize(using = DateDeserializer::class)
    val _created: OffsetDateTime,
    @JsonDeserialize(using = DateDeserializer::class)
    val _modified: OffsetDateTime,
) {

    val resourceDateType = data.temporal.resourceDateType?.key
    val resourceDate = data.temporal.resourceDate
    val resourceDateStart = data.temporal.resourceRange?.start
    val resourceDateEnd = data.temporal.resourceRange?.end
    val resourceDateTypeSince = data.temporal.resourceDateTypeSince?.key


    val regionKey =  if (data.spatial?.regionKey != null) KeyValueModel( data.spatial.regionKey, data.spatial.regionKey.padEnd(12,'0')) else null
    val spatialReferences = data.spatial?.references ?: emptyList()

    fun getSpatialReferenceComponents( type: COORD_TYPE): String {
        return spatialReferences.filter {
            it.value != null
        }.map {
            // null check is done above
            when(type) {
                COORD_TYPE.Lat1 -> it.value!!.lat1
                COORD_TYPE.Lat2 -> it.value!!.lat2
                COORD_TYPE.Lon1 -> it.value!!.lon1
                COORD_TYPE.Lon2 -> it.value!!.lon2
            }
        }.joinToString(",","[", "]")
    }
    fun getSpatialReferenceLocationNames(): String {
        return spatialReferences.filter {
            // TODO check if filter is necessary
            it.value != null
        }.map {
            it.title
        }.joinToString(",","[", "]")
    }

    lateinit var catalog: Catalog

    val formatterISO = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSXXX")
    val formatterOnlyDate = SimpleDateFormat("yyyy-MM-dd")
    val formatterNoSeparator = SimpleDateFormat("yyyyMMddHHmmssSSS")
    var documentType = mapDocumentType()

    val hierarchyLevel = "job"
    val hierarchyLevelName = "nonGeographicDataset"
    val mdStandardName = "ISO19115"
    val mdStandardVersion = "2003/Cor.1:2006"
    val metadataLanguage = TransformationTools.getLanguageISO639_2Value(data.metadata.language)
    val dataLanguages =
        data.dataset?.languages?.map { TransformationTools.getLanguageISO639_2Value(KeyValueModel(it, null)) } ?: emptyList()


    // Always use UTF-8 (see INGRID-2340)
    val characterSetCode = getCodelistValue("510", data.metadata.characterSet) ?: "utf8"
    val spatialSystems = data.spatial?.spatialSystems?.map {
        val referenceSystem = getCodelistValue("100", it)
        val epsgCode = if (referenceSystem?.startsWith("EPSG") == true) referenceSystem.substring(
            5,
            referenceSystem.indexOf(":")
        ) else null
        KeyValueModel(epsgCode, referenceSystem)
    }
    val description = data.description
    lateinit var datasetURL: String
    val advProductGroups = data.advProductGroups?.map { getCodelistValue("8010", it) } ?: emptyList()
    val alternateTitle = data.alternateTitle
    val dateEvents = data.temporal.events ?: emptyList()

    val inspireKeywords = Thesaurus(
        keywords = data.themes?.map { Keyword(name = getCodelistValue("6100", it), link = null) },
        date = "2008-06-01",
        name = "GEMET - INSPIRE themes, version 1.0"
    )
    val freeKeywords = Thesaurus(
        keywords = data.keywords?.map { Keyword(name = it, link = null) },
        date = null,
        name = null,
    )

    // TODO after thesauri are added
    val umthesKeywords = Thesaurus(
        keywords = null,
        date = "2009-01-15",
        name = "UMTHES Thesaurus"
    )
    val gemetKeywords = Thesaurus(
        keywords = null,
        date = "2012-07-20",
        name = "GEMET - Concepts, version 3.1"
    )
    val serviceTypeKeywords = Thesaurus(
        keywords = null,
        date = "2008-06-01",
        name = "Service Classification, version 1.0"
    )
    val envTopicKeywords = Thesaurus(
        keywords = null,
        date = "2006-05-01",
        name = "German Environmental Classification - Topic, version 1.0"
    )
    val inspirePriorityKeywords = Thesaurus(
        keywords = null,
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
        },
    ) else Thesaurus()
    val inspireRelevantKeyword =
        if (data.isInspireRelevant == true) Thesaurus(keywords = listOf(Keyword("inspireidentifiziert"))) else Thesaurus()

    val contentField: MutableList<String> = mutableListOf()

    private fun mapDocumentType(): String {
        return when (type) {
            "InGridSpecialisedTask" -> "0"
            "InGridGeoDataset" -> "1"
            "InGridLiterature" -> "2"
            "InGridGeoService" -> "3"
            "InGridProject" -> "4"
            "InGridDataCollection" -> "5"
            "InGridInformationSystem" -> "6"
            else -> throw ServerException.withReason("Could not map document type: $type")
        }
    }

    val parentIdentifier: String? = data.parentIdentifier
    val modifiedMetadataDate: String =  formatDate(formatterOnlyDate, data.modifiedMetadata ?: _modified)
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

    companion object {
        val codelistHandler: CodelistHandler? by lazy {
            SpringContext.getBean(CodelistHandler::class.java)
        }
        val config: Config? by lazy {
            SpringContext.getBean(Config::class.java)
        }
        val catalogService: CatalogService? by lazy {
            SpringContext.getBean(CatalogService::class.java)
        }
    }

    fun getCodelistValue(codelistId: String, entry: KeyValueModel?): String? {
        return getCodelistValue(codelistId, entry, "de")
    }
    fun getCodelistValue(codelistId: String, entry: KeyValueModel?, field: String): String? =
        if (entry?.key != null) codelistHandler?.getCodelistValue(codelistId, entry.key, field) else entry?.value


    fun formatDate(formatter: SimpleDateFormat, date: OffsetDateTime): String = formatter.format(Date.from(date.toInstant()))

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

    fun getVerticalExtentISO(): String? {
        val verticalExtent = data.spatial.verticalExtent ?: return null
        return """
                    <gmd:verticalElement>
                        <gmd:EX_VerticalExtent>
                            <gmd:minimumValue>
                                <gco:Real>${verticalExtent.minimumValue}</gco:Real>
                            </gmd:minimumValue>
                            <gmd:maximumValue>
                                <gco:Real>${verticalExtent.maximumValue}</gco:Real>
                            </gmd:maximumValue>
                            <gmd:verticalCRS>
                                <gml:VerticalCRS gml:id="verticalCRSN_ID_${TransformationTools.getRandomUUID()}">
                                    <gml:identifier codeSpace=""/>
                                    <gml:scope/>
                                    <gml:verticalCS>
                                        <gml:VerticalCS gml:id="verticalCS_ID_${TransformationTools.getRandomUUID()}">
                                            <gml:identifier codeSpace=""/>
                                            <gml:axis>
                                                <gml:CoordinateSystemAxis gml:id="coordinateSystemAxis_ID_${TransformationTools.getRandomUUID()}" uom="${
            StringEscapeUtils.escapeXml10(
                getCodelistValue("102", verticalExtent.unitOfMeasure, "iso")
            )
        }">
                                                    <gml:identifier codeSpace=""/>
                                                    <gml:axisAbbrev/>
                                                    <gml:axisDirection codeSpace=""/>
                                                </gml:CoordinateSystemAxis>
                                            </gml:axis>
                                        </gml:VerticalCS>
                                    </gml:verticalCS>
                                    <gml:verticalDatum>
                                        <gml:VerticalDatum gml:id="verticalDatum_ID_${TransformationTools.getRandomUUID()}">
                                            <gml:identifier codeSpace=""/>
                                            <gml:name>${
            StringEscapeUtils.escapeXml10(getCodelistValue("101", verticalExtent.Datum))
        }</gml:name>
                                            <gml:scope/>
                                        </gml:VerticalDatum>
                                    </gml:verticalDatum>
                                </gml:VerticalCRS>
                            </gmd:verticalCRS>
                        </gmd:EX_VerticalExtent>
                    </gmd:verticalElement>
        """.trimIndent()
    }

    init {
        pointOfContact = determinePointOfContact()
    }

    fun initialize(catalogIdentifier: String) {
        this.catalog = catalogService!!.getCatalogById(catalogIdentifier)
        this.datasetURL =
            (catalog.settings?.config?.namespace ?: "https://registry.gdi-de.org/id/${catalogIdentifier}")
                .suffixIfNot("/") + uuid
    }

    fun handleContent(value: String?): String? {
        if (value == null) return null
        contentField.add(value)
        return value
    }
}

enum class COORD_TYPE { Lat1, Lat2, Lon1, Lon2 }





