package de.ingrid.igeserver.documenttypes

import com.orientechnologies.orient.core.db.ODatabaseSession
import org.apache.logging.log4j.kotlin.logger
import org.springframework.stereotype.Service

@Service
class AddressType : AbstractDocumentType(TYPE, profiles) {

    val log = logger()

    companion object {
        private const val TYPE = "AddressDoc"
        private val profiles = arrayOf<String>()
    }

    override fun initialize(session: ODatabaseSession) {
    }

}