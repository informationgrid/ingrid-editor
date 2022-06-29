package de.ingrid.igeserver.api.messaging

import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.messaging.simp.SimpMessagingTemplate
import org.springframework.stereotype.Service
import java.util.*

data class UrlMessage(val numUrls: Int = 0, val progress: Int = 0) : Message()

@Service
class JobsNotifier @Autowired constructor(val msgTemplate: SimpMessagingTemplate) {
    val log = logger()

    private val WS_MESSAGE_TRANSFER_DESTINATION = "/topic/jobs"

    fun sendMessage(message: UrlMessage) {
        msgTemplate.convertAndSend(WS_MESSAGE_TRANSFER_DESTINATION, message)
    }
    fun endMessage(message: UrlMessage) {
        msgTemplate.convertAndSend(WS_MESSAGE_TRANSFER_DESTINATION, message.apply { this.endTime = Date() })
    }

}