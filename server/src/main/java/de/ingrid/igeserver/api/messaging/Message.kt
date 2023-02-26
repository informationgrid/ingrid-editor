package de.ingrid.igeserver.api.messaging

import java.util.*

abstract class Message(open val startTime: Date = Date(), open var progress: Int = 0) {
    var endTime: Date? = null
    var message: String = ""
    var errors: MutableList<String> = mutableListOf()
}