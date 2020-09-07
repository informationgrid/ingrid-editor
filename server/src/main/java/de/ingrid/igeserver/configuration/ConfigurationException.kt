package de.ingrid.igeserver.configuration

import java.lang.RuntimeException

open class ConfigurationException : RuntimeException {
    constructor(message: String) : super(message)
    constructor(message: String, cause: Throwable) : super(message, cause)
}