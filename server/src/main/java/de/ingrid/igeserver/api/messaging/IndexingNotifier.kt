/**
 * ==================================================
 * Copyright (C) 2023 wemove digital solutions GmbH
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
package de.ingrid.igeserver.api.messaging

import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.messaging.simp.SimpMessagingTemplate
import org.springframework.stereotype.Service

data class IndexMessage(
    val catalogId: String?,
    var numDocuments: Int = 0,
    var numAddresses: Int = 0,
    var numSkipped: Int = 0,
    var progressDocuments: Int = 0,
    var progressAddresses: Int = 0,
) : Message()

@Service
class IndexingNotifier(val msgTemplate: SimpMessagingTemplate) {
    val log = logger()

    private val WS_MESSAGE_TRANSFER_DESTINATION = "/topic/indexStatus"

    fun sendMessage(message: IndexMessage) {
        msgTemplate.convertAndSend("$WS_MESSAGE_TRANSFER_DESTINATION/${message.catalogId}", message)
    }

    fun addAndSendMessageError(message: IndexMessage, ex: Exception, errorPrefix: String = "") {
        val errorMessage = "${errorPrefix}${ex.message}"
        log.error(errorMessage, ex)
        sendMessage(message.apply {
            errors.add(errorMessage)
        })
    }
}
