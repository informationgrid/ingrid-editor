package de.ingrid.igeserver.profiles

import com.orientechnologies.orient.core.db.ODatabaseSession
import com.orientechnologies.orient.core.metadata.schema.OType
import de.ingrid.igeserver.persistence.model.EntityType
import de.ingrid.igeserver.persistence.orientdb.OrientDBDocumentEntityType
import org.apache.logging.log4j.LogManager
import org.springframework.stereotype.Component
import kotlin.reflect.KClass

@Component
class TestType : OrientDBDocumentEntityType {

    companion object {
        private val log = LogManager.getLogger(TestType::class.java)
        private const val TYPE = "TestDoc"
        private val profiles = arrayOf("mcloud")
    }

    override val entityType: KClass<out EntityType>
        get() = TestType::class

    override val className: String
        get() = TYPE

    override val profiles: Array<String>
        get() = arrayOf("mcloud")

    override fun usedInProfile(profileId: String): Boolean {
        return false
    }

    override fun initialize(session: ODatabaseSession) {
        val schema = session.metadata.schema
        if (!schema.existsClass(TYPE)) {
            log.debug("Create class $TYPE")
            val myClass = schema.createClass(TYPE)
            myClass.createProperty("_id", OType.STRING)
            myClass.createProperty("_parent", OType.STRING)
        }
    }
}