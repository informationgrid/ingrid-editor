/**
 * ==================================================
 * Copyright (C) 2025 wemove digital solutions GmbH
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
package de.ingrid.igeserver.profiles.ingrid_bkg.importer

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.codelists.model.CodeListEntry
import de.ingrid.igeserver.exports.iso.Metadata
import de.ingrid.igeserver.model.KeyValue
import de.ingrid.igeserver.profiles.ingrid.importer.iso19139.UseConstraint
import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.igeserver.utils.getString

data class AccessConstraint(
    val title: KeyValue?,
    val note: String? = null,
)

class CommonMapperBkg(val codeListService: CodelistHandler) {

    fun accessConstraintsOverride(origAccessConstraints: List<KeyValue>, metadata: Metadata): List<KeyValue> {
        val bkgConstraint = accessConstraintBkg(metadata)
        val numberOfOtherConstraints = when {
            bkgConstraint?.title != null && bkgConstraint.note != null -> 2
            bkgConstraint?.title != null || bkgConstraint?.note != null -> 1
            else -> 0
        }
        return origAccessConstraints.dropLast(numberOfOtherConstraints)
    }

    fun accessConstraintBkg(metadata: Metadata): AccessConstraint? = metadata.identificationInfo[0].identificationInfo?.resourceConstraints
        ?.lastOrNull { it.legalConstraint?.accessConstraints != null }
        ?.let {
            val otherConstraints = it.legalConstraint?.otherConstraints
            when (otherConstraints?.size) {
                1 -> AccessConstraint(
                    convertToKeyValueOfCodelistInDataLanguage(
                        "10001",
                        otherConstraints[0].value!!,
                    ),
                )

                2 -> AccessConstraint(
                    convertToKeyValueOfCodelistInDataLanguage("10001", otherConstraints[0].value!!),
                    otherConstraints[1].value,
                )

                else -> null
            }
        }

    fun useConstraintBkg(origUseConstraints: List<UseConstraint>): UseConstraint? = origUseConstraints.lastOrNull()?.let {
        UseConstraint(
            convertToKeyValueOfCodelistInDataLanguage("10003", it.title?.value),
            it.source,
            it.note,
        )
    }

    private fun convertToKeyValueOfCodelistInDataLanguage(codelist: String, value: String?): KeyValue = codeListService.getCodelists(listOf(codelist)).firstOrNull()?.let {
        val entry: CodeListEntry? = it.entries.find { entry -> getDataField(entry.data, "de") == value }
        if (entry == null) {
//        log.error("Value in codelist $codelist not found: $value")
        }
        if (entry == null) KeyValue(null, value) else KeyValue(entry.id)
    } ?: KeyValue(null, value)

    private fun getDataField(jsonData: String?, field: String): String? {
        if (jsonData.isNullOrEmpty()) return null
        return jacksonObjectMapper().readValue(
            jsonData,
            JsonNode::class.java,
        ).getString(field)
    }
}
