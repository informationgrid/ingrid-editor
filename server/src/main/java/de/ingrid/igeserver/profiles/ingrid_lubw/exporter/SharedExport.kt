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
package de.ingrid.igeserver.profiles.ingrid_lubw.exporter

import com.fasterxml.jackson.databind.JsonNode
import de.ingrid.igeserver.profiles.ingrid.exporter.model.KeywordIso
import de.ingrid.igeserver.profiles.ingrid.exporter.model.Thesaurus
import de.ingrid.igeserver.profiles.ingrid_lubw.exporter.tranformer.GeodatasetTransformerLubw
import de.ingrid.igeserver.utils.getString
import kotlin.reflect.KClass


fun getLubwModelTransformerClass(docType: String): KClass<out Any>? {
    return when (docType) {
        "InGridGeoDataset" -> GeodatasetTransformerLubw::class
        else -> null
    }
}

fun amendLubwDescriptiveKeywords(
    docData: JsonNode,
    previousKeywords: List<Thesaurus>
): List<Thesaurus> {
    val oac = docData.getString("oac")

    val keywords = previousKeywords.toMutableList()

    if (oac.isNullOrEmpty().not()) {
        keywords += Thesaurus(
            keywords = listOf( KeywordIso(
                name = "oac: $oac",
            )),
        )
    }
    return keywords
}

