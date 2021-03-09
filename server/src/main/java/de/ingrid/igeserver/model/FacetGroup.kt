package de.ingrid.igeserver.model

enum class Operator {
    AND, OR
}

data class FacetGroup(val id: String,
                      val label: String,
                      val filter: Array<QuickFilter>, 
                      val combine: Operator = Operator.OR,
                      val selection: Operator = Operator.AND)