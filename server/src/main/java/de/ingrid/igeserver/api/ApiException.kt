package de.ingrid.igeserver.api

open class ApiException : Exception {
    private var code: Int
    var isHideStacktrace = false

    constructor(msg: String?) : super(msg) {
        code = 500
    }

    constructor(msg: String?, doNotShowStacktrace: Boolean) : super(msg) {
        code = 500
        isHideStacktrace = doNotShowStacktrace
    }

    constructor(code: Int, msg: String?) : super(msg) {
        this.code = code
    }

}