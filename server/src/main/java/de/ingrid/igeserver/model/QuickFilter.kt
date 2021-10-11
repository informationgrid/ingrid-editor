package de.ingrid.igeserver.model

import com.fasterxml.jackson.annotation.JsonIgnore

abstract class QuickFilter {
    abstract val id: String

    abstract val label: String

    @get:JsonIgnore
    abstract val filter: String


    open fun filter(parameter: List<*>? = null): String = this.filter

    open val parameters: List<String> = emptyList()

    open val implicitFilter: List<String> = emptyList()
}
