package de.ingrid.igeserver.persistence.postgresql.model.meta

import de.ingrid.igeserver.persistence.postgresql.PostgreSQLEntityType
import de.ingrid.igeserver.persistence.model.EntityType
import de.ingrid.igeserver.persistence.model.meta.VersionInfoType
import de.ingrid.igeserver.persistence.model.meta.impl.BaseVersionInfoType
import de.ingrid.igeserver.persistence.postgresql.jpa.model.impl.EntityBase
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.VersionInfo
import org.springframework.stereotype.Component
import kotlin.reflect.KClass

@Component
class PVersionInfoType : BaseVersionInfoType(), PostgreSQLEntityType {

    companion object {
        private const val ID_ATTRIBUTE = "identifier"
    }

    override val entityType: KClass<out EntityType>
        get() = VersionInfoType::class

    override val jpaType: KClass<out EntityBase>
        get() = VersionInfo::class

    override val idAttribute: String?
        get() = ID_ATTRIBUTE
}