package de.ingrid.igeserver.services

import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Message
import de.ingrid.igeserver.repository.MessageRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import java.time.OffsetDateTime
import java.util.*

@Service
class MessageService(
    private val messageRepo: MessageRepository,
    private val catalogService: CatalogService
) {

    fun get(catalogId: String?): List<Message> {
        return messageRepo.findAllByCatalog_Identifier(catalogId)
    }

    fun getById(id: Int) : Optional<Message> {
        return messageRepo.findById(id)
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

    fun delete(message: Message) {
        messageRepo.delete(message)
    }

}
