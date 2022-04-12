package de.ingrid.igeserver.services

const val FIELD_STATE = "_state"
const val FIELD_DOCUMENT_TYPE = "_type"
const val FIELD_ID = "_id"
const val FIELD_UUID = "_uuid"
const val PARENT_ID = "_parent"
const val FIELD_CREATED = "_created"
const val FIELD_MODIFIED = "_modified"
const val FIELD_CREATED_BY = "_createdBy"
const val FIELD_MODIFIED_BY = "_modifiedBy"
const val FIELD_HAS_CHILDREN = "_hasChildren"
const val FIELD_PARENT = "_parent"
const val FIELD_PARENT_IS_FOLDER = "_parentIsFolder"
const val FIELD_PENDING_DATE = "_pendingDate"
const val FIELD_CATEGORY = "_category"
const val FIELD_DRAFT = "draft"
const val FIELD_PUBLISHED = "published"
const val FIELD_ARCHIVE = "archive"
const val FIELD_VERSION = "_version"

enum class DocumentCategory(val value: String) {
    // used in FIELD_CATEGORY
    DATA("data"),
    ADDRESS("address"),
    // used in FIELD_DOCUMENT_TYPE
    FOLDER("FOLDER")
}
