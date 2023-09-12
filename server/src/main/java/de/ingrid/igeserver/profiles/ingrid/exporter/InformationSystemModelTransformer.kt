package de.ingrid.igeserver.profiles.ingrid.exporter

import de.ingrid.igeserver.exporter.CodelistTransformer
import de.ingrid.igeserver.profiles.ingrid.exporter.model.IngridModel
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.mdek.upload.Config

class InformationSystemModelTransformer constructor(
    model: IngridModel,
    catalogIdentifier: String,
    codelistTransformer: CodelistTransformer,
    config: Config,
    catalogService: CatalogService,
) : IngridModelTransformer(
    model, catalogIdentifier, codelistTransformer, config, catalogService
) {

    override val hierarchyLevel = "application"
    override val hierarchyLevelName = "application"

    val baseDataText = data.baseDataText
    val implementationHistory = data.implementationHistory

    fun hasDataQualityInfo() = (baseDataText.isNullOrEmpty() && implementationHistory.isNullOrEmpty()).not()

}




