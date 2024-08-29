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
package de.ingrid.igeserver.profiles.bmi.exporter.model

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import de.ingrid.igeserver.exports.interfaces.dcat.Download
import de.ingrid.igeserver.exports.interfaces.dcat.LinkType
import de.ingrid.igeserver.model.KeyValue
import org.json.simple.parser.JSONParser

@JsonIgnoreProperties(ignoreUnknown = true)
data class DownloadModel(
    val title: String?,
    override val link: LinkTypeModel?,
    val type: KeyValue?,
    val format: KeyValue?,
    val description: String?,
    val license: KeyValue?,
    val byClause: String?,
    val modified: String?,
    val availability: KeyValue?,
    val languages: List<KeyValue>?,
) : Download {
    val languageKeys: List<String>?
        get() = languages?.map { it.key }?.filterNotNull()

    fun getLicenseData(): Any? {
        if (license != null) {
            var jsonString = "{\"id\":\"" + license.key + "\",\"name\":\"" + license.value + "\"}"
            // either use key or if no key search for value
            val entryID = license.key ?: BmiModel.codeListService?.getCodeListEntryId("6500", license.value, "de")
            if (entryID != null) {
                val codeListEntry = BmiModel.codeListService?.getCodeListEntry("6500", entryID)
                if (!codeListEntry?.data.isNullOrEmpty()) {
                    jsonString = codeListEntry?.data.toString()
                } else if (codeListEntry?.getField("de") != null) {
                    jsonString = "{\"id\":\"" + license.key + "\",\"name\":\"" + codeListEntry.getField("de") + "\"}"
                }
            }
            return if (jsonString.isEmpty()) null else JSONParser().parse(jsonString)
        }
        return null
    }
}

@JsonIgnoreProperties(ignoreUnknown = true)
data class LinkTypeModel(override val asLink: Boolean?, override val value: String?) : LinkType
