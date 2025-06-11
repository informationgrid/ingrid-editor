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

import de.ingrid.igeserver.exporter.AddressModelTransformer
import de.ingrid.igeserver.profiles.ingrid.exporter.IngridModelTransformer
import de.ingrid.igeserver.profiles.ingrid.exporter.model.KeywordIso
import de.ingrid.igeserver.profiles.ingrid.exporter.model.Thesaurus
import de.ingrid.igeserver.profiles.ingrid_baw.exporter.transformer.GeodatasetTransformerBaw
import de.ingrid.igeserver.profiles.ingrid_baw.exporter.transformer.GeoserviceTransformerBaw
import de.ingrid.igeserver.profiles.ingrid_baw.exporter.transformer.ProjectModelTransformerBaw
import de.ingrid.igeserver.profiles.ingrid_baw.exporter.transformer.PublicationModelTransformerBaw
import de.ingrid.igeserver.utils.getPath
import de.ingrid.igeserver.utils.getString
import de.ingrid.igeserver.utils.mapToKeyValue
import org.springframework.dao.EmptyResultDataAccessException
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
