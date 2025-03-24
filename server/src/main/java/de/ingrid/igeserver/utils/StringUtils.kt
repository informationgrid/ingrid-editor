package de.ingrid.igeserver.utils

fun String.prefixIfNot(prefix: String) = if (this.startsWith(prefix)) this else "$prefix$this"

fun String.suffixIfNot(suffix: String) = if (this.endsWith(suffix)) this else "$this$suffix"

inline fun <T> Boolean.ifFalse(body: () -> T?): T? = if (!this) body() else null
