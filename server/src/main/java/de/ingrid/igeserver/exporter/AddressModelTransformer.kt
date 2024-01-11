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
    val doc: Document,
    val documentService: DocumentService
) {

    var displayAddress: Document
//    fun getModel() = displayAddress

    // needs to be set in during init phase
    private val ancestorAddressesIncludingSelf: MutableList<DocumentData>

    init {
        ancestorAddressesIncludingSelf = getAncestorAddressesIncludingSelf(doc.wrapperId)
        displayAddress = determineDisplayAddress()
    }

    private val data = doc.data

    fun getIndividualName(addressDoc: Document): String? {
        val address: JsonNode = addressDoc.data

        // format: "lastName, firstName, salutation academicTitle"
        val salutation = codelist.getValue("4300", address.get("salutation")?.mapToKeyValue())
        val academicTitle = codelist.getValue("4305", address.get("academicTitle")?.mapToKeyValue())
        val namePostFix = listOf(salutation, academicTitle).filter { !it.isNullOrBlank() }.joinToString(" ")
        val individualName = listOf(address.getString("lastName"), address.getString("firstName"), namePostFix)
            .filter { !it.isNullOrBlank() }.joinToString(", ")

        return individualName.ifBlank { null }
    }

    fun getIndividualName(): String? = getIndividualName(doc)

    fun getOrganization(): String? =
        if (data.getString("organization").isNullOrEmpty()) {
            determineEldestAncestor()?.document?.data?.getString("organization")
        } else data.getString("organization")

    fun getPositionName(): String? =
        if (data.getString("positionName")
                .isNullOrEmpty()
        ) determinePositionNameFromAncestors() else data.getString("positionName")


    private fun determineDisplayAddress(): Document {
        val nonHiddenAddress = ancestorAddressesIncludingSelf

        return if (nonHiddenAddress.size > 0) {
            nonHiddenAddress.last().document
        } else doc
    }

    fun getHierarchy(): List<Document> =
        ancestorAddressesIncludingSelf.map {
            it.document
        }.reversed()

    private fun determineEldestAncestor(): DocumentData? = ancestorAddressesIncludingSelf.firstOrNull()

    private fun determinePositionNameFromAncestors(): String {
        if (!data.getString("positionName").isNullOrEmpty()) return data.getStringOrEmpty("positionName")

        val ancestorsWithoutEldest = ancestorAddressesIncludingSelf.drop(1)
        return ancestorsWithoutEldest
            .filter {
                !it.document.data.get("organization").isNull || !it.document.data.get("organization").asText()
                    .isNullOrEmpty()
            }.joinToString(", ") { it.document.data.get("organization").asText() }
    }

    val id = doc.id
    val uuid = doc.uuid

    //    val isFolder = doc.type == "FOLDER"
    val hoursOfService = data.getString("hoursOfService")
    val country = data.get("address")?.get("country")?.mapToKeyValue()
    val countryIso3166 =
        data.get("address")?.get("country")
            ?.let { TransformationTools.getISO3166_1_Alpha_3FromNumericLanguageCode(it.mapToKeyValue()!!) }
    val zipCode = data.getString("address.zipCode")
    val zipPoBox = data.getString("address.zipPoBox")
    val poBox = data.getString("address.poBox")
    val street = data.getString("address.street")
    val city = data.getString("address.city")
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
    
    val firstName = data.getString("firstName")
    val lastName = data.getString("lastName")
    val salutation = data.get("salutation").mapToKeyValue()
    val academicTitle = data.get("academicTitle").mapToKeyValue()

    val administrativeArea =
        codelist.getCatalogCodelistValue("6250", data.get("address").get("administrativeArea")?.mapToKeyValue())
    val addressDocType = getAddressDocType(doc.type)
    fun getAddressDocType(docType: String) = if (docType == "InGridOrganisationDoc") 0 else 2

    val parentAddresses = ancestorAddressesIncludingSelf.dropLast(1)

    fun getNextParent() = documentService.getParentWrapper(doc.id!!)?.uuid

    private val formatterISO = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSXXX")
    private fun formatDate(formatter: SimpleDateFormat, date: OffsetDateTime): String =
        formatter.format(Date.from(date.toInstant()))

    val lastModified = formatDate(formatterISO, doc.modified!!)
    
    val contactsComTypeKeys = data.get("contact")?.map { it.get("type")?.getString("key") }
    val contactsComTypeValues = data.get("contact")?.map { it.get("type")?.mapToKeyValue() }
    val contactsComConnections = data.get("contact")?.map { it.getString("connection")}

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
        return getPublishedChildren(doc.id)
            .filter { !it.document.data.get("hideAddress").asBoolean() }
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

    fun contactType(type: String): String? = data.get("contact")
        .firstOrNull { it.get("type")?.getString("key") == type }
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