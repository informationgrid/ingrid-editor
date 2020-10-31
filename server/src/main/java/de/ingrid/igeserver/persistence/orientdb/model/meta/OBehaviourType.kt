package de.ingrid.igeserver.persistence.orientdb.model.meta

import com.orientechnologies.orient.core.db.ODatabaseSession
import de.ingrid.igeserver.persistence.orientdb.OrientDBEntityType
import de.ingrid.igeserver.persistence.model.meta.BehaviourType
import de.ingrid.igeserver.persistence.model.EntityType
import de.ingrid.igeserver.persistence.model.meta.impl.BaseBehaviourType
import org.apache.logging.log4j.kotlin.logger
import org.springframework.stereotype.Component
import kotlin.reflect.KClass

@Component
class OBehaviourType : BaseBehaviourType(), OrientDBEntityType {

    private val log = logger()

    override val entityType: KClass<out EntityType>
        get() = BehaviourType::class

    override fun initialize(session: ODatabaseSession) {
        val schema = session.metadata.schema
        if (!schema.existsClass(className)) {
            log.debug("Create class $className")
            schema.createClass(className)
        }
    }
}