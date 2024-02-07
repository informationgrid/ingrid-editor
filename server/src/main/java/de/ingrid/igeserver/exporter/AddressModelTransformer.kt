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
package de.ingrid.igeserver.exporter

import com.fasterxml.jackson.databind.JsonNode
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.model.KeyValue
import de.ingrid.igeserver.services.DocumentData
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.igeserver.utils.getString
import de.ingrid.igeserver.utils.getStringOrEmpty
import de.ingrid.igeserver.utils.mapToKeyValue
import org.springframework.dao.EmptyResultDataAccessException
import java.text.SimpleDateFormat
import java.time.OffsetDateTime
import java.util.*

class AddressModelTransformer(
    val catalogIdentifier: String,
    val codelist: CodelistTransformer,
    val relationType: KeyValue?,
    val doc: Document,
    val documentService: DocumentService
) {

    var displayAddress: Document

    // needs to be set in during init phase
    private val ancestorAddressesIncludingSelf: MutableList<DocumentData>

    init {
        ancestorAddressesIncludingSelf = if (doc.wrapperId == -1) mutableListOf() else getAncestorAddressesIncludingSelf(doc.wrapperId)
        displayAddress = determineDisplayAddress()
    }

    private fun getIndividualName(addressDoc: Document): String? {
        val address: JsonNode = addressDoc.data

        // format: "lastName, firstName, salutation academic-title"
        val salutation = codelist.getValue("4300", address.get("salutation")?.mapToKeyValue())
        val academicTitle = codelist.getValue("4305", address.get("academic-title")?.mapToKeyValue())
        val namePostFix = listOf(salutation, academicTitle).filter { !it.isNullOrBlank() }.joinToString(" ")
        val individualName = listOf(address.getString("lastName"), address.getString("firstName"), namePostFix)
            .filter { !it.isNullOrBlank() }.joinToString(", ")

        return individualName.ifBlank { null }
    }

    fun getIndividualName(): String? = getIndividualName(displayAddress)

    fun getDisplayOrganization(): String? =
        if (displayAddress.data.getString("organization").isNullOrEmpty()) {
            determineEldestAncestor()?.document?.data?.getString("organization")
        } else displayAddress.data.getString("organization")
    
    fun getOrganization(): String? = displayAddress.data.getString("organization")

    fun getPositionName(): String? =
        if (displayAddress.data.getString("positionName")
                .isNullOrEmpty()
        ) determinePositionNameFromAncestors() else displayAddress.data.getString("positionName")


    private fun determineDisplayAddress(): Document {
        val nonHiddenAddress = ancestorAddressesIncludingSelf

        return if (nonHiddenAddress.size > 0) {
            nonHiddenAddress.last().document
        } else doc
    }

    fun getHierarchy(): List<AddressModelTransformer> =
        ancestorAddressesIncludingSelf.map {
            AddressModelTransformer(catalogIdentifier, codelist, null, it.document, documentService)
        }.reversed()

    private fun determineEldestAncestor(): DocumentData? = ancestorAddressesIncludingSelf.firstOrNull()

    private fun determinePositionNameFromAncestors(): String {
        if (!displayAddress.data.getString("positionName").isNullOrEmpty()) return displayAddress.data.getStringOrEmpty("positionName")

        val ancestorsWithoutEldest = ancestorAddressesIncludingSelf.drop(1)
        return ancestorsWithoutEldest
            .filter {
                it.document.data.getStringOrEmpty("organization").isNotEmpty()
            }.joinToString(", ") { it.document.data.get("organization").asText() }
    }

    val id = displayAddress.id
    val uuid = displayAddress.uuid

    //    val isFolder = doc.type == "FOLDER"
    val hoursOfService = displayAddress.data.getString("hoursOfService")
    val country = displayAddress.data.get("address")?.get("country")?.mapToKeyValue()
    val countryKey = country?.key ?: ""
    val countryIso3166 = displayAddress.data.get("address")?.get("country")
        ?.takeIf { !it.isNull }
        ?.mapToKeyValue()
        ?.let {
            TransformationTools.getISO3166_1_Alpha_3FromNumericLanguageCode(it)
        }
    val zipCode = displayAddress.data.getString("address.zip-code")
    val zipPoBox = displayAddress.data.getString("address.zip-po-box")
    val poBox = displayAddress.data.getString("address.po-box")
    val street = displayAddress.data.getString("address.street")
    val city = displayAddress.data.getString("address.city")
    val postBoxAddress =
        listOfNotNull(
            // "Postbox" is a fixed string needed for portal display
            this.poBox?.let { "Postbox $it" },
            this.zipPoBox?.let { it + this.city?.let { " $it" } }).filter { it.isNotEmpty() }
            .joinToString(", ")
    val telephone = contactType("1")
    val fax = contactType("2")
    val email = contactType("3")
    val homepage = contactType("4")

    val firstName = displayAddress.data.getString("firstName")
    val lastName = displayAddress.data.getString("lastName")
    val salutation = displayAddress.data.get("salutation")?.mapToKeyValue()
    val academicTitle = displayAddress.data.get("academic-title")?.mapToKeyValue()

    val administrativeArea =
        codelist.getCatalogCodelistValue("6250", displayAddress.data.get("address")?.get("administrativeArea")?.mapToKeyValue())
    val addressDocType = getAddressDocType(displayAddress.type)
    fun getAddressDocType(docType: String) = if (docType == "InGridOrganisationDoc") 0 else 2

    val parentAddresses = ancestorAddressesIncludingSelf.dropLast(1)

    fun getNextParent() = documentService.getParentWrapper(doc.wrapperId!!)?.uuid

    private val formatterISO = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSXXX")
    private fun formatDate(formatter: SimpleDateFormat, date: OffsetDateTime): String =
        formatter.format(Date.from(date.toInstant()))

    val lastModified = formatDate(formatterISO, displayAddress.modified!!)

    val contactsComTypeKeys = displayAddress.data.get("contact")?.map { it.get("type")?.getString("key") } ?: emptyList()
    val contactsComTypeValues = displayAddress.data.get("contact")?.map { it.get("type")?.mapToKeyValue() } ?: emptyList()
    val contactsComConnections = displayAddress.data.get("contact")?.map { it.getString("connection") } ?: emptyList()

    /**
     * Get all published objects with references to this address.
     */
    fun getObjectReferences(): List<ObjectReference> {
        val addressDoc = getLastPublishedDocument(catalogIdentifier, doc.uuid)
        return documentService.getIncomingReferences(addressDoc, catalogIdentifier).map {
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
        return getPublishedChildren(doc.wrapperId)
            .filter { it.document.data.get("hideAddress")?.asBoolean() != true }
            .map {
                SubordinatedParty(
                    it.wrapper.uuid,
                    getAddressDocType(it.wrapper.type),
                    getIndividualName(it.document),
                    it.document.data.getString("organization")
                )
            }.toMutableList()
    }

    private fun getPublishedChildren(id: Int?): List<DocumentData> =
        documentService.findChildrenDocs(catalogIdentifier, id, true).hits

    fun getLastPublishedDocument(catalogIdentifier: String, uuid: String): Document? {
        return try {
            documentService.getLastPublishedDocument(catalogIdentifier, uuid, forExport = true, resolveLinks = false)
        } catch (e: Exception) {
            null
        }

    }

    fun getAncestorAddressesIncludingSelf(id: Int?): MutableList<DocumentData> {
        if (id == null) return mutableListOf()

        val wrapper = documentService.getWrapperByDocumentId(id)
        if (wrapper.type == "FOLDER") return mutableListOf()

        val convertedDoc = try {
            val publishedDoc = documentService.getLastPublishedDocument(catalogIdentifier, wrapper.uuid)
            DocumentData(wrapper, publishedDoc)
        } catch (ex: EmptyResultDataAccessException) {
            // no published document found
            null
        }

        return if (wrapper.parent != null) {
            val ancestors = getAncestorAddressesIncludingSelf(wrapper.parent!!.id!!)
            // ignore hideAddress if address has no ancestors. only add if convertedDoc is not null
            if (convertedDoc?.document?.data?.get("hideAddress")?.asBoolean() != true || ancestors.isEmpty()) {
                convertedDoc?.let { ancestors.add(it) }
            }
            ancestors
        } else {
            if (convertedDoc != null) mutableListOf(convertedDoc) else mutableListOf()
        }
    }

    private fun contactType(type: String): String? = displayAddress.data.get("contact")
        ?.firstOrNull { it.get("type")?.getString("key") == type }
        ?.getString("connection")

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