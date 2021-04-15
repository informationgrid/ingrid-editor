package de.ingrid.igeserver.persistence.filter

import com.fasterxml.jackson.databind.node.ObjectNode
import de.ingrid.igeserver.extension.pipe.Context
import de.ingrid.igeserver.extension.pipe.Filter
import de.ingrid.igeserver.extension.pipe.Message
import de.ingrid.igeserver.persistence.ConcurrentModificationException
import de.ingrid.igeserver.persistence.DBApi
import de.ingrid.igeserver.persistence.model.document.DocumentType
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.DocumentWrapper
import de.ingrid.igeserver.repository.DocumentRepository
import de.ingrid.igeserver.services.*
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component

/**
 * Filter for validating document data send from the client before updating in the storage
 */
@Component
class DefaultUpdateValidator : Filter<PreUpdatePayload> {

    companion object {
        private val PROFILES = arrayOf<String>()
    }

    override val profiles: Array<String>?
        get() = PROFILES

    @Autowired
    private lateinit var dbService: DBApi
    
    @Autowired
    private lateinit var documentRepo: DocumentRepository

    override fun invoke(payload: PreUpdatePayload, context: Context): PreUpdatePayload {
        val docId = payload.document.uuid

        context.addMessage(Message(this, "Validate document data '$docId' before update"))

        checkForPublishedConcurrency(payload.wrapper, payload.document.version)

        return payload
    }

    /**
     * Throw an exception if we want to save a draft version with a version number lower than
     * the current published version.
     */
    private fun checkForPublishedConcurrency(wrapper: DocumentWrapper, version: Int?) {

        val draft = wrapper.draft
        val publishedDBID = wrapper.published?.id

        if (draft == null && publishedDBID != null) {
//            val publishedDoc = dbService.find(DocumentType::class, publishedDBID)
            val publishedDoc = documentRepo.findById(publishedDBID).get()
            val publishedVersion = publishedDoc.version
            if (version != null && publishedVersion != null && publishedVersion > version) {
                throw ConcurrentModificationException.withConflictingResource(publishedDBID.toString(),
                    publishedDoc.version!!, version)
            }
        }
    }
}