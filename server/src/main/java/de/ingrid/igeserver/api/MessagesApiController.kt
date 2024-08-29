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
package de.ingrid.igeserver.api

import de.ingrid.igeserver.model.Message
import de.ingrid.igeserver.model.MessageCreationRequest
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.MessageService
import de.ingrid.igeserver.utils.AuthUtils
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.security.Principal
import java.time.OffsetDateTime

@RestController
@RequestMapping(path = ["/api"])
class MessagesApiController(
    private val authUtils: AuthUtils,
) : MessagesApi {

    @Autowired
    private lateinit var catalogService: CatalogService

    @Autowired
    private lateinit var messageService: MessageService

    override fun getMessages(principal: Principal): ResponseEntity<List<Message>> {
        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)
        var result = this.messageService.get(catalogId)
        // combine catalog specific messages with global messages
        result = result + this.messageService.get(null)

        // sort and remove expired messages
        result = result.sortedBy { it.id }.filter { it.expires?.toInstant()?.isAfter(OffsetDateTime.now().minusDays(1).toInstant()) ?: true }
        return ResponseEntity.ok(result.map { it.message })
    }

    override fun getDbMessages(principal: Principal): ResponseEntity<List<de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Message>> {
        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)
        val catalogMessages = this.messageService.get(catalogId)
        val generalMessages = this.messageService.get(null)

        // TODO
        // use one query to get the required messages with order and general messages as the first messages in the list
        var messages = catalogMessages + generalMessages
        messages = messages.sortedWith(compareByDescending(Comparator.nullsLast<OffsetDateTime?>(nullsFirst())) { it.expires })
        return ResponseEntity.ok(messages)
    }

    override fun createMessage(principal: Principal, messageRequest: MessageCreationRequest): ResponseEntity<Void> {
        val catalogId = if (messageRequest.forCurrentCatalog) catalogService.getCurrentCatalogForPrincipal(principal) else null
        val expires = if (messageRequest.validUntil.isNullOrEmpty()) null else OffsetDateTime.parse(messageRequest.validUntil)
        this.messageService.save(messageRequest.message, expires, catalogId)
        return ResponseEntity.ok().build()
    }

    override fun deleteMessage(principal: Principal, id: Int): ResponseEntity<Void> {
        val message = this.messageService.getById(id).get()
        this.messageService.delete(message)
        return ResponseEntity.ok().build()
    }
}
