package de.ingrid.igeserver.documenttypes

import com.orientechnologies.orient.core.db.ODatabaseSession
import com.orientechnologies.orient.core.metadata.schema.OType
import org.apache.logging.log4j.LogManager
import org.apache.logging.log4j.kotlin.logger
import org.springframework.core.annotation.Order
import org.springframework.stereotype.Service

@Service
@Order(1)
class AddressWrapperType : DocumentType(TYPE, profiles) {

    val log = logger()

    companion object {
        const val TYPE = "AddressWrapper"
        private val profiles = arrayOf<String>()
    }

    override fun initialize(session: ODatabaseSession) {
        val schema = session.metadata.schema
        if (!schema.existsClass(TYPE)) {
            log.debug("Create class $TYPE")
            val docClass = schema.createClass(TYPE)

            // TODO: set more constraints and information for a new catalog (name, email?, ...)
            docClass.createProperty("_id", OType.STRING)
            docClass.createProperty("_parent", OType.STRING)
            docClass.createProperty("draft", OType.LINK)
            docClass.createProperty("published", OType.LINK)
            docClass.createProperty("archive", OType.LINKLIST)
        }
    }

}