package de.ingrid.igeserver.persistence.orientdb.model.meta

import com.orientechnologies.orient.core.db.ODatabaseSession
import com.orientechnologies.orient.core.metadata.schema.OType
import de.ingrid.igeserver.persistence.orientdb.OrientDBEntityType
import de.ingrid.igeserver.persistence.model.EntityType
import de.ingrid.igeserver.persistence.model.meta.UserInfoType
import org.apache.logging.log4j.kotlin.logger
import org.springframework.stereotype.Component
import kotlin.reflect.KClass

@Component()
class OUserInfoType : OrientDBEntityType {

    private val log = logger()

    companion object {
        private const val TYPE = "Info"
    }

    override val profiles: Array<String>?
        get() = null

    override val className: String
        get() = TYPE

    override val entityType: KClass<out EntityType>
        get() = UserInfoType::class

    override fun initialize(session: ODatabaseSession) {
        val schema = session.metadata.schema
        if (!schema.existsClass(TYPE)) {
            log.debug("Create class $TYPE")
            val docClass = schema.createClass(TYPE)
            docClass.createProperty("userId", OType.STRING)
            docClass.createProperty("currentCatalogId", OType.STRING)
            docClass.createProperty("catalogIds", OType.EMBEDDEDLIST, OType.STRING)
        }
    }
}