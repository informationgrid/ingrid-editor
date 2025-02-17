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
package de.ingrid.igeserver.features.ogc_api_records.profiles.ingrid

import de.ingrid.igeserver.features.ogc_api_records.services.research_query.OgcApiResearchQuery
import de.ingrid.igeserver.features.ogc_api_records.services.research_query.OgcFilterParameter
import de.ingrid.igeserver.model.BoolFilter
import org.intellij.lang.annotations.Language
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Component

@Profile("ingrid | ingrid-hmdk")
@Component
class OgcApiResearchQueryIngrid : OgcApiResearchQuery() {
    override val profiles = listOf("ingrid", "ingrid-hmdk")

    override fun profileSpecificClauses(ogcParameter: OgcFilterParameter): MutableList<BoolFilter>? {
        val clausesList: MutableList<BoolFilter> = mutableListOf()

        ogcParameter.bbox?.let { bbox ->
            val boundingBox = bbox.map { coordinate -> coordinate.toString() }
            clausesList.add(BoolFilter("OR", listOf("ingridSelectSpatial"), null, boundingBox, true))
        }

        if (ogcParameter.q != null) {
            clausesList.add(BoolFilter("OR", listOf(qParameterSQL(ogcParameter)), null, null, false))
        }

        return clausesList
    }

    @Language("PostgreSQL")
    private fun qParameterSQL(ogcParameter: OgcFilterParameter): String {
        val titleCondition = ogcParameter.q?.joinToString(" OR ") { "title ILIKE '%$it%'" }
        val descriptionCondition = ogcParameter.q?.joinToString(" OR ") { "data ->> 'description' ILIKE '%$it%'" }
        val alternateTitleCondition = ogcParameter.q?.joinToString(" OR ") { "data ->> 'alternateTitle' ILIKE '%$it%'" }
        val freeKeywordsCondition = ogcParameter.q?.joinToString(" OR ") { "EXISTS (SELECT 1 FROM jsonb_array_elements(data -> 'keywords' -> 'free') AS keyword WHERE keyword ->> 'label' ILIKE '%$it%')" }

        return """
            ($titleCondition)
            OR ($descriptionCondition)
            OR ($alternateTitleCondition)
            OR ($freeKeywordsCondition)
        """
    }
}
