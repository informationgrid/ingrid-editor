package de.ingrid.igeserver.persistence.filter

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.ClientException
import de.ingrid.igeserver.extension.pipe.Context
import de.ingrid.igeserver.extension.pipe.Filter
import org.springframework.stereotype.Component

/**
 * Filter for processing document data send from the client before publish
 */
@Component
class DocumentSizeValidator : Filter<PreUpdatePayload> {

    val MAXIMUM_DOCUMENT_SIZE = 32000000 // 32MB

    companion object {
        private val PROFILES = arrayOf<String>()
    }

    override val profiles: Array<String>?
        get() = PROFILES

    override fun invoke(payload: PreUpdatePayload, context: Context): PreUpdatePayload {
        val lengthInBytes = jacksonObjectMapper().writeValueAsString(payload.document).length
        if (lengthInBytes > MAXIMUM_DOCUMENT_SIZE) {
            throw ClientException.withReason("Document too big! Max content is 32MB")
        }

        return payload
    }
}