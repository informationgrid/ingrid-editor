package de.ingrid.igeserver.documenttypes

import com.orientechnologies.orient.core.db.ODatabaseSession
import com.orientechnologies.orient.core.metadata.schema.OType
import org.apache.logging.log4j.kotlin.logger
import org.springframework.core.annotation.Order
import org.springframework.stereotype.Service

@Service
@Order(1)
class DocumentType : AbstractDocumentType(TYPE, profiles) {

    private val log = logger()

    companion object {
        const val TYPE = "Document"
        private val profiles = arrayOf<String>()
    }

    override fun initialize(session: ODatabaseSession) {
        val schema = session.metadata.schema
        if (!schema.existsClass(TYPE)) {
            log.debug("Create class $TYPE")
            val docClass = schema.createClass(TYPE)

            docClass.createProperty("_id", OType.STRING)
            docClass.createProperty("_parent", OType.STRING)
            docClass.createProperty("_type", OType.STRING)
//            docClass.createProperty("_created", OType.DATETIME)
//            docClass.createProperty("_modified", OType.DATETIME)
//            docClass.createProperty("title", OType.STRING)
        }
    }
}