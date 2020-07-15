package de.ingrid.igeserver.persistence.orientdb.model.document

import com.orientechnologies.orient.core.db.ODatabaseSession
import com.orientechnologies.orient.core.metadata.schema.OType
import de.ingrid.igeserver.persistence.model.document.DocumentWrapperType
import de.ingrid.igeserver.persistence.model.EntityType
import de.ingrid.igeserver.persistence.orientdb.OrientDBDocumentEntityType
import org.apache.logging.log4j.kotlin.logger
import org.springframework.core.annotation.Order
import org.springframework.stereotype.Component
import kotlin.reflect.KClass

@Component()
@Order(2)
class ODocumentWrapperType : OrientDBDocumentEntityType {

    private val log = logger()

    companion object {
        private const val TYPE = "DocumentWrapper"
        private val PROFILES = arrayOf<String>()
    }

    override val profiles: Array<String>
        get() = PROFILES

    override val className: String
        get() = TYPE

    override val entityType: KClass<out EntityType>
        get() = DocumentWrapperType::class

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