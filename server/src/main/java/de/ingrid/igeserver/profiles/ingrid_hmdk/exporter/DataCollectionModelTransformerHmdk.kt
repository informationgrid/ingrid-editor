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
package de.ingrid.igeserver.profiles.ingrid_hmdk.exporter

import de.ingrid.igeserver.exporter.CodelistTransformer
import de.ingrid.igeserver.model.KeyValue
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.profiles.ingrid.exporter.GeodatasetModelTransformer
import de.ingrid.igeserver.profiles.ingrid.exporter.TransformerCache
import de.ingrid.igeserver.profiles.ingrid.exporter.model.IngridModel
import de.ingrid.igeserver.profiles.ingrid.exporter.model.KeywordIso
import de.ingrid.igeserver.profiles.ingrid.exporter.model.Thesaurus
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.igeserver.utils.getBoolean
import de.ingrid.igeserver.utils.mapToKeyValue
import de.ingrid.mdek.upload.Config

class DataCollectionModelTransformerHmdk(
    model: IngridModel,
    catalogIdentifier: String,
    codelists: CodelistTransformer,
    config: Config,
    catalogService: CatalogService,
    cache: TransformerCache,
    doc: Document,
    documentService: DocumentService
) : GeodatasetModelTransformer(
    model,
    catalogIdentifier,
    codelists,
    config,
    catalogService,
    cache,
    doc,
    documentService
) {

    private val docData = doc.data

    private val publicationHmbTG = docData.getBoolean("publicationHmbTG") ?: false
    private val informationHmbTG = docData.get("informationHmbTGKeywords")
        ?.mapNotNull { it.mapToKeyValue() }
        ?.map { KeyValue(it.key, codelists.getCatalogCodelistValue("informationsgegenstand", it)) }
        ?: emptyList()

    override fun getDescriptiveKeywords(): List<Thesaurus> {
        val keywords = super.getDescriptiveKeywords().toMutableList()

        if (informationHmbTG.isNotEmpty()) {
            keywords += Thesaurus(
                keywords = informationHmbTG.map { KeywordIso(it.key) },
                date = "2013-08-02",
                name = "HmbTG-Informationsgegenstand",
                link = "http://www.tc211.org/ISO19139/resources/codeList.xml#MD_KeywordTypeCode",
                showType = false
            )
            keywords += Thesaurus(keywords = informationHmbTG.map { KeywordIso(it.value) })
        }

        if (publicationHmbTG)
            keywords += Thesaurus(keywords = listOf(KeywordIso(name = "hmbtg", link = null)))

        return keywords
    }
}