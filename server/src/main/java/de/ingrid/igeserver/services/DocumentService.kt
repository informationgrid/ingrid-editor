package de.ingrid.igeserver.services

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.ObjectNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.api.ApiException
import de.ingrid.igeserver.api.NotFoundException
import de.ingrid.igeserver.persistence.model.document.DocumentType
import de.ingrid.igeserver.persistence.model.document.DocumentWrapperType
import de.ingrid.igeserver.persistence.model.EntityType
import de.ingrid.igeserver.model.QueryField
import de.ingrid.igeserver.model.StatisticResponse
import de.ingrid.igeserver.persistence.*
import de.ingrid.igeserver.persistence.ConcurrentModificationException
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

    enum class DocumentState(val value: String) {
        PUBLISHED("P"),
        DRAFT("W")
    }

    fun <T : EntityType> getByDocumentId(id: String, type: KClass<T>, withReferences: Boolean): JsonNode? {

        val query = listOf(QueryField(FIELD_ID, id))
        val findOptions = FindOptions(
                queryType = QueryType.EXACT,
                resolveReferences = withReferences)
        val docs = dbService.findAll(type, query, findOptions)
        if (docs.totalHits != 1L) {
            log.error("A $type could not be found or is not unique for UUID: $id (got ${docs.totalHits})")
            throw NotFoundException(404, "No unique document wrapper found")
        }
        return try {
            docs.hits[0]
        } catch (e: Exception) {
            log.error("Error getting document by ID: $id", e)
            null
        }
    }

    fun <T : EntityType> determineHasChildren(doc: JsonNode, type: KClass<T>): Boolean {
        val id = doc[FIELD_ID].asText()
        val countMap = dbService.countChildrenOfType(id, type)
        return if (countMap.containsKey(id)) {
            countMap[id]!! > 0
        } else false
    }

    fun findChildrenDocs(parentId: String?, isAddress: Boolean): FindAllResults {
        val queryMap = listOf(
                QueryField(FIELD_PARENT, parentId),
                QueryField(FIELD_CATEGORY, if (isAddress) DocumentCategory.ADDRESS.value else DocumentCategory.DATA.value)
        )
        val findOptions = FindOptions(
                queryType = QueryType.EXACT,
                resolveReferences = true,
                queryOperator = "AND")
        return dbService.findAll(DocumentWrapperType::class, queryMap, findOptions)
    }

    fun getLatestDocument(doc: JsonNode, onlyPublished: Boolean = false, resolveLinks: Boolean = true): ObjectNode {

        val docData: ObjectNode = getDocumentVersion(doc, onlyPublished)

        return prepareDocument(docData, doc[FIELD_DOCUMENT_TYPE].asText(), onlyPublished, resolveLinks)
    }

    private fun prepareDocument(docData: ObjectNode, docType: String, onlyPublished: Boolean = false, resolveLinks: Boolean = true): ObjectNode {
        // set empty parent fields explicitly to null
        val parent = docData.has(FIELD_PARENT)
        if (!parent || docData.get(FIELD_PARENT).asText().isEmpty()) {
            docData.put(FIELD_PARENT, null as String?)
        }
        removeDBManagementFields(docData)

        // get latest references from links
        if (resolveLinks) {
            val refType = getDocumentType(docType)

            refType.mapLatestDocReference(docData, onlyPublished)
        }

        return docData
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
        val documentWrapper = createDocumentWrapper(dataJson, recordId, category)

        // save wrapper
        val resultWrapper = dbService.save(DocumentWrapperType::class, null, documentWrapper.toString())
        return getLatestDocument(resultWrapper)
    }

    fun updateDocument(id: String, data: JsonNode, publish: Boolean = false): JsonNode {
        val docWrapper = getByDocumentId(id, DocumentWrapperType::class, false) as ObjectNode

        checkForPublishedConcurrency(docWrapper, data.get(FIELD_VERSION)?.asInt())

        // just update document by using new data and adding database ID
        val recordId = determineRecordId(docWrapper)

        // update parent in case of moving a document
        docWrapper.put(FIELD_PARENT, data.get(FIELD_PARENT).asText());

        // save document with same ID or new one, if no draft version exists
        val updatedDocument = data as ObjectNode
        updatedDocument.put(FIELD_MODIFIED, OffsetDateTime.now().toString())
        val version = updatedDocument.get(FIELD_VERSION)?.asText();

        // handle linked docs
        val docType = updatedDocument[FIELD_DOCUMENT_TYPE].asText()
        val refType = getDocumentType(docType)
        refType.handleLinkedFields(updatedDocument)

        // TODO: use document id instead of DB-ID
        // TODO: use version as Int
        val savedDoc = dbService.save(DocumentType::class, recordId, updatedDocument.toString(), version)

        val dbID = dbService.getRecordId(savedDoc)
        saveDocumentWrapper(publish, docWrapper, dbID)
        val wrapper = getByDocumentId(id, DocumentWrapperType::class, true)
        return getLatestDocument(wrapper!!)
    }

    fun getDocumentStatistic(): StatisticResponse {

        // TODO: filter by not marked deleted

        val allDocumentPublishedQuery = listOf(
                QueryField(FIELD_CATEGORY, DocumentCategory.DATA.value),
                QueryField(FIELD_PUBLISHED, null, true)
        )

        val allDocumentDraftsQuery = listOf(
                QueryField(FIELD_CATEGORY, DocumentCategory.DATA.value),
                QueryField(FIELD_DOCUMENT_TYPE, DocumentCategory.FOLDER.value, true),
                QueryField(FIELD_DRAFT, null, true)
        )

        val allDocumentQuery = listOf(
                QueryField(FIELD_CATEGORY, DocumentCategory.DATA.value),
                QueryField(FIELD_DOCUMENT_TYPE, DocumentCategory.FOLDER.value, true)
        )

        val options = FindOptions(
                queryOperator = "AND",
                queryType = QueryType.EXACT)

        val allData = dbService.findAll(DocumentWrapperType::class, allDocumentQuery, options)
        val allDataDrafts = dbService.findAll(DocumentWrapperType::class, allDocumentDraftsQuery, options)
        val allDataPublished = dbService.findAll(DocumentWrapperType::class, allDocumentPublishedQuery, options)

        return StatisticResponse(
                totalNum = allData.totalHits,
                numDrafts = allDataDrafts.totalHits,
                numPublished = allDataPublished.totalHits
        )
    }

    /**
     * Every document type belongs to a category(data or address). However a folder can belong to multiple categories
     */
    private fun getCategoryFromType(docType: String, defaultIsAddress: Boolean): String {

        if (docType == DocumentCategory.FOLDER.value) {
            return if (defaultIsAddress) DocumentCategory.ADDRESS.value else DocumentCategory.DATA.value
        }

        return documentTypes
                .find { it.className == docType }!!
                .category
    }

    private fun determineRecordId(docWrapper: ObjectNode): String? {
        return if (docWrapper[FIELD_DRAFT].isNull) {
            null
        } else {
            docWrapper[FIELD_DRAFT].asText()
        }
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

        objectNode.put(FIELD_STATE, if (onlyPublished) DocumentState.PUBLISHED.value else determineState(doc))

        return objectNode
    }

    private fun determineState(node: JsonNode): String {
        val draft = !node[FIELD_DRAFT].isNull
        val published = !node[FIELD_PUBLISHED].isNull
        return if (published && draft) {
            DocumentState.PUBLISHED.value + DocumentState.DRAFT.value
        } else if (published) {
            DocumentState.PUBLISHED.value
        } else {
            DocumentState.DRAFT.value
        }
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

    private fun createDocumentWrapper(node: ObjectNode, recordId: String, category: String): ObjectNode {

        val nodeParentId = node[PARENT_ID]
        val parentId = nodeParentId?.textValue()
        val documentType = node[FIELD_DOCUMENT_TYPE].asText()

        return jacksonObjectMapper().createObjectNode().apply {
            put(FIELD_DRAFT, null as String?)
            put(FIELD_PUBLISHED, null as String?)
            put(FIELD_ID, node[FIELD_ID].asText())
            put(FIELD_DRAFT, recordId)
            put(FIELD_PARENT, parentId)
            put(FIELD_DOCUMENT_TYPE, documentType)
            put(FIELD_CATEGORY, category)
            putArray(FIELD_ARCHIVE)
        }
    }

    private fun saveDocumentWrapper(publish: Boolean, docWrapper: ObjectNode, dbID: String): JsonNode {
        return if (publish) {
            handlePublishingOnDocumentWrapper(docWrapper, dbID)
        } else {
            handleSaveOnDocumentWrapper(docWrapper, dbID)
        }
    }

    private fun handleSaveOnDocumentWrapper(docWrapper: ObjectNode, dbID: String): JsonNode {
        // update document wrapper with new draft version
        if (docWrapper[FIELD_DRAFT].isNull) {
            // TODO: db_id is ORecord!
            docWrapper.put(FIELD_DRAFT, dbID)
            return dbService.save(DocumentWrapperType::class, dbService.getRecordId(docWrapper), docWrapper.toString())
        }
        return docWrapper
    }

    private fun handlePublishingOnDocumentWrapper(docWrapper: ObjectNode, dbID: String): JsonNode {
        // add ID from published field to archive
        if (!docWrapper[FIELD_PUBLISHED].isNull) {
            docWrapper.withArray(FIELD_ARCHIVE).add(docWrapper[FIELD_PUBLISHED])
        }

        // add doc to published reference
        docWrapper.put(FIELD_PUBLISHED, dbID)

        // remove draft version
        docWrapper.put(FIELD_DRAFT, null as String?)
        return dbService.save(DocumentWrapperType::class, dbService.getRecordId(docWrapper), docWrapper.toString())
    }

    private fun updateParent(dbDoc: String, parent: String?): JsonNode {
        val map = getJsonNode(dbDoc) as ObjectNode
        map.put(FIELD_PARENT, parent)
        return map
    }

    /**
     * Throw an exception if we want to save a draft version with a version number lower than
     * the current published version.
     */
    private fun checkForPublishedConcurrency(wrapper: ObjectNode, version: Int?) {

        val draft = wrapper.get(FIELD_DRAFT)
        val publishedDBID = wrapper.get(FIELD_PUBLISHED).asText()

        if (draft.isNull && publishedDBID != null) {
            val publishedDoc = dbService.find(DocumentType::class, publishedDBID)
            val publishedVersion = publishedDoc?.get("@version")?.asInt()
            if (version != null && publishedVersion != null && publishedVersion > version) {
                throw ConcurrentModificationException(
                        "Could not update object with id $publishedDBID. The database version is newer than the record version.",
                        publishedDBID,
                        publishedDoc.get("@version").asInt(),
                        version)
            }
        }
    }

    fun deleteRecursively(id: String) {
        val wrapper = getByDocumentId(id, DocumentWrapperType::class, true)

        findChildrenDocs(id, isAddress(wrapper)).hits.forEach {
            deleteRecursively(it.get(FIELD_ID).asText())
        }

        // remove all document versions which have the same ID
        dbService.remove(DocumentType::class, id)

        // remove the wrapper
        dbService.remove(DocumentWrapperType::class, id)
    }

    fun isAddress(wrapper: JsonNode?): Boolean {
        return wrapper?.get(FIELD_CATEGORY)?.asText() == DocumentCategory.ADDRESS.value
    }

    fun revertDocument(id: String): JsonNode {

        // remove draft version
        val wrapper = getByDocumentId(id, DocumentWrapperType::class, false) as ObjectNode

        val publishedId = wrapper.get(FIELD_PUBLISHED)

        // check if draft and published field are filled
        assert(!wrapper.get(FIELD_DRAFT).isNull && !publishedId.isNull)

        wrapper.put(FIELD_DRAFT, null as String?)
        val recordId = dbService.getRecordId(wrapper)
//        val version = wrapper.get(FIELD_VERSION).asText()

        dbService.save(DocumentWrapperType::class, recordId, wrapper.toString())

        // return published version
        val publishedDoc = dbService.find(DocumentType::class, publishedId.asText()) as ObjectNode

        publishedDoc.put(FIELD_STATE, DocumentState.PUBLISHED.value)
//        publishedDoc.put(FIELD_HAS_CHILDREN, determineHasChildren())

        return prepareDocument(publishedDoc, wrapper.get(FIELD_DOCUMENT_TYPE).asText())

    }
}
