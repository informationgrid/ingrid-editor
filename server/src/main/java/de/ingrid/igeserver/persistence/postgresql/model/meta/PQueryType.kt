package de.ingrid.igeserver.persistence.postgresql.model.meta

import de.ingrid.igeserver.persistence.model.EntityType
import de.ingrid.igeserver.persistence.model.meta.QueryType
import de.ingrid.igeserver.persistence.model.meta.impl.BaseQueryType
import de.ingrid.igeserver.persistence.postgresql.PostgreSQLEntityType
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Query
import de.ingrid.igeserver.persistence.postgresql.jpa.model.impl.EntityBase
import org.springframework.stereotype.Component
import kotlin.reflect.KClass

@Component
class PQueryType: BaseQueryType(), PostgreSQLEntityType {
    override val entityType: KClass<out EntityType>
        get() = QueryType::class
    
    override val jpaType: KClass<out EntityBase>
        get() = Query::class
}