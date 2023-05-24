package de.ingrid.igeserver.profiles.ingrid.types

import de.ingrid.igeserver.persistence.model.EntityType
import de.ingrid.igeserver.persistence.model.UpdateReferenceOptions
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import org.springframework.stereotype.Component

@Component
abstract class InGridBaseType : EntityType() {
    override val profiles = arrayOf("ingrid")

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
        return doc.data.get("graphicOverviews")?.let {
            getUploadsFromFileList(it, "fileName")
        } ?: emptyList()
    }
}