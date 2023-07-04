package de.ingrid.igeserver.api.messaging

import java.util.*

open class Message(open val startTime: Date = Date(), open var progress: Int = 0) {
    var endTime: Date? = null
    var message: String = ""
    var errors: MutableList<String> = mutableListOf()
    var infos: MutableList<String> = mutableListOf()
    var report: Any? = null
    var stage: String? = null
}