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
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.AccessDeniedException
import org.springframework.security.core.Authentication
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
        val parentId = if (parent == null || parent.isNull) null else parent.asInt()
        val resultDoc = documentService.createDocument(principal, catalogId, data, parentId, address, publish)
        return ResponseEntity.ok(resultDoc)
    }

    /**
     * Update dataset.
     */
    override fun updateDataset(
        principal: Principal,
        id: Int,
        data: JsonNode,
        publish: Boolean,
        unpublish: Boolean,
        revert: Boolean
    ): ResponseEntity<JsonNode> {

        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)
        val resultDoc = if (revert) {
            documentService.revertDocument(principal, catalogId, id)
        } else if (unpublish) {
            documentService.unpublishDocument(principal, catalogId, id)
        } else {
            val doc = documentService.convertToDocument(data)
            documentService.updateDocument(principal, catalogId, id, doc, publish)
        }
        val node = documentService.convertToJsonNode(resultDoc)
        return ResponseEntity.ok(node)
    }

    @Transactional
    override fun deleteById(principal: Principal, ids: Array<String>): ResponseEntity<Unit> {

        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)
        for (id in ids) {
            // TODO: remove references to document!?
            documentService.deleteRecursively(catalogId, id)
        }
        return ResponseEntity.noContent().build()
    }

    @Transactional
    override fun copyDatasets(
        principal: Principal,
        ids: List<String>,
        options: CopyOptions
    ): ResponseEntity<List<JsonNode>> {
        val destCanWrite = aclService.getPermissionInfo(principal as Authentication, options.destId)
            .let { it.canWrite || it.canOnlyWriteSubtree }
        val sourceCanRead = ids.map { aclService.getPermissionInfo(principal, it.toInt()).canRead }.all { it }
        if (!(destCanWrite && sourceCanRead)) throw ForbiddenException.withAccessRights("No access to referenced datasets")


        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)
        val results = ids.map { id -> handleCopy(principal, catalogId, id, options) }
        return ResponseEntity.ok(results)
    }

    override fun moveDatasets(
        principal: Principal,
        ids: List<Int>,
        options: CopyOptions
    ): ResponseEntity<Void> {
        val destCanWrite = aclService.getPermissionInfo(principal as Authentication, options.destId)
            .let { it.canWrite || it.canOnlyWriteSubtree }
        val sourceCanWrite = ids.map { aclService.getPermissionInfo(principal, it).canWrite }.all { it }
        if (!(destCanWrite && sourceCanWrite)) throw ForbiddenException.withAccessRights("No access to referenced datasets")

        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)
        ids.forEach { id -> handleMove(catalogId, id, options) }
        return ResponseEntity(HttpStatus.OK)
    }

    private fun handleCopy(principal: Principal, catalogId: String, id: String, options: CopyOptions): JsonNode {

        val wrapper = documentService.getWrapperByDocumentIdAndCatalog(catalogId, id)

        val doc = documentService.getLatestDocument(wrapper, false, false)

        if (options.includeTree) {
            validateCopyOperation(catalogId, id.toInt(), options.destId)
        }

        val docJson = documentService.convertToJsonNode(doc)
        (docJson as ObjectNode).put(FIELD_PARENT, options.destId)

        return createCopyAndHandleSubTree(principal, catalogId, docJson, options, documentService.isAddress(wrapper))
    }

    private fun createCopyAndHandleSubTree(
        principal: Principal,
        catalogId: String,
        doc: JsonNode,
        options: CopyOptions,
        isAddress: Boolean
    ): JsonNode {
        val origParentId = doc[FIELD_ID].asText()

        val objectNode = doc as ObjectNode

        // remove fields that shouldn't be persisted
        // also copied docs need new ID
        listOf(FIELD_ID, FIELD_UUID, FIELD_STATE, FIELD_HAS_CHILDREN).forEach { objectNode.remove(it) }

        val copiedParent =
            documentService.createDocument(principal, catalogId, doc, options.destId, isAddress, false) as ObjectNode

        if (options.includeTree) {
            val count = handleCopySubTree(principal, catalogId, copiedParent, origParentId, options, isAddress)
            copiedParent.put(FIELD_HAS_CHILDREN, count > 0)
        }

        return copiedParent
    }

    private fun handleCopySubTree(
        principal: Principal,
        catalogId: String,
        parent: JsonNode,
        origParentId: String,
        options: CopyOptions,
        isAddress: Boolean
    ): Long {

        // get all children of parent and save those recursively
        val parentId = parent.get(FIELD_ID)?.asInt()
        val docs = documentService.findChildrenDocs(catalogId, origParentId.toInt(), isAddress)

        docs.hits.forEach { child ->

            child.let {
                val childDoc = documentService.getLatestDocument(it, false, false)
                val childVersion = (documentService.convertToJsonNode(childDoc) as ObjectNode)
                    .put(FIELD_PARENT, parentId)
                createCopyAndHandleSubTree(principal, catalogId, childVersion, CopyOptions(parentId, true), isAddress)
            }

        }
        return docs.totalHits
    }

    private fun handleMove(catalogId: String, id: Int, options: CopyOptions) {

        if (id == options.destId) {
            throw ConflictException.withReason("Cannot move '$id' to itself")
        }
        validateCopyOperation(catalogId, id, options.destId)

        // update ACL parent
        documentService.aclService.updateParent(id, options.destId)

        // get new parent path
        val newPath = if (options.destId == null) emptyList() else {
            getPathFromWrapper(catalogId, options.destId.toString()) + options.destId.toString()
        }

        // updateWrapper
        val docWrapper = documentService.getWrapperByDocumentId(id)
        docWrapper.parent =
            if (options.destId == null) null else docWrapperRepo.findById(options.destId).get()
        docWrapper.path = newPath

        docWrapperRepo.save(docWrapper)

        updatePathForAllChildren(catalogId, newPath, id)
    }

    private fun updatePathForAllChildren(catalogId: String, path: List<String>, id: Int) {
        documentService.findChildren(catalogId, id).hits
            .forEach {
                it.path = path + id.toString()
                if (it.type == "FOLDER") {
                    updatePathForAllChildren(catalogId, it.path, it.id!!)
                }
                docWrapperRepo.save(it)
            }
    }

    private fun validateCopyOperation(catalogId: String, sourceId: Int, destinationId: Int?) {
        // check destination is not part of source
        val descIds = getAllDescendantIds(catalogId, sourceId)
        if (descIds.contains(destinationId) || sourceId == destinationId) {
            throw ConflictException.withReason("Cannot copy '$sourceId' since  '$destinationId' is part of the hierarchy")
        }
    }

    /**
     *  Get a list of all IDs hierarchically below a given id
     */
    private fun getAllDescendantIds(catalogId: String, id: Int): List<Int> {
        val docs = documentService.findChildren(catalogId, id)
        return if (docs.hits.isEmpty()) {
            emptyList()
        } else {
            docs.hits
                .flatMap { doc ->
                    if (doc.countChildren > 0) getAllDescendantIds(
                        catalogId,
                        doc.id!!
                    ) + doc.id!! else listOf(doc.id!!)
                }
        }
    }

    override fun getChildren(
        principal: Principal,
        parentId: String?,
        isAddress: Boolean
    ): ResponseEntity<List<JsonNode>> {

        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)
        val isCatAdmin = authUtils.isAdmin(principal)
        val children = if (!isCatAdmin && parentId == null) {
            val userName = authUtils.getUsernameFromPrincipal(principal)
            val userGroups = catalogService.getUser(userName)?.groups
            getRootDocsFromGroup(userGroups, catalogId, isAddress)
        } else {
            documentService.findChildrenDocs(catalogId, parentId?.toInt(), isAddress).hits
        }

        val childDocs = children
            .map { doc ->
                val latest = documentService.getLatestDocument(doc, resolveLinks = false)
                latest.data.put(FIELD_HAS_CHILDREN, doc.countChildren > 0)
                latest.data.put(FIELD_PARENT, doc.parent?.id)
                documentService.convertToJsonNode(latest)
            }
        return ResponseEntity.ok(childDocs)
    }

    private fun getRootDocsFromGroup(
        userGroups: MutableSet<Group>?,
        catalogId: String,
        isAddress: Boolean,
    ): List<DocumentWrapper> {

        val actualRootIds = mutableListOf<Int>()
        val potentialRootIds = aclService.getDatasetUuidsFromGroups(userGroups!!, isAddress)

        for (currentId in potentialRootIds) {
            var isRoot = true
            for (potentialParent in potentialRootIds) {
                if (currentId == potentialParent) continue
                if (isChildOf(currentId, potentialParent, catalogId, isAddress)) {
                    isRoot = false
                    break
                }
            }
            if (isRoot) actualRootIds.add(currentId)
        }

        return actualRootIds.map { id -> documentService.getWrapperByDocumentId(id) }

    }

    private fun isChildOf(childId: Int, parentId: Int, catalogId: String, isAddress: Boolean): Boolean {

        val childrenIds = this.documentService.findChildrenDocs(catalogId, parentId, isAddress).hits.mapNotNull { it.id }
        if (childrenIds.contains(childId)) return true

        childrenIds.forEach { parentChild -> if (isChildOf(childId, parentChild, catalogId, isAddress)) return true }
        return false
    }

    override fun find(
        principal: Principal,
        query: String?,
        size: Int,
        sort: String?,
        sortOrder: String?,
        forAddress: Boolean
    ): ResponseEntity<SearchResult<JsonNode>> {

        val isAdmin = authUtils.isAdmin(principal)
        val userName = authUtils.getUsernameFromPrincipal(principal)
        val userGroups = catalogService.getUser(userName)?.groups ?: emptySet()

        // if a user has no groups then user is not allowed anything
        if (userGroups.isEmpty() && !isAdmin) {
            return ResponseEntity.ok(SearchResult<JsonNode>().apply { totalHits = 0; hits = emptyList() })
        }

        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)

        val category = if (forAddress) "address" else "data"

//        val sortDirection = if (sortOrder == "asc") Sort.Direction.ASC else Sort.Direction.DESC
//        val sortColumn = "draft.$sort"
        val theQuery = if (query == null) emptyList() else {
            listOf(
                QueryField("title", "OR", QueryType.LIKE, query),
                QueryField("uuid", "OR", QueryType.LIKE, query)
            )
        }
        val docs = documentService.find(
            catalogId,
            category,
            theQuery,
            PageRequest.of(
                0,
                size
//                Sort.by(sortDirection, sortColumn)
            ),
            userGroups
        )

        val searchResult = SearchResult<JsonNode>()
        searchResult.totalHits = docs.totalElements
        searchResult.hits = docs.content
            .map { doc -> documentService.getLatestDocument(doc, resolveLinks = false) }
            .map { doc -> documentService.convertToJsonNode(doc) }
        return ResponseEntity.ok(searchResult)
    }

    override fun getByUUID(
        principal: Principal,
        uuid: String,
        publish: Boolean?
    ): ResponseEntity<JsonNode> {
        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)
        val wrapper = documentService.getWrapperByCatalogAndDocumentUuid(catalogId, uuid)

        return getByID(principal, wrapper.id!!, publish)
    }

    override fun getByID(
        principal: Principal,
        id: Int,
        publish: Boolean?
    ): ResponseEntity<JsonNode> {

        try {
            val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)
            val wrapper = documentService.getWrapperByDocumentIdAndCatalog(catalogId, id.toString())

            val doc = documentService.getLatestDocument(wrapper)
            doc.data.put(FIELD_HAS_CHILDREN, wrapper.countChildren > 0)
            doc.data.put(FIELD_PARENT, wrapper.parent?.id)
            doc.hasWritePermission = wrapper.hasWritePermission
            doc.hasOnlySubtreeWritePermission = wrapper.hasOnlySubtreeWritePermission
            val jsonDoc = documentService.convertToJsonNode(doc)
            return ResponseEntity.ok(jsonDoc)
        } catch (ex: AccessDeniedException) {
            throw ForbiddenException.withAccessRights("No read access to document")
        }

    }

    override fun getPath(
        principal: Principal,
        id: Int
    ): ResponseEntity<List<PathResponse>> {
        val wrapper = documentService.getWrapperByDocumentId(id)
        val path = wrapper.path

        val response = path.map { pathId ->
            val pathWrapper = docWrapperRepo.findByIdNoPermissionCheck(pathId.toInt())
            val title = pathWrapper.draft?.title ?: pathWrapper.published?.title ?: "???!"
            val permission = aclService.getPermissionInfo(principal as Authentication, pathId.toInt())
            PathResponse(pathId.toInt(), title, permission)
        }

        return ResponseEntity.ok(
            response + PathResponse(
                wrapper.id!!,
                wrapper.draft?.title ?: wrapper.published?.title ?: "???",
                PermissionInfo(true, wrapper.hasWritePermission, wrapper.hasOnlySubtreeWritePermission)
            )
        )

    }

    data class PathResponse(val id: Int, val title: String, val permission: PermissionInfo? = null)

    private fun getPathFromWrapper(catalogId: String, id: String) =
        documentService.getWrapperByDocumentIdAndCatalog(catalogId, id).path

}
