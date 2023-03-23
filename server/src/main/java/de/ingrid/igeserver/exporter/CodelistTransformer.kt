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


    fun getData(codelistId: String, key: String?): String? = key?.let { codelistHandler.getCodelistEntryDataField(codelistId, it) }
    fun getDataField(codelistId: String, key: String?, dataField: String?): String? = getData(codelistId, key)?.let { Regex("\"$dataField\":\"([^\"]*)\"").find(it)?.groupValues?.get(1)}

}

