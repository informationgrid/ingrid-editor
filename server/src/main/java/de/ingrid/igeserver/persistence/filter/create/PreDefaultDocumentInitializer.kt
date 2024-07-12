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
package de.ingrid.igeserver.persistence.filter.create

import de.ingrid.igeserver.extension.pipe.Context
import de.ingrid.igeserver.extension.pipe.Filter
import de.ingrid.igeserver.extension.pipe.Message
import de.ingrid.igeserver.persistence.filter.PreCreatePayload
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import de.ingrid.igeserver.repository.CatalogRepository
import de.ingrid.igeserver.repository.DocumentWrapperRepository
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.DOCUMENT_STATE
import de.ingrid.igeserver.services.DateService
import de.ingrid.igeserver.utils.AuthUtils
import org.springframework.dao.EmptyResultDataAccessException
import org.springframework.stereotype.Component
import java.util.*

/**
 * Filter for processing document data send from the client before insert
 */
@Component
class PreDefaultDocumentInitializer(
    val dateService: DateService,
    val docWrapperRepo: DocumentWrapperRepository,
    val catalogRepo: CatalogRepository,
    val catalogService: CatalogService,
    var authUtils: AuthUtils
) : Filter<PreCreatePayload> {

    override val profiles = arrayOf<String>()

    override fun invoke(payload: PreCreatePayload, context: Context): PreCreatePayload {
        // initialize id
        if (payload.document.uuid.isEmpty()) {
            payload.document.uuid = UUID.randomUUID().toString()
        }
        val docId = payload.document.uuid

        context.addMessage(Message(this, "Process document data '$docId' before insert"))

        val catalogRef = catalogRepo.findByIdentifier(context.catalogId)
        initializeDocument(payload, context, catalogRef)
        initializeDocumentWrapper(payload, context, catalogRef)

        // call entity type specific hook
        payload.type.onCreate(payload.document, payload.initiator)

        return payload
    }

    protected fun initializeDocument(payload: PreCreatePayload, context: Context, catalogRef: Catalog) {
        val now = dateService.now()
        val fullName = authUtils.getFullNameFromPrincipal(context.principal!!)
        val actualUser = catalogService.getDbUserFromPrincipal(context.principal!!)

        with(payload.document) {
            catalog = catalogRef
//            data.put(FIELD_HAS_CHILDREN, false)
            created = now
            modified = now
            contentmodified = now
            createdby = fullName
            createdByUser = actualUser
            modifiedby = fullName
            contentmodifiedby = if (actualUser != null) fullName else null
            contentModifiedByUser = catalogService.getDbUserFromPrincipal(context.principal!!)
            state = DOCUMENT_STATE.DRAFT
            isLatest = true
        }
    }

    protected fun initializeDocumentWrapper(payload: PreCreatePayload, context: Context, catalogRef: Catalog) {
        val parentId = payload.parentId
        val parentRef = try {
            when (parentId == null) {
                true -> null
                else -> docWrapperRepo.findById(parentId).get()
            }
        } catch (ex: EmptyResultDataAccessException) {
            null
        }

        val documentType = payload.document.type
        val newPath = if (parentRef == null) emptyList() else parentRef.path + parentRef.id!!

        with(payload.wrapper) {
            catalog = catalogRef
//            draft = null
//            published = null
            uuid = payload.document.uuid
            parent = parentRef
            type = documentType
            category = payload.category
//            archive = mutableSetOf()
            path = newPath
            responsibleUser = catalogService.getDbUserFromPrincipal(context.principal!!)
        }
    }
}
