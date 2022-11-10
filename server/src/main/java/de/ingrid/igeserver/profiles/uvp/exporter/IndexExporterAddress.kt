package de.ingrid.igeserver.profiles.uvp.exporter

import com.fasterxml.jackson.databind.node.ArrayNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.codelists.CodeListService
import de.ingrid.igeserver.exports.ExportTypeInfo
import de.ingrid.igeserver.exports.IgeExporter
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.DocumentWrapper
import de.ingrid.igeserver.repository.CatalogRepository
import de.ingrid.igeserver.repository.DocumentWrapperRepository
import de.ingrid.igeserver.services.DocumentCategory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Profile("uvp")
class IndexExporterAddress @Autowired constructor(
    val catalogRepo: CatalogRepository,
    val codelistService: CodeListService,
    val docWrapperRepo: DocumentWrapperRepository
) : IgeExporter {

    override val typeInfo = ExportTypeInfo(
        DocumentCategory.ADDRESS,
        "indexUvpIDF",
        "UVP IDF Address (Elasticsearch)",
        "Export von UVP Adressen ins IDF Format für die Anzeige im Portal ins Elasticsearch-Format. Für UVP allerdings leer und nur für Auflistung im Portal unter 'Verfahrensführende Behörden' benötigt.",
        "application/json",
        "json",
        listOf("uvp")
    )

    @Transactional
    override fun run(doc: Document, catalogId: String): Any {
        val catalog = catalogRepo.findByIdentifier(catalogId)
        val partner = codelistService.getCodeListValue("110", catalog.settings?.config?.partner, "ident") ?: ""
        val provider = codelistService.getCodeListValue("111", catalog.settings?.config?.provider, "ident") ?: ""
        val addressType = if (doc.type == "UvpOrganisationDoc") 0 else 1
        val commTypeKeys = getCommTypeKeys(doc)
        val commTypeValues = getCommTypeValues(doc)
        val commValues = getCommValues(doc)
        val wrapperDoc = docWrapperRepo.getById(doc.wrapperId!!)

        return jacksonObjectMapper().createObjectNode().apply {
            put("t02_address.adr_id", doc.uuid)
            put("title", doc.title)
            put("iPlugId", "ige-ng_$catalogId")
            put("dataSourceName", "iPlug IGE-NG ($catalogId)")
            set<ArrayNode>("partner", jacksonObjectMapper().createArrayNode().add(partner))
            set<ArrayNode>("provider", jacksonObjectMapper().createArrayNode().add(provider))
            put("title", doc.title)
            put("t02_address.typ", addressType)
            put("is_top_level", isTopLevelNode(wrapperDoc.parent))
            set<ArrayNode>("t02_address.parents.title", getParentTitleAsArrayNode(wrapperDoc.parent))
            set<ArrayNode>("t021_communication.commtype_key", commTypeKeys)
            set<ArrayNode>("t021_communication.commtype_value", commTypeValues)
            set<ArrayNode>("t021_communication.comm_value", commValues)
            set<ArrayNode>(
                "datatype", jacksonObjectMapper().createArrayNode()
                    .add("dsc_ecs_address")
                    .add("address")
                    .add("IDF_1.0")
            )

        }.toString()
    }

    /**
     * A top level node is defined by when its parent is null or the parent is a folder.
     */
    private fun isTopLevelNode(parent: DocumentWrapper?) = parent == null || parent.type == "FOLDER"

    private fun getParentTitleAsArrayNode(parent: DocumentWrapper?): ArrayNode {
        val titles = getParentTitle(parent)
        return jacksonObjectMapper().createArrayNode().apply {
            titles.forEach { add(it) }
        }
    }

    private fun getParentTitle(parent: DocumentWrapper?): List<String> {
        if (parent == null || parent.type == "FOLDER") return emptyList()

        return getParentTitle(parent.parent) + (parent.published?.title ?: "")
    }

    private fun getCommTypeKeys(doc: Document): ArrayNode {
        return jacksonObjectMapper().createArrayNode().apply {
            doc.data.get("contact")
                .map { it.get("type").get("key").textValue() }
                .forEach { add(it) }
        }
    }

    private fun getCommTypeValues(doc: Document): ArrayNode {
        return jacksonObjectMapper().createArrayNode().apply {
            doc.data.get("contact")
                .map { it.get("type").get("key").textValue() }
                .map { codelistService.getCodeListValue("4430", it, "de") }
                .forEach { add(it) }
        }
    }

    private fun getCommValues(doc: Document): ArrayNode {
        return jacksonObjectMapper().createArrayNode().apply {
            doc.data.get("contact")
                .map { it.get("connection").textValue() }
                .forEach { add(it) }
        }
    }

    override fun toString(exportedObject: Any): String {
        return exportedObject.toString()
    }
}
