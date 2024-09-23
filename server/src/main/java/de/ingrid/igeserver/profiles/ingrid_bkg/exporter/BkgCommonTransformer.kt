package de.ingrid.igeserver.profiles.ingrid_bkg.exporter

import de.ingrid.igeserver.exporter.model.CharacterStringModel
import de.ingrid.igeserver.profiles.ingrid.exporter.AccessConstraint
import de.ingrid.igeserver.profiles.ingrid.exporter.IngridModelTransformer
import de.ingrid.igeserver.profiles.ingrid.exporter.IngridModelTransformer.UseConstraintTemplate
import de.ingrid.igeserver.utils.getString
import de.ingrid.igeserver.utils.getStringOrEmpty

class BkgCommonTransformer(private val modelTransformer: IngridModelTransformer) {

    private val bkgUseConstraintsTitleKey = modelTransformer.doc.data.getStringOrEmpty("resource.useConstraintsBkg.key")
    private val bkgAccessConstraintsTitleKey =
        modelTransformer.doc.data.getStringOrEmpty("resource.accessConstraintsBkg.key")

    fun getUseConstraints(): List<UseConstraintTemplate> {
        val title = modelTransformer.getValueFromCodelistData("10003", bkgUseConstraintsTitleKey) ?: ""
        return modelTransformer.useConstraints + listOf(
            UseConstraintTemplate(
                CharacterStringModel(
                    title,
                    if (bkgUseConstraintsTitleKey == "99") {
                        "http://inspire.ec.europa.eu/metadata-codelist/LimitationsOnPublicAccess/noLimitations"
                    } else {
                        modelTransformer.getValueFromCodelistData(
                            "10003",
                            bkgUseConstraintsTitleKey,
                            "url",
                        )
                    },
                ),
                modelTransformer.doc.data.getStringOrEmpty("resource.useConstraintsBkgSource"),
                null,
                bkgUseConstraintsTitleKey,
                modelTransformer.doc.data.getStringOrEmpty("resource.useConstraintsBkgComment"),
            ),
        )
    }

    fun getAccessConstraints(): List<AccessConstraint> {
        val title = modelTransformer.getValueFromCodelistData("10001", bkgAccessConstraintsTitleKey)
            ?: return modelTransformer.getAccessConstraints() + AccessConstraint(
                accessConstraintsCodelistValues,
                emptyList(),
            )

        val comment = modelTransformer.doc.data.getString("resource.accessConstraintsBkgComment")

        return modelTransformer.getAccessConstraints() + AccessConstraint(
            accessConstraintsCodelistValues,
            listOfNotNull(
                CharacterStringModel(
                    title,
                    if (bkgAccessConstraintsTitleKey == "99") {
                        "http://inspire.ec.europa.eu/metadata-codelist/LimitationsOnPublicAccess/noLimitations"
                    } else {
                        modelTransformer.getValueFromCodelistData(
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

    private val accessConstraintsCodelistValues: List<String>
        get() {
            return when (bkgAccessConstraintsTitleKey) {
                "5" -> listOf("copyright", "otherRestrictions")
                "6" -> listOf("license", "otherRestrictions")
                "7" -> listOf("copyright", "license", "otherRestrictions")
                "8" -> listOf("intellectualPropertyRights", "otherRestrictions")
                "9" -> listOf("restricted", "otherRestrictions")
                else -> modelTransformer.useConstraintsCodelistValues
            }
        }

    val useConstraintsCodelistValue =
        when (bkgUseConstraintsTitleKey) {
            "10" -> listOf("copyright", "otherRestrictions")
            "12" -> listOf("copyright", "otherRestrictions")
            "13" -> listOf("intellectualPropertyRights", "otherRestrictions")
            "14" -> listOf("restricted", "otherRestrictions")
            else -> modelTransformer.useConstraintsCodelistValues
        }
}
