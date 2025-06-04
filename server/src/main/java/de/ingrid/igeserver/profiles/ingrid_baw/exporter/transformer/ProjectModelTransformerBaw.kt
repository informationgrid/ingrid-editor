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

import de.ingrid.igeserver.profiles.ingrid.exporter.IngridModelTransformer
import de.ingrid.igeserver.profiles.ingrid.exporter.TransformerConfig
import de.ingrid.igeserver.profiles.ingrid.exporter.model.Thesaurus
import de.ingrid.igeserver.profiles.ingrid_baw.exporter.getBawKeywords
import de.ingrid.igeserver.profiles.ingrid_baw.exporter.getParentIdentifierBaw
import de.ingrid.igeserver.utils.getString

open class ProjectModelTransformerBaw(transformerConfig: TransformerConfig) : IngridModelTransformer(transformerConfig) {

    override val metadataDateAsDateTime = true
    override val linkToVerticalCRS = true
    override fun getParentIdentifier(): String? = getParentIdentifierBaw(this)
    override fun getKeywordsAsList(): List<String> = super.getKeywordsAsList() + getBawKeywords(this).keywords.mapNotNull { it.name }

    override fun getDescriptiveKeywords(): List<Thesaurus> = super.getDescriptiveKeywords() + getBawKeywords(this)

    override val hierarchyLevelName = "project"

    val orderNumber = doc.data.getString("orderNumber")

    // address type: Projektleitung
//    val managers = data.pointOfContact?.filter { it.type?.key == "8" }?.mapNotNull { toAddressModelTransformer(it) }?.map { it.title }
//    val managerAdd = data.pointOfContact?.filter { it.type?.key == "8" }?.mapNotNull { toAddressModelTransformer(it) }
//
//    // address type: "Bearbeiter" TODO: change to "Projektbeteiligte" when in codelist
//    val participants = data.pointOfContact?.filter { it.type?.key == "9" }?.mapNotNull { toAddressModelTransformer(it) }?.map { it.title }
}
