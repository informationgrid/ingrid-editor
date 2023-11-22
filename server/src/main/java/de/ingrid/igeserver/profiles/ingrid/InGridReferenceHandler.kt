package de.ingrid.igeserver.profiles.ingrid

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.utils.DocumentLinks
import de.ingrid.igeserver.utils.ReferenceHandler
import de.ingrid.igeserver.utils.UploadInfo
import jakarta.persistence.EntityManager
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service

@Service
class InGridReferenceHandler(entityManager: EntityManager) : ReferenceHandler(entityManager) {

    override fun getProfile() = InGridProfile.id

    override val urlFields = listOf("uri", "url", "methodCall")

    private val sqlUrls = """
        SELECT doc.uuid as uuid, catalog.identifier as catalogId, doc.data -> 'graphicOverviews' as graphicOverviews, doc.title, doc.type
        ,doc.data -> 'references' as references, doc.data -> 'service' as service, doc.data -> 'serviceUrls' as serviceUrls
        FROM catalog,
             document_wrapper dw,
             document doc
        WHERE dw.catalog_id = catalog.id
          AND doc.catalog_id = catalog.id
          AND catalog.type = 'ingrid'
          AND dw.deleted = 0
          AND dw.category = 'data'
          AND dw.uuid = doc.uuid
          AND doc.state != 'ARCHIVED'
          AND doc.is_latest = true
    """.trimIndent()


    override fun getURLsFromCatalog(catalogId: String, groupDocIds: List<Int>): List<DocumentLinks> {
        val extraJsonbFields = arrayOf("references", "service", "serviceUrls")

        val result = queryDocs(sqlUrls, "graphicOverviews", null, catalogId, extraJsonbFields, groupDocIds)
        return mapQueryResults(result)
    }

    private fun mapQueryResults(
        result: List<Array<Any?>>
    ): List<DocumentLinks> {
        val uniqueList = mutableListOf<DocumentLinks>()
        val dictionary: MutableMap<String, JsonNode?> = mutableMapOf()
        result.forEach {
            val catalogId = it[1].toString()
            val docUuid = it[0].toString()
            val existingDoc = uniqueList.find { it.catalogId == catalogId && it.docUuid == docUuid }
            val data = if (it[2] == null) null else jacksonObjectMapper().readTree(it[2].toString())
            val references = if (it[5] == null) null else jacksonObjectMapper().readTree(it[5].toString())
            val operations = if (it[6] == null) null else jacksonObjectMapper().readTree(it[6].toString())
            val serviceUrls = if (it[7] == null) null else jacksonObjectMapper().readTree(it[7].toString())

            dictionary["graphicOverviews"] = data
            dictionary["operations"] = operations
            dictionary["references"] = references
            dictionary["serviceUrls"] = serviceUrls

            if (existingDoc == null) {
                uniqueList.add(
                    DocumentLinks(
                        catalogId,
                        docUuid,
                        getUrlsFromJsonFields(dictionary),
                        it[3].toString(),
                        it[4].toString()
                    )
                )
            } else {
                existingDoc.docs.addAll(getUrlsFromJsonFields(dictionary))
            }
        }

        return uniqueList
    }


    private fun getUrlsFromJsonFields(dictionary: MutableMap<String, JsonNode?>): MutableList<UploadInfo> {
        val linkList: MutableList<UploadInfo> = mutableListOf()

        dictionary["graphicOverviews"].let {
            linkList.addAll(getUrlsFromGraphicOverviews(dictionary["graphicOverviews"]))
        }

        dictionary["operations"].let {
            linkList.addAll(getUrlsFromOperationJsonField(dictionary["operations"]))
        }

        dictionary["references"].let {
            linkList.addAll(getUrlsFromReferenceJsonField(dictionary["references"]))
        }

        dictionary["serviceUrls"].let {
            linkList.addAll(getUrlsFromServiceURLsJsonField(dictionary["serviceUrls"]))
        }
        return linkList
    }

    private fun getUrlsFromGraphicOverviews(graphicOverviews: JsonNode?): MutableList<UploadInfo> {
        if (graphicOverviews == null) return mutableListOf()

        return graphicOverviews
            .asSequence()
            .filter { it.has("fileName") && it["fileName"].has("uri") }
            .map { jacksonObjectMapper().convertValue(it, LinkItem::class.java) }
            .filter { it.fileName.asLink }
            .map { it.fileName.uri }
            .map { UploadInfo("graphicOverviews", it, null) }
            .toMutableList()
    }

    private fun getUrlsFromOperationJsonField(service: JsonNode?): MutableList<UploadInfo> {
        if (service == null) return mutableListOf()

        val operations: JsonNode = service["operations"] ?: return mutableListOf()

        return operations
            .mapNotNull { it["methodCall"]?.asText() }
            .filter { it.isNotBlank() }
            .map { node -> UploadInfo("Operationen", node, null) }
            .toMutableList()
    }

    private fun getUrlsFromReferenceJsonField(references: JsonNode?): MutableList<UploadInfo> {
        if (references == null) return mutableListOf()

        return references
            .mapNotNull { it["url"]?.asText() }
            .filter { it.isNotBlank() }
            .map { node -> UploadInfo("Reference", node, null) }
            .toMutableList()
    }

    private fun getUrlsFromServiceURLsJsonField(serviceURLs: JsonNode?): MutableList<UploadInfo> {
        if (serviceURLs == null) return mutableListOf()

        return serviceURLs
            .mapNotNull { it["url"]?.asText() }
            .filter { it.isNotBlank() }
            .map { node -> UploadInfo("serviceURLs", node, null) }
            .toMutableList()
    }


    @JsonIgnoreProperties(ignoreUnknown = true)
    private data class LinkItem(val fileName: FileInfo, val fileDescription: String?)

    @JsonIgnoreProperties(ignoreUnknown = true)
    private data class FileInfo(val uri: String, val value: String, val asLink: Boolean)

}
