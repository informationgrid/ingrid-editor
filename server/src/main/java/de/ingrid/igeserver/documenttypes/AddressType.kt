package de.ingrid.igeserver.documenttypes

import com.orientechnologies.orient.core.db.ODatabaseSession
import com.orientechnologies.orient.core.metadata.schema.OType
import org.apache.logging.log4j.LogManager
import org.apache.logging.log4j.kotlin.logger
import org.springframework.stereotype.Service

@Service
class AddressType : DocumentType(TYPE, profiles) {

    val log = logger()

    companion object {
        private const val TYPE = "AddressDoc"
        private val profiles = arrayOf<String>()
    }

    override fun initialize(session: ODatabaseSession) {
        val schema = session.metadata.schema
        if (!schema.existsClass(TYPE)) {
            log.debug("Create class $TYPE")
            val addressClass = schema.createClass(TYPE)
            addressClass.createProperty("_id", OType.STRING)
            addressClass.createProperty("_parent", OType.STRING)
        }
    }

}