package de.ingrid.igeserver.api.messaging

import de.ingrid.igeserver.tasks.quartz.IgeJobInfo
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.messaging.simp.SimpMessagingTemplate
import org.springframework.stereotype.Service
import java.util.*

data class URLCheckerReport(val totalUrls: Int, val invalidUrls: List<UrlReport>)

data class UrlReport(val url: String, var success: Boolean, var status: Int, val datasets: MutableList<DatasetInfo>)

data class DatasetInfo(val title: String, val type: String, val uuid: String, val field: String? = null)

data class UrlMessage(var numUrls: Int = 0, override var progress: Int = 0) : Message(progress = progress) {
    var report: URLCheckerReport? = null
}

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
class JobsNotifier @Autowired constructor(val msgTemplate: SimpMessagingTemplate) {
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
    
    fun endMessage(type: MessageTarget, jobInfo: IgeJobInfo) {
        msgTemplate.convertAndSend(WS_MESSAGE_TRANSFER_DESTINATION + type, jobInfo)
    }

}
