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
    val parentIdentifier: String?,
    val pointOfContact: List<AddressRefModel>?,
    val spatial: IngridSpatial?,
    val metadata: IngridMetadata,
    val advProductGroups: List<KeyValueModel>?,
    val alternateTitle: String?,
    val themes: List<KeyValueModel>?,
    val keywords: List<String>?,
    val dataset: Dataset?,
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

@JsonIgnoreProperties(ignoreUnknown = true)
data class Dataset(
    val languages: List<String>?
)


@JsonIgnoreProperties(ignoreUnknown = true)
data class IngridMetadata(
    val language: KeyValueModel,
    val characterSet: KeyValueModel?
)

@JsonIgnoreProperties(ignoreUnknown = true)
data class IngridSpatial(
    val references: List<SpatialModel>?,
    val spatialSystems: List<KeyValueModel>?,
    val verticalExtent: Any?
)
