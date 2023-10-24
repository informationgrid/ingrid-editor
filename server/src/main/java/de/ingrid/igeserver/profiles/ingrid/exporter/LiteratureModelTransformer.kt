package de.ingrid.igeserver.profiles.ingrid.exporter

import de.ingrid.igeserver.exporter.CodelistTransformer
import de.ingrid.igeserver.profiles.ingrid.exporter.model.IngridModel
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.mdek.upload.Config

class LiteratureModelTransformer(
    model: IngridModel,
    catalogIdentifier: String,
    codelistTransformer: CodelistTransformer,
    config: Config,
    catalogService: CatalogService,
    cache: TransformerCache
) : IngridModelTransformer(
    model, catalogIdentifier, codelistTransformer, config, catalogService, cache
) {

    override val hierarchyLevelName = "document"

    val publication = data.publication
    val baseDataText = data.publication?.baseDataText
    val publisherOrPlaceholder =
        if (publication?.publisher.isNullOrEmpty()) "Location of the editor" else publication?.publisher


}




