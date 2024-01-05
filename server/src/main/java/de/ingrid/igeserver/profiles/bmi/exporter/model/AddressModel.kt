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
package de.ingrid.igeserver.profiles.bmi.exporter.model

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.annotation.JsonProperty
import com.fasterxml.jackson.databind.annotation.JsonDeserialize
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.codelists.CodeListService
import de.ingrid.igeserver.ServerException
import de.ingrid.igeserver.persistence.postgresql.jpa.mapping.DateDeserializer
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.DocumentWrapper
import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.igeserver.utils.SpringContext
import java.time.OffsetDateTime

@JsonIgnoreProperties(ignoreUnknown = true)
data class AddressModel(
    @JsonProperty("_uuid") val uuid: String,
    @JsonProperty("_id") val id: Int,
    val salutation: KeyValueModel?,
    @JsonProperty("academic-title") val academicTitle: KeyValueModel?,
    val firstName: String?,
    val lastName: String?,
    val organization: String?,
    val title: String?,
    val contact: List<ContactModel>,
    val hideAddress: Boolean?,
    var address: Address = Address(false, "", "", "", "", "", null, null),
    @JsonDeserialize(using = DateDeserializer::class)
    @JsonProperty("_created") val created: OffsetDateTime,
    @JsonDeserialize(using = DateDeserializer::class)
    @JsonProperty("_modified") val modified: OffsetDateTime,
    @JsonProperty("_parent") val parent: Int?,
) {

    companion object {
        val documentService: DocumentService? by lazy {
            SpringContext.getBean(DocumentService::class.java)
        }
        val codeListService: CodeListService? by lazy {
            SpringContext.getBean(CodeListService::class.java)
        }
        val codelistHandler: CodelistHandler? by lazy {
            SpringContext.getBean(CodelistHandler::class.java)
        }
    }

    init {
        // TODO: add functionality later (#)
        /*if (address.inheritAddress) {
            address = getAddressInformationFromParent(parent)
        }*/
    }

    /**
     *  Get all ancestors of address including itself.
     *  Addresses with the flag hideAddress are ignored,
     *  but only if they have a parent themselves.
     *  @return List of ancestors
     */
    fun getAncestorAddressesIncludingSelf(id: Int?, catalogIdent: String): MutableList<AddressModel> {
        if (id == null) return mutableListOf()

        val doc = documentService!!.getWrapperByDocumentId(id)
        val publishedDoc = documentService!!.getLastPublishedDocument(catalogIdent, doc.uuid)
        if (publishedDoc == null || publishedDoc.type == "FOLDER") {
            return emptyList<AddressModel>().toMutableList()
        }

        val convertedDoc = addInternalFields(publishedDoc, doc)

        return if (doc.parent != null) {
            val ancestors = getAncestorAddressesIncludingSelf(doc.parent!!.id!!, catalogIdent)
            // ignore hideAddress if address has no ancestors
            if (convertedDoc.hideAddress != true || ancestors.isEmpty()) ancestors.add(convertedDoc)
            ancestors
        } else {
            mutableListOf(convertedDoc)
        }
    }

    private fun addInternalFields(publishedParent: Document, wrapper: DocumentWrapper): AddressModel {

        val visibleAddress = publishedParent.data.apply {
            put("_id", wrapper.id)
            put("_uuid", publishedParent.uuid)
            put("_created", publishedParent.created.toString())
            put("_modified", publishedParent.modified.toString())
            put("_parent", wrapper.parent?.id)
        }

        return jacksonObjectMapper().convertValue(visibleAddress, AddressModel::class.java)
    }

/*    @JsonProperty("_parent")
    private fun setParent(value: Int?) {
        if (value != null) {
            val parentAddress = documentService?.getWrapperByDocumentId(value)
            parentUuid = parentAddress?.uuid
            parentName = parentAddress?.published?.title
        }
    }*/

    fun getNamePresentation() = organization ?: "$lastName, $firstName"
    val telephone: String? get() = contactType("1")
    val fax: String? get() = contactType("2")
    val email: String? get() = contactType("3")
    val homepage: String? get() = contactType("4")

    private fun contactType(type: String): String? = contact
        .firstOrNull { it.type?.key == type }
        ?.connection
}

data class ContactModel(val type: KeyValueModel?, val connection: String?){
    val typeLabel: String?
        get() = AddressModel.codeListService?.getCodeListValue("4430", type?.key, "en")
}

@JsonIgnoreProperties(ignoreUnknown = true)
data class Address(
    val inheritAddress: Boolean = false,
    val street: String?,
    @JsonProperty("zip-code") val zipCode: String?,
    val city: String?,
    @JsonProperty("zip-po-box") val zipPoBox: String?,
    @JsonProperty("po-box") val poBox: String?,
    val administrativeArea: KeyValueModel?,
    val country: KeyValueModel?
) {
    val countryKey = country?.key ?: ""

    val countryName: String?
        get() = AddressModel.codeListService?.getCodeListValue("6200", country?.key, "de")
}
