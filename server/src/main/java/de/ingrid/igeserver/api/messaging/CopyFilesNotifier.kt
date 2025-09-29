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
package de.ingrid.igeserver.api.messaging

import org.apache.logging.log4j.kotlin.logger
import org.springframework.messaging.simp.SimpMessagingTemplate
import org.springframework.stereotype.Service

data class CopyFilesMessage(
    val catalogId: String,
    val sourceDatasetId: String,
    val targetDatasetId: String,
    var currentFile: String = "",
    var copiedFiles: Int = 0,
    var totalFiles: Int = 0,
) : Message() {

    fun increaseProgress() {
        copiedFiles++
        progress = ((copiedFiles.toFloat() / totalFiles) * 100).toInt()
    }
}

@Service
class CopyFilesNotifier(val msgTemplate: SimpMessagingTemplate) {
    val log = logger()

    fun sendMessage(message: CopyFilesMessage) {
        msgTemplate.convertAndSend("${WS_MESSAGE_TRANSFER_DESTINATION}/${message.catalogId}", message)
    }

    fun addAndSendMessageError(message: CopyFilesMessage, ex: Exception?, errorPrefix: String = "") {
        val errorMessage = ex?.message?.let { errorPrefix + it } ?: errorPrefix
        log.error(errorMessage, ex)
        sendMessage(message.apply { errors.add(errorMessage) })
    }

    companion object {
        private const val WS_MESSAGE_TRANSFER_DESTINATION = "/topic/copyFilesStatus"
    }
}
