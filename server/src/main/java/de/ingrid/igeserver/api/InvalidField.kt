package de.ingrid.igeserver.api

/**
 * Representation of an invalid field value
 */
open class InvalidField(val name: String, val errorCode: String, val data: Map<String, Any?>? = null)