package de.ingrid.igeserver.persistence.postgresql.model.document

import de.ingrid.igeserver.persistence.model.EntityType
import de.ingrid.igeserver.persistence.model.document.DocumentType
import de.ingrid.igeserver.persistence.model.document.impl.BaseDocumentType
import de.ingrid.igeserver.persistence.postgresql.PostgreSQLEntityType
import de.ingrid.igeserver.persistence.postgresql.jpa.model.impl.EntityBase
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import org.springframework.core.annotation.Order
import org.springframework.stereotype.Component
import kotlin.reflect.KClass

@Component
@Order(1)
class PDocumentType : BaseDocumentType(), PostgreSQLEntityType {

    override val entityType: KClass<out EntityType>
        get() = DocumentType::class

    override val jpaType: KClass<out EntityBase>
        get() = Document::class
}