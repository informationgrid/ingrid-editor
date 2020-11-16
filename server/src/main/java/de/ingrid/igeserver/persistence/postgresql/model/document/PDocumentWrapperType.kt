package de.ingrid.igeserver.persistence.postgresql.model.document

import de.ingrid.igeserver.persistence.model.document.DocumentWrapperType
import de.ingrid.igeserver.persistence.model.EntityType
import de.ingrid.igeserver.persistence.model.document.impl.BaseDocumentWrapperType
import de.ingrid.igeserver.persistence.postgresql.PostgreSQLEntityType
import de.ingrid.igeserver.persistence.postgresql.jpa.model.impl.EntityBase
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.DocumentWrapper
import org.springframework.core.annotation.Order
import org.springframework.stereotype.Component
import kotlin.reflect.KClass
import kotlin.reflect.full.memberProperties

@Component
@Order(2)
class PDocumentWrapperType : BaseDocumentWrapperType(), PostgreSQLEntityType {

    companion object {
        private const val ID_ATTRIBUTE = "uuid"
    }

    override val entityType: KClass<out EntityType>
        get() = DocumentWrapperType::class

    override val jpaType: KClass<out EntityBase>
        get() = DocumentWrapper::class

    override val idAttribute: String?
        get() = ID_ATTRIBUTE
}