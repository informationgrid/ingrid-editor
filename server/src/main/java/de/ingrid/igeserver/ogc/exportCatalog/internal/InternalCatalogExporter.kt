package de.ingrid.igeserver.ogc.exportCatalog.internal

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.ObjectNode
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.ogc.exportCatalog.CatalogExportTypeInfo
import de.ingrid.igeserver.ogc.exportCatalog.OgcCatalogExporter
import de.ingrid.igeserver.model.RecordCollection
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.DocumentCategory
import de.ingrid.igeserver.services.DocumentService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Lazy
import org.springframework.http.MediaType
import org.springframework.stereotype.Service


@Service
class InternalCatalogExporter @Autowired constructor(
        @Lazy val documentService: DocumentService,
        val catalogService: CatalogService
) : OgcCatalogExporter {

    override val typeInfo: CatalogExportTypeInfo
        get() = CatalogExportTypeInfo(
                DocumentCategory.DATA,
                "internal",
                "IGE Catalog in JSON",
                "Interne Datenstruktur des IGE Catalog",
                MediaType.APPLICATION_JSON_VALUE,
                "json",
                listOf()
        )

    override fun run(catalog: Catalog): JsonNode {
        val newCatalogObject = mapCatalogToRecordCollection(catalog)
        return convertToJsonNode(newCatalogObject)
    }

    private fun mapCatalogToRecordCollection(catalog: Catalog): RecordCollection {
        val apiHost = "http://localhost:8550"
        val links = "${apiHost}/collections/${catalog.identifier}/items"
        return RecordCollection(
                id = catalog.identifier,
                title = catalog.name,
                description = catalog.description,
                links = links,
                itemType = "record",
                type = "Collection",
                modelType = catalog.type,
                created = catalog.created,
                updated = catalog.modified,
        )
    }


    fun convertToJsonNode(catalog: RecordCollection): JsonNode {

        val mapper = jacksonObjectMapper()
        mapper.registerModule(JavaTimeModule())

        val node = mapper.convertValue(catalog, ObjectNode::class.java)
        val data = node
        data.fields().forEach { entry ->
            node.replace(entry.key, entry.value)
        }
        return node

    }


}