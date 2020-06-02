package de.ingrid.igeserver.documenttypes

import com.orientechnologies.orient.core.db.ODatabaseSession
import kotlin.jvm.Throws
import de.ingrid.igeserver.api.ApiException
import com.fasterxml.jackson.databind.JsonNode
import de.ingrid.igeserver.db.DBApi
import de.ingrid.igeserver.services.DocumentService
import java.util.*

/**
 * Classes that implement this interface have to check that the class that
 * they are responsible for is created and has the necessary properties set.
 * Most important properties are those, which contain references to other
 * DocumentTypes.
 */
abstract class DocumentType(val typeName: String, private val forProfiles: Array<String>) {

    /**
     * Initialize a database session with this DocumentType.
     *
     * @param session is the database session for access
     */
    abstract fun initialize(session: ODatabaseSession)

    @Throws(ApiException::class)
    open fun handleLinkedFields(doc: JsonNode?, dbService: DBApi?) {
    }

    open fun mapLatestDocReference(doc: JsonNode?, docService: DocumentService?) {}
    fun usedInProfile(profileId: String): Boolean {
        return forProfiles.isEmpty() || Arrays.asList(*forProfiles).contains(profileId)
    }

}