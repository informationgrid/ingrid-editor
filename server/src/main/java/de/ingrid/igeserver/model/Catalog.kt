package de.ingrid.igeserver.model

import java.time.OffsetDateTime

data class Catalog(
    var id: String?,
    val name: String,
    val description: String? = "",
    var type: String = "",
    val created: OffsetDateTime?,
    val modified: OffsetDateTime?,
    var countDocuments: Int = 0,
    var countAddresses: Int = 0
)
