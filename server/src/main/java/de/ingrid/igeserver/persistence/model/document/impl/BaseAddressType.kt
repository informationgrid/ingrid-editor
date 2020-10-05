package de.ingrid.igeserver.persistence.model.document.impl

import de.ingrid.igeserver.persistence.model.document.AddressType
import de.ingrid.igeserver.services.DocumentCategory

open class BaseAddressType : AddressType {

    companion object {
        @JvmStatic
        protected val CATEGORY = DocumentCategory.ADDRESS
        @JvmStatic
        protected val TYPE = "AddressDoc"
        @JvmStatic
        protected val PROFILES = arrayOf<String>()
    }

    override val category: String
        get() = CATEGORY.value

    override val profiles: Array<String>
        get() = PROFILES

    override val className: String
        get() = TYPE
}