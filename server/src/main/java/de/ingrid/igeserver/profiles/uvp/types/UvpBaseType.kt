/*
 * ==================================================
 * Copyright (C) 2023-2026 wemove digital solutions GmbH
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
package de.ingrid.igeserver.profiles.uvp.types

import de.ingrid.igeserver.persistence.model.EntityType
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.profiles.uvp.UvpDocumentReferences
import org.springframework.stereotype.Component

@Component
abstract class UvpBaseType : EntityType() {
    override val profiles = arrayOf("uvp")

    override fun getReferenceUUIDs(doc: Document): List<String> = doc.data.path("pointOfContact").values().mapNotNull { address ->
        address.path("ref").asString()
    }

    override fun getUploads(doc: Document): List<String> = UvpDocumentReferences.extractDocument(doc.data)
        .references
        .filterNot { it.isExternalLink }
        .map { it.uri }
}
