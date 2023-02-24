package de.ingrid.igeserver.api.messaging

import java.util.*

abstract class Message(open var progress: Int = 0) {
    val startTime: Date = Date()
    var endTime: Date? = null
    var message: String = ""
    var errors: MutableList<String> = mutableListOf()
}