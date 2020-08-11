package de.ingrid.igeserver.persistence.orientdb.model.meta

import com.orientechnologies.orient.core.db.ODatabaseSession
import com.orientechnologies.orient.core.metadata.schema.OType
import de.ingrid.igeserver.persistence.orientdb.OrientDBEntityType
import de.ingrid.igeserver.persistence.model.meta.BehaviourType
import de.ingrid.igeserver.persistence.model.EntityType
import org.apache.logging.log4j.kotlin.logger
import org.springframework.stereotype.Component
import kotlin.reflect.KClass

@Component()
class OBehaviourType : OrientDBEntityType {

    private val log = logger()

    companion object {
        private const val TYPE = "Behaviours"
        private val PROFILES = null
    }

    override val profiles: Array<String>?
        get() = PROFILES

    override val className: String
        get() = TYPE

    override val entityType: KClass<out EntityType>
        get() = BehaviourType::class

    override fun initialize(session: ODatabaseSession) {
        val schema = session.metadata.schema
        if (!schema.existsClass(TYPE)) {
            log.debug("Create class ${TYPE}")
            val docClass = schema.createClass(TYPE)
        }
    }
}