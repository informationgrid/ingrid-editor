package de.ingrid.igeserver.profiles.ingrid_up_sh.exporter

import com.fasterxml.jackson.databind.JsonNode
import de.ingrid.igeserver.exporter.CodelistTransformer
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.profiles.ingrid.exporter.GeodatasetModelTransformer
import de.ingrid.igeserver.profiles.ingrid.exporter.GeometryContext
import de.ingrid.igeserver.profiles.ingrid.exporter.TransformerCache
import de.ingrid.igeserver.profiles.ingrid.exporter.model.IngridModel
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.igeserver.utils.getStringOrEmpty
import de.ingrid.mdek.upload.Config

class GeodatasetTransformerUPSH(
    model: IngridModel,
    catalogIdentifier: String,
    codelists: CodelistTransformer,
    config: Config,
    catalogService: CatalogService,
    cache: TransformerCache,
    doc: Document? = null,
    documentService: DocumentService
) : GeodatasetModelTransformer(model, catalogIdentifier, codelists, config, catalogService, cache, null, documentService) {

    private val docData = doc?.data

    override fun getGeometryContexts(): List<GeometryContext> {
        return docData?.get("geometryContext")
            ?.map { convertToGeometryContext(it) } ?: emptyList()
    }

    private fun convertToGeometryContext(item: JsonNode): GeometryContext {
        return GeometryContext(
            item.getStringOrEmpty("geometryType"),
            item.getStringOrEmpty("name"),
            item.getStringOrEmpty("featureType.key"),
            item.getStringOrEmpty("dataType"),
            item.getStringOrEmpty("description"),
        )
    }
}