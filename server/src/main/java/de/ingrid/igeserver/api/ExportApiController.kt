package de.ingrid.igeserver.api

import com.fasterxml.jackson.databind.node.ObjectNode
import de.ingrid.igeserver.exports.ExportTypeInfo
import de.ingrid.igeserver.model.ExportRequestParameter
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.DocumentCategory
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.igeserver.services.ExportService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.security.Principal

@RestController
@RequestMapping(path = ["/api"])
class ExportApiController : ExportApi {
    @Autowired
    private lateinit var exportService: ExportService

    @Autowired
    private lateinit var documentService: DocumentService

    @Autowired
    private lateinit var catalogService: CatalogService

    override fun export(principal: Principal, data: ExportRequestParameter): ResponseEntity<String?> {

        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)

        // TODO: option to export addresses too?
        val doc = documentService.getWrapperByDocumentIdAndCatalog(catalogId, data.id)
        val docVersion = documentService.getLatestDocument(doc, !data.isUseDraft, catalogId = catalogId)

        val exporter = exportService.getExporter(DocumentCategory.DATA, data.exportFormat)
        val result = exporter.run(docVersion)
        val stringResult = if (result is ObjectNode) result.toPrettyString() else result as String
        return ResponseEntity.ok(stringResult)
    }

    override fun exportTypes(principal: Principal, profile: String): ResponseEntity<List<ExportTypeInfo>> {
        return ResponseEntity.ok(exportService.getExportTypes(profile))
    }
}
