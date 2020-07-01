package de.ingrid.igeserver.api

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.ObjectNode
import de.ingrid.igeserver.db.DBApi
import de.ingrid.igeserver.documenttypes.DocumentWrapperType
import de.ingrid.igeserver.exports.ExportTypeInfo
import de.ingrid.igeserver.model.ExportRequestParameter
import de.ingrid.igeserver.services.*
import de.ingrid.igeserver.utils.AuthUtils
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

    @Autowired
    private lateinit var authUtils: AuthUtils

    @Throws(Exception::class)
    override fun export(principal: Principal?, data: ExportRequestParameter): ResponseEntity<String> {

        val dbId = dbUtils.getCurrentCatalogForPrincipal(principal)

        // TODO: option to export addresses too?
        var result = ""
        dbService.acquire(dbId).use {
            val doc = documentService.getByDocId(data.id, DocumentWrapperType.TYPE, true)
            if (doc != null) {
                var docVersion: JsonNode? = getDocumentVersion(doc, data.isUseDraft)

                result = exportService.doExport(docVersion, data.exportFormat)
            }
        }
        return ResponseEntity.ok(result)
    }

    private fun getDocumentVersion(doc: JsonNode, useDraft: Boolean): JsonNode? {
        var docVersion: JsonNode? = null
        if (useDraft) {
            docVersion = doc.get(FIELD_DRAFT)
        }
        if (docVersion == null || docVersion.isNull) {
            docVersion = doc.get(FIELD_PUBLISHED)
        }
        MapperService.removeDBManagementFields(docVersion as ObjectNode)
        val state = documentService.determineState(doc)
        docVersion.put(FIELD_STATE, state)
        return docVersion
    }

    @Throws(Exception::class)
    override fun exportTypes(principal: Principal?, sourceCatalogType: String): ResponseEntity<List<ExportTypeInfo>> {
        return ResponseEntity.ok(exportService.exportTypes)
    }
}