package de.ingrid.igeserver.persistence.orientdb.model.document

import de.ingrid.igeserver.persistence.model.EntityType
import de.ingrid.igeserver.persistence.model.document.GeoServiceType
import de.ingrid.igeserver.persistence.model.document.impl.BaseGeoServiceType
import de.ingrid.igeserver.persistence.orientdb.OrientDBDocumentEntityType
import org.springframework.stereotype.Component
import kotlin.reflect.KClass

@Component
class OGeoServiceType : BaseGeoServiceType(), OrientDBDocumentEntityType {

    override val entityType: KClass<out EntityType>
        get() = GeoServiceType::class
}