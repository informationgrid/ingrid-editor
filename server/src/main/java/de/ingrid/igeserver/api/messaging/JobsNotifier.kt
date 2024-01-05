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
package de.ingrid.igeserver.api.messaging

import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.messaging.simp.SimpMessagingTemplate
import org.springframework.stereotype.Service
import java.util.*

data class URLCheckerReport(val totalUrls: Int, val invalidUrls: List<UrlReport>)

data class UrlReport(val url: String, var success: Boolean, var status: Int, val datasets: MutableList<DatasetInfo>)

data class DatasetInfo(val title: String, val type: String, val uuid: String, val field: String? = null)

enum class NotificationType(val uri: String) {
    URL_CHECK("/url-check"),
    IMPORT("/import")
}

class MessageTarget(val type: NotificationType, var catalogId : String? = null) {
    override fun toString(): String {
        return if (catalogId == null)
            type.uri
        else "${type.uri}/$catalogId"
    }
}

@Service
class JobsNotifier(val msgTemplate: SimpMessagingTemplate) {
    val log = logger()

    private val WS_MESSAGE_TRANSFER_DESTINATION = "/topic/jobs"

    fun sendMessage(type: MessageTarget, message: Message) {
        msgTemplate.convertAndSend(WS_MESSAGE_TRANSFER_DESTINATION + type, message)
    }
    fun endMessage(type: MessageTarget, message: Message) {
        msgTemplate.convertAndSend(WS_MESSAGE_TRANSFER_DESTINATION + type, message.apply {
            this.endTime = Date()
            this.progress = 100
        })
    }
    
}
