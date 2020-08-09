package de.ingrid.igeserver.index

import de.ingrid.igeserver.model.QueryField
import de.ingrid.igeserver.services.FIELD_PUBLISHED

data class IndexOptions(
        val dbFilter: List<QueryField>,
        val exportFormat: String,
        val queryOperator: String = "AND",
        val documentState: String = FIELD_PUBLISHED
)