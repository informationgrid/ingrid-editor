package de.ingrid.igeserver.persistence.filter

import com.fasterxml.jackson.databind.JsonNode
import de.ingrid.igeserver.extension.pipe.Payload

/**
 * Payload to be used for persistence related filters
 */
class PersistencePayload(val action: Action, var data: JsonNode): Payload {

    /**
     * Persistence action to perform on the contained data
     */
    enum class Action {
        CREATE,
        UPDATE,
        PUBLISH,
        UNPUBLISH,
        DELETE
    }
}