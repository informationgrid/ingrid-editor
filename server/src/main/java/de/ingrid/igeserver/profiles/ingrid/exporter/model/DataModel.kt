package de.ingrid.igeserver.profiles.ingrid.exporter.model

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.annotation.JsonProperty
import de.ingrid.igeserver.exporter.model.AddressRefModel
import de.ingrid.igeserver.exporter.model.KeyValueModel
import de.ingrid.igeserver.exporter.model.SpatialModel
import de.ingrid.igeserver.services.BehaviourService
import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.igeserver.utils.SpringContext
import java.util.*

@JsonIgnoreProperties(ignoreUnknown = true)
data class DataModel(
    val description: String?,
    val _parent: String?,
    val pointOfContact: List<AddressRefModel>?,
    @JsonProperty("spatial") val spatial: IngridSpatial?,

    ) {


    companion object {
        val codelistHandler: CodelistHandler? by lazy {
            SpringContext.getBean(CodelistHandler::class.java)
        }
        val behaviourService: BehaviourService? by lazy {
            SpringContext.getBean(BehaviourService::class.java)
        }
    }
}

data class IngridSpatial(
    @JsonProperty("references")
    val references: List<SpatialModel>?,
    @JsonProperty("spatialSystems")
    val spatialSystems: List<KeyValueModel>?,
    @JsonProperty("verticalExtent")
    val verticalExtent: Any?
)
