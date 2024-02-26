package de.ingrid.igeserver.profiles.ingrid_bast.exporter

import com.fasterxml.jackson.databind.ObjectMapper
import de.ingrid.igeserver.exporter.CodelistTransformer
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.profiles.ingrid.exporter.IngridLuceneExporter
import de.ingrid.igeserver.profiles.ingrid.exporter.TransformerCache
import de.ingrid.igeserver.profiles.ingrid.exporter.model.IngridModel
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.mdek.upload.Config
import org.springframework.context.annotation.Lazy
import org.springframework.stereotype.Service
import kotlin.reflect.KClass

@Service
class IngridLuceneExporterBast(
    codelistHandler: CodelistHandler,
    config: Config,
    catalogService: CatalogService,
    @Lazy documentService: DocumentService
) :
    IngridLuceneExporter(
        codelistHandler,
        config,
        catalogService,
        documentService,
    ) {

    override fun getTransformer(
        type: IngridDocType,
        catalog: Catalog,
        codelistTransformer: CodelistTransformer,
        doc: Document,
        mapper: ObjectMapper
    ): Any {
        return when (type) {
            IngridDocType.DOCUMENT -> {
                val otherTransformer = getBastTransformer(doc.type)
                otherTransformer
                    ?.constructors
                    ?.first()
                    ?.call(
                        mapper.convertValue(doc, IngridModel::class.java),
                        catalog.identifier,
                        codelistTransformer,
                        config,
                        catalogService,
                        TransformerCache(),
                        doc,
                        documentService
                    ) ?: super.getTransformer(type, catalog, codelistTransformer, doc, mapper)
            }
            else -> super.getTransformer(type, catalog, codelistTransformer, doc, mapper)
        }
    }

    private fun getBastTransformer(docType: String): KClass<out Any>? {
        return when (docType) {
            "InGridGeoDataset" -> GeodatasetTransformerBast::class
            "InGridGeoService" -> GeoserviceTransformerBast::class
            else -> null
        }
    }
}
