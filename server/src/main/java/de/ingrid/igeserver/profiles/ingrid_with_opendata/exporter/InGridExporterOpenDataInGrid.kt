import de.ingrid.igeserver.exports.ExportOptions
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.profiles.ingrid.exporter.IngridLuceneExporter
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.mdek.upload.UploadConfig
import org.springframework.context.annotation.Lazy
import org.springframework.stereotype.Service

class InGridExporterOpenDataInGrid

@Service
class IngridLuceneExporterOpenInGrid(
    codelistHandler: CodelistHandler,
    uploadConfig: UploadConfig,
    catalogService: CatalogService,
    @Lazy documentService: DocumentService,
) : IngridLuceneExporter(
    codelistHandler,
    uploadConfig,
    catalogService,
    documentService,
) {

    /*
        override fun getTransformer(data: TransformerData): Any = when (data.type) {
            IngridDocType.DOCUMENT -> {
                IngridModelTransformerBast(
                    TransformerConfig(
                        data.mapper.convertValue(data.doc, IngridModel::class.java),
                        data.catalogIdentifier,
                        data.codelistTransformer,
                        uploadConfig,
                        catalogService,
                        TransformerCache(),
                        data.doc,
                        documentService,
                        data.tags,
                    ),
                )
            }

            else -> super.getTransformer(data)
        }
     */

    override fun getTemplateForDoctype(
        doc: Document,
        catalog: Catalog,
        options: ExportOptions,
    ): Pair<String, Map<String, Any>> = when (doc.type) {
        "OpenDataDoc" -> Pair(
            "export/opendata/lucene-export.jte",
            getMapper(IngridDocType.DOCUMENT, doc, catalog, options),
        )

        else -> super.getTemplateForDoctype(doc, catalog, options)
    }
}
