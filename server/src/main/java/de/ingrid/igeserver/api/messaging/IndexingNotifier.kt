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
import org.jetbrains.kotlin.backend.common.push
import org.springframework.messaging.simp.SimpMessagingTemplate
import org.springframework.stereotype.Service

data class IndexMessage(
    val catalogId: String,
    var totalDatasets: Long = 0,
    val targets: MutableList<TargetMessage> = mutableListOf(),
) : Message() {

    private var indexDatasets: Int = 0

    fun getTargetByName(name: String): TargetMessage {
        val result = targets.find { it.name == name }
        return result ?: TargetMessage(name).also { targets.push(it) }
    }

    fun increaseProgress() {
        indexDatasets++
        progress = ((indexDatasets.toFloat() / totalDatasets) * 100).toInt()
    }
}

data class TargetMessage(
    val name: String,
    var numDocuments: Int = 0,
    var numAddresses: Int = 0,
    var numSkipped: Int = 0,
    var progressDocuments: Int = 0,
    var progressAddresses: Int = 0,
    var progress: Int = 0,
)

@Service
class IndexingNotifier(val msgTemplate: SimpMessagingTemplate) {
    val log = logger()

    fun sendMessage(message: IndexMessage) {
        msgTemplate.convertAndSend("${Companion.WS_MESSAGE_TRANSFER_DESTINATION}/${message.catalogId}", message)
    }

    fun addAndSendMessageError(message: IndexMessage, ex: Exception?, errorPrefix: String = "") {
        val errorMessage = ex?.message?.let { errorPrefix + it } ?: errorPrefix
        log.error(errorMessage, ex)
        sendMessage(message.apply { errors.add(errorMessage) })
    }

    companion object {
        private const val WS_MESSAGE_TRANSFER_DESTINATION = "/topic/indexStatus"
    }
}
