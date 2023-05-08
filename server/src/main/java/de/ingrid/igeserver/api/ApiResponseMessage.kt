package de.ingrid.igeserver.api

import jakarta.xml.bind.annotation.XmlRootElement
import jakarta.xml.bind.annotation.XmlTransient

@XmlRootElement
class ApiResponseMessage(@get:XmlTransient var code: Int, var message: String?) {
    var type: String? = null

    init {
        type = when (code) {
            ERROR -> "error"
            WARNING -> "warning"
            INFO -> "Info"
            OK -> "ok"
            TOO_BUSY -> "too busy"
            else -> "unknown"
        }
    }

    companion object {
        const val ERROR = 1
        const val WARNING = 2
        const val INFO = 3
        const val OK = 4
        const val TOO_BUSY = 5
    }
}