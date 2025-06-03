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
package de.ingrid.igeserver.profiles.ingrid.types

import de.ingrid.igeserver.api.InvalidField
import de.ingrid.igeserver.api.ValidationException
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.services.DocumentState
import de.ingrid.igeserver.services.InitiatorAction
import de.ingrid.igeserver.utils.getPath
import de.ingrid.igeserver.utils.getString
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component

@Component
class InGridGeoDatasetType(jdbcTemplate: JdbcTemplate) : InGridBaseType(jdbcTemplate) {
    override val className = "InGridGeoDataset"
    override val jsonSchema = "/ingrid/schemes/geo-dataset.schema.json"

    override fun onCreate(doc: Document, initiator: InitiatorAction) {
        super.onCreate(doc, initiator)

        // identifier must be empty, especially during copy operation (#5234)
        if (initiator == InitiatorAction.COPY) {
            doc.data.put("identifier", "")
        }
    }

    override fun onPublish(doc: Document) {
        super.onPublish(doc)

        val allCoupledResourcesPublished = doc.data.getPath("dataQualityInfo.lineage.source.descriptions")
            ?.filter { it.getString("_type") == "internalDataOrigin" }
            ?.map { documentService.docRepo.getByCatalogAndUuidAndIsLatestIsTrue(doc.catalog!!, it.getString("uuidRef")!!) }
            ?.all { it.state == DocumentState.PUBLISHED } ?: true

        if (!allCoupledResourcesPublished) throw ValidationException.withInvalidFields(listOf(InvalidField("dataQualityInfo.lineage.source.descriptions", "INTERNAL_REFERENCES_MUST_BE_PUBLISHED")))
    }
}
