package de.ingrid.igeserver.profiles.ingrid

import com.fasterxml.jackson.databind.node.ArrayNode
import de.ingrid.igeserver.utils.DocumentLinks
import de.ingrid.igeserver.utils.ReferenceHandler
import de.ingrid.igeserver.utils.UploadInfo
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import javax.persistence.EntityManager

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
        result: List<Array<Any>>,
        onlyLinks: Boolean = true
    ): List<DocumentLinks> {
        val uniqueList = mutableListOf<DocumentLinks>()
        result.forEach {
            val catalogId = it[1].toString()
            val docUuid = it[0].toString()
            val existingDoc = uniqueList.find { it.catalogId == catalogId && it.docUuid == docUuid }
            if (existingDoc == null) {
                uniqueList.add(
                    DocumentLinks(
                        catalogId,
                        docUuid,
                        getUrlsFromJsonField(it[2] as ArrayNode, onlyLinks),
                        it[3].toString(),
                        it[4].toString()
                    )
                )
            } else {
                existingDoc.docs.addAll(getUrlsFromJsonField(it[2] as ArrayNode, onlyLinks))
            }
        }

        return uniqueList
    }

    private fun getUrlsFromJsonField(graphicOverviews: ArrayNode, onlyLinks: Boolean): MutableList<UploadInfo> {
        return graphicOverviews
            .filter { it.get("fileName").get("asLink").asBoolean() }
            .map { it.get("fileName").get("uri").asText() }
            .map { UploadInfo("graphicOverviews", it, null) }
            .toMutableList()
    }

}
