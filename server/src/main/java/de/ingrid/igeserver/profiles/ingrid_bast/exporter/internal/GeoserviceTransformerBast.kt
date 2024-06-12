/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
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
package de.ingrid.igeserver.profiles.ingrid_bast.exporter.internal

import de.ingrid.igeserver.exporter.model.CharacterStringModel
import de.ingrid.igeserver.profiles.ingrid.exporter.GeodataserviceModelTransformer
import de.ingrid.igeserver.profiles.ingrid.exporter.TransformerConfig
import de.ingrid.igeserver.profiles.ingrid.exporter.model.KeywordIso
import de.ingrid.igeserver.profiles.ingrid.exporter.model.Thesaurus
import de.ingrid.igeserver.utils.getString
import de.ingrid.igeserver.utils.getStringOrEmpty

class GeoserviceTransformerBast(transformerConfig: TransformerConfig) : GeodataserviceModelTransformer(    transformerConfig) {

    private val docData = doc.data

    override fun getDescriptiveKeywords(): List<Thesaurus> {
        val bastKeywords = Thesaurus("BASt Keywords", "2024-01-01", showType = false, keywords = listOfNotNull(
            docData.getString("projectNumber")?.let { KeywordIso(it) },
            docData.getString("projectTitle")?.let { KeywordIso(it) }
        ))
        return super.getDescriptiveKeywords() + bastKeywords
    }

    override val supplementalInformation = docData.getString("supplementalInformation")

    override val useConstraints: List<UseConstraintTemplate> =
        super.useConstraints + if (docData.getString("resource.useConstraintsComments") == null) emptyList()
        else listOf(
            UseConstraintTemplate(
                CharacterStringModel(docData.getStringOrEmpty("resource.useConstraintsComments"), null), null, null, null
            )
        )
}