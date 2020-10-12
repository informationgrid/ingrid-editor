package de.ingrid.igeserver.persistence.postgresql.model.document

import de.ingrid.igeserver.persistence.model.EntityType
import de.ingrid.igeserver.persistence.model.document.UvpType
import de.ingrid.igeserver.persistence.model.document.impl.BaseUvpType
import de.ingrid.igeserver.persistence.postgresql.PostgreSQLEntityType
import de.ingrid.igeserver.persistence.postgresql.jpa.EntityBase
import de.ingrid.igeserver.persistence.postgresql.jpa.model.Document
import org.springframework.stereotype.Component
import kotlin.reflect.KClass

@Component
class PUvpType : BaseUvpType(), PostgreSQLEntityType {

    override val entityType: KClass<out EntityType>
        get() = UvpType::class

    override val jpaType: KClass<out EntityBase>
        get() = Document::class
}