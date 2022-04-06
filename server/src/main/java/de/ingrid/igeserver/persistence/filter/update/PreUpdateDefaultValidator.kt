package de.ingrid.igeserver.persistence.filter.update

import de.ingrid.igeserver.extension.pipe.Context
import de.ingrid.igeserver.extension.pipe.Filter
import de.ingrid.igeserver.extension.pipe.Message
import de.ingrid.igeserver.persistence.ConcurrentModificationException
import de.ingrid.igeserver.persistence.filter.PreUpdatePayload
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.DocumentWrapper
import org.springframework.stereotype.Component

/**
 * Filter for validating document data send from the client before updating in the storage
 */
@Component
class PreUpdateDefaultValidator : Filter<PreUpdatePayload> {

    companion object {
        private val PROFILES = arrayOf<String>()
    }

    override val profiles: Array<String>?
        get() = PROFILES

    override fun invoke(payload: PreUpdatePayload, context: Context): PreUpdatePayload {
        val docId = payload.document.uuid

        context.addMessage(Message(this, "Validate document data '$docId' before update"))

        checkForPublishedConcurrency(payload.wrapper, payload.document.version)

        return payload
    }

    /**
     * Throw an exception if we want to save a draft version with a version number lower than
     * the current published version.
     * TODO: Can this actually happen? Version number always is increased.
     */
    private fun checkForPublishedConcurrency(wrapper: DocumentWrapper, version: Int?) {

        val draft = wrapper.draft
        val published = wrapper.published

        if (draft == null && published != null) {
//            val publishedDoc = dbService.find(DocumentType::class, publishedDBID)
            val publishedVersion = published.version
            if (version != null && publishedVersion != null && publishedVersion > version) {
                throw ConcurrentModificationException.withConflictingResource(
                    published.id.toString(),
                    published.version!!, version
                )
            }
        }
    }
}
