package de.ingrid.igeserver.model

class SearchResult<T> {
    var hits: List<T>? = null
    var totalHits: Long = 0
    var page = 0
    var size = 0
}
