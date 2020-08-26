package de.ingrid.igeserver.persistence

import java.lang.RuntimeException

open class PersistenceException : RuntimeException {
    constructor(message: String) : super(message)
    constructor(message: String, cause: Throwable) : super(message, cause)
}