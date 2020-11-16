package de.ingrid.igeserver.profiles.test

import com.fasterxml.jackson.annotation.JsonIgnore
import de.ingrid.igeserver.persistence.model.EntityType
import de.ingrid.igeserver.persistence.model.document.impl.BaseDocumentType
import de.ingrid.igeserver.persistence.postgresql.PostgreSQLEntityType
import de.ingrid.igeserver.persistence.postgresql.jpa.EmbeddedData
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.persistence.postgresql.jpa.model.impl.EntityBase
import org.springframework.stereotype.Component
import kotlin.reflect.KClass

@Component
class PTestType : BaseDocumentType(), PostgreSQLEntityType {

    companion object {
        @JvmStatic
        protected val TYPE = "TestDoc"
        @JvmStatic
        protected val PROFILES = arrayOf("mcloud")
    }

    override val profiles: Array<String>
        get() = PROFILES

    override val className: String
        get() = TYPE

    override val entityType: KClass<out EntityType>
        get() = PTestType::class

    override val jpaType: KClass<out EntityBase>
        get() = Document::class

    override fun usedInProfile(profileId: String): Boolean {
        return false
    }
}

/**
 * EmbeddedData type used by Document instances with TestDoc data
 */
@Component
class TestData : HashMap<String, Any?>(), EmbeddedData {

    companion object {
        @JvmStatic
        protected val TYPE_NAME = PTestType().className
    }

    @get:JsonIgnore
    override val typeColumnValue: String
        get() = TYPE_NAME
}