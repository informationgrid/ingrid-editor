/*
 * ==================================================
 * Copyright (C) 2023-2026 wemove digital solutions GmbH
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

import de.ingrid.igeserver.exporter.TransformationTools
import de.ingrid.igeserver.utils.getString

open class AlgorithmModelTransformer(transformerConfig: TransformerConfig) : IngridModelTransformer(transformerConfig) {

    override val hierarchyLevel = "application"
    override val hierarchyLevelName = "algorithm"

    // section "Daten"
    val trainingData: String? = doc.data.getString("trainingData")
    val dataBias: String? = doc.data.getString("dataBias")
    val inputData: List<AlgorithmInputOutput> = getInputOutputData("inputData")
    val outputData: List<AlgorithmInputOutput> = getInputOutputData("outputData")

    // section "Algorithmus"
    val algorithmType: String? = doc.data.getString("algorithmType")
    val explanation: String? = doc.data.getString("explanation")
    val methods: List<String> = doc.data.get("methods")?.mapNotNull { if (it.isNull) null else it.asString() } ?: emptyList()
    val errorBias: String? = doc.data.getString("errorBias")

    // section "Übersicht"
    val monitoring: String? = doc.data.getString("monitoring")
    val typeOfUse: String? = doc.data.getString("typeOfUse")

    // section "Verweise"
    val apiUrl: String? = doc.data.getString("apiUrl")
    val sourceCodeUrl: String? = doc.data.getString("sourceCodeUrl")
    val websiteUrl: String? = doc.data.getString("websiteUrl")
    val exampleUrl: String? = doc.data.getString("exampleUrl")
    val publiccodeUrl: String? = doc.data.getString("publiccodeUrl")
    val additionalUrls: List<AlgorithmAdditionalUrl> =
        doc.data.get("additionalUrls")?.mapNotNull { url ->
            AlgorithmAdditionalUrl(
                name = url.getString("name") ?: return@mapNotNull null,
                url = url.getString("url"),
            )
        } ?: emptyList()

    /**
     * True if any algorithm-specific field has a value, so the export only renders the
     * `alg:Algorithm_Metadata` extension when there is something to export.
     */
    fun hasAlgorithmMetadata(): Boolean = listOf(
        trainingData,
        dataBias,
        algorithmType,
        explanation,
        errorBias,
        monitoring,
        typeOfUse,
        apiUrl,
        sourceCodeUrl,
        websiteUrl,
        exampleUrl,
        publiccodeUrl,
    ).any { TransformationTools.hasValue(it) } ||
        inputData.isNotEmpty() ||
        outputData.isNotEmpty() ||
        methods.isNotEmpty() ||
        additionalUrls.isNotEmpty()

    private fun getInputOutputData(key: String): List<AlgorithmInputOutput> = doc.data.get(key)?.mapNotNull { row ->
        val name = row.getString("name") ?: return@mapNotNull null
        AlgorithmInputOutput(
            name = name,
            url = row.getString("url"),
            attributes = row.get("attributes")?.mapNotNull { attribute ->
                val attributeName = attribute.getString("name") ?: return@mapNotNull null
                AlgorithmAttribute(
                    name = attributeName,
                    unit = attribute.getString("unit"),
                    spatialResolution = attribute.getString("spatialResolution"),
                    temporalResolution = attribute.getString("temporalResolution"),
                )
            } ?: emptyList(),
        )
    } ?: emptyList()
}

data class AlgorithmInputOutput(
    val name: String,
    val url: String?,
    val attributes: List<AlgorithmAttribute>,
)

data class AlgorithmAttribute(
    val name: String,
    val unit: String?,
    val spatialResolution: String?,
    val temporalResolution: String?,
)

data class AlgorithmAdditionalUrl(
    val name: String,
    val url: String?,
)
