package de.ingrid.igeserver.profiles.ingrid.importer.dcatapde

import de.ingrid.igeserver.profiles.ingrid.importer.dcatapde.model.RecordPLUProperties
import de.ingrid.igeserver.profiles.ingrid.importer.dcatapde.model.elasticsearch.Contact
import de.ingrid.igeserver.services.DocumentService
import java.util.*

class DcatApDeMapper(val catalogId: String, val model: RecordPLUProperties, val documentService: DocumentService) {

    val title = model.title
    val uuid = model.identifier
    val parentUuid: String? = null
    val type = "InGridGeoDataset"
    val description = model.description?.trim()
    fun getPointOfContacts(): List<Contact> {
        val publisher = model.publisher?.name?.let { Contact().apply { hasOrganizationName = it; type = "10" } }
        val contact = model.contact?.apply { type = "7" }
        val maintainers = model.maintainers?.map { Contact().apply { hasOrganizationName = it.name; type = "1" } }
        return if (maintainers == null) listOfNotNull(publisher, contact)
        else listOfNotNull(publisher, contact) + maintainers
    }

    fun getAddressUuid(contact: Contact): String {
        val search = contact.hasOrganizationName ?: contact.fn ?: return UUID.randomUUID().toString()
        return documentService.docRepo.findAddressByOrganisationName(catalogId, search)
            .firstOrNull() ?: UUID.randomUUID().toString()
    }
}
