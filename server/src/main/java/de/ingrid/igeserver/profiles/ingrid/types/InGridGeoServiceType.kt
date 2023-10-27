package de.ingrid.igeserver.profiles.ingrid.types

import de.ingrid.igeserver.api.InvalidField
import de.ingrid.igeserver.api.ValidationException
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.services.DOCUMENT_STATE
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component

@Component
class InGridGeoServiceType @Autowired constructor(jdbcTemplate: JdbcTemplate) : InGridBaseType(jdbcTemplate) {
    override val className = "InGridGeoService"

    override fun onPublish(doc: Document) {
        super.onPublish(doc)
        
        val allCoupledResourcesPublished = doc.data.get("service")?.get("coupledResources")
            ?.filter { !it.get("isExternalRef").asBoolean() }
            ?.map { documentService.docRepo.getByCatalogAndUuidAndIsLatestIsTrue(doc.catalog!!, it.get("uuid").asText() ) }
            ?.all { it.state == DOCUMENT_STATE.PUBLISHED } ?: true
        
        if (!allCoupledResourcesPublished) throw ValidationException.withInvalidFields(InvalidField("service.coupledResources", "Not all coupled resources are published"))
    }

    override val jsonSchema = "/ingrid/schemes/geo-service.schema.json"
}
