package de.ingrid.igeserver.services

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.ObjectNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.api.ApiException
import de.ingrid.igeserver.persistence.DBApi
import de.ingrid.igeserver.persistence.FindOptions
import de.ingrid.igeserver.persistence.QueryType
import de.ingrid.igeserver.persistence.model.document.DocumentType
import de.ingrid.igeserver.persistence.model.document.DocumentWrapperType
import de.ingrid.igeserver.persistence.model.EntityType
import de.ingrid.igeserver.model.QueryField
import de.ingrid.igeserver.model.StatisticResponse
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import java.time.OffsetDateTime
import java.util.*
import kotlin.reflect.KClass

@Service
class DocumentService : MapperService() {

    private val log = logger()

    @Autowired
    private lateinit var documentTypes: List<EntityType>

    @Autowired
    private lateinit var dbService: DBApi

    fun updateParent(dbDoc: String, parent: String?): JsonNode {
        val map = getJsonNode(dbDoc) as ObjectNode
        map.put(FIELD_PARENT, parent)
        return map
    }

    fun determineState(node: JsonNode): String {
        val draft = !node[FIELD_DRAFT].isNull
        val published = !node[FIELD_PUBLISHED].isNull
        return if (published && draft) {
            "PW"
        } else if (published) {
            "P"
        } else {
            "W"
        }
    }

    fun <T : EntityType> getByDocId(id: String, type: KClass<T>, withReferences: Boolean): JsonNode? {

        val query = listOf(QueryField(FIELD_ID, id))
        val findOptions = FindOptions()
        findOptions.queryType = QueryType.EXACT
        findOptions.resolveReferences = withReferences
        val docs = dbService.findAll(type, query, findOptions)
        if (docs.totalHits != 1L) {
            log.error("A $type could not be found or is not unique for UUID: $id (got ${docs.totalHits})")
            throw RuntimeException("No unique document wrapper found")
        }
        return try {
            docs.hits[0]
        } catch (e: Exception) {
            log.error("Error getting document by ID: $id", e)
            null
        }
    }

    val documentWrapper: ObjectNode
        get() {
            val docWrapper = jacksonObjectMapper().createObjectNode()
                    .put(FIELD_DRAFT, null as String?)
                    .put(FIELD_PUBLISHED, null as String?)
            docWrapper.putArray(FIELD_ARCHIVE)

            return docWrapper
        }

    fun <T : EntityType> determineHasChildren(doc: JsonNode, type: KClass<T>): Boolean {
        val id = doc[FIELD_ID].asText()
        val countMap = dbService.countChildrenOfType(id, type)
        return if (countMap.containsKey(id)) {
            countMap[id]!! > 0
        } else false
    }

    fun getLatestDocument(doc: JsonNode, onlyPublished: Boolean = false): ObjectNode {

        val docData: ObjectNode = getDocumentVersion(doc, onlyPublished)

        // set empty parent fields explicitly to null
        if (!docData.has(FIELD_PARENT)) {
            docData.put(FIELD_PARENT, null as String?)
        }
        removeDBManagementFields(docData)

        // get latest references from links
        handleLatestLinkedDocs(docData, onlyPublished)
        return docData
    }

    private fun getDocumentVersion(doc: JsonNode, onlyPublished: Boolean): ObjectNode {
        val draft = doc[FIELD_DRAFT]
        val published = doc[FIELD_PUBLISHED]

        if (onlyPublished && published.isNull) {
            throw ApiException("No published version available of ${doc.get(FIELD_ID)}")
        }

        val objectNode = if (draft.isNull || onlyPublished) {
            published as ObjectNode
        } else {
            draft as ObjectNode
        }

        objectNode.put(FIELD_STATE, if (onlyPublished) "P" else determineState(doc))

        return objectNode
    }

    private fun handleLatestLinkedDocs(doc: ObjectNode, onlyPublished: Boolean) {
        val docType = doc[FIELD_DOCUMENT_TYPE].asText()
        val refType = getDocumentType(docType)

        refType.mapLatestDocReference(doc, onlyPublished)
    }

    fun getDocumentType(docType: String): EntityType {

        return checkNotNull(documentTypes.find { it.className == docType })

    }

    fun createDocument(data: JsonNode, address: Boolean = false): JsonNode {

        val dataJson = data as ObjectNode

        addCreationInfo(dataJson)

        // save document
        val result = dbService.save(DocumentType::class, null, dataJson.toString())

        // create DocumentWrapper
        val recordId = dbService.getRecordId(result)
        val category = getCategoryFromType(data.get(FIELD_DOCUMENT_TYPE).asText(), address)
        val documentWrapper = createWrapper(dataJson, recordId, category)

        // save wrapper
        val resultWrapper = dbService.save(DocumentWrapperType::class, null, documentWrapper.toString())
        return getLatestDocument(resultWrapper)

    }

    /**
     * Every document type belongs to a category(data or address). However a folder can belong to multiple categories
     */
    private fun getCategoryFromType(docType: String, defaultIsAddress: Boolean): String {

        if (docType == "FOLDER") {
            return if (defaultIsAddress) "address" else "data"
        }

        return documentTypes
                .find { it.className == docType }!!
                .category

    }

    private fun addCreationInfo(dataJson: ObjectNode) {

        val uuid = dataJson.get(FIELD_ID)?.textValue() ?: UUID.randomUUID().toString()
        val now = OffsetDateTime.now().toString()

        with(dataJson) {
            put(FIELD_ID, uuid)
            put(FIELD_HAS_CHILDREN, false)
            put(FIELD_CREATED, now)
            put(FIELD_MODIFIED, now)
        }

    }

    private fun createWrapper(node: ObjectNode, recordId: String, category: String): ObjectNode {

        val nodeParentId = node[PARENT_ID]
        val parentId = nodeParentId?.textValue()
        val documentType = node[FIELD_DOCUMENT_TYPE].asText()

        return documentWrapper
                .put(FIELD_ID, node[FIELD_ID].asText())
                .put(FIELD_DRAFT, recordId)
                .put(FIELD_PARENT, parentId)
                .put(FIELD_DOCUMENT_TYPE, documentType)
                .put(FIELD_CATEGORY, category)

    }

    fun getDocStatistic(): StatisticResponse {

        // TODO: filter by not marked deleted

        val allDocumentPublishedQuery = listOf(
                QueryField(FIELD_CATEGORY, "data"),
                QueryField(FIELD_PUBLISHED, null, true)
        )

        val allDocumentDraftsQuery = listOf(
                QueryField(FIELD_CATEGORY, "data"),
                QueryField(FIELD_DOCUMENT_TYPE, "FOLDER", true),
                QueryField(FIELD_DRAFT, null, true)
        )

        val allDocumentQuery = listOf(
                QueryField(FIELD_CATEGORY, "data"),
                QueryField(FIELD_DOCUMENT_TYPE, "FOLDER", true)
        )

        val options = FindOptions()
        options.queryOperator = "AND"
        options.queryType = QueryType.EXACT

        val allData = dbService.findAll(DocumentWrapperType::class, allDocumentQuery, options)
        val allDataDrafts = dbService.findAll(DocumentWrapperType::class, allDocumentDraftsQuery, options)
        val allDataPublished = dbService.findAll(DocumentWrapperType::class, allDocumentPublishedQuery, options)

        return StatisticResponse(
                totalNum = allData.totalHits,
                numDrafts = allDataDrafts.totalHits,
                numPublished = allDataPublished.totalHits
        )
    }
}
