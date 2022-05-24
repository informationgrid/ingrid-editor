package de.ingrid.igeserver.model

import com.fasterxml.jackson.annotation.JsonIgnore

abstract class QuickFilter {
    abstract val id: String

    abstract val label: String

    @get:JsonIgnore
    abstract val filter: String

    @get:JsonIgnore
    open val isFieldQuery: Boolean = false

    open val codelistId: String? = null
    
    // in case the codelist ID is catalog specific stored in a behaviour
    // format: <behaviourId>::<field>::<defaultValue>
    open val codelistIdFromBehaviour: String? = null

    open fun filter(parameter: List<*>? = null): String = this.filter

    open val parameters: List<String> = emptyList()

    open val implicitFilter: List<String> = emptyList()
}
