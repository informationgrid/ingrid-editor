package de.ingrid.igeserver.services

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.ObjectNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.api.ApiException
import de.ingrid.igeserver.db.DBApi
import de.ingrid.igeserver.db.FindOptions
import de.ingrid.igeserver.db.QueryType
import de.ingrid.igeserver.documenttypes.AbstractDocumentType
import de.ingrid.igeserver.documenttypes.DocumentType
import de.ingrid.igeserver.documenttypes.DocumentWrapperType
import de.ingrid.igeserver.model.QueryField
import de.ingrid.igeserver.model.StatisticResponse
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import java.time.OffsetDateTime
import java.util.*

@Service
class DocumentService : MapperService() {

    private val log = logger()

    @Autowired
    private lateinit var documentTypes: List<AbstractDocumentType>

    @Autowired
    private lateinit var dbService: DBApi

    @Throws(Exception::class)
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

    @Throws(Exception::class)
    fun getByDocId(id: String, type: String, withReferences: Boolean): JsonNode? {

        val query = listOf(QueryField(FIELD_ID, id))
        val findOptions = FindOptions()
        findOptions.queryType = QueryType.exact
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

    fun determineHasChildren(doc: JsonNode, type: String): Boolean {
        val id = doc[FIELD_ID].asText()
        val countMap = dbService.countChildrenFromNode(id, type)
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

        refType.mapLatestDocReference(doc, onlyPublished, this)
    }

    fun getDocumentType(docType: String): AbstractDocumentType {

        return checkNotNull(documentTypes.find { it.typeName == docType })

    }

    fun createDocument(data: JsonNode, address: Boolean = false): JsonNode {

        val dataJson = data as ObjectNode

        addCreationInfo(dataJson)

        // save document
        val result = dbService.save(DocumentType.TYPE, null, dataJson.toString())

        // create DocumentWrapper
        val recordId = dbService.getRecordId(result)
        val category = if (address) "address" else "data"
        val documentWrapper = createWrapper(dataJson, recordId, category)

        // save wrapper
        val resultWrapper = dbService.save(DocumentWrapperType.TYPE, null, documentWrapper.toString())
        return getLatestDocument(resultWrapper)

    }


    private fun addCreationInfo(dataJson: ObjectNode) {

        val uuid = UUID.randomUUID()
        val now = OffsetDateTime.now().toString()

        with(dataJson) {
            put(FIELD_ID, uuid.toString())
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
                QueryField("_category", "data"),
                QueryField("published", null, true)
        )

        val allDocumentDraftsQuery = listOf(
                QueryField("_category", "data"),
                QueryField("draft", null, true)
        )

        val allDocumentQuery = listOf(
                QueryField("_category", "data")
        )

        val options = FindOptions()
        options.queryOperator = "AND"
        options.queryType = QueryType.exact

        val allData = dbService.findAll(DocumentWrapperType.TYPE, allDocumentQuery, options)
        val allDataDrafts = dbService.findAll(DocumentWrapperType.TYPE, allDocumentDraftsQuery, options)
        val allDataPublished = dbService.findAll(DocumentWrapperType.TYPE, allDocumentPublishedQuery, options)

        return StatisticResponse(
                totalNum = allData.totalHits,
                numDrafts = allDataDrafts.totalHits,
                numPublished = allDataPublished.totalHits
        )
    }
}
