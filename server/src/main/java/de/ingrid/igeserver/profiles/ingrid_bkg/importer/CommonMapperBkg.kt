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

    fun accessConstraintBkg(metadata: Metadata): AccessConstraint? =
        metadata.identificationInfo[0].identificationInfo?.resourceConstraints
            ?.last { it.legalConstraint?.accessConstraints != null }
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

    fun useConstraintBkg(origUseConstraints: List<UseConstraint>): UseConstraint? = origUseConstraints.last()?.let {
        UseConstraint(
            convertToKeyValueOfCodelistInDataLanguage("10003", it.title?.value),
            it.source,
            it.note,
        )
    }

    private fun convertToKeyValueOfCodelistInDataLanguage(codelist: String, value: String?): KeyValue =
        codeListService.getCodelists(listOf(codelist)).firstOrNull()?.let {
            val entry: CodeListEntry? = it.entries.find { entry -> getDataField(entry.data, "de") == value }
            if (entry == null) {
//        log.error("Value in codelist $codelist not found: $value")
            }
            if (entry == null) KeyValue(null, value) else KeyValue(entry.id)
        } ?: KeyValue(null, value)

    private fun getDataField(jsonData: String, field: String): String? = jacksonObjectMapper().readValue(
        jsonData,
        JsonNode::class.java,
    ).getString(field)
}
