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
package de.ingrid.igeserver.profiles.ingrid_bkg.exporter

import de.ingrid.igeserver.exporter.model.CharacterStringModel
import de.ingrid.igeserver.profiles.ingrid.exporter.AccessConstraint
import de.ingrid.igeserver.profiles.ingrid.exporter.GeodatasetModelTransformer
import de.ingrid.igeserver.profiles.ingrid.exporter.TransformerConfig
import de.ingrid.igeserver.utils.getString
import de.ingrid.igeserver.utils.getStringOrEmpty

class GeodatasetTransformerBkg(transformerConfig: TransformerConfig) : GeodatasetModelTransformer(transformerConfig) {

    private val docData = doc.data

    private val bkgUseConstraintsTitleKey = docData.getStringOrEmpty("resource.useConstraintsBkg.key")
    private val bkgAccessConstraintsTitleKey = docData.getStringOrEmpty("resource.accessConstraintsBkg.key")

    override val useConstraintsCodelistValues: List<String>
        get() {
            return when (bkgUseConstraintsTitleKey) {
                "10" -> listOf("copyright", "otherRestrictions")
                "12" -> listOf("copyright", "otherRestrictions")
                "13" -> listOf("intellectualPropertyRights", "otherRestrictions")
                "14" -> listOf("restricted", "otherRestrictions")
                else -> super.useConstraintsCodelistValues
            }
        }

    override val useConstraints: List<UseConstraintTemplate>
        get() {
            val title = getValueFromCodelistData("10003", bkgUseConstraintsTitleKey) ?: ""
            return super.useConstraints + listOf(
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
                    docData.getStringOrEmpty("resource.useConstraintsBkgSource"),
                    null,
                    bkgUseConstraintsTitleKey,
                    docData.getStringOrEmpty("resource.useConstraintsBkgComment"),
                ),
            )
        }

    override fun getAccessConstraints(): List<AccessConstraint> {
        val title = getValueFromCodelistData("10001", bkgAccessConstraintsTitleKey)
            ?: return super.getAccessConstraints() + AccessConstraint(
                accessConstraintsCodelistValues,
                emptyList(),
            )

        val comment = docData.getString("resource.accessConstraintsBkgComment")

        return super.getAccessConstraints() + AccessConstraint(
            accessConstraintsCodelistValues,
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

    private val accessConstraintsCodelistValues: List<String>
        get() {
            return when (bkgAccessConstraintsTitleKey) {
                "5" -> listOf("copyright", "otherRestrictions")
                "6" -> listOf("license", "otherRestrictions")
                "7" -> listOf("copyright", "license", "otherRestrictions")
                "8" -> listOf("intellectualPropertyRights", "otherRestrictions")
                "9" -> listOf("restricted", "otherRestrictions")
                else -> super.useConstraintsCodelistValues
            }
        }
}
