package de.ingrid.igeserver.api.messaging

import org.springframework.beans.factory.annotation.Autowired
import org.springframework.messaging.simp.SimpMessagingTemplate
import org.springframework.stereotype.Service


@Service
class IndexingNotifier @Autowired constructor(val msgTemplate: SimpMessagingTemplate) {
    private val WS_MESSAGE_TRANSFER_DESTINATION = "/topic/indexStatus"

    fun sendMessage(message: String) {
        msgTemplate.convertAndSend(WS_MESSAGE_TRANSFER_DESTINATION, "Message: $message")
    }
}