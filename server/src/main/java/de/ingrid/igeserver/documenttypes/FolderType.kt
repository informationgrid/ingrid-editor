package de.ingrid.igeserver.documenttypes

import com.orientechnologies.orient.core.db.ODatabaseSession
import org.apache.logging.log4j.kotlin.logger
import org.springframework.stereotype.Service

@Service
class FolderType : AbstractDocumentType(FOLDER, profiles) {

    val log = logger()

    companion object {
        private const val FOLDER = "FOLDER"
        private val profiles = arrayOf<String>()
    }

    override fun initialize(session: ODatabaseSession) {
    }
}