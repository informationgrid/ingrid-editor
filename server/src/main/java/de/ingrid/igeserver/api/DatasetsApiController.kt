package de.ingrid.igeserver.api

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.ObjectNode
import de.ingrid.igeserver.annotations.AuditLog
import de.ingrid.igeserver.model.CopyOptions
import de.ingrid.igeserver.model.User
import de.ingrid.igeserver.persistence.FindAllResults
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.DocumentWrapper
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Group
import de.ingrid.igeserver.repository.DocumentRepository
import de.ingrid.igeserver.repository.DocumentWrapperRepository
import de.ingrid.igeserver.services.*
import de.ingrid.igeserver.utils.AuthUtils
import de.ingrid.mdek.upload.storage.Storage
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.access.AccessDeniedException
import org.springframework.security.acls.domain.BasePermission
import org.springframework.security.acls.domain.SidRetrievalStrategyImpl
import org.springframework.security.acls.model.SidRetrievalStrategy
import org.springframework.security.core.Authentication
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.security.Principal
import java.time.format.DateTimeFormatter
import java.util.*

@RestController
@RequestMapping(path = ["/api"])
class DatasetsApiController(
    private val authUtils: AuthUtils,
    private val catalogService: CatalogService,
    private val docWrapperRepo: DocumentWrapperRepository,
    private val docRepo: DocumentRepository,
    private val documentService: DocumentService,
    private val groupService: GroupService,
    private val aclService: IgeAclService,
    private val storage: Storage,
) : DatasetsApi {

//    private val log = logger()

    private val sidRetrievalStrategy: SidRetrievalStrategy = SidRetrievalStrategyImpl()

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
        addMetadataToDocument(resultDoc)

        val node = documentService.convertToJsonNode(resultDoc.document)
        return ResponseEntity.ok(node)
    }

    /**
     * Update dataset.
     */
    override fun updateDataset(
        principal: Principal,
        id: Int,
        data: JsonNode,
        publishDate: Date?,
        publish: Boolean,
        unpublish: Boolean,
        cancelPendingPublishing: Boolean,
        revert: Boolean
    ): ResponseEntity<JsonNode> {

        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)
        val resultDoc = if (revert) {
            documentService.revertDocument(principal, catalogId, id)
        } else if (unpublish) {
            documentService.unpublishDocument(principal, catalogId, id)
        } else if (cancelPendingPublishing) {
            documentService.cancelPendingPublishing(principal, catalogId, id)
        } else if (publish) {
            val doc = documentService.convertToDocument(data)
            documentService.publishDocument(principal, catalogId, id, doc, publishDate)
        } else {
            val doc = documentService.convertToDocument(data)
            documentService.updateDocument(principal, catalogId, id, doc)
        }

        addMetadataToDocument(resultDoc)

        val node = documentService.convertToJsonNode(resultDoc.document)
        return ResponseEntity.ok(node)
    }

    private fun addMetadataToDocument(
        documentData: DocumentData
    ) {
        val wrapper = documentData.wrapper

        with(documentData.document) {
            data.put(FIELD_HAS_CHILDREN, wrapper.countChildren > 0)
            data.put(FIELD_PARENT, wrapper.parent?.id)
            data.put(FIELD_PARENT_IS_FOLDER, wrapper.parent?.type == "FOLDER")
            // TODO: next two fields not really necessary, since they can be simply evaluated from doc
            data.put(FIELD_CREATED_USER_EXISTS, createdByUser != null)
            data.put(FIELD_MODIFIED_USER_EXISTS, contentModifiedByUser != null)
            data.put(FIELD_PENDING_DATE, wrapper.pending_date?.format(DateTimeFormatter.ISO_DATE_TIME))
            data.put(FIELD_TAGS, wrapper.tags.joinToString(","))
            data.put(FIELD_RESPONSIBLE_USER, wrapper.responsibleUser?.id)
            wrapper.fingerprint?.let {
                data.put(FIELD_METADATA_DATE, it[0].date.toString())
            }
            hasWritePermission = wrapper.hasWritePermission
            hasOnlySubtreeWritePermission = wrapper.hasOnlySubtreeWritePermission
            wrapperId = wrapper.id
        }
    }

    @Transactional
    override fun deleteById(principal: Principal, ids: List<Int>): ResponseEntity<Unit> {

        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)
        for (id in ids) {
            // TODO: remove references to document!?
            documentService.deleteDocument(principal, catalogId, id)
        }
        return ResponseEntity.noContent().build()
    }

    @AuditLog(action = "copy_datasets", target = "options", data = "ids")
    @Transactional
    override fun copyDatasets(
        principal: Principal,
        ids: List<Int>,
        options: CopyOptions
    ): ResponseEntity<List<JsonNode>> {
        val destCanWrite = aclService.getPermissionInfo(principal as Authentication, options.destId)
            .let { it.canWrite || it.canOnlyWriteSubtree }
        val sourceCanRead = ids.map { aclService.getPermissionInfo(principal, it).canRead }.all { it }
        if (!(destCanWrite && sourceCanRead)) throw ForbiddenException.withAccessRights("No access to referenced datasets")


        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)
        val results = ids.map { id -> handleCopy(principal, catalogId, id, options) }
        return ResponseEntity.ok(results)
    }

    @AuditLog(action = "move_datasets", target = "options", data = "ids")
    @Transactional
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

    @Transactional
    override fun setResponsibleUser(principal: Principal, datasetId: Int, userId: Int): ResponseEntity<Void> {
        this.docWrapperRepo.findById(datasetId).ifPresent { wrapper ->
            val user = this.catalogService.getUser(userId)
            if (user != null) {
                wrapper.responsibleUser = user
                docWrapperRepo.save(wrapper)
            }
        }
        return ResponseEntity(HttpStatus.OK)
    }

    override fun replaceAddress(
        principal: Principal,
        source: String,
        target: String
    ): ResponseEntity<Unit> {
        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)
        this.documentService.replaceAddress(catalogId, source, target)
        return ResponseEntity(HttpStatus.OK)
    }

    override fun setTags(principal: Principal, id: Int, tags: TagRequest): ResponseEntity<List<String>> {
        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)
        val updatedTags = this.documentService.updateTags(catalogId, id, tags) ?: emptyList()
        return ResponseEntity.ok(updatedTags)
    }

    /*
     * Validation errors are thrown as exceptions
     */
    override fun validate(principal: Principal, id: Int): ResponseEntity<Unit> {
        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)
        documentService.validate(principal, catalogId, id)
        return ResponseEntity.ok().build()
    }

    private fun handleCopy(principal: Principal, catalogId: String, id: Int, options: CopyOptions): JsonNode {

        val wrapper = documentService.getWrapperByDocumentIdAndCatalog(catalogId, id)

        val doc = documentService.getDocumentByWrapperId(catalogId, id)

        if (options.includeTree) {
            validateCopyOperation(catalogId, id, options.destId)
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
        val origParentId = doc[FIELD_ID].asInt()
        val origParentUUID = doc[FIELD_UUID].asText()

        val objectNode = doc as ObjectNode

        // remove fields that shouldn't be persisted
        // also copied docs need new ID
        listOf(
            FIELD_ID,
            FIELD_UUID,
            FIELD_STATE,
            FIELD_HAS_CHILDREN,
            FIELD_VERSION,
            FIELD_CREATED
        ).forEach { objectNode.remove(it) }

        val copiedParent =
            documentService.createDocument(
                principal,
                catalogId,
                doc,
                options.destId,
                isAddress,
                false,
                InitiatorAction.COPY
            )

        addMetadataToDocument(copiedParent)

        storage.copyToUnpublished(catalogId, origParentUUID, copiedParent.wrapper.uuid)

        val copiedParentJson = documentService.convertToJsonNode(copiedParent.document) as ObjectNode
        if (options.includeTree) {
            val count = handleCopySubTree(principal, catalogId, copiedParent.wrapper.id!!, origParentId, isAddress)
            copiedParentJson.put(FIELD_HAS_CHILDREN, count > 0)
        }

        return copiedParentJson
    }

    private fun handleCopySubTree(
        principal: Principal,
        catalogId: String,
        parentId: Int,
        origParentId: Int,
        isAddress: Boolean
    ): Long {

        // get all children of parent and save those recursively
        val docs = documentService.findChildrenDocs(catalogId, origParentId, isAddress)

        docs.hits.forEach { child ->

            child.let {
//                val childDoc = documentService.getLatestDocument(it, false, false)
                val childVersion = (documentService.convertToJsonNode(it.document) as ObjectNode)
                    .put(FIELD_PARENT, parentId)
                createCopyAndHandleSubTree(principal, catalogId, childVersion, CopyOptions(parentId, true), isAddress)
            }

        }
        return docs.totalHits
    }

    private fun handleMove(catalogId: String, id: Int, options: CopyOptions) {

        if (id == options.destId) {
            throw ConflictException.withMoveConflict("Cannot move '$id' to itself")
        }
        validateCopyOperation(catalogId, id, options.destId)

        // update ACL parent
        documentService.aclService.updateParent(id, options.destId)

        // get new parent path
        val newPath = if (options.destId == null) emptyList() else {
            getPathFromWrapper(catalogId, options.destId) + options.destId.toString()
        }

        // updateWrapper
        val docData = documentService.getDocumentFromCatalog(catalogId, id)
        val parent =
            if (options.destId == null) null else documentService.getDocumentFromCatalog(catalogId, options.destId)

        // check parent is published if moved dataset also has been published
        if (parent != null && parent.wrapper.type != DocumentCategory.FOLDER.value && docData.document.state != DOCUMENT_STATE.DRAFT) {
            if (parent.document.state == DOCUMENT_STATE.DRAFT) {
                throw ValidationException.withReason(
                    "Parent must be published, since moved dataset is also published",
                    errorCode = "PARENT_IS_NOT_PUBLISHED"
                )
            }
        }

        docData.wrapper.parent = parent?.wrapper
        docData.wrapper.path = newPath

        docWrapperRepo.save(docData.wrapper)

        updatePathForAllChildren(catalogId, newPath, id)
    }

    private fun updatePathForAllChildren(catalogId: String, path: List<String>, id: Int) {
        documentService.findChildrenWrapper(catalogId, id).hits
            .forEach {
                it.path = path + id.toString()
                // FIXME: what about the path of person under an institution???
                if (it.type == "FOLDER") {
                    updatePathForAllChildren(catalogId, it.path, it.id!!)
                }
                docWrapperRepo.save(it)
            }
    }

    private fun validateCopyOperation(catalogId: String, sourceId: Int, destinationId: Int?) {
        // check destination is not part of source
        val descIds = documentService.getAllDescendantIds(catalogId, sourceId)
        if (descIds.contains(destinationId) || sourceId == destinationId) {
            throw ConflictException.withCopyConflict("Cannot copy '$sourceId' since  '$destinationId' is part of the hierarchy")
        }
    }

    override fun getChildren(
        principal: Principal,
        parentId: String?,
        isAddress: Boolean
    ): ResponseEntity<List<JsonNode>> {

        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)
        val isSuperOrCatAdmin = authUtils.isAdmin(principal)
        val hasRootRead = checkForRootPermissions(
            sidRetrievalStrategy.getSids(principal as Authentication),
            listOf(BasePermission.READ)
        )

        val childrenInfo = if (
            parentId == null && !isSuperOrCatAdmin && !hasRootRead
        ) {
            // Calculate Root Objects for non-admin users
            val userName = authUtils.getUsernameFromPrincipal(principal)
            val userGroups = catalogService.getUser(userName)?.getGroupsForCatalog(catalogId)
            getRootDocsFromGroup(userGroups, isAddress)
        } else {
            documentService.findChildrenDocs(catalogId, parentId?.toInt(), isAddress)
        }

        val childDocs = childrenInfo.hits
            .map { doc ->
                addMetadataToDocument(doc)
                documentService.convertToJsonNode(doc.document)
            }
        return ResponseEntity.ok(childDocs)
    }

    private fun getRootDocsFromGroup(
        userGroups: Set<Group>?,
        isAddress: Boolean,
    ): FindAllResults<DocumentData> {

        val actualRoots = mutableListOf<DocumentWrapper>()
        val groupDatasets = aclService.getDatasetIdsFromGroups(userGroups!!, isAddress)
            .map { id -> documentService.getWrapperByDocumentId(id) }
        // paths is a list of string which need to be compared with ids from datasets, so we convert IDs to strings here
        val groupDatasetIds = groupDatasets.map { it.id.toString() }.toSet()

        for (potentialRoot in groupDatasets) {
            // if potentialRoot.path contains(intersects) any other groupDatasetId it is a descendant and therefore not an actual root node.
            val isRoot = potentialRoot.path.intersect(groupDatasetIds).isEmpty()
            if (isRoot) actualRoots.add(potentialRoot)
        }

        return documentService.getDocumentsFromWrappers(actualRoots)
    }


    data class UserAccessResponse(val canOnlyRead: Set<User>, val canWrite: Set<User>)

    override fun getUsersWithAccessToDocument(
        principal: Principal,
        id: Int,
    ): ResponseEntity<UserAccessResponse> {
        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)
        val isSuperOrCatAdmin = authUtils.isAdmin(principal)

        val canWriteUsers =
            groupService.getUsersWithAccess(principal, catalogId, id, BasePermission.WRITE).toMutableSet()
        val canOnlyReadUsers =
            groupService.getUsersWithAccess(principal, catalogId, id, BasePermission.READ).minus(canWriteUsers)
                .toMutableSet()


        if (isSuperOrCatAdmin) {
            //  only show admins to other admins
            val admins =
                catalogService.getAllCatalogUsers(principal, catalogId).filter { user -> user.role == "cat-admin" }
                    .toSet()
            // admins can always write
            canWriteUsers.addAll(admins)
            canOnlyReadUsers.removeAll(admins)
        } else {
            val principalManagedUsers = catalogService.getAllCatalogUserIds(principal)
                .filter { catalogService.canEditUser(principal, it) }
            val principalLogin = authUtils.getUsernameFromPrincipal(principal)
            // filter list to only show users which the md-admin principal can edit + himself
            canWriteUsers.retainAll { principalManagedUsers.contains(it.login) || it.login == principalLogin }
            canOnlyReadUsers.retainAll { principalManagedUsers.contains(it.login) || it.login == principalLogin }
        }

        return ResponseEntity.ok(UserAccessResponse(canOnlyReadUsers, canWriteUsers))
    }

    override fun getByUUID(
        principal: Principal,
        uuid: String,
        publish: Boolean?
    ): ResponseEntity<JsonNode> {
        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)
        val wrapper = documentService.getWrapperByCatalogAndDocumentUuid(catalogId, uuid)

        return if (publish == true) {
            val document = documentService.getLastPublishedDocument(catalogId, uuid)
            addMetadataToDocument(DocumentData(wrapper, document))
            documentService.convertToJsonNode(document).let { ResponseEntity.ok(it) }
        } else {
            getByID(principal, wrapper.id!!)
        }
    }

    override fun getByID(
        principal: Principal,
        id: Int
    ): ResponseEntity<JsonNode> {

        try {
            val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)
            // TODO: catalogId is not necessary anymore
            val docData = documentService.getDocumentFromCatalog(catalogId, id, true)

            addMetadataToDocument(docData)
            val jsonDoc = documentService.convertToJsonNode(docData.document)
            return ResponseEntity.ok(jsonDoc)
        } catch (ex: AccessDeniedException) {
            throw ForbiddenException.withAccessRights("No read access to document")
        }

    }

    override fun getPath(
        principal: Principal,
        id: Int
    ): ResponseEntity<List<PathResponse>> {
        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)
        val documentData = documentService.getDocumentFromCatalog(catalogId, id)
        val path = documentData.wrapper.path

        val pathInfos = path
            .map(String::toInt)
            .map { pathId -> createPathResponse(pathId, principal) }

        return ResponseEntity.ok(
            pathInfos + PathResponse(
                documentData.wrapper.id!!,
                documentData.document.title ?: "???",
                PermissionInfo(
                    true,
                    documentData.wrapper.hasWritePermission,
                    documentData.wrapper.hasOnlySubtreeWritePermission
                )
            )
        )

    }

    private fun createPathResponse(
        pathId: Int,
        principal: Principal
    ): PathResponse {
        // use function without permission check to get parents we don't have access to
        val pathWrapper = docWrapperRepo.findByIdNoPermissionCheck(pathId)
        val latestDoc = docRepo.getByCatalogAndUuidAndIsLatestIsTrue(pathWrapper.catalog!!, pathWrapper.uuid)
        val title = latestDoc.title ?: "???"
        val permission = aclService.getPermissionInfo(principal as Authentication, pathId)
        return PathResponse(pathId, title, permission)
    }

    data class PathResponse(val id: Int, val title: String, val permission: PermissionInfo? = null)

    private fun getPathFromWrapper(catalogId: String, id: Int) =
        documentService.getWrapperByDocumentIdAndCatalog(catalogId, id).path

}
