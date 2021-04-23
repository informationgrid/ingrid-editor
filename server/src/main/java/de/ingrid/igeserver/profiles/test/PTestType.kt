package de.ingrid.igeserver.profiles.test

import de.ingrid.igeserver.persistence.model.document.impl.BaseDocumentType
import org.springframework.stereotype.Component

@Component
class PTestType : BaseDocumentType() {

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

    /*override val entityType: KClass<out EntityType>
        get() = PTestType::class
    override val jpaType: KClass<out EntityBase>
        get() = TODO("Not yet implemented")*/

    override fun usedInProfile(profileId: String): Boolean {
        return false
    }
}

/**
 * EmbeddedData type used by Document instances with TestDoc data
 */
@Component
class TestData : HashMap<String, Any?>() {

    companion object {
        @JvmStatic
        protected val TYPE_NAME = PTestType().className
    }

}