package de.ingrid.igeserver.persistence.model.document.impl

import de.ingrid.igeserver.persistence.model.document.DocumentWrapperType

open class BaseDocumentWrapperType : DocumentWrapperType {

    companion object {
        @JvmStatic
        protected val TYPE = "DocumentWrapper"
        @JvmStatic
        protected val PROFILES = arrayOf<String>()
    }

    override val profiles: Array<String>
        get() = PROFILES

    override val className: String
        get() = TYPE
}