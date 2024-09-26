package de.ingrid.igeserver.profiles.ingrid_bkg.exporter

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.exporter.CodelistTransformer
import de.ingrid.igeserver.exporter.model.CharacterStringModel
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.profiles.ingrid.exporter.AccessConstraint
import de.ingrid.igeserver.profiles.ingrid.exporter.IngridModelTransformer.UseConstraintTemplate
import de.ingrid.igeserver.utils.getString
import de.ingrid.igeserver.utils.getStringOrEmpty

class BkgCommonTransformer(private val codelists: CodelistTransformer, private val doc: Document) {

    private val bkgUseConstraintsTitleKey = doc.data.getStringOrEmpty("resource.useConstraintsBkg.key")
    private val bkgAccessConstraintsTitleKey =
        doc.data.getStringOrEmpty("resource.accessConstraintsBkg.key")

    fun getUseConstraints(): List<UseConstraintTemplate> {
        val title = getValueFromCodelistData("10003", bkgUseConstraintsTitleKey) ?: ""
        return listOf(
            UseConstraintTemplate(
                CharacterStringModel(
                    title,
                    if (bkgUseConstraintsTitleKey == "99") {
                        "http://inspire.ec.europa.eu/metadata-codelist/LimitationsOnPublicAccess/noLimitations"
                    } else {
                        getValueFromCodelistData(
                            "10003",
                            bkgUseConstraintsTitleKey,
                            "url",
                        )
                    },
                ),
                doc.data.getStringOrEmpty("resource.useConstraintsBkgSource"),
                null,
                bkgUseConstraintsTitleKey,
                doc.data.getStringOrEmpty("resource.useConstraintsBkgComment"),
            ),
        )
    }

    fun getAccessConstraints(defaultAccessConstraintsCodelistValues: List<String>): AccessConstraint {
        val title = getValueFromCodelistData("10001", bkgAccessConstraintsTitleKey)
            ?: return AccessConstraint(
                accessConstraintsCodelistValues ?: defaultAccessConstraintsCodelistValues,
                emptyList(),
            )

        val comment = doc.data.getString("resource.accessConstraintsBkgComment")

        return AccessConstraint(
            accessConstraintsCodelistValues ?: defaultAccessConstraintsCodelistValues,
            listOfNotNull(
                CharacterStringModel(
                    title,
                    if (bkgAccessConstraintsTitleKey == "99") {
                        "http://inspire.ec.europa.eu/metadata-codelist/LimitationsOnPublicAccess/noLimitations"
                    } else {
                        getValueFromCodelistData(
                            "10001",
                            bkgAccessConstraintsTitleKey,
                            "url",
                        )
                    },
                ),
                if (comment != null) CharacterStringModel(comment, null) else null,
            ),
        )
    }

    private fun getValueFromCodelistData(codelistId: String, key: String, field: String = "de"): String? {
        val jsonData = codelists.getData(
            codelistId,
            key,
        )

        if (jsonData.isNullOrEmpty()) return null

        return jacksonObjectMapper().readValue(
            jsonData,
            JsonNode::class.java,
        ).getString(field)
    }

    private val accessConstraintsCodelistValues: List<String>?
        get() {
            return when (bkgAccessConstraintsTitleKey) {
                "5" -> listOf("copyright", "otherRestrictions")
                "6" -> listOf("license", "otherRestrictions")
                "7" -> listOf("copyright", "license", "otherRestrictions")
                "8" -> listOf("intellectualPropertyRights", "otherRestrictions")
                "9" -> listOf("restricted", "otherRestrictions")
                else -> null
            }
        }

    val useConstraintsCodelistValue =
        when (bkgUseConstraintsTitleKey) {
            "10" -> listOf("copyright", "otherRestrictions")
            "12" -> listOf("copyright", "otherRestrictions")
            "13" -> listOf("intellectualPropertyRights", "otherRestrictions")
            "14" -> listOf("restricted", "otherRestrictions")
            else -> null
        }
}
