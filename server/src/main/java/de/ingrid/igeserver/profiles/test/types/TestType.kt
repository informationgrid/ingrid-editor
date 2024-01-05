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
package de.ingrid.igeserver.profiles.mcloud.types

import com.fasterxml.jackson.databind.node.ObjectNode
import de.ingrid.igeserver.persistence.model.EntityType
import de.ingrid.igeserver.persistence.model.UpdateReferenceOptions
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.services.FIELD_UUID
import org.apache.logging.log4j.kotlin.logger
import org.springframework.stereotype.Component

@Component
class TestType : EntityType() {

    override val className = "TestDoc"
    override val profiles = listOf("mcloud", "test").toTypedArray()

    val log = logger()

    override fun usedInProfile(profileId: String): Boolean {
        return false
    }

    override fun pullReferences(doc: Document): List<Document> {
        return pullLinkedAddresses(doc)
    }

    override fun updateReferences(doc: Document, options: UpdateReferenceOptions) {
        updateAddresses(doc, options)
    }

    private fun pullLinkedAddresses(doc: Document): MutableList<Document> {
        val addressDocs = mutableListOf<Document>()

        val addresses = doc.data.path("addresses")
        for (address in addresses) {
            val addressJson = address.path("ref")
            val uuid = addressJson.path(FIELD_UUID).textValue()
            val addressDoc = documentService.convertToDocument(addressJson)
            addressDocs.add(addressDoc)
            (address as ObjectNode).put("ref", uuid)
        }
        return addressDocs
    }

    private fun updateAddresses(doc: Document, options: UpdateReferenceOptions) {
        return replaceUuidWithReferenceData(doc, "addresses", options)
    }
}
