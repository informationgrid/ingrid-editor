/**
 * ==================================================
 * Copyright (C) 2024 wemove digital solutions GmbH
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
package de.ingrid.igeserver.profiles.ingrid_lfubayern.exporter

import com.fasterxml.jackson.databind.JsonNode
import de.ingrid.igeserver.exporter.CodelistTransformer
import de.ingrid.igeserver.exporter.model.CharacterStringModel
import de.ingrid.igeserver.model.KeyValue
import de.ingrid.igeserver.profiles.ingrid.exporter.IngridModelTransformer.UseConstraintTemplate
import de.ingrid.igeserver.profiles.ingrid.exporter.model.KeywordIso
import de.ingrid.igeserver.profiles.ingrid.exporter.model.Thesaurus
import de.ingrid.igeserver.profiles.ingrid_lfubayern.exporter.external.GeodatasetTransformerExternalLfub
import de.ingrid.igeserver.profiles.ingrid_lfubayern.exporter.external.GeoserviceTransformerExternalLfub
import de.ingrid.igeserver.profiles.ingrid_lfubayern.exporter.external.InformationSystemTransformerExternalLfub
import de.ingrid.igeserver.profiles.ingrid_lfubayern.exporter.internal.GeodatasetTransformerLfub
import de.ingrid.igeserver.profiles.ingrid_lfubayern.exporter.internal.GeoserviceTransformerLfub
import de.ingrid.igeserver.profiles.ingrid_lfubayern.exporter.internal.InformationSystemTransformerLfub
import de.ingrid.igeserver.utils.getString
import de.ingrid.igeserver.utils.getStringOrEmpty
import kotlin.reflect.KClass

fun lfubUseConstraints(
    superUseConstraints: List<UseConstraintTemplate>,
    docData: JsonNode
): List<UseConstraintTemplate> {
    val comments = docData.getString("resource.useConstraintsComments")
    if (comments.isNullOrEmpty()) return superUseConstraints
    return if (superUseConstraints.isNotEmpty()) {
        superUseConstraints.apply {
            get(0).note = docData.getStringOrEmpty("resource.useConstraintsComments")
        }
    } else {
        // add comment as title, since it's the only otherConstraints then
        listOf(
            UseConstraintTemplate(
                CharacterStringModel(docData.getStringOrEmpty("resource.useConstraintsComments"), null),
                null,
                null,
                null
            )
        )
    }
}

fun lfubGetDescriptiveKeywords(
    superDescriptiveKeywords: List<Thesaurus>,
    docData: JsonNode,
    codelistHandler: CodelistTransformer,
    ignoreInternalKeywords: Boolean = false
): List<Thesaurus> {
    val lfuInternalKeywords = Thesaurus(
        "LfU Bayern Internal Keywords",
        "2024-07-01",
        keywords = docData.get("keywords").get("internalKeywords")?.map { keyword: JsonNode? ->
            val value = keyword?.getString("key")
                ?.let { codelistHandler.getCatalogCodelistValue("20001", KeyValue(it)) }
                ?: keyword?.getString("value")
            KeywordIso(value)
        } ?: emptyList(),
    )
    val lfugeoKeywords = Thesaurus(
        "LfU Bayern Geological Keywords",
        "2018-08-01",
        type = "stratum",
        dateType = "revision",
        keywords = docData.get("keywords").get("geologicalKeywords")?.map { keyword: JsonNode? ->
            val value = keyword?.getString("key")
                ?.let { codelistHandler.getCatalogCodelistValue("20000", KeyValue(it)) }
                ?: keyword?.getString("value")
            KeywordIso(value)
        } ?: emptyList(),
    )
    return if (ignoreInternalKeywords) superDescriptiveKeywords + lfugeoKeywords
    else superDescriptiveKeywords + lfuInternalKeywords + lfugeoKeywords
}

fun getLfuBayernTransformer(docType: String): KClass<out Any>? {
    return when (docType) {
        "InGridGeoDataset" -> GeodatasetTransformerLfub::class
        "InGridGeoService" -> GeoserviceTransformerLfub::class
        "InGridInformationSystem" -> InformationSystemTransformerLfub::class
        else -> null
    }
}

fun getLfuBayernExternalTransformer(docType: String): KClass<out Any>? {
    return when (docType) {
        "InGridGeoDataset" -> GeodatasetTransformerExternalLfub::class
        "InGridGeoService" -> GeoserviceTransformerExternalLfub::class
        "InGridInformationSystem" -> InformationSystemTransformerExternalLfub::class
        else -> null
    }
}