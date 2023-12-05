package de.ingrid.igeserver.profiles.ingrid_krzn.exporter

import de.ingrid.igeserver.exporter.CodelistTransformer
import de.ingrid.igeserver.exporter.model.KeyValueModel
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.profiles.ingrid.exporter.GeodataserviceModelTransformer
import de.ingrid.igeserver.profiles.ingrid.exporter.TransformerCache
import de.ingrid.igeserver.profiles.ingrid.exporter.model.IngridModel
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
    doc: Document? = null,
    documentService: DocumentService
) : GeodataserviceModelTransformer(
    model,
    catalogIdentifier,
    codelists,
    config,
    catalogService,
    cache,
    documentService = documentService
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
                    codelists.getCatalogCodelistValue("10500", KeyValueModel(it, null))
                        ?.replace("{ID}", coupledUuids)

                }
            }
        }
}