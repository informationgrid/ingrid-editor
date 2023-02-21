package de.ingrid.igeserver.exporter

import de.ingrid.igeserver.exporter.model.KeyValueModel
import de.ingrid.igeserver.services.CodelistHandler

open class CodelistTransformer constructor(
    val codelistHandler: CodelistHandler,
    ) {


    fun getValue(codelistId: String, entry: KeyValueModel?): String? {
        return getValue(codelistId, entry, "de")
    }

    fun getValue(codelistId: String, entry: KeyValueModel?, field: String): String? =
        if (entry?.key != null) codelistHandler.getCodelistValue(codelistId, entry.key, field) else entry?.value
}

