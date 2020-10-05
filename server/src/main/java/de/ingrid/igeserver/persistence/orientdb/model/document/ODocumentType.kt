package de.ingrid.igeserver.persistence.orientdb.model.document

import com.orientechnologies.orient.core.db.ODatabaseSession
import com.orientechnologies.orient.core.metadata.schema.OType
import de.ingrid.igeserver.persistence.model.document.DocumentType
import de.ingrid.igeserver.persistence.model.EntityType
import de.ingrid.igeserver.persistence.model.document.impl.BaseDocumentType
import de.ingrid.igeserver.persistence.orientdb.OrientDBDocumentEntityType
import org.apache.logging.log4j.kotlin.logger
import org.springframework.core.annotation.Order
import org.springframework.stereotype.Component
import kotlin.reflect.KClass

@Component
@Order(1)
class ODocumentType : BaseDocumentType(), OrientDBDocumentEntityType {

    private val log = logger()

    override val entityType: KClass<out EntityType>
        get() = DocumentType::class

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