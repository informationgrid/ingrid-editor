/*
 * ==================================================
 * Copyright (C) 2024-2026 wemove digital solutions GmbH
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
import de.ingrid.igeserver.exporter.model.Authority
import de.ingrid.igeserver.exporter.model.CharacterStringModel
import de.ingrid.igeserver.exporter.model.GeoElementType
import de.ingrid.igeserver.exporter.model.GeographicElement
import de.ingrid.igeserver.persistence.model.document.IncomingReferenceOptions
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.profiles.ingrid.exporter.IngridModelTransformer
import de.ingrid.igeserver.profiles.ingrid.exporter.model.AttachedField
import de.ingrid.igeserver.profiles.ingrid.exporter.model.KeywordIso
import de.ingrid.igeserver.profiles.ingrid.exporter.model.ServiceUrl
import de.ingrid.igeserver.profiles.ingrid.exporter.model.Thesaurus
import de.ingrid.igeserver.profiles.ingrid.types.InGridDocType
import de.ingrid.igeserver.profiles.ingrid.types.IngridIncomingReferenceOptions
import de.ingrid.igeserver.profiles.ingrid_baw.exporter.transformer.AddressModelTransformerBaw
import de.ingrid.igeserver.profiles.ingrid_baw.exporter.transformer.GeodatasetTransformerBaw
import de.ingrid.igeserver.profiles.ingrid_baw.exporter.transformer.GeoserviceTransformerBaw
import de.ingrid.igeserver.profiles.ingrid_baw.exporter.transformer.ProjectModelTransformerBaw
import de.ingrid.igeserver.profiles.ingrid_baw.exporter.transformer.PublicationModelTransformerBaw
import de.ingrid.igeserver.profiles.ingrid_baw.exporter.transformer.SoftwareModelTransformerBaw
import de.ingrid.igeserver.utils.getBoolean
import de.ingrid.igeserver.utils.getDouble
import de.ingrid.igeserver.utils.getInteger
import de.ingrid.igeserver.utils.getPath
import de.ingrid.igeserver.utils.getString
import de.ingrid.igeserver.utils.mapToKeyValue
import de.ingrid.igeserver.utils.prefixIfNot
import java.text.NumberFormat
import java.time.Instant
import java.time.ZoneId
import java.util.*
import kotlin.reflect.KClass

fun getBawModelTransformerClass(docType: String): KClass<out Any>? = when (docType) {
    "InGridGeoDataset" -> GeodatasetTransformerBaw::class
    "BawMeasurement" -> GeodatasetTransformerBaw::class
    "BawSimulation" -> GeodatasetTransformerBaw::class
    "BawLaboratoryData" -> GeodatasetTransformerBaw::class
    "InGridGeoService" -> GeoserviceTransformerBaw::class
    "BawPublication" -> PublicationModelTransformerBaw::class
    "InGridProject" -> ProjectModelTransformerBaw::class
    "InGridInformationSystem" -> SoftwareModelTransformerBaw::class
    "PublicationAddressDoc" -> AddressModelTransformerBaw::class
    "InGridOrganisationDoc" -> AddressModelTransformerBaw::class
    "InGridPersonDoc" -> AddressModelTransformerBaw::class
    else -> null
}

fun getBawTemplateForDocType(docType: String): String? = when (docType) {
    "InGridGeoDataset" -> "export/ingrid-baw/idf-geodataset-baw.jte"
    "BawMeasurement" -> "export/ingrid-baw/idf-geodataset-baw.jte"
    "BawSimulation" -> "export/ingrid-baw/idf-geodataset-baw.jte"
    "BawLaboratoryData" -> "export/ingrid-baw/idf-geodataset-baw.jte"
    "BawPublication" -> "export/ingrid-baw/idf-publication-baw.jte"
    "PublicationAddressDoc" -> "export/ingrid/idf/idf-address.jte"
    "InGridProject" -> "export/ingrid-baw/idf-project-baw.jte"
    "InGridInformationSystem" -> "export/ingrid-baw/idf-software-baw.jte"
    else -> null
}

fun mapDocumentTypeBaw(type: String): String? = when (type) {
    "BawMeasurement", "BawSimulation", "BawLaboratoryData" -> InGridDocType.InGridGeoDataset.typeId
    "BawPublication" -> InGridDocType.InGridPublication.typeId
    else -> null
}

/**
 * Get the parent identifier of a document.
 * @param transformer The transformer instance.
 * @return The uuid of the parent object, or `null` if the document has no parent or the parent is a folder.
 */
fun getParentIdentifierBaw(transformer: IngridModelTransformer): String? {
    val wrapper = transformer.documentService.getWrapperById(transformer.doc.wrapperId!!)
    return if (wrapper.parent != null && wrapper.parent?.type != "FOLDER") wrapper.parent?.uuid else null
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

fun getSubsoilKeywords(transformer: IngridModelTransformer): Thesaurus = Thesaurus(
    "Baugrunddynamik-Schlagwortkatalog",
    "2012-01-01",
    showType = true,
    type = "discipline",
    keywords = transformer.doc.data.getPath("keywords.subsoilKeywords")
        ?.mapNotNull { it.mapToKeyValue() }
        ?.map {
            KeywordIso(
                name = transformer.codelists.getValue("3950007", it),
            )
        }
        ?: emptyList(),
)

fun getOrderInfoValue(transformer: IngridModelTransformer): String? = transformer.doc.data.getPath("bawOrderInfo")?.mapToKeyValue()
    ?.let { transformer.codelists.getValue("bawOrderInfo", it) }

fun getOrderNumber(transformer: IngridModelTransformer): String? {
    val orderInfoValue = getOrderInfoValue(transformer)
    return orderInfoValue?.substringBefore(" - ")?.trim()
}

fun getOrderTitle(transformer: IngridModelTransformer): String? {
    val orderInfoValue = getOrderInfoValue(transformer)
    return orderInfoValue?.substringAfter(" - ")?.trim()
}

fun getLfsReferences(modelTransformer: IngridModelTransformer) = modelTransformer.doc.data.getPath("lfsReferences")?.mapNotNull {
    ServiceUrl(
        name = it.getString("title") ?: "???",
        url = modelTransformer.transformUrl(
            it.getString("file.uuid")?.let { path ->
                // add LFS prefix for legacy data where necessary (LFS/KA/ or LFS/HH/ paths)
                val finalPath =
                    if (path.startsWith("KA/") || path.startsWith("HH/")) path.prefixIfNot("LFS/") else path
                "https://dl.datenfinder.baw.de/$finalPath"
            },
        )
            ?: return@mapNotNull null,
        description = it.getString("explanation"),
        functionValue = "download",
        attachedToField = AttachedField("2000", "9900", "Datendownload"),
        applicationProfile = modelTransformer.codelists.getValue("1320", it.getPath("fileFormat")?.mapToKeyValue()),
    )
} ?: emptyList()

data class BwastrInfo(
    val title: String,
    val bwastrId: String,
    val name: String,
    val streckenName: String,
    val start: String,
    val end: String,
)

fun getBwastrInfos(transformerBaw: IngridModelTransformer) = transformerBaw.doc.data.getPath("spatial.references")?.filter { it.getString("type") == "bwastr" }?.map {
    BwastrInfo(
        title = it.getString("title") ?: "",
        bwastrId = it.getString("bwastr.bwastrid") ?: "",
        name = it.getString("bwastr.bwastr_name") ?: "",
        streckenName = it.getString("bwastr.strecken_name") ?: "",
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
            geographicIdentifier = CharacterStringModel(getBwastrCode(it.get("bwastr")), null),
            authority = Authority(
                title = "VV-WSV 1103",
                date = "2019-05-29",
            ),
        )
    } ?: emptyList()
    )

fun getBwastrIdfSection(transformer: IngridModelTransformer): String {
    val sections = getBwastrInfos(transformer)
    val name = if (sections.size == 1) sections[0].name else sections.joinToString(", ", "[", "]") { it.name }
    val streckenName =
        if (sections.size == 1) sections[0].streckenName else sections.joinToString(", ", "[", "]") { it.streckenName }

    return """
            <idf:additionalDataSection id="bawDmqsAdditionalFields">
                <idf:title lang="de">BAW DMQS Zusatzfelder</idf:title>
                <idf:additionalDataField id="bwstr-bwastr_name">
                    <idf:title lang="de">Bwstr Name</idf:title>
                    <idf:data>$name</idf:data>
                </idf:additionalDataField>
                <idf:additionalDataField id="bwstr-strecken_name">
                    <idf:title lang="de">Bwstr Streckenname</idf:title>
                    <idf:data>$streckenName</idf:data>
                </idf:additionalDataField>
            </idf:additionalDataSection>
    """.trimIndent()
}

private fun getBwastrCode(bwastrNode: JsonNode): String {
    val bwastrId = bwastrNode.getString("bwastrid")?.padStart(4, '0')
        ?: throw IllegalArgumentException("No bwastrid found: $bwastrNode")
    val kmStart = bwastrNode.getDouble("start")?.let { formatDouble(it) }
    val kmEnd = bwastrNode.getDouble("end")?.let { formatDouble(it) }
    val name = bwastrNode.getString("bwastr_name")
    val strecke = bwastrNode.getString("streckenName")?.let { ", $it" } ?: ""

    return if (kmStart != null && kmEnd != null) {
        "$bwastrId-$kmStart-$kmEnd"
    } else {
        "$name$strecke - [$bwastrId]"
    }
}

// Use NumberFormat to cap at 3 fraction digits and strip trailing zeros/decimal point.
private fun formatDouble(value: Double?): String? = value?.let {
    val nf = NumberFormat.getInstance(Locale.ENGLISH).apply {
        minimumFractionDigits = 0
        maximumFractionDigits = 3
        isGroupingUsed = false
    }
    nf.format(it)
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
    val litDoc =
        transformer.addressExporter.getLastPublishedDocument(it.getString("uuid")!!) ?: return@mapNotNull null
    calcLiteratureAggregate(transformer, litDoc)
} ?: emptyList()

fun getBautechnikSimulation(transformer: IngridModelTransformer): BautechnikSimulationBaw? {
    if (transformer.doc.type != "BawSimulation") return null
    val data = transformer.doc.data.getPath("simulationPhases")?.find { it.getString("type") == "bautechnikSimulation" }
        ?: return null

    fun getList(path: String): List<String> = data.getPath(path)?.map { node ->
        node.getString("value") ?: node.asText()
    }?.filter { it.isNotBlank() } ?: emptyList()

    val softwareNode = data.getPath("software")
    val software = if (softwareNode != null) {
        SoftwareBaw(
            name = softwareNode.getString("name"),
            version = softwareNode.getString("version"),
        )
    } else {
        null
    }

    val calcNode = data.getPath("calculationConcept")
    val calculationConcept = if (calcNode != null) {
        CalculationConceptBaw(
            materialLinear = calcNode.getBoolean("isMaterialLinear"),
            geometricLinear = calcNode.getBoolean("isGeometricLinear"),
            imperfections = calcNode.getBoolean("hasImperfections"),
        )
    } else {
        null
    }

    val matParamsNode = data.getPath("materialParameters")
    val materialParameters = if (matParamsNode != null) {
        MaterialParametersBaw(
            reinforcement = matParamsNode.getPath("reinforcement")?.map { ReinforcementBaw(it.getDouble("yieldLimit")) }
                ?: emptyList(),
            steel = matParamsNode.getPath("steel")?.map { SteelBaw(it.getDouble("yieldLimit")) } ?: emptyList(),
            concrete = matParamsNode.getPath("concrete")?.map {
                ConcreteBaw(
                    it.getDouble("compressiveStrength"),
                    it.getPath("unitOfMeasure")?.mapToKeyValue()
                        ?.let { e -> transformer.codelists.getValue("BAW_simulationConcreteUnit", e) },
                )
            } ?: emptyList(),
        )
    } else {
        null
    }

    return BautechnikSimulationBaw(
        software = software,
        objects = getList("object"),
        objectParts = getList("objectPart"),
        researchGoals = getList("researchGoal"),
        spatialDimension = data.getPath("dimension.spatialDimension")?.mapToKeyValue()?.let { transformer.codelists.getValue("BAW_simulationSpatialDimension", it) },
        timeDimension = data.getBoolean("dimension.timeDimension"),
        levels = getList("level"),
        phases = getList("phase"),
        calculationConcept = calculationConcept,
        materials = getList("materials"),
        materialParameters = materialParameters,
        materialModels = getList("materialModel"),
        elementTypes = getList("elementTypes"),
        effects = getList("effects"),
        physics = getList("physics"),
        analysisTypes = getList("analysisType"),
    )
}

fun getCfdSimulation(transformer: IngridModelTransformer): CfdSimulationBaw? {
    if (transformer.doc.type != "BawSimulation") return null
    val data = transformer.doc.data.getPath("simulationPhases")?.find { it.getString("type") == "cfdSimulation" }
        ?: return null

    return CfdSimulationBaw(
        shipNames = data.getPath("shipName")?.mapNotNull { it.mapToKeyValue()?.value } ?: emptyList(),
        physics = data.getPath("physics")?.mapToKeyValue()?.value,
        constantCrossSection = data.getBoolean("properties.constantCrossSection"),
        propulsion = data.getBoolean("properties.propulsion"),
        movementType = data.getPath("movementType")?.mapToKeyValue()?.value,
        trajectory = data.getPath("trajectory")?.mapToKeyValue()?.value,
        cellCount = data.getInteger("cellCount"),
    )
}

data class SoftwareBaw(
    val name: String?,
    val version: String?,
)

data class CalculationConceptBaw(
    val materialLinear: Boolean?,
    val geometricLinear: Boolean?,
    val imperfections: Boolean?,
)

data class ReinforcementBaw(
    val yieldLimit: Double?,
)

data class SteelBaw(
    val yieldLimit: Double?,
)

data class ConcreteBaw(
    val value: Double?,
    val unit: String?,
)

data class MaterialParametersBaw(
    val reinforcement: List<ReinforcementBaw>,
    val steel: List<SteelBaw>,
    val concrete: List<ConcreteBaw>,
)

data class BautechnikSimulationBaw(
    val software: SoftwareBaw?,
    val objects: List<String>,
    val objectParts: List<String>,
    val researchGoals: List<String>,
    val spatialDimension: String?,
    val timeDimension: Boolean?,
    val levels: List<String>,
    val phases: List<String>,
    val calculationConcept: CalculationConceptBaw?,
    val materials: List<String>,
    val materialParameters: MaterialParametersBaw?,
    val materialModels: List<String>,
    val elementTypes: List<String>,
    val effects: List<String>,
    val physics: List<String>,
    val analysisTypes: List<String>,
)

data class CfdSimulationBaw(
    val shipNames: List<String>,
    val physics: String?,
    val constantCrossSection: Boolean?,
    val propulsion: Boolean?,
    val movementType: String?,
    val trajectory: String?,
    val cellCount: Int?,
)

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
    "11" to "author",
    "10" to "publisher",
)

private fun extractCitedParties(transformer: IngridModelTransformer, data: JsonNode): List<CitedResponsibleParty> = data.getPath("pointOfContact")
    ?.filter { addressTypeMapping.containsKey(it.getString("type.key")) }?.map {
        val party = transformer.documentService.getLastPublishedDocument(
            transformer.catalogIdentifier,
            it.getString("ref")!!,
        )

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
    return "$lastName, $firstName"
}

/**
 * Whitelist of allowed BAW domains for transformed URLs.
 * The single source of truth for defaults lives in `BawProperties`.
 * This holder is intentionally initialized empty and populated once at startup
 * by `BawProfile` from Spring Boot properties (key `profile.baw.domain-whitelist`).
 */
object BawPropertiesHolder {
    @Volatile
    var domainWhitelist: List<String> = emptyList()
}

fun transformUrlForDatenrepository(url: String?): String? {
    // Skip URLs that are not BAW related
    if (url == null || !url.contains("baw.de")) return url

    // adapt datenfinder download URLs to datenrepository URL
    val cleanUrl =
        url.replace("dl.datenfinder.baw.de/LFS/KA/", "dl.datenrepository.baw.de/")
            .replace("dl.datenfinder.baw.de/LFS/HH/", "dl.datenrepository.baw.de/")
            .replace("dl.datenfinder.baw.de", "dl.datenrepository.baw.de")

    // Only allow URLs that are in the domain whitelist. Return null for other URLs.
    val whitelist = BawPropertiesHolder.domainWhitelist
    return if (whitelist.any { cleanUrl.contains(it) }) cleanUrl else null
}

fun convertToIngridOptionsWithStructuralChildren(options: IncomingReferenceOptions): IngridIncomingReferenceOptions {
    val ingridOptions = options as? IngridIncomingReferenceOptions
        ?: IngridIncomingReferenceOptions(docStateFilter = options.docStateFilter)
    return ingridOptions.copy(addStructuralChildren = true)
}
