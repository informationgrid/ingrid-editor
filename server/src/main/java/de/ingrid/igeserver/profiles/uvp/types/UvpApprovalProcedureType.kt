package de.ingrid.igeserver.profiles.uvp.types

import de.ingrid.igeserver.persistence.model.EntityType
import de.ingrid.igeserver.persistence.model.UpdateReferenceOptions
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component

@Component
class UvpApprovalProcedureType @Autowired constructor() : EntityType() {
    override val className = "UvpApprovalProcedureDoc"
    override val profiles = arrayOf("uvp")

    val log = logger()

    override val jsonSchema = "/uvp/schemes/approval-procedure.schema.json"

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
        /*if( doc.data.get("distributions") != null) {
            val files = doc.data.get("distributions")
                .filter { download -> !download.get("link").get("asLink").booleanValue() }
                .map { download -> getUploadFile(download)}

            return files
        }*/
        return emptyList()
    }

    /*private fun getUploadFile(download: JsonNode): String {
        if (download.get("link").get("uri") !== null) {
            return URLDecoder.decode(download.get("link").get("uri").textValue()!!, "utf-8")
        } else {
            return download.get("link").get("value").textValue()
        }
    }*/


}
