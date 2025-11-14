package de.ingrid.igeserver.exporter

import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.profiles.ingrid.exporter.TransformerCache
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.mdek.upload.UploadConfig

interface GeneralTransformerConfig {
    val catalogIdentifier: String
    val codelists: CodelistTransformer
    val uploadConfig: UploadConfig
    val catalogService: CatalogService
    val cache: TransformerCache
    val doc: Document
    val documentService: DocumentService
    val tags: List<String>
}
