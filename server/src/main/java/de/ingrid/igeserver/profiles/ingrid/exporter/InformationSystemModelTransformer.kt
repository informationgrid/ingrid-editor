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

import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import de.ingrid.igeserver.profiles.ingrid.exporter.model.lucene.LuceneDocumentInGrid
import de.ingrid.igeserver.profiles.ingrid.exporter.model.lucene.LuceneInformationSystem
import de.ingrid.igeserver.profiles.ingrid.exporter.model.lucene.LuceneServiceUrl

open class InformationSystemModelTransformer(transformerConfig: TransformerConfig) : IngridModelTransformer(transformerConfig) {

    override val hierarchyLevel = "application"
    override val hierarchyLevelName = "application"

    val baseDataText = data.baseDataText
    val implementationHistory = data.implementationHistory
    val explanation = data.explanation
    val serviceType = data.serviceType
    val serviceVersion = data.serviceVersion ?: emptyList()

    fun hasDataQualityInfo() = (baseDataText.isNullOrEmpty() && implementationHistory.isNullOrEmpty()).not()

    override fun toLuceneDocument(
        catalog: Catalog,
        partner: String,
        provider: String,
    ): LuceneDocumentInGrid {
        val doc = super.toLuceneDocument(catalog, partner, provider)
        val st = data.serviceType?.let { codelists.getCatalogCodelistValue("5300", it) ?: it.value ?: it.key }
        val versions = data.serviceVersion?.mapNotNull { it.value ?: it.key } ?: emptyList()
        val sUrls = data.serviceUrls?.map {
            LuceneServiceUrl(
                name = it.name,
                url = it.url,
                explanation = it.description,
            )
        } ?: emptyList()

        val hasInformationSystem = st != null ||
            versions.isNotEmpty() ||
            data.informationSystem != null ||
            data.systemEnvironment != null ||
            data.implementationHistory != null ||
            data.baseDataText != null ||
            data.explanation != null ||
            sUrls.isNotEmpty()

        return doc.copy(
            ingrid = doc.ingrid.copy(
                informationSystem = if (hasInformationSystem) {
                    LuceneInformationSystem(
                        serviceType = st,
                        version = versions,
                        informationSystem = data.informationSystem,
                        systemEnvironment = data.systemEnvironment,
                        history = data.implementationHistory,
                        basisData = data.baseDataText,
                        explanation = data.explanation,
                        serviceUrls = sUrls,
                    )
                } else {
                    null
                },
            ),
        )
    }
}
