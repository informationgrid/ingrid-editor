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
import de.ingrid.igeserver.profiles.ingrid_baw.exporter.getBwastrIdfSection
import de.ingrid.igeserver.profiles.ingrid_baw.exporter.getLfsReferences
import de.ingrid.igeserver.profiles.ingrid_baw.exporter.getLiteratureAggregates
import de.ingrid.igeserver.profiles.ingrid_baw.exporter.getParentIdentifierBaw
import de.ingrid.igeserver.profiles.ingrid_baw.exporter.getSubsoilKeywords
import de.ingrid.igeserver.profiles.ingrid_baw.exporter.mapDocumentTypeBaw
import de.ingrid.igeserver.profiles.ingrid_baw.exporter.transformUrlForDatenrepository
import de.ingrid.igeserver.utils.getDouble
import de.ingrid.igeserver.utils.getPath
import de.ingrid.igeserver.utils.getString
import de.ingrid.igeserver.utils.mapToKeyValue

class GeodatasetTransformerBaw(transformerConfig: TransformerConfig) : GeodatasetModelTransformer(transformerConfig) {

    fun forRepository() = transformerConfig.tags.contains("forRepository")
    override fun transformUrl(url: String?): String? = if (forRepository()) transformUrlForDatenrepository(url) else super.transformUrl(url)
    override fun mapDocumentType(type: String): String = mapDocumentTypeBaw(type) ?: super.mapDocumentType(type)
    override val linkToVerticalCRS = true
    override fun getParentIdentifier(): String? = getParentIdentifierBaw(this)
    override fun getGeographicElements(): List<GeographicElement> = super.getGeographicElements() + getBwastrGeographicElements(this)
    override fun getKeywordsAsList(): List<String> = super.getKeywordsAsList() +
        getBawKeywords(this).keywords.mapNotNull { it.name } +
        getSubsoilKeywords(this).keywords.mapNotNull { it.name } +
        getSimulationKeywordThesauri().flatMap { t -> t.keywords.mapNotNull { it.name } }

    override fun getDescriptiveKeywords(): List<Thesaurus> = super.getDescriptiveKeywords() +
        getBawKeywords(this) +
        getSubsoilKeywords(this) +
        getSimulationKeywordThesauri()

    override val spatialSystems = super.spatialSystems + (
        (doc.data.getPath("spatial.verticalSpatialSystems"))?.mapNotNull { it.mapToKeyValue() }?.map {
            mapToCharacterStringModel(
                "verticalSpatialSystems",
                it,
            )
        } ?: emptyList()
        )

    override val extraContent: String by lazy { getBwastrIdfSection(this) }
    override fun getServiceUrlsAndCoupledServiceAndAtomAndExternalRefs() = super.getServiceUrlsAndCoupledServiceAndAtomAndExternalRefs() + getLfsReferences(this)

    override val hierarchyLevelName = when (doc.type) {
        "BawMeasurement" -> "measurement"
        "BawSimulation" -> "Simulation"
        else -> super.hierarchyLevelName
    }

    fun getLiteratureAggregates() = getLiteratureAggregates(this)

    val orderTitle = if (forRepository()) null else doc.data.getString("orderTitle")
    val orderNumber = if (forRepository()) null else doc.data.getString("orderNumber")
    val simulationParameters = doc.data.getPath("simulationParameter")
        ?.map {
            SimParameter(
                name = it.getString("name") ?: "",
                role = codelists.getValue("3950004", it.getPath("role")?.mapToKeyValue()) ?: "",
                value = it.getString("value") ?: "",
                unit = it.getString("unit") ?: "",
            )
        } ?: emptyList()

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

    val process = doc.data.getPath("process")?.mapToKeyValue()?.let { codelists.getValue("3950001", it) ?: it.value }
    val measuringMethod: List<String> = doc.data.getPath("measuringMethod")?.mapNotNull { it.mapToKeyValue() }
        ?.mapNotNull { codelists.getValue("3950011", it) ?: it.value } ?: emptyList()

    // measurementMethod for Messdaten and process for Simulationen
    val method = measuringMethod + (process?.let { listOf(it) } ?: emptyList())

    val methodThesaurus = Thesaurus(
        "de.baw.codelist.model.method",
        "2017-01-17",
        showType = true,
        type = "discipline",
        keywords = method.map {
            KeywordIso(
                name = it,
                link = null,
            )
        },
    )

    val modelType = doc.data.getPath("simulationModelType")?.mapNotNull { codelists.getValue("3950003", it.mapToKeyValue()) } ?: emptyList()

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

    // Wasserbau Messdaten
    val waterMeasurements = doc.data.getPath("measurementPhases")?.find { it.getString("type") == "waterMeasurement" }

    // different place in measurement and simulation doctypes
    val timestep = waterMeasurements?.getDouble("timestep") ?: doc.data.getDouble("timestep")
    val spatiality = waterMeasurements?.getPath("spatiality")?.mapToKeyValue()?.let { codelists.getValue("3950012", it) }
    val frequency = waterMeasurements?.getDouble("frequency")
    val measuringDepth = waterMeasurements?.getPath("measuringDepth")?.let { depth ->
        MeasurementDepth(
            value = depth.getString("value"),
            crs = depth.getPath("verticalSpatialSystems")?.mapToKeyValue()?.let { codelists.getValue("verticalSpatialSystems", it) },
        )
    }
    val zeroLevel = waterMeasurements?.getPath("zeroLevel")?.map { level ->
        ZeroLevel(
            value = level.getString("value"),
            crs = level.getPath("verticalSpatialSystems")?.mapToKeyValue()?.let { codelists.getValue("verticalSpatialSystems", it) },
            unit = level.getPath("unitOfMeasurement")?.mapToKeyValue()?.let { codelists.getValue("3950020", it) },
            description = level.getString("description"),
        )
    } ?: emptyList()

    val averageWaterLevel = waterMeasurements?.getPath("averageWaterLevel")?.map { level ->
        AverageWaterLevel(
            value = level.getString("value"),
            unit = level.getPath("unitOfMeasurement")?.mapToKeyValue()?.let { codelists.getValue("3950020", it) },
        )
    } ?: emptyList()

    val maxDrain = waterMeasurements?.getString("drain.max")
    val minDrain = waterMeasurements?.getString("drain.min")

    val measurementDevices = waterMeasurements?.getPath("gauge")?.map { device ->
        MeasurementDevice(
            name = device.getString("name"),
            id = device.getString("id"),
            model = device.getString("model"),
            description = device.getString("description"),
        )
    } ?: emptyList()

    val targetParameters = doc.data.getPath("targetParameters")?.map { param ->
        TargetParameter(
            name = param.getPath("name")?.mapToKeyValue()?.let { codelists.getValue("3950021", it) },
            type = param.getPath("type")?.mapToKeyValue()?.let { codelists.getValue("3950014", it) },
            unit = param.getPath("unitOfMeasurement")?.mapToKeyValue()?.let { codelists.getValue("3950020", it) },
            formula = param.getString("formula"),
        )
    } ?: emptyList()

    val dataQualityDescription = waterMeasurements?.getString("dataQualityDescription")
}

data class TargetParameter(
    val name: String?,
    val type: String?,
    val unit: String?,
    val formula: String?,
)

data class MeasurementDevice(
    val name: String?,
    val id: String?,
    val model: String?,
    val description: String?,
)

data class AverageWaterLevel(
    val value: String?,
    val unit: String?,
)
data class ZeroLevel(
    val value: String?,
    val crs: String?,
    val unit: String?,
    val description: String?,
)

data class MeasurementDepth(
    val value: String?,
    val crs: String?,
)

data class SimParameter(
    val name: String,
    val role: String,
    val value: String,
    val unit: String,
)
