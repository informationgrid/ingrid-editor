package de.ingrid.igeserver.api

open class PublishedVersionNotFoundException: Exception {
    constructor(message: String) : super(message)
}