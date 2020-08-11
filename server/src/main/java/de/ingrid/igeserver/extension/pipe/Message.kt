package de.ingrid.igeserver.extension.pipe

import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

/**
 * A message passed within the context when running the filters in a pipe
 */
data class Message(val creator: Any, val message: String, val created: LocalDateTime = LocalDateTime.now()) {
    override fun toString(): String {
        return message + " [" + dateFormat.format(created) + " from " + creator.toString() + "]"
    }

    companion object {
        val dateFormat: DateTimeFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSS")
    }
}