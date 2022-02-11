package de.ingrid.igeserver.profiles.uvp.types

import com.fasterxml.jackson.databind.JsonNode
import de.ingrid.igeserver.persistence.model.EntityType
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.services.DocumentService
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component
import java.net.URLDecoder

@Component
class UvpAdmissionProcedureType @Autowired constructor(val docService: DocumentService) : EntityType() {
    override val className = "UvpAdmissionProcedureDoc"
    override val profiles = arrayOf("uvp")

    val log = logger()

//    override val jsonSchema = "/mcloud/schemes/mcloud.schema.json"

    /*override fun pullReferences(doc: Document): List<Document> {
    }

    override fun updateReferences(doc: Document, options: UpdateReferenceOptions) {
    }*/

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
