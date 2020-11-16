package de.ingrid.igeserver.persistence.postgresql.model.document

import com.fasterxml.jackson.annotation.JsonIgnore
import de.ingrid.igeserver.persistence.model.EntityType
import de.ingrid.igeserver.persistence.model.document.FolderType
import de.ingrid.igeserver.persistence.model.document.impl.BaseFolderType
import de.ingrid.igeserver.persistence.postgresql.PostgreSQLEntityType
import de.ingrid.igeserver.persistence.postgresql.jpa.EmbeddedData
import de.ingrid.igeserver.persistence.postgresql.jpa.model.impl.EntityBase
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import org.springframework.stereotype.Component
import kotlin.reflect.KClass

@Component
class PFolderType : BaseFolderType(), PostgreSQLEntityType {

    override val entityType: KClass<out EntityType>
        get() = FolderType::class

    override val jpaType: KClass<out EntityBase>
        get() = Document::class
}

/**
 * EmbeddedData type used by Document instances with folder data
 */
@Component
class FolderData : HashMap<String, Any?>(), EmbeddedData {

    companion object {
        @JvmStatic
        protected val TYPE_NAME = BaseFolderType().className
    }

    @get:JsonIgnore
    override val typeColumnValue: String
        get() = TYPE_NAME
}