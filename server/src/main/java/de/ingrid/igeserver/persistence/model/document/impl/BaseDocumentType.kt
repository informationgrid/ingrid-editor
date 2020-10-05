package de.ingrid.igeserver.persistence.model.document.impl

import de.ingrid.igeserver.persistence.model.document.DocumentType

open class BaseDocumentType : DocumentType {

    companion object {
        @JvmStatic
        protected val TYPE = "Document"
        @JvmStatic
        protected val PROFILES = arrayOf<String>()
    }

    override val profiles: Array<String>
        get() = PROFILES

    override val className: String
        get() = TYPE
}