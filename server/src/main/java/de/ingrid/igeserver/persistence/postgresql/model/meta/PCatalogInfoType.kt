package de.ingrid.igeserver.persistence.postgresql.model.meta

import de.ingrid.igeserver.persistence.postgresql.PostgreSQLEntityType
import de.ingrid.igeserver.persistence.model.meta.CatalogInfoType
import de.ingrid.igeserver.persistence.model.EntityType
import de.ingrid.igeserver.persistence.model.meta.impl.BaseCatalogInfoType
import de.ingrid.igeserver.persistence.postgresql.jpa.model.impl.EntityBase
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import org.springframework.stereotype.Component
import kotlin.reflect.KClass

@Component
class PCatalogInfoType : BaseCatalogInfoType(), PostgreSQLEntityType {

    override val entityType: KClass<out EntityType>
        get() = CatalogInfoType::class

    override val jpaType: KClass<out EntityBase>
        get() = Catalog::class
}