package de.ingrid.igeserver.profiles.mcloud.types.impl

import de.ingrid.igeserver.profiles.mcloud.types.MCloudType

open class BaseMCloudType : MCloudType {

    companion object {
        @JvmStatic
        protected val TYPE = "mCloudDoc"
        @JvmStatic
        protected val PROFILES = arrayOf("mcloud")
    }

    override val profiles: Array<String>
        get() = PROFILES

    override val className: String
        get() = TYPE
}