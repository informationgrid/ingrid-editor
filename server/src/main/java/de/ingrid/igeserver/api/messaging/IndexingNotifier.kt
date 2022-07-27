package de.ingrid.igeserver.api.messaging

import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.messaging.simp.SimpMessagingTemplate
import org.springframework.stereotype.Service
import java.util.*

data class IndexMessage(
    val catalogId: String?,
    val startTime: Date = Date(),
    var endTime: Date? = null,
    var numDocuments: Int = 0,
    var numAddresses: Int = 0,
    var numSkipped: Int = 0,
    var progressDocuments: Int = 0,
    var progressAddresses: Int = 0,
    var message: String = "",
    var errors: MutableList<String> = mutableListOf()
)

@Service
class IndexingNotifier @Autowired constructor(val msgTemplate: SimpMessagingTemplate) {
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
