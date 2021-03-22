package de.ingrid.igeserver.model

enum class Operator {
    CHECKBOX, RADIO, SPATIAL
}

data class FacetGroup(val id: String,
                      val label: String,
                      val filter: Array<QuickFilter>,
                      val combine: Operator = Operator.RADIO,
                      val selection: Operator = Operator.CHECKBOX)