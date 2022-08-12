package de.ingrid.igeserver.persistence.filter.update

import de.ingrid.igeserver.extension.pipe.Context
import de.ingrid.igeserver.extension.pipe.Filter
import de.ingrid.igeserver.extension.pipe.Message
import de.ingrid.igeserver.persistence.filter.PreUpdatePayload
import de.ingrid.igeserver.repository.CatalogRepository
import de.ingrid.igeserver.repository.DocumentWrapperRepository
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.utils.AuthUtils
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component

/**
 * Filter for processing document data send from the client before update
 */
@Component
class PreDefaultDocumentUpdater @Autowired constructor(
    val docWrapperRepo: DocumentWrapperRepository,
    val catalogService: CatalogService,
    val catalogRepo: CatalogRepository,
    var authUtils: AuthUtils
) : Filter<PreUpdatePayload> {

    val log = logger()

    override val profiles = arrayOf<String>()

    override fun invoke(payload: PreUpdatePayload, context: Context): PreUpdatePayload {
        val docId = payload.document.uuid

        context.addMessage(Message(this, "Process document data '$docId' before update"))

        // update parent in case of moving a document
        // TODO: update parent in wrapper -> should be done somewhere else maybe? directly in move operation!
        /*val parent = payload.document.data.get(FIELD_PARENT)
        if (parent != null && !parent.isNull) {
            try {
                payload.dbDocument.parent = docWrapperRepo.findById(parent.asInt()).get()
            } catch (ex: EmptyResultDataAccessException) {
                // in case of no permission just log information
                log.warn("Parent Wrapper not found, possibly to read permission on parent?")
            } catch (ex: AccessDeniedException) {
                log.debug("Parent cannot be accessed due to permissions, so reference will not be updated")
            }
        }*/

        // save document with same ID or new one, if no draft version exists (because the last version is published)
        // this can happen when moving a published document
//        val draftId = payload.dbDocument.id
//        val createdDate = payload.dbDocument.created
//        val createdBy = payload.dbDocument.createdby
//        val createdbyUser = payload.dbDocument.createdByUser

        with(payload.document) {
            // remove parent from document (only store parent in wrapper)
//            data.remove(FIELD_PARENT)

            // set catalog information
            // TODO: a document does not really need this information since the document wrapper takes care of it
            /*catalog = catalogRepo.findByIdentifier(context.catalogId)

            // set name of user who modifies document
            modifiedby = authUtils.getFullNameFromPrincipal(context.principal!!)
            modifiedByUser = catalogService.getDbUserFromPrincipal(context.principal!!)

            // set server side fields from previous document version
            id = id ?: draftId
            created = createdDate
            createdby = createdBy
            createdByUser = createdbyUser
*/
            // handle linked docs
            payload.type.pullReferences(this)

            // call entity type specific hook
            payload.type.onUpdate(this)
        }

        return payload
    }
}
