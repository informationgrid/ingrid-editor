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
import de.ingrid.igeserver.profiles.ingrid.exporter.GeodataserviceModelTransformer
import de.ingrid.igeserver.profiles.ingrid.exporter.TransformerConfig
import de.ingrid.igeserver.profiles.ingrid.exporter.model.Thesaurus
import de.ingrid.igeserver.profiles.ingrid_baw.exporter.getBawKeywords
import de.ingrid.igeserver.profiles.ingrid_baw.exporter.getBwastrGeographicElements
import de.ingrid.igeserver.profiles.ingrid_baw.exporter.getBwastrIdfSection
import de.ingrid.igeserver.profiles.ingrid_baw.exporter.getParentIdentifierBaw
import de.ingrid.igeserver.profiles.ingrid_baw.exporter.mapDocumentTypeBaw
import de.ingrid.igeserver.profiles.ingrid_baw.exporter.transformUrlForDatenrepository
import de.ingrid.igeserver.utils.getPath
import de.ingrid.igeserver.utils.mapToKeyValue

class GeoserviceTransformerBaw(transformerConfig: TransformerConfig) : GeodataserviceModelTransformer(transformerConfig) {

    fun forRepository() = transformerConfig.tags.contains("forRepository")
    override fun transformUrl(url: String?): String? = if (forRepository()) transformUrlForDatenrepository(url) else super.transformUrl(url)
    override fun mapDocumentType(type: String): String = mapDocumentTypeBaw(type) ?: super.mapDocumentType(type)
    override val linkToVerticalCRS = true
    override fun getParentIdentifier(): String? = getParentIdentifierBaw(this)
    override fun getGeographicElements(): List<GeographicElement> = super.getGeographicElements() + getBwastrGeographicElements(this)
    override fun getKeywordsAsList(): List<String> = super.getKeywordsAsList() + getBawKeywords(this).keywords.mapNotNull { it.name }

    override fun getDescriptiveKeywords(): List<Thesaurus> = super.getDescriptiveKeywords() + getBawKeywords(this)

    override val spatialSystems = super.spatialSystems + (
        (doc.data.getPath("spatial.verticalSpatialSystems"))?.mapNotNull { it.mapToKeyValue() }?.map {
            mapToCharacterStringModel(
                "verticalSpatialSystems",
                it,
            )
        } ?: emptyList()
        )

    override val extraContent: String by lazy { getBwastrIdfSection(this) }
}
