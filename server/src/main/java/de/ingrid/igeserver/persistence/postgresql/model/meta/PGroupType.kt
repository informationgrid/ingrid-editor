package de.ingrid.igeserver.persistence.postgresql.model.meta

import com.fasterxml.jackson.annotation.JsonIgnore
import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.ArrayNode
import de.ingrid.igeserver.persistence.model.EntityType
import de.ingrid.igeserver.persistence.model.meta.GroupType
import de.ingrid.igeserver.persistence.model.meta.impl.BaseGroupType
import de.ingrid.igeserver.persistence.model.meta.impl.BaseUserInfoType
import de.ingrid.igeserver.persistence.postgresql.PostgreSQLEntityType
import de.ingrid.igeserver.persistence.postgresql.jpa.EmbeddedData
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Group
import de.ingrid.igeserver.persistence.postgresql.jpa.model.impl.EntityBase
import org.springframework.stereotype.Component
import kotlin.reflect.KClass

@Component
class PGroupType : BaseGroupType(), PostgreSQLEntityType {

    companion object {
        private const val ID_ATTRIBUTE = "identifier"
    }

    override val entityType: KClass<out EntityType>
        get() = GroupType::class

    override val jpaType: KClass<out EntityBase>
        get() = Group::class

    override val idAttribute: String?
        get() = ID_ATTRIBUTE
}

@Component
class PermissionsData(
    val pages: JsonNode? = null,
    val actions: JsonNode? = null,
    val documents: ArrayNode? = null,
    val addresses: ArrayNode? = null
) : HashMap<String, Any?>(mapOf("pages" to pages, "actions" to actions, "documents" to documents, 
    "addresses" to addresses)), EmbeddedData {

    companion object {
        @JvmStatic
        protected val TYPE_NAME = "PermissionsData"
    }

    @get:JsonIgnore
    override val typeColumnValue: String
        get() = TYPE_NAME
}
