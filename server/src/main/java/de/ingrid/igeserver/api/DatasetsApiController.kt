/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
package de.ingrid.igeserver.api

import com.fasterxml.jackson.databind.JsonNode
import de.ingrid.igeserver.annotations.AuditLog
import de.ingrid.igeserver.model.CopyOptions
import de.ingrid.igeserver.model.DocumentWithMetadata
import de.ingrid.igeserver.model.User
import de.ingrid.igeserver.persistence.FindAllResults
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.DocumentWrapper
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Group
import de.ingrid.igeserver.repository.DocumentRepository
import de.ingrid.igeserver.repository.DocumentWrapperRepository
import de.ingrid.igeserver.services.*
import de.ingrid.igeserver.utils.AuthUtils
import de.ingrid.igeserver.utils.convertToDocument
import de.ingrid.igeserver.utils.prepareDocumentWithMetadata
import de.ingrid.mdek.upload.storage.Storage
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
        type: String,
        parentId: Int?,
        address: Boolean,
        publish: Boolean
    ): ResponseEntity<DocumentWithMetadata> {
        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)
        val doc = convertToDocument(data, type)
        val resultDoc = documentService.createDocument(principal, catalogId, doc, parentId, address, publish)
        val metadata = prepareDocumentWithMetadata(resultDoc)
        return ResponseEntity.ok(metadata)
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
        revert: Boolean,
        version: Int?
    ): ResponseEntity<DocumentWithMetadata> {

        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)
        val resultDoc = if (revert) {
            documentService.revertDocument(principal, catalogId, id)
        } else if (unpublish) {
            documentService.unpublishDocument(principal, catalogId, id)
        } else if (cancelPendingPublishing) {
            documentService.cancelPendingPublishing(principal, catalogId, id)
        } else if (publish) {
            val doc = convertToDocument(data, docVersion = version)
            documentService.publishDocument(principal, catalogId, id, doc, publishDate)
        } else {
            val doc = convertToDocument(data, docVersion = version)
            documentService.updateDocument(principal, catalogId, id, doc)
        }

        val metadata = prepareDocumentWithMetadata(resultDoc)
        return ResponseEntity.ok(metadata)
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
    ): ResponseEntity<List<DocumentWithMetadata>> {
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

    private fun handleCopy(
        principal: Principal,
        catalogId: String,
        id: Int,
        options: CopyOptions
    ): DocumentWithMetadata {

        val wrapper = documentService.getWrapperByDocumentIdAndCatalog(id)

        val doc = documentService.getDocumentByWrapperId(catalogId, id)

        if (options.includeTree) {
            validateCopyOperation(catalogId, id, options.destId)
        }

//        val metadata = prepareDocumentWithMetadata(DocumentData(wrapper, doc))
        // TODO AW: is there another way?
//        metadata.document.put(FIELD_PARENT, options.destId)

        // clear UUID to create a new one during copy
        documentService.detachDocumentFromDatabase(doc)
        doc.uuid = ""
        doc.id = null
        doc.version = null

        return createCopyAndHandleSubTree(principal, catalogId, doc, options, documentService.isAddress(wrapper))
    }

    private fun createCopyAndHandleSubTree(
        principal: Principal,
        catalogId: String,
        doc: Document,
        options: CopyOptions,
        isAddress: Boolean
    ): DocumentWithMetadata {
        val origParentId = doc.wrapperId!! // doc[FIELD_ID].asInt()
        val origParentUUID = doc.uuid // doc[FIELD_UUID].asText()

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


        storage.copyToUnpublished(catalogId, origParentUUID, copiedParent.wrapper.uuid)

//        val copiedParentJson = documentService.convertToJsonNode(copiedParent.document) as ObjectNode
        if (options.includeTree) {
            val count = handleCopySubTree(principal, catalogId, copiedParent.wrapper.id!!, origParentId, isAddress)
            // TODO AW: is this needed to calc hasChildren?
//            copiedParentJson.put(FIELD_HAS_CHILDREN, count > 0)
        }

        return prepareDocumentWithMetadata(copiedParent)
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
//                val childVersion = (documentService.convertToJsonNode(it.document) as ObjectNode)
//                    .put(FIELD_PARENT, parentId)

                // clear UUID to create a new one during copy
                it.document.uuid = ""
                createCopyAndHandleSubTree(principal, catalogId, it.document, CopyOptions(parentId, true), isAddress)
            }

        }
        return docs.totalHits
    }

    private fun handleMove(catalogId: String, id: Int, options: CopyOptions) {

        if (id == options.destId) {
            throw ConflictException.withMoveConflict("Cannot move '$id' to itself")
        }
        validateCopyOperation(catalogId, id, options.destId)

        documentService.updateParent(catalogId, id, options.destId)
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
    ): ResponseEntity<List<DocumentInfo>> {

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
            .map { mapToDocumentInfo(it, isAddress) }
        return ResponseEntity.ok(childDocs)
    }

    private fun mapToDocumentInfo(data: DocumentData, isAddress: Boolean): DocumentInfo {
        return DocumentInfo(
            data.wrapper.id!!,
            data.document.title ?: "???",
            data.document.uuid,
            data.document.state.getState(),
            data.wrapper.countChildren > 0,
            data.wrapper.parent?.id,
            data.wrapper.type,
            data.document.modified!!,
            data.document.contentmodified!!,
            data.wrapper.pending_date,
            data.wrapper.tags.joinToString(","),
            data.wrapper.hasWritePermission,
            data.wrapper.hasOnlySubtreeWritePermission,
            isAddress
        )
    }

    private fun getRootDocsFromGroup(
        userGroups: Set<Group>?,
        isAddress: Boolean,
    ): FindAllResults<DocumentData> {

        val actualRoots = mutableListOf<DocumentWrapper>()
        val groupDatasets = aclService.getDatasetIdsFromGroups(userGroups!!, isAddress)
            .map { id -> documentService.getWrapperById(id) }
        val groupDatasetIds = groupDatasets.map { it.id }.toSet()

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
    ): ResponseEntity<DocumentWithMetadata> {
        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)
        val wrapper = documentService.getWrapperByCatalogAndDocumentUuid(catalogId, uuid)

        return if (publish == true) {
            val document = documentService.getLastPublishedDocument(catalogId, uuid)
            val metadata = prepareDocumentWithMetadata(DocumentData(wrapper, document))
            ResponseEntity.ok(metadata)
        } else {
            getByID(principal, wrapper.id!!)
        }
    }

    override fun getByID(
        principal: Principal,
        id: Int
    ): ResponseEntity<DocumentWithMetadata> {

        try {
            val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)
            // TODO: catalogId is not necessary anymore
            val docData = documentService.getDocumentFromCatalog(catalogId, id, true)
            val metadata = prepareDocumentWithMetadata(docData)
            return ResponseEntity.ok(metadata)
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

}
