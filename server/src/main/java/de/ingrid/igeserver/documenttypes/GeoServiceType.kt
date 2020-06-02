package de.ingrid.igeserver.documenttypes

import com.orientechnologies.orient.core.db.ODatabaseSession
import org.apache.logging.log4j.kotlin.logger
import org.springframework.stereotype.Service

@Service
class GeoServiceType : AbstractDocumentType(TYPE, profiles) {

    private val log = logger()

    companion object {
        private const val TYPE = "GeoServiceDoc"
        private val profiles = arrayOf("ingrid")
    }

    override fun initialize(session: ODatabaseSession) {
    }
}