package de.ingrid.igeserver.profiles.ingrid

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.exporter.model.KeyValueModel
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
        , doc.data -> 'references'  as references , doc.data -> 'service' as service , doc.data -> 'serviceUrls' as serviceUrls
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
        val extraJsonbFields = arrayOf("references", "service" , "serviceUrls")

        val result = queryDocs(sqlUrls, "graphicOverviews", null, catalogId , extraJsonbFields)
        return mapQueryResults(result)
    }

    private fun mapQueryResults(
            result: List<Array<Any?>>,
            onlyLinks: Boolean = true
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
           // val identifier = if (it[7] == null) null else jacksonObjectMapper().readTree(it[7].toString())


            dictionary["graphicOverviews"] = data
            dictionary["operations"] = operations
            dictionary["references"] = references
            dictionary["serviceUrls"] = serviceUrls

            if (existingDoc == null) {
                uniqueList.add(
                        DocumentLinks(
                                catalogId,
                                docUuid,
                                getUrlsFromJsonFields(dictionary, onlyLinks),
                                it[3].toString(),
                                it[4].toString()
                        )
                )

            } else {
                existingDoc.docs.addAll(getUrlsFromJsonFields(dictionary, onlyLinks))

            }
        }

        return uniqueList
    }


    private fun getUrlsFromJsonFields(dictionary: MutableMap<String, JsonNode?>, onlyLinks: Boolean): MutableList<UploadInfo> {
        if (dictionary["graphicOverviews"] == null && dictionary["operations"] == null && dictionary["references"] == null
            &&  dictionary["serviceUrls"] == null ) return mutableListOf()


        val linkList: MutableList<UploadInfo> = mutableListOf()

        if (dictionary["graphicOverviews"] != null) {

            linkList.addAll(getUrlsFromGraphicOverviews(dictionary["graphicOverviews"] , true))
        }

        if (dictionary["operations"] != null) {

            linkList.addAll(getUrlsFromOperationJsonField(dictionary["operations"] , true))
        }


        if (dictionary["references"] != null) {

            linkList.addAll(getUrlsFromReferenceJsonField(dictionary["references"] , true))
        }

        if (dictionary["serviceUrls"] != null) {

            linkList.addAll(getUrlsFromServiceURLsJsonField(dictionary["serviceUrls"] , true))
        }
        return linkList

    }
    private fun getUrlsFromGraphicOverviews(graphicOverviews: JsonNode?, onlyLinks: Boolean): MutableList<UploadInfo> {
        if (graphicOverviews == null) return mutableListOf()

        return graphicOverviews
                .asSequence()
                .map { jacksonObjectMapper().convertValue(it, LinkItem::class.java) }
                .filter { it.fileName.asLink }
                .map { it.fileName.uri }
                .map { UploadInfo("graphicOverviews", it, null) }
                .toMutableList()
    }

    private fun getUrlsFromOperationJsonField(service: JsonNode?, onlyLinks: Boolean): MutableList<UploadInfo> {
        if (service == null) return mutableListOf()

        val operations: JsonNode = service["operations"]

        val uploadInfoList = mutableListOf<UploadInfo>()

        for (operation in operations) {
            val methodCall: String? = operation["methodCall"]?.asText()
            if (!methodCall.isNullOrBlank()) {
                uploadInfoList.add(UploadInfo("Operationen", methodCall!!, null))
            }
        }
        return  uploadInfoList
    }

    private fun getUrlsFromReferenceJsonField(references: JsonNode?, onlyLinks: Boolean): MutableList<UploadInfo> {
        if (references == null) return mutableListOf()

        val uploadInfoList = mutableListOf<UploadInfo>()

        for (node in references) {
            val url: String? = node["url"]?.asText()
            if (!url.isNullOrBlank()) {
                uploadInfoList.add(UploadInfo("Reference", url!!, null))
            }

        }

        return  uploadInfoList
    }

    private fun getUrlsFromServiceURLsJsonField(serviceURLs: JsonNode?, onlyLinks: Boolean): MutableList<UploadInfo> {
        if (serviceURLs == null) return mutableListOf()

        val uploadInfoList = mutableListOf<UploadInfo>()

        for (node in serviceURLs) {
            val url: String? = node["url"]?.asText()
            if (!url.isNullOrBlank()) {
                uploadInfoList.add(UploadInfo("serviceURLs", url!!, null))
            }

        }

        return  uploadInfoList
    }


    @JsonIgnoreProperties(ignoreUnknown = true)
    private data class LinkItem(val fileName: FileInfo, val fileDescription: String?)
    @JsonIgnoreProperties(ignoreUnknown = true)
    private data class FileInfo(val uri: String, val value: String, val asLink: Boolean)

}
