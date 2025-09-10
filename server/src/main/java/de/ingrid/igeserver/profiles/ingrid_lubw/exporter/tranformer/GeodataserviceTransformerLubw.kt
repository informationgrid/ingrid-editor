/**
 * ==================================================
 * Copyright (C) 2023-2025 wemove digital solutions GmbH
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
package de.ingrid.igeserver.profiles.ingrid_lubw.exporter.tranformer

import de.ingrid.igeserver.profiles.ingrid.exporter.GeodataserviceModelTransformer
import de.ingrid.igeserver.profiles.ingrid.exporter.TransformerConfig

class GeodataserviceTransformerLubw(transformerConfig: TransformerConfig) : GeodataserviceModelTransformer(transformerConfig) {

    // if the document is a service with "Zugang geschützt" or it has access constraints other than "1" ("Es gelten keine Zugriffsbeschränkungen") #4377 #7280
    override fun hasAccessConstraints(): Boolean = super.hasAccessConstraints() || (data.resource?.accessConstraints?.any { it.key != "1" } == true)
}
