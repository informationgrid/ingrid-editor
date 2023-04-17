package de.ingrid.igeserver.persistence.filter.update

import de.ingrid.igeserver.extension.pipe.Context
import de.ingrid.igeserver.extension.pipe.Filter
import de.ingrid.igeserver.extension.pipe.Message
import de.ingrid.igeserver.persistence.filter.PreUpdatePayload
import de.ingrid.igeserver.repository.CatalogRepository
import de.ingrid.igeserver.repository.DocumentWrapperRepository
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.utils.AuthUtils
import org.apache.logging.log4j.LogManager
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

    companion object {
        private val log = LogManager.getLogger()
    }

    override val profiles = arrayOf<String>()

    override fun invoke(payload: PreUpdatePayload, context: Context): PreUpdatePayload {
        val docId = payload.document.uuid

        context.addMessage(Message(this, "Process document data '$docId' before update"))

        with(payload.document) {
            // handle linked docs
            payload.type.pullReferences(this)

            // call entity type specific hook
            payload.type.onUpdate(this)
        }

        return payload
    }
}
