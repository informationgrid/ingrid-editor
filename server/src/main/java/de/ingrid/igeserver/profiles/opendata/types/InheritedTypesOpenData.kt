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
package de.ingrid.igeserver.profiles.opendata.types

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.ObjectNode
import de.ingrid.igeserver.persistence.model.EntityType
import de.ingrid.igeserver.persistence.model.UpdateReferenceOptions
import de.ingrid.igeserver.persistence.model.document.impl.AddressType
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.profiles.opendata.OpenDataProfile
import de.ingrid.igeserver.services.DocumentCategory
import de.ingrid.igeserver.services.FIELD_UUID
import org.apache.logging.log4j.kotlin.logger
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component
import java.net.URLDecoder

@Component
class BmiType : EntityType() {
    override val className = "OpenDataDoc"
    override val profiles = arrayOf(OpenDataProfile.id)

    val log = logger()

// TODO:   override val jsonSchema = "/bmi/schemes/bmi.schema.json"

    override fun pullReferences(doc: Document): List<Document> {
        return pullLinkedAddresses(doc)
    }

    override fun updateReferences(doc: Document, options: UpdateReferenceOptions) {
        updateAddresses(doc, options)
    }

    override fun getUploads(doc: Document): List<String> {
        if (doc.data.get("distributions") != null) {
            val files = doc.data.get("distributions")
                .filter { download -> !download.get("link").get("asLink").booleanValue() }
                .map { download -> getUploadFile(download) }

            return files
        }
        return emptyList()
    }

    private fun getUploadFile(download: JsonNode): String {
        if (download.get("link").get("uri") != null) {
            return URLDecoder.decode(download.get("link").get("uri").textValue()!!, "utf-8")
        } else {
            return download.get("link").get("value").textValue()
        }
    }

    private fun pullLinkedAddresses(doc: Document): MutableList<Document> {
        val addressDocs = mutableListOf<Document>()

        val addresses = doc.data.path("addresses")
        for (address in addresses) {
            val addressJson = address.path("ref")
            // during import address already is replaced by UUID
            // TODO: improve import process so we don't need this
            if (addressJson is ObjectNode) {
                val uuid = addressJson.path(FIELD_UUID).textValue()
                val addressDoc = documentService.convertToDocument(addressJson)
                addressDocs.add(addressDoc)
                (address as ObjectNode).put("ref", uuid)
            }
        }
        return addressDocs
    }

    override fun getReferenceIds(doc: Document): List<String> {
        return doc.data.path("addresses").map { address ->
            address.path("ref").textValue()
        }
    }

    private fun updateAddresses(doc: Document, options: UpdateReferenceOptions) {
        return replaceUuidWithReferenceData(doc, "addresses", options)
    }
}

@Component
class OpenDataAddressType(jdbcTemplate: JdbcTemplate) : AddressType(jdbcTemplate) {

// TODO:   override val jsonSchema = "/bmi/schemes/address.schema.json"

    override val category = DocumentCategory.ADDRESS.value

    override val profiles = arrayOf(OpenDataProfile.id)

    override val className = "OpenDataAddressDoc"
}

