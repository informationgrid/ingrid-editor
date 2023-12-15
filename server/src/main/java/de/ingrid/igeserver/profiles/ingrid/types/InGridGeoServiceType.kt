/**
 * ==================================================
 * Copyright (C) 2023 wemove digital solutions GmbH
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
import de.ingrid.igeserver.services.DOCUMENT_STATE
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component

@Component
class InGridGeoServiceType(jdbcTemplate: JdbcTemplate) : InGridBaseType(jdbcTemplate) {
    override val className = "InGridGeoService"

    override fun onPublish(doc: Document) {
        super.onPublish(doc)
        
        val allCoupledResourcesPublished = doc.data.get("service")?.get("coupledResources")
            ?.filter { !it.get("isExternalRef").asBoolean() }
            ?.map { documentService.docRepo.getByCatalogAndUuidAndIsLatestIsTrue(doc.catalog!!, it.get("uuid").asText() ) }
            ?.all { it.state == DOCUMENT_STATE.PUBLISHED } ?: true
        
        if (!allCoupledResourcesPublished) throw ValidationException.withInvalidFields(InvalidField("service.coupledResources", "COUPLED_RESOURCES_MUST_BE_PUBLISHED"))
    }

    override val jsonSchema = "/ingrid/schemes/geo-service.schema.json"
}
