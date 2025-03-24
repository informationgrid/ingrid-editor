package de.ingrid.igeserver.utils

fun String.prefixIfNot(prefix: String) = if (this.startsWith(prefix)) this else "$prefix$this"
