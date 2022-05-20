package de.ingrid.igeserver.model

enum class ViewComponent {
    CHECKBOX, RADIO, SPATIAL, TIMESPAN, SELECT
}

enum class Operator {
    OR, AND
}

data class FacetGroup(val id: String,
                      val label: String,
                      val filter: Array<QuickFilter>,
                      val combine: Operator = Operator.OR,
                      val viewComponent: ViewComponent = ViewComponent.CHECKBOX)