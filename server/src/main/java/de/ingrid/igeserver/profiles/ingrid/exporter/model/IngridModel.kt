package de.ingrid.igeserver.profiles.ingrid.exporter.model

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.annotation.JsonProperty
import com.fasterxml.jackson.databind.annotation.JsonDeserialize
import de.ingrid.igeserver.persistence.postgresql.jpa.mapping.DateDeserializer
import java.time.OffsetDateTime
import java.util.*

@JsonIgnoreProperties(ignoreUnknown = true)
data class IngridModel(
    @JsonProperty("_uuid") val uuid: String,
    @JsonProperty("_type") val type: String,
    val title: String,
    val data: DataModel,
    @JsonDeserialize(using = DateDeserializer::class)
    val _created: OffsetDateTime,
    @JsonDeserialize(using = DateDeserializer::class)
    val _modified: OffsetDateTime,
)
