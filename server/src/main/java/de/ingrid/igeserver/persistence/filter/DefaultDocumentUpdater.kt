package de.ingrid.igeserver.persistence.filter

import de.ingrid.igeserver.extension.pipe.Context
import de.ingrid.igeserver.extension.pipe.Filter
import de.ingrid.igeserver.extension.pipe.Message
import de.ingrid.igeserver.repository.CatalogRepository
import de.ingrid.igeserver.repository.DocumentWrapperRepository
import de.ingrid.igeserver.services.FIELD_PARENT
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.dao.EmptyResultDataAccessException
import org.springframework.security.access.AccessDeniedException
import org.springframework.stereotype.Component

/**
 * Filter for processing document data send from the client before update
 */
@Component
class DefaultDocumentUpdater @Autowired constructor(
    val docWrapperRepo: DocumentWrapperRepository,
    val catalogRepo: CatalogRepository
) : Filter<PreUpdatePayload> {

    val log = logger()

    override val profiles = arrayOf<String>()

    override fun invoke(payload: PreUpdatePayload, context: Context): PreUpdatePayload {
        val docId = payload.document.uuid

        context.addMessage(Message(this, "Process document data '$docId' before update"))

        // update parent in case of moving a document
        val parent = payload.document.data.get(FIELD_PARENT)
        if (!parent.isNull) {
            try {
                payload.wrapper.parent = docWrapperRepo.findById(parent.asInt()).get()
            } catch (ex: EmptyResultDataAccessException) {
                // in case of no permission just log information
                log.warn("Parent Wrapper not found, possibly to read permission on parent?")
            } catch (ex: AccessDeniedException) {
                log.debug("Parent cannot be accessed due to permissions, so reference will not be updated")
            }
        }

        // remove parent from document (only store parent in wrapper)
        payload.document.data.remove(FIELD_PARENT)

        // set catalog information
        // TODO: a document does not really need this information since the document wrapper takes care of it
        payload.document.catalog = catalogRepo.findByIdentifier(context.catalogId)

        // update modified date -> already done in entity!
        // payload.document.modified = dateService.now()

        // handle linked docs
        payload.type.pullReferences(payload.document)

        // call entity type specific hook
        payload.type.onUpdate(payload.document)

        return payload
    }
}
