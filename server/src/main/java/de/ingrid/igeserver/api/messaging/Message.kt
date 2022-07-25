package de.ingrid.igeserver.api.messaging

import java.util.*

abstract class Message {
    val startTime: Date = Date()
    var endTime: Date? = null
    var message: String = ""
    var errors: MutableList<String> = mutableListOf()
}