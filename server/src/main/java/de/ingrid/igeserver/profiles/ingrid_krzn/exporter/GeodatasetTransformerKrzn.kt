package de.ingrid.igeserver.profiles.ingrid_krzn.exporter

import de.ingrid.igeserver.exporter.CodelistTransformer
import de.ingrid.igeserver.exporter.model.KeyValueModel
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.profiles.ingrid.exporter.GeodatasetModelTransformer
import de.ingrid.igeserver.profiles.ingrid.exporter.TransformerCache
import de.ingrid.igeserver.profiles.ingrid.exporter.model.IngridModel
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.igeserver.utils.getString
import de.ingrid.mdek.upload.Config

class GeodatasetTransformerKrzn(
    model: IngridModel,
    catalogIdentifier: String,
    codelists: CodelistTransformer,
    config: Config,
    catalogService: CatalogService,
    cache: TransformerCache,
    doc: Document? = null,
    documentService: DocumentService
) : GeodatasetModelTransformer(model, catalogIdentifier, codelists, config, catalogService, cache, documentService = documentService) {

    private val docData = doc?.data
    override val systemEnvironment =
        if (!super.systemEnvironment.isNullOrEmpty()) super.systemEnvironment
        else docData?.getString("environmentDescription")

    override val mapLinkUrl = docData?.getString("mapLink.key")?.let {
        // do not map specific entry where we do not want to show mapUrl
        if (it == "0") return@let null
        codelists.getCatalogCodelistValue("10500", KeyValueModel(it, null))
            ?.replace("{ID}", model.uuid)
    }

    /*
        override fun getCrossReferences(): List<CrossReference> {
            return super.getCrossReferences()
                .map { ref ->
                    if (ref.refType.key != "3600") ref 
                    else {
                        ref.mapUrl = ref.serviceUrl
                        ref
                    }
                }
        }
    */
}