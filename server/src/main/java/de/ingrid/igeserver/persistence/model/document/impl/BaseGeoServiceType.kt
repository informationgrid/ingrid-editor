package de.ingrid.igeserver.persistence.model.document.impl

import de.ingrid.igeserver.persistence.model.document.GeoServiceType

open class BaseGeoServiceType : GeoServiceType {

    companion object {
        @JvmStatic
        protected val TYPE = "GeoServiceDoc"
        @JvmStatic
        protected val PROFILES = arrayOf("ingrid")
    }

    override val profiles: Array<String>
        get() = PROFILES

    override val className: String
        get() = TYPE
}