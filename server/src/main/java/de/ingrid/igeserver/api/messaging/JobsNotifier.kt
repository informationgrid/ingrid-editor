package de.ingrid.igeserver.api.messaging

import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.messaging.simp.SimpMessagingTemplate
import org.springframework.stereotype.Service
import java.util.*

data class URLCheckerReport(val totalUrls: Int, val invalidUrls: List<UrlReport>)

data class UrlReport(val url: String, var success: Boolean, var status: Int, val datasets: MutableList<DatasetInfo>)

data class DatasetInfo(val title: String, val type: String, val uuid: String, val field: String)

data class UrlMessage(var numUrls: Int = 0, var progress: Int = 0) : Message() {
    var report: URLCheckerReport? = null
}

@Service
class JobsNotifier @Autowired constructor(val msgTemplate: SimpMessagingTemplate) {
    val log = logger()

    private val WS_MESSAGE_TRANSFER_DESTINATION = "/topic/jobs"

    fun sendMessage(message: UrlMessage) {
        msgTemplate.convertAndSend(WS_MESSAGE_TRANSFER_DESTINATION, message)
    }
    fun endMessage(message: UrlMessage) {
        msgTemplate.convertAndSend(WS_MESSAGE_TRANSFER_DESTINATION, message.apply {
            this.endTime = Date()
            this.progress = 100
        })
    }

}