/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
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
class UploadCheckApiController(
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

