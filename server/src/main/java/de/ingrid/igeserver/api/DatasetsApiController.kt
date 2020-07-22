package de.ingrid.igeserver.api

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.ObjectNode
import de.ingrid.igeserver.model.CopyOptions
import de.ingrid.igeserver.model.QueryField
import de.ingrid.igeserver.model.SearchResult
import de.ingrid.igeserver.persistence.DBApi
import de.ingrid.igeserver.persistence.FindAllResults
import de.ingrid.igeserver.persistence.FindOptions
import de.ingrid.igeserver.persistence.QueryType
import de.ingrid.igeserver.persistence.model.document.DocumentWrapperType
import de.ingrid.igeserver.services.*
import de.ingrid.igeserver.utils.AuthUtils
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.security.Principal
import java.util.*

@RestController
@RequestMapping(path = ["/api"])
class DatasetsApiController @Autowired constructor(private val authUtils: AuthUtils, private val catalogService: CatalogService, private val dbService: DBApi, private val documentService: DocumentService) : DatasetsApi {

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

        val dbId = catalogService.getCurrentCatalogForPrincipal(principal)

        try {
            dbService.acquire(dbId).use {

                val resultDoc = documentService.createDocument(data, address)

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

        val dbId = catalogService.getCurrentCatalogForPrincipal(principal)

        dbService.acquire(dbId).use {
            if (dbId == null) {
                throw NotFoundException(HttpStatus.NOT_FOUND.value(), "The user does not seem to be assigned to any database.")
            }

            if (revert) {
                throw ApiException("Not implemented")
            }

            val resultDoc = documentService.updateDocument(id, data, publish)

            return ResponseEntity.ok(resultDoc)
        }
    }

    @Throws(Exception::class)
    override fun deleteById(principal: Principal?, ids: Array<String>): ResponseEntity<String> {

        val dbId = catalogService.getCurrentCatalogForPrincipal(principal)

        dbService.acquire(dbId).use {
            for (id in ids) {

                // TODO: remove references to document!?
                documentService.deleteRecursively(id)

            }
            return ResponseEntity.ok().build()
        }
    }

    override fun copyDatasets(
            principal: Principal?,
            ids: List<String>,
            options: CopyOptions): ResponseEntity<List<JsonNode>> {

        val dbId = catalogService.getCurrentCatalogForPrincipal(principal)

        dbService.acquire(dbId).use {
            val results = ids.map { id -> handleCopy(id, options) }
            return ResponseEntity.ok(results)
        }

    }

    override fun moveDatasets(
            principal: Principal?,
            ids: List<String>,
            options: CopyOptions): ResponseEntity<Void> {

        val dbId = catalogService.getCurrentCatalogForPrincipal(principal)

        dbService.acquire(dbId).use {
//            dbService.beginTransaction()
            ids.forEach { id -> handleMove(id, options) }
//            dbService.commitTransaction()
            return ResponseEntity(HttpStatus.OK)
        }

    }

    private fun handleCopy(id: String, options: CopyOptions): JsonNode {

        val wrapper = documentService.getByDocumentId(id, DocumentWrapperType::class, true) as ObjectNode

        val doc = documentService.getLatestDocument(wrapper, false, false)

        // add new parent to document
        doc.put(FIELD_PARENT, options.destId)

        return createCopyAndHandleSubTree(doc, options, documentService.isAddress(wrapper))

    }

    private fun createCopyAndHandleSubTree(doc: ObjectNode, options: CopyOptions, isAddress: Boolean): JsonNode {
        val origParentId = doc.get(FIELD_ID).asText()

        // when we copy the node, then we also have to reset the id
        doc.put(FIELD_ID, null as String?)

        val copiedParent = documentService.createDocument(doc, isAddress) as ObjectNode

        if (options.includeTree) {
            val count = handleCopySubTree(doc, origParentId, options, isAddress);
            copiedParent.put(FIELD_HAS_CHILDREN, count > 0)
        }

        return copiedParent;
    }

    private fun handleCopySubTree(parent: ObjectNode, origParentId: String, options: CopyOptions, isAddress: Boolean): Long {

        // get all children of parent and save those recursively
        val parentId = parent.get(FIELD_ID).asText()
        val docs = documentService.findChildrenDocs(origParentId, isAddress)

        docs.hits.forEach { doc: JsonNode ->

            val id = doc.get(FIELD_ID).asText()
            val child = documentService.getByDocumentId(id, DocumentWrapperType::class, true)
            child?.let {
                val childVersion = documentService.getLatestDocument(it, false, false)
                childVersion.put(FIELD_PARENT, parentId)
                createCopyAndHandleSubTree(childVersion, options, isAddress)
            }

        }

        return docs.totalHits

    }

    private fun handleMove(id: String, options: CopyOptions) {

        val wrapper = documentService.getByDocumentId(id, DocumentWrapperType::class, true) as ObjectNode
        val doc = documentService.getLatestDocument(wrapper, false, false)

        // update parent
        doc.put(FIELD_PARENT, options.destId)

        val published = doc.get(FIELD_STATE).asText() == DocumentService.DocumentState.PUBLISHED.value

        // update document which includes updating the wrapper
        documentService.updateDocument(id, doc, published)

        // updateWrapper
        val wrapperWithLinks = documentService.getByDocumentId(id, DocumentWrapperType::class, false) as ObjectNode
        wrapperWithLinks.put(FIELD_PARENT, options.destId)
        val wrapperId = dbService.getRecordId(wrapperWithLinks)
        dbService.save(DocumentWrapperType::class, wrapperId, wrapperWithLinks.toString())

    }

    @Throws(ApiException::class)
    override fun getChildren(
            principal: Principal?,
            parentId: String?,
            isAddress: Boolean
    ): ResponseEntity<List<ObjectNode>> {

        val dbId = catalogService.getCurrentCatalogForPrincipal(principal)

        try {
            dbService.acquire(dbId).use {
                val docs = documentService.findChildrenDocs(parentId, isAddress)
                val childDocs = docs.hits
                        .map { doc: JsonNode ->
                            val node = documentService.getLatestDocument(doc, resolveLinks = false)
                            node.put(FIELD_HAS_CHILDREN, documentService.determineHasChildren(doc, DocumentWrapperType::class))
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

        var docs: FindAllResults
        val dbId = catalogService.getCurrentCatalogForPrincipal(principal)

        dbService.acquire(dbId).use {
            val cat = FIELD_CATEGORY + " == " + if (forAddress) "\"address\"" else "\"data\""
            val queryMap = listOf(
                    QueryField("$cat AND draft.title", query),
                    QueryField("$cat AND draft IS NULL AND published.title", query)
            )
            val findOptions = FindOptions(
                    size = size,
                    queryType = QueryType.LIKE,
                    sortField = sort,
                    sortOrder = sortOrder,
                    resolveReferences = true)
            docs = dbService.findAll(DocumentWrapperType::class, queryMap, findOptions)
            val searchResult = SearchResult()
            searchResult.totalHits = docs.totalHits
            searchResult.hits = docs.hits
                    .map { doc: JsonNode -> documentService.getLatestDocument(doc) }
            return ResponseEntity.ok(searchResult)
        }
    }

    @Throws(Exception::class)
    override fun getByID(
            principal: Principal?,
            id: String,
            publish: Boolean?): ResponseEntity<JsonNode> {

        val dbId = catalogService.getCurrentCatalogForPrincipal(principal)

        dbService.acquire(dbId).use {
            val query = listOf(QueryField(FIELD_ID, id))
            val findOptions = FindOptions(
                    queryType = QueryType.EXACT,
                    resolveReferences = true)
            val docs = dbService.findAll(DocumentWrapperType::class, query, findOptions)
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

        val dbId = catalogService.getCurrentCatalogForPrincipal(principal)

        var parentId: String = id
        val path: MutableList<String> = ArrayList()
        path.add(id)

        try {
            dbService.acquire(dbId).use {
                while (true) {
                    val doc = documentService.getByDocumentId(parentId, DocumentWrapperType::class, false) ?: break
                    val nextParentId = doc[FIELD_PARENT]?.textValue()
                    if (nextParentId != null) {
                        path.add(nextParentId)
                        parentId = nextParentId
                    } else {
                        break;
                    }
                }
            }
        } catch (e: Exception) {
            log.error("Error getting path", e)
        }

        return ResponseEntity.ok(path.reversed())

    }
}