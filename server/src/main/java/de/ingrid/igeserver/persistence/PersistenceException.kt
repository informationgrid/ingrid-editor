package de.ingrid.igeserver.persistence

import java.lang.RuntimeException

open class PersistenceException(message: String?) : RuntimeException(message)