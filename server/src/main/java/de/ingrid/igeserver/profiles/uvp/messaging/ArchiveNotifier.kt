/**
 * ==================================================
 * Copyright (C) 2023-2025 wemove digital solutions GmbH
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
package de.ingrid.igeserver.profiles.uvp.messaging

import de.ingrid.igeserver.api.messaging.Message
import org.apache.logging.log4j.kotlin.logger
import org.springframework.messaging.simp.SimpMessagingTemplate
import org.springframework.stereotype.Service

data class ArchiveMessage(
    var catalogId: String,
) : Message()

@Service
class ArchiveNotifier(val msgTemplate: SimpMessagingTemplate) {
    val log = logger()

    fun sendMessage(message: ArchiveMessage) {
        msgTemplate.convertAndSend("${WS_MESSAGE_TRANSFER_DESTINATION}/${message.catalogId}", message)
    }

    companion object {
        private const val WS_MESSAGE_TRANSFER_DESTINATION = "/topic/uvp/archiveStatus"
    }
}
