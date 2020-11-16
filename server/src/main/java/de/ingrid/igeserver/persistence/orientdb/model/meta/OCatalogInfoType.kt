package de.ingrid.igeserver.persistence.orientdb.model.meta

import com.orientechnologies.orient.core.db.ODatabaseSession
import com.orientechnologies.orient.core.metadata.schema.OType
import de.ingrid.igeserver.persistence.orientdb.OrientDBEntityType
import de.ingrid.igeserver.persistence.model.meta.CatalogInfoType
import de.ingrid.igeserver.persistence.model.EntityType
import de.ingrid.igeserver.persistence.model.meta.impl.BaseCatalogInfoType
import org.apache.logging.log4j.kotlin.logger
import org.springframework.stereotype.Component
import kotlin.reflect.KClass

@Component
class OCatalogInfoType : BaseCatalogInfoType(), OrientDBEntityType {

    private val log = logger()

    override val entityType: KClass<out EntityType>
        get() = CatalogInfoType::class

    override fun initialize(session: ODatabaseSession) {
        val schema = session.metadata.schema
        if (!schema.existsClass(className)) {
            log.debug("Create class $className")
            val docClass = schema.createClass(className)
            docClass.createProperty("name", OType.STRING)
            docClass.createProperty("type", OType.STRING)
            docClass.createProperty("version", OType.STRING)
        }
    }
}