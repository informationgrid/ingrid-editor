package de.ingrid.igeserver.profiles.krzn.exporter

import de.ingrid.igeserver.exporter.CodelistTransformer
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.profiles.ingrid.exporter.InformationSystemModelTransformer
import de.ingrid.igeserver.profiles.ingrid.exporter.TransformerCache
import de.ingrid.igeserver.profiles.ingrid.exporter.model.IngridModel
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.mdek.upload.Config

class InformationSystemModelTransformerKrzn(
    model: IngridModel,
    catalogIdentifier: String,
    codelists: CodelistTransformer,
    config: Config,
    catalogService: CatalogService,
    cache: TransformerCache,
    doc: Document? = null
) : InformationSystemModelTransformer(model, catalogIdentifier, codelists, config, catalogService, cache, doc) {

    
    private val docData = doc?.data
    override val systemEnvironment = super.systemEnvironment ?: docData?.get("environmentDescription")?.asText()
    
}