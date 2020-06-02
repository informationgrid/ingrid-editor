package de.ingrid.igeserver.documenttypes

import com.orientechnologies.orient.core.db.ODatabaseSession
import com.orientechnologies.orient.core.metadata.schema.OType
import org.apache.logging.log4j.kotlin.logger
import org.springframework.core.annotation.Order
import org.springframework.stereotype.Service

@Service
@Order(2)
class DocumentWrapperType : AbstractDocumentType(TYPE, profiles) {

    private val log = logger()

    companion object {
        const val TYPE = "DocumentWrapper"
        private val profiles = arrayOf<String>()
    }

    override fun initialize(session: ODatabaseSession) {
        val schema = session.metadata.schema
        if (!schema.existsClass(TYPE)) {
            log.debug("Create class $TYPE")
            val docClass = schema.createClass(TYPE)

            val documentClass = session.getClass("Document");

            // TODO: set more constraints and information for a new catalog (name, email?, ...)
            docClass.createProperty("_id", OType.STRING)
            docClass.createProperty("_parent", OType.STRING)
            docClass.createProperty("_type", OType.STRING)
            docClass.createProperty("_category", OType.STRING) // address or data
            docClass.createProperty("draft", OType.LINK, documentClass)
            docClass.createProperty("published", OType.LINK, documentClass)
            docClass.createProperty("archive", OType.LINKLIST, documentClass)
        }
    }
}