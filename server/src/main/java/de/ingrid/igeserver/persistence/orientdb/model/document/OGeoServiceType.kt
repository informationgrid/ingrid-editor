package de.ingrid.igeserver.persistence.orientdb.model.document

import de.ingrid.igeserver.persistence.model.EntityType
import de.ingrid.igeserver.persistence.model.document.GeoServiceType
import de.ingrid.igeserver.persistence.orientdb.OrientDBDocumentEntityType
import org.apache.logging.log4j.kotlin.logger
import org.springframework.stereotype.Component
import kotlin.reflect.KClass

@Component()
class OGeoServiceType : OrientDBDocumentEntityType {

    private val log = logger()

    companion object {
        private const val TYPE = "GeoServiceDoc"
        private val PROFILES = arrayOf("ingrid")
    }

    override val profiles: Array<String>
        get() = PROFILES

    override val className: String
        get() = TYPE

    override val entityType: KClass<out EntityType>
        get() = GeoServiceType::class
}