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
package de.ingrid.igeserver.profiles.ingrid_krzn.exporter

import de.ingrid.igeserver.exporter.CodelistTransformer
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.profiles.ingrid.exporter.GeodataserviceModelTransformer
import de.ingrid.igeserver.profiles.ingrid.exporter.TransformerCache
import de.ingrid.igeserver.profiles.ingrid.exporter.model.IngridModel
import de.ingrid.igeserver.model.KeyValue
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.igeserver.utils.getString
import de.ingrid.mdek.upload.Config

class GeoserviceTransformerKrzn(
    model: IngridModel,
    catalogIdentifier: String,
    codelists: CodelistTransformer,
    config: Config,
    catalogService: CatalogService,
    cache: TransformerCache,
    doc: Document,
    documentService: DocumentService
) : GeodataserviceModelTransformer(
    model,
    catalogIdentifier,
    codelists,
    config,
    catalogService,
    cache,
    doc,
    documentService
) {

    private val docData = doc?.data

    override val mapLinkUrl = docData?.get("service")?.get("coupledResources")
        ?.filter { !it.get("isExternalRef").asBoolean() }
        ?.mapNotNull { it.getString("uuid") }
        ?.joinToString(",")
        ?.let outer@{ coupledUuids ->
            coupledUuids.split(",").firstOrNull()?.let { uuid ->
                getLastPublishedDocument(uuid)?.data?.getString("mapLink.key")?.let {
                    // do not map specific entry where we do not want to show mapUrl
                    if (it == "0") return@outer null
                    codelists.getCatalogCodelistValue("10500", KeyValue(it, null))
                        ?.replace("{ID}", coupledUuids)

                }
            }
        }
}