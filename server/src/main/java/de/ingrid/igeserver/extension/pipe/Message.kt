package de.ingrid.igeserver.extension.pipe

import de.ingrid.igeserver.services.DateService
import de.ingrid.igeserver.utils.SpringContext
import java.time.OffsetDateTime
import java.time.format.DateTimeFormatter

/**
 * A message passed within the context when running the filters in a pipe
 */
data class Message(val creator: Any, val message: String) {

    val created: OffsetDateTime? = dateService?.now()

    override fun toString(): String {
        return message + " [" + dateFormat.format(created) + " from " + creator.toString() + "]"
    }

    companion object {
        val dateFormat: DateTimeFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSS")
        val dateService: DateService? by lazy {
            SpringContext.getBean(DateService::class.java)
        }
    }
}