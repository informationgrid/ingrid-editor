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
import org.springframework.dao.EmptyResultDataAccessException
import java.time.OffsetDateTime

@JsonIgnoreProperties(ignoreUnknown = true)
data class AddressModel(
    @JsonProperty("_uuid") var uuid: String,
    @JsonProperty("_id") var id: Int,
    @JsonProperty("_type") var docType: String,
    val salutation: KeyValueModel?,
    @JsonProperty("academic-title") val academicTitle: KeyValueModel?,
    val firstName: String?,
    val lastName: String?,
    val organization: String?,
    var title: String?,
    val contact: List<ContactModel> = emptyList(),
    val hideAddress: Boolean?,
    var address: Address = Address(false, "", "", "", "", "", null, null),
    var positionName: String?,
    var hoursOfService: String?,
    @JsonDeserialize(using = DateDeserializer::class)
    @JsonProperty("_created") var created: OffsetDateTime,
    @JsonDeserialize(using = DateDeserializer::class)
    @JsonProperty("_modified") var modified: OffsetDateTime,
    @JsonDeserialize(using = DateDeserializer::class)
    @JsonProperty("_contentModified") var contentmodified: OffsetDateTime,
    @JsonProperty("_parent") var parent: Int?,
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
     *  Addresses that are not published are ignored.
     *  @return List of ancestors from eldest to youngest including self
     */
    fun getAncestorAddressesIncludingSelf(id: Int?, catalogIdent: String): MutableList<AddressModel> {
        if (id == null) return mutableListOf()

        val doc = documentService!!.getWrapperByDocumentId(id)
        if (doc.type == "FOLDER") {
            return emptyList<AddressModel>().toMutableList()
        }

        val convertedDoc = try {
            val publishedDoc = documentService!!.getLastPublishedDocument(catalogIdent, doc.uuid)
            addInternalFields(publishedDoc, doc)
        } catch (ex: EmptyResultDataAccessException) {
            // no published document found
            null
        }


        return if (doc.parent != null) {
            val ancestors = getAncestorAddressesIncludingSelf(doc.parent!!.id!!, catalogIdent)
            // ignore hideAddress if address has no ancestors. only add if convertedDoc is not null
            if ( convertedDoc?.hideAddress != true || ancestors.isEmpty()) convertedDoc?.let { ancestors.add(it) }
            ancestors
        } else {
            if (convertedDoc  != null) mutableListOf(convertedDoc) else mutableListOf()
        }
    }

    fun getPublishedChildren(id: Int?, catalogIdent: String): List<AddressModel> =
        documentService!!.findChildrenDocs(catalogIdent, id, true).hits
            .mapNotNull {
                try {
                    val doc =
                        documentService!!.getLastPublishedDocument(catalogIdent, it.wrapper.uuid, resolveLinks = false)
                    this.addInternalFields(doc, it.wrapper)
                } catch (ex: EmptyResultDataAccessException) {
                    null
                }
            }


    private fun addInternalFields(document: Document, wrapper: DocumentWrapper): AddressModel {

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
