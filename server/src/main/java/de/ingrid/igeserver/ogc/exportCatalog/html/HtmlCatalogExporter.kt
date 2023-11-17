package de.ingrid.igeserver.ogc.exportCatalog.html


import com.fasterxml.jackson.databind.node.ObjectNode
import de.ingrid.igeserver.ogc.OgcHtmlConverterService
import de.ingrid.igeserver.ogc.exportCatalog.CatalogExportTypeInfo
import de.ingrid.igeserver.ogc.exportCatalog.OgcCatalogExporter
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.DocumentCategory
import de.ingrid.igeserver.services.DocumentService
import org.keycloak.util.JsonSerialization.mapper
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Lazy
import org.springframework.context.annotation.Profile
import org.springframework.http.MediaType
import org.springframework.stereotype.Service


@Service
@Profile("ogc-api")
class HtmlCatalogExporter @Autowired constructor(
        @Lazy val documentService: DocumentService,
        val catalogService: CatalogService,
        val ogcHtmlConverterService: OgcHtmlConverterService
) : OgcCatalogExporter {

    override val typeInfo: CatalogExportTypeInfo
        get() = CatalogExportTypeInfo(
                DocumentCategory.DATA,
                "html",
                "IGE Catalog in HTML",
                "HTML Representation des IGE Catalog",
                MediaType.TEXT_HTML_VALUE,
                "html",
                listOf()
        )

    override fun run(catalog: Catalog): Any {
        val objectNode: ObjectNode = mapper.valueToTree(catalog)
        return ogcHtmlConverterService.convertObjectNode2Html(objectNode, "Collection" )
    }

}