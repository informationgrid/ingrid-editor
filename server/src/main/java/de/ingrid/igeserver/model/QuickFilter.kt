package de.ingrid.igeserver.model

import com.fasterxml.jackson.annotation.JsonIgnore

interface QuickFilter {
    val id: String
    
    val label: String
    
    @get:JsonIgnore
    val filter: String
}
