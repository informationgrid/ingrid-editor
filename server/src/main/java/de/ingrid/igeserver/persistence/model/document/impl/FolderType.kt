package de.ingrid.igeserver.persistence.model.document.impl

import de.ingrid.igeserver.persistence.model.EntityType
import de.ingrid.igeserver.services.DocumentCategory
import org.springframework.stereotype.Component

@Component
class FolderType : EntityType() {

    companion object {
        @JvmStatic
        protected val TYPE = DocumentCategory.FOLDER
        @JvmStatic
        protected val PROFILES = arrayOf<String>()
    }

    override val profiles: Array<String>
        get() = PROFILES

    override val className: String
        get() = TYPE.value
}