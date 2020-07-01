package de.ingrid.igeserver.api

import de.ingrid.igeserver.db.DBApi
import de.ingrid.igeserver.documenttypes.DocumentWrapperType
import de.ingrid.igeserver.exports.ExportTypeInfo
import de.ingrid.igeserver.model.ExportRequestParameter
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.igeserver.services.ExportService
import de.ingrid.igeserver.utils.DBUtils
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.security.Principal

@RestController
@RequestMapping(path = ["/api"])
class ExportApiController : ExportApi {
    @Autowired
    lateinit var exportService: ExportService

    @Autowired
    lateinit var dbService: DBApi

    @Autowired
    lateinit var documentService: DocumentService

    @Autowired
    private lateinit var dbUtils: DBUtils

    @Throws(Exception::class)
    override fun export(principal: Principal?, data: ExportRequestParameter): ResponseEntity<String> {

        val dbId = dbUtils.getCurrentCatalogForPrincipal(principal)

        // TODO: option to export addresses too?
        var result = ""
        dbService.acquire(dbId).use {
            val doc = documentService.getByDocId(data.id, DocumentWrapperType.TYPE, true)
            if (doc != null) {
                val docVersion = documentService.getLatestDocument(doc, !data.isUseDraft)

                result = exportService.doExport(docVersion, data.exportFormat)
            }
        }
        return ResponseEntity.ok(result)
    }

    @Throws(Exception::class)
    override fun exportTypes(principal: Principal?, sourceCatalogType: String): ResponseEntity<List<ExportTypeInfo>> {
        return ResponseEntity.ok(exportService.exportTypes)
    }
}