package de.ingrid.igeserver.persistence.postgresql.model.document

import de.ingrid.igeserver.persistence.model.EntityType
import de.ingrid.igeserver.persistence.model.document.GeoServiceType
import de.ingrid.igeserver.persistence.model.document.impl.BaseGeoServiceType
import de.ingrid.igeserver.persistence.postgresql.PostgreSQLEntityType
import de.ingrid.igeserver.persistence.postgresql.jpa.EntityBase
import de.ingrid.igeserver.persistence.postgresql.jpa.model.Document
import org.springframework.stereotype.Component
import kotlin.reflect.KClass

@Component
class PGeoServiceType : BaseGeoServiceType(), PostgreSQLEntityType {

    override val entityType: KClass<out EntityType>
        get() = GeoServiceType::class

    override val jpaType: KClass<out EntityBase>
        get() = Document::class
}