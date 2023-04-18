package de.ingrid.igeserver.exporter.model

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.annotation.JsonProperty
import com.fasterxml.jackson.databind.annotation.JsonDeserialize
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.persistence.postgresql.jpa.mapping.DateDeserializer
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.DocumentWrapper
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.igeserver.utils.SpringContext
import java.time.OffsetDateTime

@JsonIgnoreProperties(ignoreUnknown = true)
data class AddressModel(
    @JsonProperty("_uuid") val uuid: String,
    @JsonProperty("_id") val id: Int,
    @JsonProperty("_type") val docType: String,
    val salutation: KeyValueModel?,
    @JsonProperty("academic-title") val academicTitle: KeyValueModel?,
    val firstName: String?,
    val lastName: String?,
    val organization: String?,
    val title: String?,
    val contact: List<ContactModel>,
    val hideAddress: Boolean?,
    var address: Address = Address(false, "", "", "", "", "", null, null),
    var positionName: String?,
    var hoursOfService: String?,
    @JsonDeserialize(using = DateDeserializer::class)
    @JsonProperty("_created") val created: OffsetDateTime,
    @JsonDeserialize(using = DateDeserializer::class)
    @JsonProperty("_modified") val modified: OffsetDateTime,
    @JsonProperty("_parent") val parent: Int?,
) {

    companion object {
        val documentService: DocumentService? by lazy { SpringContext.getBean(DocumentService::class.java) }
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
        if (doc.type == "FOLDER") {
            return emptyList<AddressModel>().toMutableList()
        }

        val publishedDoc = documentService!!.getLastPublishedDocument(catalogIdent, doc.uuid)

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

    fun getNamePresentation() = organization ?: "$lastName, $firstName"
    val telephone: String? get() = contactType("1")
    val fax: String? get() = contactType("2")
    val email: String? get() = contactType("3")
    val homepage: String? get() = contactType("4")

    private fun contactType(type: String): String? = contact
        .firstOrNull { it.type?.key == type }
        ?.connection
}

data class ContactModel(val type: KeyValueModel?, val connection: String?)

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

}
