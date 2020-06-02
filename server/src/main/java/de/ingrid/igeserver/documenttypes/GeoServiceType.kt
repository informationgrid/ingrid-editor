package de.ingrid.igeserver.documenttypes

import com.orientechnologies.orient.core.db.ODatabaseSession
import com.orientechnologies.orient.core.metadata.schema.OType
import org.apache.logging.log4j.LogManager
import org.apache.logging.log4j.kotlin.logger
import org.springframework.stereotype.Service

@Service
class GeoServiceType : DocumentType(TYPE, profiles) {

    private val log = logger()

    companion object {
        private const val TYPE = "GeoServiceDoc"
        private val profiles = arrayOf("ingrid")
    }

    override fun initialize(session: ODatabaseSession) {
        val schema = session.metadata.schema
        if (!schema.existsClass(TYPE)) {
            log.debug("Create class $TYPE")
            val docClass = schema.createClass(TYPE)

            // TODO: set more constraints and information for a new catalog (name, email?, ...)
            docClass.createProperty("_id", OType.STRING)
            docClass.createProperty("_parent", OType.STRING)
            docClass.createProperty("addresses", OType.LINKLIST)
        }
    }
}