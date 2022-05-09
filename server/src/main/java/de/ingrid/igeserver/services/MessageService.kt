package de.ingrid.igeserver.services

import com.fasterxml.jackson.databind.node.ObjectNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Message
import de.ingrid.igeserver.repository.MessageRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import java.time.OffsetDateTime

@Service
class MessageService @Autowired constructor(
    private val messageRepo: MessageRepository,
    private val catalogService: CatalogService
) {

    fun get(catalogId: String?): List<Message> {
        return messageRepo.findAllByCatalog_Identifier(catalogId)
    }

    fun getAll(): List<Message> {
        return messageRepo.findAll()
    }

    fun save(
        message:
        de.ingrid.igeserver.model.Message, expires: OffsetDateTime?, catalogId: String?
    ) {
        messageRepo.save(
            Message(
            ).apply {
                this.message = message
                this.expires = expires
                catalog = if (catalogId != null) catalogService.getCatalogById(catalogId) else null
            }
        )

    }

    fun delete(id: Int) {
        messageRepo.deleteById(id)
    }

}