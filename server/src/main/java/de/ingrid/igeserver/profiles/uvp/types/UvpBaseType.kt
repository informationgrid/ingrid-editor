package de.ingrid.igeserver.profiles.uvp.types

import de.ingrid.igeserver.persistence.model.EntityType
import de.ingrid.igeserver.persistence.model.UpdateReferenceOptions
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component

@Component
abstract class UvpBaseType @Autowired constructor() : EntityType() {
    override val profiles = arrayOf("uvp")

    override fun pullReferences(doc: Document): List<Document> {
        return pullLinkedAddresses(doc)
    }

    override fun updateReferences(doc: Document, options: UpdateReferenceOptions) {
        updateAddresses(doc, options)
    }

    private fun pullLinkedAddresses(doc: Document): MutableList<Document> {
        return replaceWithReferenceUuid(doc, "pointOfContact")
    }

    override fun getReferenceIds(doc: Document): List<String> {
        return doc.data.path("pointOfContact").map { address ->
            address.path("ref").textValue()
        }
    }

    private fun updateAddresses(doc: Document, options: UpdateReferenceOptions) {
        return replaceUuidWithReferenceData(doc, "pointOfContact", options)
    }

    override fun getUploads(doc: Document): List<String> {
        val uploads = mutableListOf<String>()
        val fileFields = arrayOf(
            "decisionDocs",
            "approvalDocs",
            "considerationDocs",
            "furtherDocs",
            "reportsRecommendationDocs",
            "applicationDocs",
            "announcementDocs"
        )
        doc.data.get("processingSteps")?.forEach { step ->
            fileFields.forEach { field ->
                step.get(field)?.forEach { file ->
                    val url = file.get("downloadURL")
                    if(!url.get("asLink").asBoolean()) {
                        uploads.add(url.get("uri").textValue())
                    }
                }
            }
        }
        return uploads
    }
}
