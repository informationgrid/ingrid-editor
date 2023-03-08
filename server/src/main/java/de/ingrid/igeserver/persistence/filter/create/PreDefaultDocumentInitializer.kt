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
import de.ingrid.igeserver.services.FIELD_PARENT
import de.ingrid.igeserver.utils.AuthUtils
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.dao.EmptyResultDataAccessException
import org.springframework.stereotype.Component
import java.util.*

/**
 * Filter for processing document data send from the client before insert
 */
@Component
class PreDefaultDocumentInitializer @Autowired constructor(
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
        payload.type.onCreate(payload.document)

        return payload
    }

    protected fun initializeDocument(payload: PreCreatePayload, context: Context, catalogRef: Catalog) {
        val now = dateService.now()
        val fullName = authUtils.getFullNameFromPrincipal(context.principal!!)

        with(payload.document) {
            catalog = catalogRef
//            data.put(FIELD_HAS_CHILDREN, false)
            created = now
            modified = now
            createdby = fullName
            createdByUser = catalogService.getDbUserFromPrincipal(context.principal!!)
            modifiedby = fullName
            modifiedByUser = catalogService.getDbUserFromPrincipal(context.principal!!)
            state = DOCUMENT_STATE.DRAFT
            isLatest = true
        }
    }

    protected fun initializeDocumentWrapper(payload: PreCreatePayload, context: Context, catalogRef: Catalog) {
        val parentId = payload.document.data[FIELD_PARENT]
        val parentRef = try {
            when (parentId == null || parentId.isNull) {
                true -> null
                else -> docWrapperRepo.findById(parentId.asInt()).get()
            }
        } catch (ex: EmptyResultDataAccessException) {
            null
        }

        // remove parent from document (only store parent in wrapper)
        payload.document.data.remove(FIELD_PARENT)

        val documentType = payload.document.type
        val newPath = if (parentRef == null) emptyList() else parentRef.path + parentRef.id.toString()

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
        }
    }
}
