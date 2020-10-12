package de.ingrid.igeserver.persistence.postgresql.model.document

import com.fasterxml.jackson.annotation.JsonIgnore
import de.ingrid.igeserver.persistence.model.document.AddressType
import de.ingrid.igeserver.persistence.model.EntityType
import de.ingrid.igeserver.persistence.model.document.impl.BaseAddressType
import de.ingrid.igeserver.persistence.postgresql.PostgreSQLEntityType
import de.ingrid.igeserver.persistence.postgresql.jpa.model.Document
import de.ingrid.igeserver.persistence.postgresql.jpa.EmbeddedData
import de.ingrid.igeserver.persistence.postgresql.jpa.EntityBase
import org.springframework.stereotype.Component
import kotlin.reflect.KClass

@Component
class PAddressType : BaseAddressType(), PostgreSQLEntityType {

    override val entityType: KClass<out EntityType>
        get() = AddressType::class

    override val jpaType: KClass<out EntityBase>
        get() = Document::class
}

@Component
class AddressData(
    val firstName: String? = null,
    val lastName: String? = null,
    val company: String? = null
) : HashMap<String, Any?>(mapOf("firstName" to firstName, "lastName" to lastName, "company" to company)), EmbeddedData {

    companion object {
        @JvmStatic
        protected val TYPE_NAME = "AddressDoc"
    }

    @get:JsonIgnore
    override val typeColumnValue: String
        get() = TYPE_NAME
}