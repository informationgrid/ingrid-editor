package de.ingrid.igeserver.persistence.filter

import de.ingrid.igeserver.extension.pipe.Context
import de.ingrid.igeserver.extension.pipe.Filter
import de.ingrid.igeserver.extension.pipe.Message
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import de.ingrid.igeserver.repository.CatalogRepository
import de.ingrid.igeserver.repository.DocumentWrapperRepository
import de.ingrid.igeserver.services.DateService
import de.ingrid.igeserver.services.FIELD_HAS_CHILDREN
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component
import java.util.*

/**
 * Filter for processing document data send from the client before insert
 */
@Component
class DefaultDocumentInitializer : Filter<PreCreatePayload> {

    companion object {
        private val PROFILES = arrayOf<String>()
    }

    @Autowired
    private lateinit var dateService: DateService

    @Autowired
    private lateinit var docWrapperRepo: DocumentWrapperRepository

    @Autowired
    private lateinit var catalogRepo: CatalogRepository

    override val profiles: Array<String>?
        get() = PROFILES

    override fun invoke(payload: PreCreatePayload, context: Context): PreCreatePayload {
        // initialize id
        if (payload.document.uuid.isEmpty()) {
            payload.document.uuid = UUID.randomUUID().toString()
        }
        val docId = payload.document.uuid;

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

        with(payload.document) {
            catalog = catalogRef
            data.put(FIELD_HAS_CHILDREN, false)
            created = now
            modified = now
        }
    }

    protected fun initializeDocumentWrapper(payload: PreCreatePayload, context: Context, catalogRef: Catalog) {
        val parentId = payload.document.data["_parent"]
        val parentRef = when (parentId == null || parentId.isNull) {
            true -> null
            else -> docWrapperRepo.findById(parentId.asText())
        }
        val documentType = payload.document.type

        with(payload.wrapper) {
            catalog = catalogRef
            draft = null
            published = null
            id = payload.document.uuid
            parent = parentRef
            type = documentType
            category = payload.category
            archive = mutableSetOf()
        }

        // add path info to created wrapper
        if (parentRef?.path != null) {
            payload.wrapper.path = listOf(*parentRef.path.toTypedArray()) + parentRef.id
        } else if (parentRef != null) {
            payload.wrapper.path = listOf(parentRef.id)
        }
    }
}
