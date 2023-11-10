package de.ingrid.igeserver.profiles.ingrid.exporter

import de.ingrid.igeserver.exporter.CodelistTransformer
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.profiles.ingrid.exporter.model.IngridModel
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.mdek.upload.Config

class DataCollectionModelTransformer(
    model: IngridModel,
    catalogIdentifier: String,
    codelistTransformer: CodelistTransformer,
    config: Config,
    catalogService: CatalogService,
    cache: TransformerCache,
    doc: Document? = null
) : IngridModelTransformer(
    model, catalogIdentifier, codelistTransformer, config, catalogService, cache, doc
) {

    override val hierarchyLevelName = "database"

    val isAdVCompatible = data.isAdVCompatible ?: false
    val databaseContent =
        data.databaseContent?.map { content -> content.parameter + content.moreInfo?.let { " ($it)" } } ?: emptyList()
    val categoryCatalog = data.categoryCatalog ?: emptyList()
    val methodText = data.methodText
    fun hasContentInfo() = databaseContent.isNotEmpty() || categoryCatalog.isNotEmpty()


}

