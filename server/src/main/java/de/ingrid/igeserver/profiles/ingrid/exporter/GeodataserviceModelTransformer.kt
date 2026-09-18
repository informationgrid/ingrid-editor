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
import de.ingrid.igeserver.profiles.ingrid.exporter.model.lucene.LuceneDocument
import de.ingrid.igeserver.profiles.ingrid.exporter.model.lucene.LuceneDoi
import de.ingrid.igeserver.profiles.ingrid.exporter.model.lucene.LuceneService
import de.ingrid.igeserver.profiles.ingrid.exporter.model.lucene.LuceneServiceOperation

open class GeodataserviceModelTransformer(transformerConfig: TransformerConfig) : IngridModelTransformer(transformerConfig) {

    override val hierarchyLevel = "service"
    override val hierarchyLevelName = "service"
    override val mdStandardName = "ISO19119"
    override val mdStandardVersion = "2005/PDAM 1"
    override val identificationType = "srv:SV_ServiceIdentification"
    override val extentType = "srv:extent"
    override fun hasAccessConstraints() = model.data.service.hasAccessConstraints ?: false
    override val description: String
        get() {
            var description = model.data.description ?: ""

            val resolution = model.data.service.resolution ?: emptyList()
            val denominator = resolution.mapNotNull { it.denominator }.joinToString(", ") { "1:$it" }
            val distanceMeter = resolution.mapNotNull { it.distanceMeter }.joinToString(", ") { "${it}m" }
            val distanceDPI = resolution.mapNotNull { it.distanceDPI }.joinToString(", ")

            if (denominator.isNotEmpty()) description += " Maßstab: $denominator;"
            if (distanceMeter.isNotEmpty()) description += " Bodenauflösung: $distanceMeter;"
            if (distanceDPI.isNotEmpty()) description += " Scanauflösung (DPI): $distanceDPI;"

            if (model.data.service.systemEnvironment.isNullOrEmpty().not()) description += " Systemumgebung: ${model.data.service.systemEnvironment};"
            if (model.data.service.explanation.isNullOrEmpty().not()) description += " Erläuterung zum Fachbezug: ${model.data.service.explanation};"

            return description.removeSuffix(";")
        }

    val abstractText = this.description
    val history = data.service.implementationHistory
    val conformanceResult = model.data.conformanceResult ?: emptyList()

    override fun toLuceneDocument(
        catalog: Catalog,
        partner: String,
        provider: String,
    ): LuceneDocument {
        val doc = super.toLuceneDocument(catalog, partner, provider)
        return doc.copy(
            ingrid = doc.ingrid.copy(
                service = LuceneService(
                    type = data.service.type?.value ?: data.service.type?.key,
                    classifications = data.service.classification?.mapNotNull { it.value ?: it.key } ?: emptyList(),
                    versions = data.service.version?.mapNotNull { it.value ?: it.key } ?: emptyList(),
                    operations = data.service.operations?.map {
                        LuceneServiceOperation(
                            name = it.name?.value ?: it.name?.key,
                            description = it.description,
                            accessUrl = it.methodCall,
                        )
                    } ?: emptyList(),
                    environmentDescription = data.service.systemEnvironment,
                    serviceHistory = data.service.implementationHistory,
                    additionalInformation = data.service.explanation,
                    hasAccessConstraints = data.service.hasAccessConstraints,
                    doi = if (doi != null || generalResourceType != null || resourceType != null) {
                        LuceneDoi(
                            identifier = doi,
                            generalResourceType = generalResourceType,
                            resourceType = resourceType,
                        )
                    } else {
                        null
                    },
                ),
            ),
        )
    }
}
