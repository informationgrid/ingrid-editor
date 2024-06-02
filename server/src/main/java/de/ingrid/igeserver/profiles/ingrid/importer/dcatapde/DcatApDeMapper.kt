/**
 * ==================================================
 * Copyright (C) 2024 wemove digital solutions GmbH
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
