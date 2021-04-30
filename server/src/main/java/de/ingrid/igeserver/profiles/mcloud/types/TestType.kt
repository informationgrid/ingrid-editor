package de.ingrid.igeserver.profiles.mcloud.types

import de.ingrid.igeserver.persistence.model.EntityType
import org.springframework.stereotype.Component

@Component
class TestType : EntityType() {

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

    override fun usedInProfile(profileId: String): Boolean {
        return false
    }
}