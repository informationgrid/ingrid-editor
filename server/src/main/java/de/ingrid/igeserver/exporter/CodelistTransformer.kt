/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
package de.ingrid.igeserver.exporter

import de.ingrid.igeserver.model.KeyValue
import de.ingrid.igeserver.services.CodelistHandler

open class CodelistTransformer constructor(
    val codelistHandler: CodelistHandler,
    val catalogIdentifier: String,
) {


    fun getValue(codelistId: String, entry: KeyValue?): String? {
        return getValue(codelistId, entry, "de")
    }

    fun getCatalogCodelistValue(codelistId: String, entry: KeyValue?): String? =
    if (entry?.key != null) codelistHandler.getCatalogCodelistValue( catalogIdentifier, codelistId, entry.key) else entry?.value

    fun getValue(codelistId: String, entry: KeyValue?, field: String): String? =
        if (entry?.key != null) codelistHandler.getCodelistValue(codelistId, entry.key, field) else entry?.value


    fun getData(codelistId: String, key: String?): String? = key?.let { codelistHandler.getCodelistEntryDataField(codelistId, it) }
    fun getDataField(codelistId: String, key: String?, dataField: String?): String? = getData(codelistId, key)?.let { Regex("\"$dataField\":\"([^\"]*)\"").find(it)?.groupValues?.get(1)}

}

