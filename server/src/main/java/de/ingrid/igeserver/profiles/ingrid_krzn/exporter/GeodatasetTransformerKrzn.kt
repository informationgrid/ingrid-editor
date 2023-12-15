/**
 * ==================================================
 * Copyright (C) 2023 wemove digital solutions GmbH
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
package de.ingrid.igeserver.profiles.ingrid_krzn.exporter

import de.ingrid.igeserver.exporter.CodelistTransformer
import de.ingrid.igeserver.exporter.model.KeyValueModel
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.profiles.ingrid.exporter.GeodatasetModelTransformer
import de.ingrid.igeserver.profiles.ingrid.exporter.TransformerCache
import de.ingrid.igeserver.profiles.ingrid.exporter.model.IngridModel
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.igeserver.utils.getString
import de.ingrid.mdek.upload.Config

class GeodatasetTransformerKrzn(
    model: IngridModel,
    catalogIdentifier: String,
    codelists: CodelistTransformer,
    config: Config,
    catalogService: CatalogService,
    cache: TransformerCache,
    doc: Document? = null,
    documentService: DocumentService
) : GeodatasetModelTransformer(model, catalogIdentifier, codelists, config, catalogService, cache, documentService = documentService) {

    private val docData = doc?.data
    override val systemEnvironment =
        if (!super.systemEnvironment.isNullOrEmpty()) super.systemEnvironment
        else docData?.getString("environmentDescription")

    override val mapLinkUrl = docData?.getString("mapLink.key")?.let {
        // do not map specific entry where we do not want to show mapUrl
        if (it == "0") return@let null
        codelists.getCatalogCodelistValue("10500", KeyValueModel(it, null))
            ?.replace("{ID}", model.uuid)
    }

    /*
        override fun getCrossReferences(): List<CrossReference> {
            return super.getCrossReferences()
                .map { ref ->
                    if (ref.refType.key != "3600") ref 
                    else {
                        ref.mapUrl = ref.serviceUrl
                        ref
                    }
                }
        }
    */
}