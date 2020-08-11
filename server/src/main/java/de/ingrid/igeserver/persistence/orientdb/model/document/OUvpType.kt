package de.ingrid.igeserver.persistence.orientdb.model.document

import de.ingrid.igeserver.persistence.model.EntityType
import de.ingrid.igeserver.persistence.model.document.UvpType
import de.ingrid.igeserver.persistence.orientdb.OrientDBDocumentEntityType
import org.apache.logging.log4j.kotlin.logger
import org.springframework.stereotype.Component
import kotlin.reflect.KClass

@Component()
class OUvpType : OrientDBDocumentEntityType {

    private val log = logger()

    companion object {
        private const val TYPE = "UvpDoc"
        private val PROFILES = arrayOf("uvp")
    }

    override val profiles: Array<String>
        get() = PROFILES

    override val className: String
        get() = TYPE

    override val entityType: KClass<out EntityType>
        get() = UvpType::class
}