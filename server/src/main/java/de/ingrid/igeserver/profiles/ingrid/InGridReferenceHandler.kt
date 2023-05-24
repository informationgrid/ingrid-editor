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
class InGridReferenceHandler @Autowired constructor(entityManager: EntityManager) : ReferenceHandler(entityManager) {

    override fun getProfile() = InGridProfile.id

    private val sqlUrls = """
        SELECT doc.uuid as uuid, catalog.identifier as catalogId, doc.data -> 'graphicOverviews' as graphicOverviews, doc.title, doc.type
        FROM catalog,
             document_wrapper dw,
             document doc
        WHERE dw.catalog_id = catalog.id
          AND catalog.type = 'ingrid'
          AND dw.deleted = 0
          AND dw.category = 'data'
          AND dw.uuid = doc.uuid
          AND doc.state != 'ARCHIVED'
    """.trimIndent()


    override fun getURLsFromCatalog(catalogId: String): List<DocumentLinks> {
        val result = queryDocs(sqlUrls, "graphicOverviews", null, catalogId)
        return mapQueryResults(result)
    }

    private fun mapQueryResults(
            result: List<Array<Any?>>,
            onlyLinks: Boolean = true
    ): List<DocumentLinks> {
        val uniqueList = mutableListOf<DocumentLinks>()
        result.forEach {
            val catalogId = it[1].toString()
            val docUuid = it[0].toString()
            val existingDoc = uniqueList.find { it.catalogId == catalogId && it.docUuid == docUuid }
            val data = if (it[2] == null) null else jacksonObjectMapper().readTree(it[2].toString())
            if (existingDoc == null) {
                uniqueList.add(
                        DocumentLinks(
                                catalogId,
                                docUuid,
                                getUrlsFromJsonField(data, onlyLinks),
                                it[3].toString(),
                                it[4].toString()
                        )
                )
            } else {
                existingDoc.docs.addAll(getUrlsFromJsonField(data, onlyLinks))
            }
        }

        return uniqueList
    }

    private fun getUrlsFromJsonField(graphicOverviews: JsonNode?, onlyLinks: Boolean): MutableList<UploadInfo> {
        if (graphicOverviews == null) return mutableListOf()

        return graphicOverviews
                .asSequence()
                .map { jacksonObjectMapper().convertValue(it, LinkItem::class.java) }
                .filter { it.fileName.asLink }
                .map { it.fileName.uri }
                .map { UploadInfo("graphicOverviews", it, null) }
                .toMutableList()
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private data class LinkItem(val fileName: FileInfo, val fileDescription: String?)
    @JsonIgnoreProperties(ignoreUnknown = true)
    private data class FileInfo(val uri: String, val value: String, val asLink: Boolean)

}
