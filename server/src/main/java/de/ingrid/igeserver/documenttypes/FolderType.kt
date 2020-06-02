package de.ingrid.igeserver.documenttypes

import com.orientechnologies.orient.core.db.ODatabaseSession
import com.orientechnologies.orient.core.metadata.schema.OType
import org.apache.logging.log4j.LogManager
import org.apache.logging.log4j.kotlin.logger
import org.springframework.stereotype.Service

@Service
class FolderType : DocumentType(FOLDER, profiles) {

    val log = logger()

    companion object {
        private const val FOLDER = "FOLDER"
        private val profiles = arrayOf<String>()
    }

    override fun initialize(session: ODatabaseSession) {
        val schema = session.metadata.schema
        if (!schema.existsClass(FOLDER)) {
            log.debug("Create class $FOLDER")
            val addressClass = schema.createClass(FOLDER)
            addressClass.createProperty("_id", OType.STRING)
            addressClass.createProperty("_parent", OType.STRING)
        }
    }
}