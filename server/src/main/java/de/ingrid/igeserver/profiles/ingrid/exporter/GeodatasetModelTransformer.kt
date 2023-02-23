package de.ingrid.igeserver.profiles.ingrid.exporter

import de.ingrid.igeserver.exporter.CodelistTransformer
import de.ingrid.igeserver.profiles.ingrid.exporter.model.IngridModel
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.mdek.upload.Config
import org.jetbrains.kotlin.util.suffixIfNot

class GeodatasetModelTransformer constructor(
    model: IngridModel,
    catalogIdentifier: String,
    codelistTransformer: CodelistTransformer,
    config: Config,
    catalogService: CatalogService,
) : IngridModelTransformer(
    model,
    catalogIdentifier,
    codelistTransformer,
    config,
    catalogService
) {

    override val hierarchyLevel = "dataset"
    override val hierarchyLevelName = null


    init {
        if (model.data.identifier != null) {
            this.citationURL =
                (if (catalog.settings?.config?.namespace.isNullOrEmpty()) "https://registry.gdi-de.org/id/$catalogIdentifier" else catalog.settings?.config?.namespace!!)
                    .suffixIfNot("/") + model.data.identifier
        }
    }

}

