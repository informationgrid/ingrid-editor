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
package de.ingrid.igeserver.profiles.ingrid_bast.exporter.external

import de.ingrid.igeserver.exporter.model.CharacterStringModel
import de.ingrid.igeserver.profiles.ingrid.exporter.GeodataserviceModelTransformer
import de.ingrid.igeserver.profiles.ingrid.exporter.TransformerConfig
import de.ingrid.igeserver.profiles.ingrid.importer.iso19139.DigitalTransferOption
import de.ingrid.igeserver.utils.getString
import de.ingrid.igeserver.utils.getStringOrEmpty

class GeoserviceTransformerExternalBast(transformerConfig: TransformerConfig) :
    GeodataserviceModelTransformer(transformerConfig) {

    private val docData = doc.data

    init {
        pointOfContact = super.pointOfContact.filter { it.relationType?.key != "2" }
        transformerConfig.model.data.orderInfo = ""
    }

    override val useConstraints: List<UseConstraintTemplate> =
        super.useConstraints + if (docData.getString("resource.useConstraintsComments") == null) {
            emptyList()
        } else {
            listOf(
                UseConstraintTemplate(
                    CharacterStringModel(docData.getStringOrEmpty("resource.useConstraintsComments"), null),
                    null,
                    null,
                    null,
                ),
            )
        }

    override val digitalTransferOptions = emptyList<DigitalTransferOption>()
}
