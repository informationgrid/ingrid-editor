package de.ingrid.igeserver.persistence.postgresql.model.meta

import de.ingrid.igeserver.persistence.postgresql.PostgreSQLEntityType
import de.ingrid.igeserver.persistence.model.meta.BehaviourType
import de.ingrid.igeserver.persistence.model.EntityType
import de.ingrid.igeserver.persistence.model.meta.impl.BaseBehaviourType
import de.ingrid.igeserver.persistence.postgresql.jpa.model.impl.EntityBase
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Behaviour
import org.springframework.stereotype.Component
import kotlin.reflect.KClass

@Component
class PBehaviourType : BaseBehaviourType(), PostgreSQLEntityType {

    companion object {
        private const val ID_ATTRIBUTE = "name"
    }

    override val entityType: KClass<out EntityType>
        get() = BehaviourType::class

    override val jpaType: KClass<out EntityBase>
        get() = Behaviour::class

    override val idAttribute: String?
        get() = ID_ATTRIBUTE
}