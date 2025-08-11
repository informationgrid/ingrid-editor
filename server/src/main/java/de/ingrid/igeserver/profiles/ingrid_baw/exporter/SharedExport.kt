/**
 * ==================================================
 * Copyright (C) 2024-2025 wemove digital solutions GmbH
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
package de.ingrid.igeserver.profiles.ingrid_baw.exporter

import com.fasterxml.jackson.databind.JsonNode
import de.ingrid.igeserver.exporter.AddressModelTransformer
import de.ingrid.igeserver.exporter.model.Authority
import de.ingrid.igeserver.exporter.model.CharacterStringModel
import de.ingrid.igeserver.exporter.model.GeoElementType
import de.ingrid.igeserver.exporter.model.GeographicElement
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.profiles.ingrid.exporter.IngridModelTransformer
import de.ingrid.igeserver.profiles.ingrid.exporter.model.KeywordIso
import de.ingrid.igeserver.profiles.ingrid.exporter.model.Thesaurus
import de.ingrid.igeserver.profiles.ingrid_baw.exporter.transformer.GeodatasetTransformerBaw
import de.ingrid.igeserver.profiles.ingrid_baw.exporter.transformer.GeoserviceTransformerBaw
import de.ingrid.igeserver.profiles.ingrid_baw.exporter.transformer.ProjectModelTransformerBaw
import de.ingrid.igeserver.profiles.ingrid_baw.exporter.transformer.PublicationModelTransformerBaw
import de.ingrid.igeserver.utils.getDouble
import de.ingrid.igeserver.utils.getPath
import de.ingrid.igeserver.utils.getString
import de.ingrid.igeserver.utils.mapToKeyValue
import org.springframework.dao.EmptyResultDataAccessException
import java.time.Instant
import java.time.ZoneId
import kotlin.reflect.KClass

fun getBawModelTransformerClass(docType: String): KClass<out Any>? = when (docType) {
    "InGridGeoDataset" -> GeodatasetTransformerBaw::class
    "BawMeasurement" -> GeodatasetTransformerBaw::class
    "BawSimulation" -> GeodatasetTransformerBaw::class
    "InGridGeoService" -> GeoserviceTransformerBaw::class
    "BawPublication" -> PublicationModelTransformerBaw::class
    "InGridProject" -> ProjectModelTransformerBaw::class
    "PublicationAddressDoc" -> AddressModelTransformer::class
    else -> null
}

fun getBawTemplateForDocType(docType: String): String? = when (docType) {
    "InGridGeoDataset" -> "export/ingrid-baw/idf-geodataset-baw.jte"
    "BawMeasurement" -> "export/ingrid-baw/idf-geodataset-baw.jte"
    "BawSimulation" -> "export/ingrid-baw/idf-geodataset-baw.jte"
    "BawPublication" -> "export/ingrid-baw/idf-publication-baw.jte"
    "PublicationAddressDoc" -> "export/ingrid/idf/idf-address.jte"
    "InGridProject" -> "export/ingrid-baw/idf-project-baw.jte"
//    "InGridGeoService" -> "export/ingrid-baw/idf-geodataservice-baw.jte"
//    "InGridSoftware" -> "export/ingrid-baw/idf-software-baw.jte"
    else -> null
}

fun mapDocumentTypeBaw(type: String): String? = when (type) {
    "BawMeasurement",
    "BawSimulation",
    -> "1" // InGridGeoDataset
    "BawPublication" -> "2" // InGridPublication
    else -> null
}

fun getParentIdentifierBaw(transformer: IngridModelTransformer): String? = transformer.data.parentIdentifier ?: getIdentifierFromParent(transformer)

private fun getIdentifierFromParent(transformer: IngridModelTransformer): String? {
    val wrapper = transformer.documentService.getWrapperById(transformer.doc.wrapperId!!)
    if (wrapper.type == "FOLDER" || wrapper.parent == null) return null

    val parentDoc = try {
        transformer.documentService.getLastPublishedDocument(transformer.catalogIdentifier, wrapper.getParentUuid()!!)
    } catch (_: EmptyResultDataAccessException) {
        // no published document found
        null
    }
    return parentDoc?.data?.getString("identifier")?.let { id -> transformer.addNamespaceIfNeeded(id) }
}

fun getPlainBawKeywords(transformer: IngridModelTransformer): List<String> = transformer.doc.data.getPath("keywords.bawKeywords")
    ?.mapNotNull { it.mapToKeyValue() }
    ?.mapNotNull { transformer.codelists.getValue("3950005", it) }
    ?: emptyList()

fun getBawKeywords(transformer: IngridModelTransformer): Thesaurus = Thesaurus(
    "BAW-Schlagwortkatalog",
    "2012-01-01",
    showType = true,
    type = "discipline",
    keywords = transformer.doc.data.getPath("keywords.bawKeywords")
        ?.mapNotNull { it.mapToKeyValue() }
        ?.map {
            KeywordIso(
                name = transformer.codelists.getValue("3950005", it),
                link = null,
            )
        }
        ?: emptyList(),
)

data class BwastrInfo(
    val title: String,
    val bwastrId: String,
    val start: String,
    val end: String,
)
fun getBwastrForIndex(transformerBaw: IngridModelTransformer) = transformerBaw.doc.data.getPath("spatial.references")?.filter { it.getString("type") == "bwastr" }?.map {
    BwastrInfo(
        title = it.getString("title") ?: "",
        bwastrId = it.getString("bwastr.bwastrid") ?: "",
        start = it.getString("bwastr.start") ?: "",
        end = it.getString("bwastr.end") ?: "",
    )
} ?: emptyList()

data class Abteilung(
    val short: String,
    val long: String,
)
val abteilungsMap = mapOf(
    "9341dbb5-4e09-3fca-b343-2990fc935761" to Abteilung("b", "Bautechnik"),
    "88b9d568-288e-391f-9649-af31fc0fc128" to Abteilung("g", "Geotechnik"),
    "30d30a3b-27fe-3470-aec2-63183b8052ce" to Abteilung("w", "Wasserbau im Binnenbereich"),
    "eaaf4d0d-44cd-356e-a3e3-520191945ca5" to Abteilung("k", "Wasserbau im Küstenbereich"),
    "d28ee28e-83d3-3996-aaf7-d053a05ec7ff" to Abteilung("z", "Zentraler Service"),
)
fun getAbteilung(transformerBaw: IngridModelTransformer) = transformerBaw.doc.data.getPath("pointOfContact")
    // Ansprechpartner
    ?.filter { it.getString("type.key") == "7" }
    // use first match only for now
    ?.firstNotNullOfOrNull { abteilungsMap[it.getString("ref")] } ?: Abteilung("", "")

fun getBwastrGeographicElements(transformer: IngridModelTransformer) = (
    transformer.doc.data.getPath("spatial.references")?.filter { it.getString("type") == "bwastr" }?.map {
        GeographicElement(
            type = GeoElementType.DESCRIPTION,
            geographicIdentifier = (
                // Use the BWASTR code with start and end as the geographic identifier if available, otherwise fall back to the title
                getBwastrCode(it.get("bwastr"))
                    ?: it.getString("title")
                )?.let { text ->
                CharacterStringModel(
                    text,
                    null,
                )
            },
            authority = Authority(
                title = "VV-WSV 1103",
                date = "2019-05-29",
            ),
        )
    } ?: emptyList()
    )

private fun getBwastrCode(bwastrNode: JsonNode): String? {
    val bwastrId = bwastrNode.getString("bwastrid")
    val kmStart = bwastrNode.getDouble("start")
    val kmEnd = bwastrNode.getDouble("end")

    return if (bwastrId != null && kmStart != null && kmEnd != null) {
        "$bwastrId-$kmStart-$kmEnd"
    } else {
        null
    }
}

data class LiteratureAggregate(
    val uuid: String,
    val title: String,
    val pubDate: String?,
    val identifiers: List<String>,
    val citedParties: List<CitedResponsibleParty>,
)

data class CitedResponsibleParty(
    val uuid: String,
    val individualName: String?,
    val organisationName: String?,
    val role: String,
)

fun getLiteratureAggregates(transformer: IngridModelTransformer): List<LiteratureAggregate> = transformer.doc.data.getPath("literatureReferences")?.mapNotNull {
    val litDoc = transformer.documentService.getLastPublishedDocument(transformer.catalogIdentifier, it.getString("uuid")!!)
    calcLiteratureAggregate(transformer, litDoc)
} ?: emptyList()

private fun calcLiteratureAggregate(transformer: IngridModelTransformer, litDoc: Document): LiteratureAggregate = LiteratureAggregate(
    uuid = litDoc.uuid,
    title = litDoc.title!!,
    pubDate = extractPublicationDate(litDoc.data),
    identifiers = extractIdentifiers(litDoc.data),
    citedParties = extractCitedParties(transformer, litDoc.data),
)

private fun extractPublicationDate(data: JsonNode): String? = data.getPath("temporal.events")?.find {
    it.getString("referenceDateType.key") == "2" // Publication
}?.getString("referenceDate")?.let { dateString ->
    // Parse ISO datetime string and convert to local date
    val instant = Instant.parse(dateString)
    val localDate = instant.atZone(ZoneId.systemDefault()).toLocalDate()
    localDate.toString()
}

private fun extractIdentifiers(data: JsonNode): List<String> = listOfNotNull(
    data.getString("publication.doi")?.let { "https://doi.org/$it" },
    data.getPath("publication.additionalIdentifiers")?.find {
        it.getString("type.key") == "1" // Handle
    }?.getString("value"),
)

private val addressTypeMapping = mapOf(
    "10" to "author",
    "11" to "publisher",
)
private fun extractCitedParties(transformer: IngridModelTransformer, data: JsonNode): List<CitedResponsibleParty> = data.getPath("pointOfContact")
    ?.filter { addressTypeMapping.containsKey(it.getString("type.key")) }?.map {
        val party = transformer.documentService.getLastPublishedDocument(transformer.catalogIdentifier, it.getString("ref")!!)

        CitedResponsibleParty(
            uuid = party.uuid,
            individualName = createIndividualName(party.data),
            organisationName = party.data.getString("organization"),
            role = addressTypeMapping.getValue(it.getString("type.key")!!),
        )
    } ?: emptyList()

private fun createIndividualName(partyData: JsonNode): String? {
    val firstName = partyData.getString("firstName") ?: return null
    val lastName = partyData.getString("lastName") ?: return null
    return "$firstName, $lastName"
}
