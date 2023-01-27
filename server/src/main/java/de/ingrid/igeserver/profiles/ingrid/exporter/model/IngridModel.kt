package de.ingrid.igeserver.profiles.ingrid.exporter.model

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.annotation.JsonProperty
import com.fasterxml.jackson.databind.annotation.JsonDeserialize
import de.ingrid.igeserver.ServerException
import de.ingrid.igeserver.exporter.model.AddressModel
import de.ingrid.igeserver.exporter.model.KeyValueModel
import de.ingrid.igeserver.exporter.model.SpatialModel
import de.ingrid.igeserver.exports.iso19115.Keyword
import de.ingrid.igeserver.exports.iso19115.Thesaurus
import de.ingrid.igeserver.persistence.postgresql.jpa.mapping.DateDeserializer
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.igeserver.utils.SpringContext
import de.ingrid.mdek.upload.Config
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
    val spatialReferences = data.spatial?.references ?: emptyList()
    lateinit var catalog: Catalog

    val formatterISO = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSXXX")
    val formatterOnlyDate = SimpleDateFormat("yyyy-MM-dd")
    val formatterNoSeparator = SimpleDateFormat("yyyyMMddHHmmssSSS")
    var documentType = mapDocumentType()

    val hierarchyLevel = "job"
    val hierarchyLevelName = "nonGeographicDataset"
    val mdStandardName = "ISO19115"
    val mdStandardVersion = "2003/Cor.1:2006"
    val metadataLanguage = getLanguageISO639_2Value(data.metadata.language)
    val dataLanguages =
        data.dataset?.languages?.map { getLanguageISO639_2Value(KeyValueModel(it, null)) } ?: emptyList()


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
    var pointOfContact: AddressModel? = null


    fun handleContent(value: String?): String? {
        if (value == null) return null
        contentField.add(value)
        return value
    }

    private fun determinePointOfContact(): AddressModel? {

        val ref = data.pointOfContact
            ?.firstOrNull()
            ?.ref ?: return null

        val nonHiddenAddress = ref.getAncestorAddressesIncludingSelf(ref.id)

        return if (nonHiddenAddress.size > 0) {
            nonHiddenAddress.last()
        } else null

    }


    private fun prepareSpatialString(spatial: SpatialModel): String {
        val coordinates =
            "${spatial.value?.lon1}, ${spatial.value?.lat1}, ${spatial.value?.lon2}, ${spatial.value?.lat2}"
        val title = spatial.title ?: ""
        return "${title}: $coordinates"
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


    fun getCodelistValue(codelistId: String, entry: KeyValueModel?): String? =
        if (entry?.key != null) codelistHandler?.getCodelistValue(codelistId, entry.key) else entry?.value


    fun formatDate(formatter: SimpleDateFormat, date: OffsetDateTime) = formatter.format(Date.from(date.toInstant()))

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
    }

    fun initialize(catalogIdentifier: String) {
        this.catalog = catalogService!!.getCatalogById(catalogIdentifier)
        this.datasetURL =
            (catalog.settings?.config?.namespace ?: "https://registry.gdi-de.org/id/${catalogIdentifier}")
                .suffixIfNot("/") + uuid
    }
}

data class AddressShort(val uuid: String, val title: String)


private fun getLanguageISO639_2Value(language: KeyValueModel): String {
    if (language.key == null) return language.value
        ?: throw ServerException.withReason("Could not map document language: $language")
    return when (language.key) {
        "150" -> "ger"
        "123" -> "eng"
        "65" -> "bul"
        "101" -> "cze"
        "103" -> "dan"
        "401" -> "spa"
        "134" -> "fin"
        "137" -> "fre"
        "164" -> "gre"
        "183" -> "hun"
        "116" -> "dut"
        "346" -> "pol"
        "348" -> "por"
        "360" -> "rum"
        "385" -> "slo"
        "386" -> "slv"
        "202" -> "ita"
        "126" -> "est"
        "247" -> "lav"
        "251" -> "lit"
        "312" -> "nno"
        "363" -> "rus"
        "413" -> "swe"
        "284" -> "mlt"
        "467" -> "wen"
        "182" -> "hsb"
        "113" -> "dsb"
        "142" -> "fry"
        "306" -> "nds"
        else -> throw ServerException.withReason("Could not map document language key: language.key")
    }


}
