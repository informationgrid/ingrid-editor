package de.ingrid.igeserver.persistence

data class FindMetadata(val parent: Int?, val hasChildren: Boolean)

class FindAllResults<T>(var totalHits: Long, var hits: List<T>) 