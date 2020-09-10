package de.ingrid.igeserver.persistence.filter

import com.fasterxml.jackson.databind.node.ObjectNode
import de.ingrid.igeserver.extension.pipe.Context
import de.ingrid.igeserver.extension.pipe.Filter
import de.ingrid.igeserver.extension.pipe.Message
import de.ingrid.igeserver.persistence.ConcurrentModificationException
import de.ingrid.igeserver.persistence.DBApi
import de.ingrid.igeserver.persistence.model.document.DocumentType
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

    override fun invoke(payload: PreUpdatePayload, context: Context): PreUpdatePayload {
        val docId = payload.document[FIELD_ID].asText();

        context.addMessage(Message(this, "Validate document data '$docId' before update"))

        checkForPublishedConcurrency(payload.wrapper, payload.document.get(FIELD_VERSION)?.asInt())

        return payload
    }

    /**
     * Throw an exception if we want to save a draft version with a version number lower than
     * the current published version.
     */
    private fun checkForPublishedConcurrency(wrapper: ObjectNode, version: Int?) {

        val draft = wrapper.get(FIELD_DRAFT)
        val publishedDBID = wrapper.get(FIELD_PUBLISHED).asText()

        if (draft.isNull && publishedDBID != null) {
            val publishedDoc = dbService.find(DocumentType::class, publishedDBID)
            val publishedVersion = publishedDoc?.get("@version")?.asInt()
            if (version != null && publishedVersion != null && publishedVersion > version) {
                throw ConcurrentModificationException(
                        "Could not update object with id '$publishedDBID'. The database version is newer than the record version.",
                        publishedDBID,
                        publishedDoc.get("@version").asInt(),
                        version)
            }
        }
    }
}