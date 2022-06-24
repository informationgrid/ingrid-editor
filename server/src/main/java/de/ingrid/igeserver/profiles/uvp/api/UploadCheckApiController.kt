package de.ingrid.igeserver.profiles.uvp.api

import de.ingrid.igeserver.profiles.uvp.UploadUtils
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.mdek.upload.storage.impl.FileSystemStorage
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.security.Principal
import javax.persistence.EntityManager

@RestController
@RequestMapping(path = ["/api/uvp/upload-check"])
class UploadCheckApiController @Autowired constructor(
    val entityManager: EntityManager,
    val catalogService: CatalogService,
    val uploadUtils: UploadUtils,
    val fileStore: FileSystemStorage
) : UploadCheckApi {

    val sqlSteps = """
        SELECT doc.uuid as uuid, catalog.identifier as catalogId, elems as step
        FROM catalog,
             document_wrapper dw,
             document doc,
             jsonb_array_elements(doc.data -> 'processingSteps') elems
        WHERE dw.catalog_id = catalog.id
          AND catalog.type = 'uvp'
          AND dw.deleted = 0
          AND dw.category = 'data'
          AND dw.draft = doc.id
    """.trimIndent()

    override fun checkUploads(principal: Principal): ResponseEntity<List<UploadCheckReport>> {
        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)
        val result = getUploadURLs(catalogId)

        return ResponseEntity.ok().body(result)
    }

    private fun getUploadURLs(catalogId: String): List<UploadCheckReport> {
        val published = uploadUtils.getPublishedDocumentsByCatalog().flatMap { doc ->
            doc.docs.map { checkIfUploadExists(doc, it.uri, "published") }
        }
        val drafts = uploadUtils.getDraftDocumentsByCatalog().flatMap { doc ->
            doc.docs.map { checkIfUploadExists(doc, it.uri, "draft") }
        }
        return published + drafts
    }

    private fun checkIfUploadExists(doc: UploadUtils.PublishedUploads, uri: String, state: String): UploadCheckReport {
        var exists = fileStore.exists(doc.catalogId,"", doc.docUuid, uri)
        if (!exists) {
            exists = fileStore.isArchived(doc.catalogId, doc.docUuid, uri)
        }
        return UploadCheckReport(doc.catalogId, uri, exists, doc.docUuid, state)
    }

}

