package de.ingrid.igeserver.profiles.mcloud.types.impl

import com.fasterxml.jackson.annotation.JsonIgnore
import de.ingrid.igeserver.persistence.model.EntityType
import de.ingrid.igeserver.persistence.postgresql.PostgreSQLEntityType
import de.ingrid.igeserver.persistence.postgresql.jpa.EmbeddedData
import de.ingrid.igeserver.persistence.postgresql.jpa.model.impl.EntityBase
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.profiles.mcloud.types.MCloudType
import org.springframework.stereotype.Component
import kotlin.reflect.KClass

@Component
class PMCloudType : BaseMCloudType(), PostgreSQLEntityType {

    override val entityType: KClass<out EntityType>
        get() = MCloudType::class

    override val jpaType: KClass<out EntityBase>
        get() = Document::class
}

/**
 * EmbeddedData type used by Document instances with mcloud data
 */
@Component
class MCloudData : HashMap<String, Any?>(), EmbeddedData {

    companion object {
        @JvmStatic
        protected val TYPE_NAME = BaseMCloudType().className
    }

    @get:JsonIgnore
    override val typeColumnValue: String
        get() = TYPE_NAME
}