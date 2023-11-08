package de.ingrid.igeserver.exporter

import de.ingrid.igeserver.exporter.model.AddressModel
import de.ingrid.igeserver.exporter.model.KeyValueModel
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.igeserver.utils.SpringContext
import java.text.SimpleDateFormat
import java.time.OffsetDateTime
import java.util.*

class AddressModelTransformer(
    private val model: AddressModel,
    val catalogIdentifier: String,
    val codelist: CodelistTransformer,
    val type: KeyValueModel? = null,
) {
    companion object {
        val documentService: DocumentService? by lazy { SpringContext.getBean(DocumentService::class.java) }
    }


    private var displayAddress: AddressModel
    fun getModel() = displayAddress

    // needs to be set in during init phase
    private val ancestorAddressesIncludingSelf: MutableList<AddressModel>

    init {
        ancestorAddressesIncludingSelf = model.getAncestorAddressesIncludingSelf(model.id, catalogIdentifier)
        displayAddress = determineDisplayAddress()
    }



    fun getIndividualName(useDisplayAddress: Boolean): String? {
        val address = if (useDisplayAddress) displayAddress else model

        // format: "lastName, firstName, salutation academicTitle"
        val salutation = codelist.getValue("4300", address.salutation)
        val academicTitle = codelist.getValue("4305", address.academicTitle)
        val namePostFix = listOf(salutation, academicTitle).filter { !it.isNullOrBlank() }.joinToString(" ")
        val individualName =
            listOf(address.lastName, address.firstName, namePostFix).filter { !it.isNullOrBlank() }.joinToString(", ")

        return individualName.ifBlank { null }
    }

    fun getIndividualName(): String? = getIndividualName(true)

    fun getOrganization(): String? =
        if (displayAddress.organization.isNullOrEmpty()) determineEldestAncestor()?.organization else displayAddress.organization

    fun getPositionName(): String? =
        if (displayAddress.positionName.isNullOrEmpty()) determinePositionNameFromAncestors() else displayAddress.positionName


    private fun determineDisplayAddress(): AddressModel {
        val nonHiddenAddress = ancestorAddressesIncludingSelf

        return if (nonHiddenAddress.size > 0) {
            nonHiddenAddress.last()
        } else model
    }

    fun getHierarchy(reverseOrder: Boolean): List<AddressModelTransformer> =
        ancestorAddressesIncludingSelf.map {
            AddressModelTransformer(
                it,
                catalogIdentifier,
                codelist
            )
        }.let{ if (reverseOrder) it.reversed() else it }

    private fun determineEldestAncestor(): AddressModel? =
        ancestorAddressesIncludingSelf.firstOrNull()

    private fun determinePositionNameFromAncestors(): String {
        if (!this.displayAddress.positionName.isNullOrEmpty()) return this.displayAddress.positionName!!
        
        val ancestorsWithoutEldest = ancestorAddressesIncludingSelf.drop(1)
        return ancestorsWithoutEldest
            .filter { !it.organization.isNullOrEmpty() }
            .map { it.organization }
            .joinToString(", ")
    }

    val id = displayAddress.id
    val uuid = displayAddress.uuid
    val isFolder = model.docType == "FOLDER"
    val hoursOfService = displayAddress.hoursOfService
    val country =
        displayAddress.address.country?.let { TransformationTools.getISO3166_1_Alpha_3FromNumericLanguageCode(it) }
    val zipCode = displayAddress.address.zipCode
    val zipPoBox = displayAddress.address.zipPoBox
    val poBox = displayAddress.address.poBox
    val street = displayAddress.address.street
    val city = displayAddress.address.city
    val email = displayAddress.email
    val postBoxAddress =
        listOfNotNull(
            // "Postbox" is a fixed string needed for portal display
            this.poBox?.let { "Postbox $it" },
            this.zipPoBox?.let { it + this.city?.let { " $it" } }).filter { it.isNotEmpty() }
            .joinToString(", ")
    val homepage = displayAddress.homepage
    val telephone = displayAddress.telephone
    val fax = displayAddress.fax

    val administrativeArea = codelist.getCatalogCodelistValue("6250", displayAddress.address.administrativeArea)
    val addressDocType = getAddressDocType(displayAddress.docType)
    fun getAddressDocType(docType: String) = if (docType == "InGridOrganisationDoc") 0 else 2

    val parentAddresses = model.getAncestorAddressesIncludingSelf(model.id, catalogIdentifier).dropLast(1)

    fun getNextParent() = documentService!!.getParentWrapper(model.id)?.uuid

    private val formatterISO = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSXXX")
    private fun formatDate(formatter: SimpleDateFormat, date: OffsetDateTime): String =
        formatter.format(Date.from(date.toInstant()))

    val lastModified = formatDate(formatterISO, displayAddress.modified)

    /**
     * Get all published objects with references to this address.
     */
    fun getObjectReferences(): List<ObjectReference> {
        val addressDoc = getLastPublishedDocument(catalogIdentifier, model.uuid)
        return documentService!!.getIncomingReferences(addressDoc).map {
            val doc = getLastPublishedDocument(catalogIdentifier, it) ?: return@map null

            ObjectReference(
                doc.uuid,
                doc.title ?: "",
                doc.type,
                doc.data.get("description")?.textValue(),
                if (doc.data.has("graphicOverviews")) {
                    doc.data.get("graphicOverviews").firstOrNull()?.get("fileName")?.get("uri")?.textValue()
                } else null
            )
        }.filterNotNull()
    }


    /**
     *  Get all published children of address including.
     *  Addresses with the flag hideAddress are ignored.
     *  @return List of children
     */
    fun getSubordinatedParties(): MutableList<SubordinatedParty> {
        return model.getPublishedChildren(model.id, catalogIdentifier)
            .filter { it.hideAddress == false }
            .map {
                AddressModelTransformer(it, catalogIdentifier, codelist, type)
            }.map {
                SubordinatedParty(
                    it.uuid,
                    it.addressDocType,
                    it.getIndividualName(false),
                    it.model.organization
                )
            }.toMutableList()
    }

    fun getLastPublishedDocument(catalogIdentifier: String, uuid: String): Document? {
        return try {
            documentService!!.getLastPublishedDocument(catalogIdentifier, uuid, forExport = true, resolveLinks = false)
        }catch (e: Exception) {
            null
        }

    }

}

data class ObjectReference(
    val uuid: String,
    val name: String,
    val type: String,
    val description: String?,
    val graphicOverview: String?
)

data class SubordinatedParty(
    val uuid: String,
    val type: Int,
    val individualName: String?,
    val organisationName: String?
)