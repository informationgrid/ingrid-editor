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
