package de.ingrid.igeserver.api

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.ObjectNode
import de.ingrid.igeserver.model.CopyOptions
import de.ingrid.igeserver.model.QueryField
import de.ingrid.igeserver.model.SearchResult
import de.ingrid.igeserver.persistence.QueryType
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.DocumentWrapper
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Group
import de.ingrid.igeserver.repository.DocumentWrapperRepository
import de.ingrid.igeserver.services.*
import de.ingrid.igeserver.utils.AuthUtils
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.AccessDeniedException
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.security.Principal

@RestController
@RequestMapping(path = ["/api"])
class DatasetsApiController @Autowired constructor(
    private val authUtils: AuthUtils,
    private val catalogService: CatalogService,
    private val docWrapperRepo: DocumentWrapperRepository,
    private val documentService: DocumentService,
    private val aclService: IgeAclService
) : DatasetsApi {

    private val log = logger()

    /**
     * Create dataset.
     */
    override fun createDataset(
        principal: Principal,
        data: JsonNode,
        address: Boolean,
        publish: Boolean
    ): ResponseEntity<JsonNode> {

        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)
        val parent = data.get(FIELD_PARENT)
        val parentId = if (parent == null || parent.isNull) null else parent.asText()
        val resultDoc = documentService.createDocument(catalogId, data, parentId, address, publish)
        return ResponseEntity.ok(resultDoc)
    }

    /**
     * Update dataset.
     */
    override fun updateDataset(
        principal: Principal,
        id: String,
        data: JsonNode,
        publish: Boolean,
        revert: Boolean
    ): ResponseEntity<JsonNode> {

        val dbId = catalogService.getCurrentCatalogForPrincipal(principal)
        val resultDoc = if (revert) {
            documentService.revertDocument(dbId, id)
        } else {
            val doc = documentService.convertToDocument(data)
            documentService.updateDocument(dbId, id, doc, publish)
        }
        val node = documentService.convertToJsonNode(resultDoc)
        return ResponseEntity.ok(node)
    }

    @Transactional
    override fun deleteById(principal: Principal, ids: Array<String>): ResponseEntity<String> {

        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)
        for (id in ids) {
            // TODO: remove references to document!?
            documentService.deleteRecursively(catalogId, id)
        }
        return ResponseEntity.ok().build()
    }

    @Transactional
    override fun copyDatasets(
        principal: Principal,
        ids: List<String>,
        options: CopyOptions
    ): ResponseEntity<List<JsonNode>> {

        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)
        val results = ids.map { id -> handleCopy(catalogId, id, options) }
        return ResponseEntity.ok(results)
    }

    override fun moveDatasets(
        principal: Principal,
        ids: List<String>,
        options: CopyOptions
    ): ResponseEntity<Void> {

        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)
        ids.forEach { id -> handleMove(catalogId, id, options) }
        return ResponseEntity(HttpStatus.OK)
    }

    private fun handleCopy(catalogId: String, id: String, options: CopyOptions): JsonNode {

        val wrapper = documentService.getWrapperByDocumentId(id)

        val doc = documentService.getLatestDocument(wrapper, false, false)

        if (options.includeTree) {
            validateCopyOperation(catalogId, id, options.destId)
        }

        val docJson = documentService.convertToJsonNode(doc)
        (docJson as ObjectNode).put(FIELD_PARENT, options.destId)

        return createCopyAndHandleSubTree(catalogId, docJson, options, documentService.isAddress(wrapper))
    }

    private fun createCopyAndHandleSubTree(
        catalogId: String,
        doc: JsonNode,
        options: CopyOptions,
        isAddress: Boolean
    ): JsonNode {
        val origParentId = doc[FIELD_ID].asText()

        val objectNode = doc as ObjectNode

        // remove fields that shouldn't be persisted
        // also copied docs need new ID
        listOf(FIELD_ID, FIELD_STATE, FIELD_HAS_CHILDREN).forEach { objectNode.remove(it) }

        val copiedParent = documentService.createDocument(catalogId, doc, origParentId, isAddress, false) as ObjectNode

        if (options.includeTree) {
            val count = handleCopySubTree(catalogId, copiedParent, origParentId, options, isAddress)
            copiedParent.put(FIELD_HAS_CHILDREN, count > 0)
        }

        return copiedParent
    }

    private fun handleCopySubTree(
        catalogId: String,
        parent: JsonNode,
        origParentId: String,
        options: CopyOptions,
        isAddress: Boolean
    ): Long {

        // get all children of parent and save those recursively
        val parentId = parent.get(FIELD_ID)?.asText()
        val docs = documentService.findChildrenDocs(catalogId, origParentId, isAddress)

        docs.hits.forEach { child ->

            child.let {
                val childDoc = documentService.getLatestDocument(it, false, false)
                val childVersion = (documentService.convertToJsonNode(childDoc) as ObjectNode)
                    .put(FIELD_PARENT, parentId)
                createCopyAndHandleSubTree(catalogId, childVersion, options, isAddress)
            }

        }
        return docs.totalHits
    }

    private fun handleMove(catalogId: String, id: String, options: CopyOptions) {

        val wrapper = documentService.getWrapperByDocumentId(id)
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
        val wrapperWithLinks = documentService.getWrapperByDocumentId(id)
        wrapperWithLinks.parent = if (options.destId == null) null else docWrapperRepo.findById(options.destId)
        docWrapperRepo.save(wrapperWithLinks)
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
                result.addAll(getAllDescendantIds(catalogId, doc.id))
            }
            result
        }
    }

    override fun getChildren(
        principal: Principal,
        parentId: String?,
        isAddress: Boolean
    ): ResponseEntity<List<JsonNode>> {

        val dbId = catalogService.getCurrentCatalogForPrincipal(principal)
        val isCatAdmin = authUtils.isAdmin(principal)
        val children = if (!isCatAdmin && parentId == null) {
            val userName = authUtils.getUsernameFromPrincipal(principal)
            val userGroups = catalogService.getUser(userName)?.groups
            getRootDocsFromGroup(userGroups, isAddress)
        } else {
            documentService.findChildrenDocs(dbId, parentId, isAddress).hits
        }

        val childDocs = children
            .map { doc ->
                val latest = documentService.getLatestDocument(doc, resolveLinks = false)
                latest.data.put(FIELD_HAS_CHILDREN, doc.countChildren > 0)
                documentService.convertToJsonNode(latest)
            }
        return ResponseEntity.ok(childDocs)
    }

    private fun getRootDocsFromGroup(
        userGroups: MutableSet<Group>?,
        isAddress: Boolean,
    ): List<DocumentWrapper> {

        return aclService.getDatasetUuidsFromGroups(userGroups!!, isAddress)
            .map { uuid -> documentService.getWrapperByDocumentId(uuid) }

    }

    override fun find(
        principal: Principal,
        query: String?,
        size: Int,
        sort: String?,
        sortOrder: String?,
        forAddress: Boolean
    ): ResponseEntity<SearchResult<JsonNode>> {

        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)

        val category = if (forAddress) "address" else "data"

        val sortDirection = if (sortOrder == "asc") Sort.Direction.ASC else Sort.Direction.DESC
        val sortColumn = "draft.$sort"
        val theQuery = if (query == null) emptyList() else {
            listOf(QueryField("title", null, QueryType.LIKE, query))
        }
        val docs = documentService.find(
            catalogId,
            category,
            theQuery,
            PageRequest.of(
                0,
                size
//                Sort.by(sortDirection, sortColumn)
            )
        )

        val searchResult = SearchResult<JsonNode>()
        searchResult.totalHits = docs.totalElements
        searchResult.hits = docs.content
            .map { doc -> documentService.getLatestDocument(doc, resolveLinks = false) }
            .map { doc -> documentService.convertToJsonNode(doc) }
        return ResponseEntity.ok(searchResult)
    }

    override fun getByID(
        principal: Principal,
        id: String,
        publish: Boolean?
    ): ResponseEntity<JsonNode> {

        try {
            val wrapper = documentService.getWrapperByDocumentId(id);

            val doc = documentService.getLatestDocument(wrapper)
            val jsonDoc = documentService.convertToJsonNode(doc)
            return ResponseEntity.ok(jsonDoc)
        } catch (ex: AccessDeniedException) {
            throw ForbiddenException.withAccessRights("No read access to document")
        }

    }

    @ExperimentalStdlibApi
    override fun getPath(
        principal: Principal,
        id: String
    ): ResponseEntity<List<String>> {

        var parentId: String = id
        val path: MutableList<String> = ArrayList()
        path.add(id)

        while (true) {
            val doc = try {
                documentService.getWrapperByDocumentId(parentId)
            } catch (ex: AccessDeniedException) {
                log.warn("Parent '$parentId' could not be fetched because of missing access rights")
                break
            }
            val nextParentId = doc.parent?.id
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
