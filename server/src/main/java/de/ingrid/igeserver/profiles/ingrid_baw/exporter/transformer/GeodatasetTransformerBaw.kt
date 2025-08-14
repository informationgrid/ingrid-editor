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
package de.ingrid.igeserver.profiles.ingrid_baw.exporter.transformer

import de.ingrid.igeserver.exporter.model.GeographicElement
import de.ingrid.igeserver.profiles.ingrid.exporter.GeodatasetModelTransformer
import de.ingrid.igeserver.profiles.ingrid.exporter.TransformerConfig
import de.ingrid.igeserver.profiles.ingrid.exporter.model.KeywordIso
import de.ingrid.igeserver.profiles.ingrid.exporter.model.Thesaurus
import de.ingrid.igeserver.profiles.ingrid_baw.exporter.getBawKeywords
import de.ingrid.igeserver.profiles.ingrid_baw.exporter.getBwastrGeographicElements
import de.ingrid.igeserver.profiles.ingrid_baw.exporter.getLiteratureAggregates
import de.ingrid.igeserver.profiles.ingrid_baw.exporter.getParentIdentifierBaw
import de.ingrid.igeserver.profiles.ingrid_baw.exporter.mapDocumentTypeBaw
import de.ingrid.igeserver.utils.getDouble
import de.ingrid.igeserver.utils.getPath
import de.ingrid.igeserver.utils.getString
import de.ingrid.igeserver.utils.mapToKeyValue

class GeodatasetTransformerBaw(transformerConfig: TransformerConfig) : GeodatasetModelTransformer(transformerConfig) {

    override fun mapDocumentType(type: String): String = mapDocumentTypeBaw(type) ?: super.mapDocumentType(type)
    override val linkToVerticalCRS = true
    override fun getParentIdentifier(): String? = getParentIdentifierBaw(this)
    override fun getGeographicElements(): List<GeographicElement> = super.getGeographicElements() + getBwastrGeographicElements(this)
    override fun getKeywordsAsList(): List<String> = super.getKeywordsAsList() +
        getBawKeywords(this).keywords.mapNotNull { it.name } +
        getSimulationKeywordThesauri().flatMap { t -> t.keywords.mapNotNull { it.name } }

    override fun getDescriptiveKeywords(): List<Thesaurus> = super.getDescriptiveKeywords() +
        getBawKeywords(this) +
        getSimulationKeywordThesauri()

    override val hierarchyLevelName = when (doc.type) {
        "BawMeasurement" -> "measurement"
        "BawSimulation" -> "Simulation"
        else -> super.hierarchyLevelName
    }

    fun getLiteratureAggregates() = getLiteratureAggregates(this)
    val waterMeasurements = doc.data.getPath("measurementPhases")?.find { it.getString("type") == "waterMeasurement" }

    val orderTitle = doc.data.getString("orderTitle")
    val orderNumber = doc.data.getString("orderNumber")
    val timestep = waterMeasurements?.getDouble("timestep")

    val simulationParameters = doc.data.getPath("simulationParameter")
        ?.map {
            SimParameter(
                name = it.getString("name") ?: "",
                role = codelists.getValue("3950004", it.getPath("role")?.mapToKeyValue()) ?: "",
                value = it.getString("value") ?: "",
                unit = it.getString("unit") ?: "",
            )
        } ?: emptyList()

    override val spatialSystems = super.spatialSystems + (
        (doc.data.getPath("spatial.verticalSpatialSystems"))?.mapNotNull { it.mapToKeyValue() }?.map {
            mapToCharacterStringModel(
                "verticalSpatialSystems",
                it,
            )
        } ?: emptyList()
        )

    fun getSimulationKeywordThesauri(): List<Thesaurus> = listOf(
        dimensionalityThesaurus,
        modelTypeThesaurus,
        methodThesaurus,
    ).filter { it.keywords.isNotEmpty() }

    val dimensionality = doc.data.getPath("dimensionality")?.mapToKeyValue()?.let { codelists.getValue("3950000", it) }

    val dimensionalityThesaurus = Thesaurus(
        "de.baw.codelist.model.dimensionality",
        "2017-01-17",
        showType = true,
        type = "discipline",
        keywords = dimensionality?.let {
            listOf(
                KeywordIso(
                    name = it,
                    link = null,
                ),
            )
        } ?: emptyList(),
    )

    val process = doc.data.getPath("process")?.mapToKeyValue()?.let { codelists.getValue("3950001", it) }
    val measuringMethod: List<String> = doc.data.getPath("measuringMethod")?.map { codelists.getValue("3950011", it.mapToKeyValue())!! } ?: emptyList()

    // measurementMethod for Messdaten and process for Simulationen
    val method = measuringMethod + (process?.let { listOf(it) } ?: emptyList())

    val methodThesaurus = Thesaurus(
        "de.baw.codelist.model.method",
        "2017-01-17",
        showType = true,
        type = "discipline",
        keywords = process?.let {
            listOf(
                KeywordIso(
                    name = it,
                    link = null,
                ),
            )
        } ?: emptyList(),
    )

    val modelType = doc.data.getPath("simulationModelType")?.map { codelists.getValue("3950003", it.mapToKeyValue())!! } ?: emptyList()

    val modelTypeThesaurus = Thesaurus(
        "de.baw.codelist.model.type",
        "2017-01-17",
        showType = true,
        type = "discipline",
        keywords = modelType.map {
            KeywordIso(
                name = it,
                link = null,
            )
        },
    )
}

data class SimParameter(
    val name: String,
    val role: String,
    val value: String,
    val unit: String,
)
