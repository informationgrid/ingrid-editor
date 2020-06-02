package de.ingrid.igeserver.documenttypes

import com.orientechnologies.orient.core.db.ODatabaseSession
import org.apache.logging.log4j.kotlin.logger
import org.springframework.stereotype.Service

@Service
class UvpType : AbstractDocumentType(TYPE, profiles) {

    private val log = logger()

    companion object {
        private const val TYPE = "UvpDoc"
        private val profiles = arrayOf("uvp")
    }

    override fun initialize(session: ODatabaseSession) {
    }
}