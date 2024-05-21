package de.ingrid.igeserver.model


abstract class KeywordFilter: QuickFilter() {
    abstract val profiles: List<String>
    fun profiles(): List<String> { return profiles }
}