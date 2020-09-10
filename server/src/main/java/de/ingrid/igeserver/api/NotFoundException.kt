package de.ingrid.igeserver.api

class NotFoundException(code: Int, msg: String?) : ApiException(code, msg) {
    constructor(msg: String?) : this(404, msg)
}