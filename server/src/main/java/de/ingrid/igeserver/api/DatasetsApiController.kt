package de.ingrid.igeserver.api

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.ObjectNode
import de.ingrid.igeserver.model.CopyOptions
import de.ingrid.igeserver.model.QueryField
import de.ingrid.igeserver.model.SearchResult
import de.ingrid.igeserver.persistence.*
import de.ingrid.igeserver.persistence.model.document.DocumentWrapperType
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.repository.DocumentWrapperRepository
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
class DatasetsApiController @Autowired constructor(
    private val authUtils: AuthUtils,
    private val catalogService: CatalogService,
    private val docWrapperRepo: DocumentWrapperRepository,
    private val documentService: DocumentService
) : DatasetsApi {

    private val log = logger()

    /**
     * Create dataset.
     */
    override fun createDataset(
            principal: Principal?,
            data: JsonNode,
            address: Boolean,
            publish: Boolean): ResponseEntity<JsonNode> {

        val dbId = catalogService.getCurrentCatalogForPrincipal(principal)
        val resultDoc = documentService.createDocument(dbId, data, address, publish)
        return ResponseEntity.ok(resultDoc)
    }

    /**
     * Update dataset.
     */
    override fun updateDataset(
            principal: Principal?,
            id: String,
            data: Document,
            publish: Boolean,
            revert: Boolean): ResponseEntity<Document> {

        val dbId = catalogService.getCurrentCatalogForPrincipal(principal)
        val resultDoc = if (revert) {
            documentService.revertDocument(dbId, id)
        } else {
            documentService.updateDocument(dbId, id, data, publish)
        }
        return ResponseEntity.ok(resultDoc)
    }

    override fun deleteById(principal: Principal?, ids: Array<String>): ResponseEntity<String> {

        val dbId = catalogService.getCurrentCatalogForPrincipal(principal)
        for (id in ids) {
            // TODO: remove references to document!?
            documentService.deleteRecursively(dbId, id)
        }
        return ResponseEntity.ok().build()
    }

    override fun copyDatasets(
            principal: Principal?,
            ids: List<String>,
            options: CopyOptions): ResponseEntity<List<JsonNode>> {

        val dbId = catalogService.getCurrentCatalogForPrincipal(principal)
        val results = ids.map { id -> handleCopy(dbId, id, options) }
        return ResponseEntity.ok(results)
    }

    override fun moveDatasets(
            principal: Principal?,
            ids: List<String>,
            options: CopyOptions): ResponseEntity<Void> {

        val dbId = catalogService.getCurrentCatalogForPrincipal(principal)
//            dbService.beginTransaction()
        ids.forEach { id -> handleMove(dbId, id, options) }
//            dbService.commitTransaction()
        return ResponseEntity(HttpStatus.OK)
    }

    private fun handleCopy(catalogId: String, id: String, options: CopyOptions): JsonNode {

        val wrapper = documentService.getWrapperByDocumentId(id, true)

        val doc = documentService.getLatestDocument(wrapper, false, false)

        if (options.includeTree) {
            validateCopyOperation(catalogId, id, options.destId)
        }

        // TODO: add new parent to document
//        doc.parent = options.destId

        return createCopyAndHandleSubTree(catalogId, doc, options, documentService.isAddress(wrapper))
    }

    private fun createCopyAndHandleSubTree(catalogId: String, doc: Document, options: CopyOptions, isAddress: Boolean): JsonNode {
        val origParentId = doc.uuid

        // when we copy the node, then we also have to reset the id
        doc.uuid = UUID.randomUUID().toString() // (FIELD_ID, null as String?)

        val copiedParent = documentService.createDocument(catalogId, doc, isAddress, false) as ObjectNode

        if (options.includeTree) {
            val count = handleCopySubTree(catalogId, doc, origParentId, options, isAddress)
            copiedParent.put(FIELD_HAS_CHILDREN, count > 0)
        }

        return copiedParent
    }

    private fun handleCopySubTree(catalogId: String, parent: Document, origParentId: String, options: CopyOptions, isAddress: Boolean): Long {

        // get all children of parent and save those recursively
        val parentId = parent.uuid
        val docs = documentService.findChildrenDocs(catalogId, origParentId, isAddress)

        docs.hits.forEach { child ->

//            val id = doc.get(FIELD_ID).asText()
//            val child = documentService.getWrapperByDocumentId(id, true)
            // TODO: migrate
/*
            child.let {
                val childVersion = documentService.getLatestDocument(it, false, false)
                childVersion.put(FIELD_PARENT, parentId)
                createCopyAndHandleSubTree(catalogId, childVersion, options, isAddress)
            }
*/

        }
        return docs.totalHits
    }

    private fun handleMove(catalogId: String, id: String, options: CopyOptions) {

        val wrapper = documentService.getWrapperByDocumentId(id, true)
        val doc = documentService.getLatestDocument(wrapper, false, true)

        if (id == options.destId) {
            throw ConflictException.withReason("Cannot move '$id' to itself")
        }
        validateCopyOperation(catalogId, id, options.destId)

        // TODO: update parent
//        doc.parent = options.destId

        val published = doc.state == DocumentService.DocumentState.PUBLISHED.value

        // update document which includes updating the wrapper
        documentService.updateDocument(catalogId, id, doc, published)

        // updateWrapper
        val wrapperWithLinks = documentService.getWrapperByDocumentId(id, false) as ObjectNode
        wrapperWithLinks.put(FIELD_PARENT, options.destId)
        // TODO: migrate
//        val wrapperId = dbService.getRecordId(wrapperWithLinks)
//        dbService.save(DocumentWrapperType::class, wrapperId, wrapperWithLinks.toString())
    }

    private fun validateCopyOperation(catalogId: String, sourceId: String, destinationId: String?) {
        // check destination is not part of source
        val descIds = getAllDescendantIds(catalogId, sourceId).drop(1)
        if (descIds.contains(destinationId)) {
            throw ConflictException.withReason("Cannot copy '$sourceId' to contained '$destinationId'")
        }
    }

    /**
     *  first id in result is always own id
     */
    private fun getAllDescendantIds(catalogId: String, id: String): List<String> {
        val docs = documentService.findChildren(catalogId, id)
        return if (docs.hits.isEmpty()) {
            List(1) { id }
        } else {
            val result = mutableListOf(id)
            docs.hits.forEach { doc ->
                result.addAll(getAllDescendantIds(catalogId, doc.uuid))
            }
            result
        }
    }

    override fun getChildren(
            principal: Principal?,
            parentId: String?,
            isAddress: Boolean
    ): ResponseEntity<List<Document>> {

        val dbId = catalogService.getCurrentCatalogForPrincipal(principal)
        val docs = documentService.findChildrenDocs(dbId, parentId, isAddress)
        val childDocs = docs.hits
                .map { doc ->
                    val node = documentService.getLatestDocument(doc, resolveLinks = false)
                    // TODO: node.hasChildren = documentService.determineHasChildren(doc)
                    node
                }
        return ResponseEntity.ok(childDocs)
    }

    override fun find(principal: Principal?, query: String?, size: Int?, sort: String?, sortOrder: String?, forAddress: Boolean): ResponseEntity<SearchResult<Document>> {

//        var docs: FindAllResults
        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)
        
        val category = if (forAddress) "address" else "data"

        /*val queryOptions = QueryOptions(
                queryType = QueryType.LIKE,
                queryOperator = QueryOperator.AND
        )
        val queryMap = listOf(
                Pair(listOf(
                        QueryField("catalog.identifier", dbId),
                        QueryField(FIELD_CATEGORY, " =", cat),
                        QueryField("draft.title", query  ?: "")
                ), queryOptions),
                Pair(listOf(
                        QueryField("catalog.identifier", dbId),
                        QueryField(FIELD_CATEGORY, " =", cat),
                        QueryField("draft", null),
                        QueryField("published.title", query  ?: "")
                ), queryOptions)
        )

        val findOptions = FindOptions(
                queryOperator = QueryOperator.OR,
                size = size,
                sortField = sort,
                sortOrder = sortOrder,
                resolveReferences = true)
        docs = dbService.findAllExt(DocumentWrapperType::class, queryMap, findOptions)
        */
        val docs = docWrapperRepo.findLatestInTitle(catalogId, category, query)
        val docs2 = docWrapperRepo.findLatestInTitle2()
        
        val searchResult = SearchResult<Document>()
        searchResult.totalHits = 123 // docs.totalHits
        searchResult.hits = docs/*.hits
                .map { doc: JsonNode -> documentService.getLatestDocument(doc) }*/
        return ResponseEntity.ok(searchResult)
    }

    override fun getByID(
            principal: Principal?,
            id: String,
            publish: Boolean?): ResponseEntity<Document> {

        val dbId = catalogService.getCurrentCatalogForPrincipal(principal)
        val query = listOf(QueryField(FIELD_ID, id))
        val findOptions = FindOptions(
                queryType = QueryType.EXACT,
                resolveReferences = true)
//        val docs = dbService.findAll(DocumentWrapperType::class, query, findOptions)

        val wrapper = docWrapperRepo.findByUuid(id)
        val doc = when (wrapper.draft) {
            null -> {
                wrapper.published?.state = "P"
                wrapper.published
            }
            else -> {
                wrapper.draft?.state = "B"
                wrapper.draft
            }
        } 
//        return if (docs.totalHits > 0) {
//            val doc = documentService.getLatestDocument(docs.hits[0])
            return ResponseEntity.ok(doc)
//        } else {
//            throw NotFoundException.withMissingResource(id, DocumentWrapperType::class.simpleName)
//        }
    }

    @ExperimentalStdlibApi
    override fun getPath(
            principal: Principal?,
            id: String): ResponseEntity<List<String>> {

        val dbId = catalogService.getCurrentCatalogForPrincipal(principal)

        var parentId: String = id
        val path: MutableList<String> = ArrayList()
        path.add(id)

        while (true) {
            val doc = documentService.getWrapperByDocumentId(parentId, false) ?: break
            val nextParentId = doc.parent?.uuid
            if (nextParentId != null) {
                path.add(nextParentId)
                parentId = nextParentId
            } else {
                break
            }
        }

        return ResponseEntity.ok(path.reversed())
    }
}
