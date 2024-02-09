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
package de.ingrid.igeserver.exporter.model

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.annotation.JsonProperty
import com.fasterxml.jackson.databind.annotation.JsonDeserialize
import de.ingrid.igeserver.persistence.postgresql.jpa.mapping.DateDeserializer
import de.ingrid.igeserver.model.KeyValue
import java.time.OffsetDateTime

@JsonIgnoreProperties(ignoreUnknown = true)
data class AddressModel(
    @JsonProperty("_uuid") val uuid: String,
    @JsonProperty("_id") val id: Int,
    @JsonProperty("_type") val docType: String,
    val salutation: KeyValue?,
    @JsonProperty("academic-title") val academicTitle: KeyValue?,
    val firstName: String?,
    val lastName: String?,
    val organization: String?,
    val title: String?,
    val contact: List<ContactModel> = emptyList(),
    val hideAddress: Boolean?,
    var address: Address = Address(false, "", "", "", "", "", null, null),
    var positionName: String?,
    var hoursOfService: String?,
    @JsonDeserialize(using = DateDeserializer::class)
    @JsonProperty("_created") val created: OffsetDateTime,
    @JsonDeserialize(using = DateDeserializer::class)
    @JsonProperty("_modified") val modified: OffsetDateTime,
    @JsonDeserialize(using = DateDeserializer::class)
    @JsonProperty("_contentModified") val contentmodified: OffsetDateTime,
    @JsonProperty("_parent") val parent: Int?,
) {

    /**
     *  Get all ancestors of address including itself.
     *  Addresses with the flag hideAddress are ignored,
     *  but only if they have a parent themselves.
     *  Addresses that are not published are ignored.
     *  @return List of ancestors from eldest to youngest including self
     */
    /*
        fun getAncestorAddressesIncludingSelf(documentService: DocumentService, id: Int?, catalogIdent: String): MutableList<DocumentData> {
            if (id == null) return mutableListOf()
    
            val wrapper = documentService.getWrapperByDocumentId(id)
            if (wrapper.type == "FOLDER") return mutableListOf()
    
            val convertedDoc = try {
                val publishedDoc = documentService.getLastPublishedDocument(catalogIdent, wrapper.uuid)
                DocumentData(wrapper, publishedDoc)
            } catch (ex: EmptyResultDataAccessException) {
                // no published document found
                null
            }
    
            return if (wrapper.parent != null) {
                val ancestors = getAncestorAddressesIncludingSelf(documentService, wrapper.parent!!.id!!, catalogIdent)
                // ignore hideAddress if address has no ancestors. only add if convertedDoc is not null
                if ( convertedDoc?.document?.data?.get("hideAddress")?.asBoolean() != true || ancestors.isEmpty()) convertedDoc?.let { ancestors.add(it) }
                ancestors
            } else {
                if (convertedDoc  != null) mutableListOf(convertedDoc) else mutableListOf()
            }
        }
    */

    /*fun getPublishedChildren(documentService: DocumentService, id: Int?, catalogIdent: String): List<DocumentData> =
        documentService.findChildrenDocs(catalogIdent, id, true).hits*/


    /*private fun addInternalFields(document: Document, wrapper: DocumentWrapper): Document {

        val visibleAddress = document.data.apply {
            put("_id", wrapper.id)
            put("_type", wrapper.type)
            put("_uuid", document.uuid)
            put("_created", document.created.toString())
            put("_modified", document.modified.toString())
            put("_contentModified", document.contentmodified.toString())
            put("_parent", wrapper.parent?.id)
            put("title", document.title)
        }

        return visibleAddress
    }*/

    /*
        private fun getAddressInformationFromParent(parentId: Int?): Address {
            val emptyAddress = Address(false, "", "", "", "", "", null, null)
            if (parentId == null) return emptyAddress

            val parentAddress = documentService?.getWrapperByDocumentId(parentId) ?: return emptyAddress
            if (parentAddress.type == "FOLDER") {
                throw ServerException.withReason("Folder not allowed as parent of inherited address")
            }

            val jsonParentAddress = parentAddress.published?.data?.get("address") ?: return emptyAddress
            val parent = jacksonObjectMapper().readValue(jsonParentAddress.toString(), Address::class.java)

            return try {
                if (parent.inheritAddress && parentAddress.parent?.id != null)
                    getAddressInformationFromParent(parentAddress.parent?.id)
                else parent
            } catch(ex: ServerException) {
                // parent probably was a folder and inherited field accidentally was set to true
                parent
            }

        }
    */

    /*    @JsonProperty("_parent")
        private fun setParent(value: Int?) {
            if (value != null) {
                val parentAddress = documentService?.getWrapperByDocumentId(value)
                parentUuid = parentAddress?.uuid
                parentName = parentAddress?.published?.title
            }
        }*/

    val telephone: String? get() = contactType("1")
    val fax: String? get() = contactType("2")
    val email: String? get() = contactType("3")
    val homepage: String? get() = contactType("4")

    private fun contactType(type: String): String? = contact
        .firstOrNull { it.type?.key == type }
        ?.connection
}

data class ContactModel(val type: KeyValue?, val connection: String?)

@JsonIgnoreProperties(ignoreUnknown = true)
data class Address(
    val inheritAddress: Boolean = false,
    val street: String?,
    @JsonProperty("zip-code") val zipCode: String?,
    val city: String?,
    @JsonProperty("zip-po-box") val zipPoBox: String?,
    @JsonProperty("po-box") val poBox: String?,
    val administrativeArea: KeyValue?,
    val country: KeyValue?
) {
    val countryKey = country?.key ?: ""

}
