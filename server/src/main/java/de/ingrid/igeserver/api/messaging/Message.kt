package de.ingrid.igeserver.api.messaging

import java.util.*

open class Message(open val startTime: Date = Date(), open var progress: Int = 0) {
    var endTime: Date? = null
    var message: String = ""
    // TODO: handle errors through quartz job info
    var errors: MutableList<String> = mutableListOf()
}