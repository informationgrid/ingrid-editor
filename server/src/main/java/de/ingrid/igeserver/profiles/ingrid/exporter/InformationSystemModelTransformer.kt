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

    val baseDataText = data.baseDataText
    val implementationHistory = data.implementationHistory
    override val hierarchyLevel = "application"
    override val hierarchyLevelName = "application"

    val isAdVCompatible = data.isAdVCompatible ?: false
    val databaseContent =
        data.databaseContent?.map { content -> content.parameter + content.moreInfo?.let { " ($it)" } } ?: emptyList()
    val categoryCatalog = data.categoryCatalog ?: emptyList()
    val methodText = data.methodText

    fun hasDataQualityInfo() = (baseDataText.isNullOrEmpty() && implementationHistory.isNullOrEmpty()).not()

}




