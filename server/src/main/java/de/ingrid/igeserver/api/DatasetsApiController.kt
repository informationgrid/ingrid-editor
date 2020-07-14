package de.ingrid.igeserver.api

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.ObjectNode
import com.orientechnologies.orient.core.exception.OConcurrentModificationException
import com.orientechnologies.orient.core.id.ORecordId
import de.ingrid.igeserver.db.*
import de.ingrid.igeserver.documenttypes.DocumentType
import de.ingrid.igeserver.documenttypes.DocumentWrapperType
import de.ingrid.igeserver.model.CopyOptions
import de.ingrid.igeserver.model.QueryField
import de.ingrid.igeserver.model.SearchResult
import de.ingrid.igeserver.services.*
import de.ingrid.igeserver.utils.AuthUtils
import de.ingrid.igeserver.utils.DBUtils
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.security.Principal
import java.time.OffsetDateTime
import java.util.*
import java.util.stream.Collectors

@RestController
@RequestMapping(path = ["/api"])
class DatasetsApiController @Autowired constructor(private val authUtils: AuthUtils, private val dbUtils: DBUtils, private val dbService: DBApi, private val documentService: DocumentService) : DatasetsApi {

    private val log = logger()

    private enum class CopyMoveOperation {
        COPY, MOVE
    }

    /**
     * Create dataset.
     */
    @Throws(ApiException::class)
    override fun createDataset(
            principal: Principal?,
            data: JsonNode,
            address: Boolean,
            publish: Boolean): ResponseEntity<JsonNode> {

        val dbId = dbUtils.getCurrentCatalogForPrincipal(principal)

        try {
            dbService.acquire(dbId).use {
                val dataJson = data

                val resultDoc = documentService.createDocument(dataJson, address)

                return ResponseEntity.ok(resultDoc)
            }
        } catch (e: Exception) {
            log.error("Error during creation of document", e)
            throw ApiException(e.message)
        }
    }

    /**
     * Update dataset.
     */
    @Throws(ApiException::class)
    override fun updateDataset(
            principal: Principal?,
            id: String,
            data: JsonNode,
            publish: Boolean,
            revert: Boolean): ResponseEntity<JsonNode> {

        val dbId = dbUtils.getCurrentCatalogForPrincipal(principal)

        dbService.acquire(dbId).use {
            if (dbId == null) {
                throw NotFoundException(HttpStatus.NOT_FOUND.value(), "The user does not seem to be assigned to any database.")
            }

            if (revert) {
                throw ApiException("Not implemented")
            }

            val docWrapper = documentService.getByDocId(id, DocumentWrapperType.TYPE, false) as ObjectNode

            checkForPublishedConcurrency(docWrapper, data.get(FIELD_VERSION)?.asInt())

            // just update document by using new data and adding database ID
            val recordId = determineRecordId(docWrapper)

            // save document with same ID or new one, if no draft version exists
            val updatedDocument = data as ObjectNode
            updatedDocument.put(FIELD_MODIFIED, OffsetDateTime.now().toString())
            val version = updatedDocument.get(FIELD_VERSION)?.asText();
            handleLinkedDocs(updatedDocument)

            // TODO: use document id instead of DB-ID
            val savedDoc = dbService.save(DocumentType.TYPE, recordId, updatedDocument.toString(), version)

            val dbID = dbService.getRecordId(savedDoc)
            saveDocumentWrapper(publish, docWrapper, dbID)
            val wrapper = documentService.getByDocId(id, DocumentWrapperType.TYPE, true)
            val result = documentService.getLatestDocument(wrapper!!)

            return ResponseEntity.ok(result)
        }
    }

    private fun determineRecordId(docWrapper: ObjectNode): String? {
        return if (docWrapper[FIELD_DRAFT].isNull) {
            null
        } else {
            docWrapper[FIELD_DRAFT].asText()
        }
    }

    /**
     * Throw an exception if we want to save a draft version with a version number lower than
     * the current published version.
     */
    private fun checkForPublishedConcurrency(wrapper: ObjectNode, version: Int?) {

        val draft = wrapper.get(FIELD_DRAFT)
        val publishedDBID = wrapper.get(FIELD_PUBLISHED).asText()

        if (draft.isNull && publishedDBID != null) {
            val publishedDoc = dbService.find(DocumentType.TYPE, publishedDBID)
            val publishedVersion = publishedDoc?.get("@version")?.asInt()
            if (version != null && publishedVersion != null && publishedVersion > version) {
                throw OConcurrentModificationException(
                        ORecordId(publishedDBID),
                        publishedDoc.get("@version").asInt(),
                        version,
                        0)
            }
        }
    }

    @Throws(Exception::class)
    override fun deleteById(principal: Principal?, ids: Array<String>): ResponseEntity<String> {

        val dbId = dbUtils.getCurrentCatalogForPrincipal(principal)

        dbService.acquire(dbId).use {
            for (id in ids) {

                // TODO: remove references to document!?
                // TODO: remove all children recursively

                // String recordId = this.dbService.getRecordId(type, id);
                // JsonNode dbDoc = this.dbService.find(type, recordId);
                dbService.remove(DocumentWrapperType.TYPE, id)
            }
            return ResponseEntity.ok().build()
        }
    }

    override fun copyDatasets(
            principal: Principal?,
            ids: List<String>,
            data: CopyOptions): ResponseEntity<List<JsonNode>> {

        val dbId = dbUtils.getCurrentCatalogForPrincipal(principal)

        dbService.acquire(dbId).use {
            val result = copyOrMove(CopyMoveOperation.COPY, ids, data.destId)
            return ResponseEntity.ok(result)
        }

    }

    override fun moveDatasets(
            principal: Principal?,
            ids: List<String>,
            options: CopyOptions): ResponseEntity<Void> {

        val dbId = dbUtils.getCurrentCatalogForPrincipal(principal)

        dbService.acquire(dbId).use {
            copyOrMove(CopyMoveOperation.MOVE, ids, options.destId)
            return ResponseEntity(HttpStatus.OK)
        }

    }

    private fun copyOrMove(operation: CopyMoveOperation, ids: List<String>, destId: String?): MutableList<JsonNode> {

        val results = mutableListOf<JsonNode>()

        for (id in ids) {
            val wrapper = documentService.getByDocId(id, DocumentWrapperType.TYPE, true) as ObjectNode
            val isAddress = wrapper.get(FIELD_CATEGORY).asText() == "address"
            val doc = documentService.getLatestDocument(wrapper, false, false)

            // add new parent to document
            doc.put(FIELD_PARENT, destId)

            val result = when (operation) {
                CopyMoveOperation.COPY -> handleCopy(doc, isAddress)
                CopyMoveOperation.MOVE -> handleMove(doc, isAddress)
            }

            results.add(result)
        }

        return results

    }

    private fun handleCopy(doc: ObjectNode, isAddress: Boolean): JsonNode {

        // when we copy the node, then we also have to reset the id
        doc.put(FIELD_ID, null as String?)

        return documentService.createDocument(doc, isAddress)
    }

    private fun handleMove(doc: ObjectNode, isAddress: Boolean): JsonNode {
        TODO("Not yet implemented")
    }

    @Throws(ApiException::class)
    override fun getChildren(
            principal: Principal?,
            parentId: String?,
            isAddress: Boolean
    ): ResponseEntity<List<ObjectNode>> {

        var docs: DBFindAllResults
        val dbId = dbUtils.getCurrentCatalogForPrincipal(principal)

        try {
            dbService.acquire(dbId).use {
                val queryMap = listOf(
                        QueryField(FIELD_PARENT, parentId),
                        QueryField(FIELD_CATEGORY, if (isAddress) "address" else "data")
                )
                val findOptions = FindOptions()
                findOptions.queryType = QueryType.exact
                findOptions.resolveReferences = true
                findOptions.queryOperator = "AND"
                docs = dbService.findAll(DocumentWrapperType.TYPE, queryMap, findOptions)
                val childDocs = docs.hits
                        .map { doc: JsonNode ->
                            val node = documentService.getLatestDocument(doc)
                            node.put(FIELD_HAS_CHILDREN, documentService.determineHasChildren(doc, DocumentWrapperType.TYPE))
                            node
                        }
                return ResponseEntity.ok(childDocs)
            }
        } catch (e: Exception) {
            log.error(e)
            throw ApiException("Error occured getting children of " + parentId + ": " + e.message)
        }

    }

    @Throws(Exception::class)
    override fun find(principal: Principal?, query: String, size: Int, sort: String, sortOrder: String, forAddress: Boolean): ResponseEntity<SearchResult> {

        var docs: DBFindAllResults
        val dbId = dbUtils.getCurrentCatalogForPrincipal(principal)

        dbService.acquire(dbId).use {
            val cat = FIELD_CATEGORY + " == " + if (forAddress) "\"address\"" else "\"data\""
            val queryMap = listOf(
                    QueryField("$cat AND draft.title", query),
                    QueryField("$cat AND draft IS NULL AND published.title", query)
            )
            val findOptions = FindOptions()
            findOptions.size = size
            findOptions.queryType = QueryType.like
            findOptions.sortField = sort
            findOptions.sortOrder = sortOrder
            findOptions.resolveReferences = true
            docs = dbService.findAll(DocumentWrapperType.TYPE, queryMap, findOptions)
            val searchResult = SearchResult()
            searchResult.totalHits = docs.totalHits
            searchResult.hits = docs.hits.stream()
                    .map { doc: JsonNode -> documentService.getLatestDocument(doc) }
                    .collect(Collectors.toList())
            return ResponseEntity.ok(searchResult)
        }
    }

    @Throws(Exception::class)
    override fun getByID(
            principal: Principal?,
            id: String,
            publish: Boolean?): ResponseEntity<JsonNode> {

        val dbId = dbUtils.getCurrentCatalogForPrincipal(principal)

        dbService.acquire(dbId).use {
            val query = listOf(QueryField(FIELD_ID, id))
            val findOptions = FindOptions()
            findOptions.queryType = QueryType.exact
            findOptions.resolveReferences = true
            val docs = dbService.findAll(DocumentWrapperType.TYPE, query, findOptions)
            return if (docs.totalHits > 0) {
                val doc = documentService.getLatestDocument(docs.hits[0])
                ResponseEntity.ok(doc)
            } else {
                throw NotFoundException(404, "Document not found with id: $id")
            }
        }

    }

    @ExperimentalStdlibApi
    @Throws(ApiException::class)
    override fun getPath(
            principal: Principal?,
            id: String): ResponseEntity<List<String>> {

        val dbId = dbUtils.getCurrentCatalogForPrincipal(principal)

        var parentId: String = id
        val path: MutableList<String> = ArrayList()
        path.add(id)

        try {
            dbService.acquire(dbId).use {
                while (true) {
                    val doc = documentService.getByDocId(parentId, DocumentWrapperType.TYPE, false) ?: break
                    val nextParentId = doc[FIELD_PARENT].textValue()
                    if (nextParentId != null) {
                        path.add(nextParentId)
                        parentId = nextParentId
                    } else {
                        break;
                    }
                }
            }
        } catch (e: Exception) {
            log.error(e)
        }

        return ResponseEntity.ok(path.reversed())

    }

    private fun saveDocumentWrapper(publish: Boolean, docWrapper: ObjectNode, dbID: String): JsonNode {
        if (publish) {
            return handlePublishingOnWrapper(docWrapper, dbID)
        } else {
            return handleSaveOnWrapper(docWrapper, dbID)
        }
    }

    @Throws(Exception::class)
    private fun handleLinkedDocs(doc: ObjectNode) {
        val docType = doc[FIELD_DOCUMENT_TYPE].asText()
        val refType = documentService.getDocumentType(docType)
        refType.handleLinkedFields(doc, dbService)
    }

    @Throws(ApiException::class)
    private fun handleSaveOnWrapper(docWrapper: ObjectNode, dbID: String): JsonNode {
        // update document wrapper with new draft version
        if (docWrapper[FIELD_DRAFT].isNull) {
            // TODO: db_id is ORecord!
            docWrapper.put(FIELD_DRAFT, dbID)
            return dbService.save(DocumentWrapperType.TYPE, dbService.getRecordId(docWrapper), docWrapper.toString())
        }
        return docWrapper
    }

    @Throws(ApiException::class)
    private fun handlePublishingOnWrapper(docWrapper: ObjectNode, dbID: String): JsonNode {
        // add ID from published field to archive
        if (!docWrapper[FIELD_PUBLISHED].isNull) {
            docWrapper.withArray(FIELD_ARCHIVE).add(docWrapper[FIELD_PUBLISHED])
        }

        // add doc to published reference
        docWrapper.put(FIELD_PUBLISHED, dbID)

        // remove draft version
        docWrapper.put(FIELD_DRAFT, null as String?)
        return dbService.save(DocumentWrapperType.TYPE, dbService.getRecordId(docWrapper), docWrapper.toString())
    }
}