package de.ingrid.igeserver.persistence.postgresql.model.meta

import de.ingrid.igeserver.persistence.postgresql.PostgreSQLEntityType
import de.ingrid.igeserver.persistence.model.EntityType
import de.ingrid.igeserver.persistence.model.meta.UserInfoType
import de.ingrid.igeserver.persistence.model.meta.impl.BaseUserInfoType
import de.ingrid.igeserver.persistence.postgresql.jpa.EntityBase
import de.ingrid.igeserver.persistence.postgresql.jpa.model.UserInfo
import org.springframework.stereotype.Component
import kotlin.reflect.KClass

@Component
class PUserInfoType : BaseUserInfoType(), PostgreSQLEntityType {

    override val entityType: KClass<out EntityType>
        get() = UserInfoType::class

    override val jpaType: KClass<out EntityBase>
        get() = UserInfo::class
}