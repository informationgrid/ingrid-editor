package de.ingrid.igeserver.api

import com.fasterxml.jackson.databind.ObjectMapper
import de.ingrid.igeserver.model.Message
import de.ingrid.igeserver.model.MessageCreationRequest
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.MessageService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.format.annotation.DateTimeFormat
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.security.Principal
import java.time.OffsetDateTime

@RestController
@RequestMapping(path = ["/api"])
class MessagesApiController : MessagesApi {

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
        result = result.sortedBy { it.id }.filter { it.expires?.isAfter(OffsetDateTime.now()) ?: true }
        return ResponseEntity.ok(result.map { it.message })
    }

    override fun getDbMessages(principal: Principal): ResponseEntity<List<de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Message>> {
        return ResponseEntity.ok(this.messageService.getAll())
    }

    override fun createMessage(principal: Principal, messageRequest: MessageCreationRequest): ResponseEntity<Void> {

        val catalogId = if (messageRequest.forCurrentCatalog) catalogService.getCurrentCatalogForPrincipal(principal) else null
        val expires = if (messageRequest.expiryDate.isNullOrEmpty()) null else OffsetDateTime.parse(messageRequest.expiryDate)

        this.messageService.save(messageRequest.message, expires, catalogId)
        return ResponseEntity.ok().build()
    }

    override fun deleteMessage(principal: Principal, id: Int): ResponseEntity<Void> {
        this.messageService.delete(id)
        return ResponseEntity.ok().build()
    }
}
