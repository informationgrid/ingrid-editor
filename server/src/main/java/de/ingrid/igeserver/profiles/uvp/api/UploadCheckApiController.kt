package de.ingrid.igeserver.profiles.uvp.api

import de.ingrid.igeserver.profiles.uvp.UvpReferenceHandler
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.utils.DocumentLinks
import de.ingrid.mdek.upload.storage.impl.FileSystemStorage
import jakarta.persistence.EntityManager
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.security.Principal

@RestController
@RequestMapping(path = ["/api/uvp/upload-check"])
class UploadCheckApiController @Autowired constructor(
    val entityManager: EntityManager,
    val catalogService: CatalogService,
    val referenceHandler: UvpReferenceHandler,
    val fileStore: FileSystemStorage
) : UploadCheckApi {

    override fun checkUploads(principal: Principal): ResponseEntity<List<UploadCheckReport>> {
//        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)
        val result = getUploadURLs()

        return ResponseEntity.ok().body(result)
    }

    private fun getUploadURLs(): List<UploadCheckReport> {
        val published = referenceHandler.getPublishedDocumentsByCatalog().flatMap { doc ->
            doc.docs.map { checkIfUploadExists(doc, it.uri, "published") }
        }
        val drafts = referenceHandler.getDraftAndPendingDocumentsByCatalog().flatMap { doc ->
            doc.docs.map { checkIfUploadExists(doc, it.uri, "draft") }
        }
        return published + drafts
    }

    private fun checkIfUploadExists(doc: DocumentLinks, uri: String, state: String): UploadCheckReport {
        var exists = fileStore.exists(doc.catalogId,"", doc.docUuid, uri)
        if (!exists) {
            exists = fileStore.isArchived(doc.catalogId, doc.docUuid, uri)
        }
        return UploadCheckReport(doc.catalogId, uri, exists, doc.docUuid, state)
    }

}

