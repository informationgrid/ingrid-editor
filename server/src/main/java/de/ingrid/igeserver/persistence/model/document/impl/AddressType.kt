package de.ingrid.igeserver.persistence.model.document.impl

import de.ingrid.igeserver.persistence.model.EntityType
import de.ingrid.igeserver.services.DocumentCategory
import org.springframework.stereotype.Component

@Component
class AddressType : EntityType() {

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