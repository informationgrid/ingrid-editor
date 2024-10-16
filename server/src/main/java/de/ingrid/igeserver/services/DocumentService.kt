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
package de.ingrid.igeserver.services

import de.ingrid.igeserver.ServerException
import de.ingrid.igeserver.api.NotFoundException
import de.ingrid.igeserver.api.TagRequest
import de.ingrid.igeserver.api.ValidationException
import de.ingrid.igeserver.configuration.GeneralProperties
import de.ingrid.igeserver.exceptions.PostSaveException
import de.ingrid.igeserver.extension.pipe.Context
import de.ingrid.igeserver.extension.pipe.impl.DefaultContext
import de.ingrid.igeserver.persistence.ConcurrentModificationException
import de.ingrid.igeserver.persistence.FindAllResults
import de.ingrid.igeserver.persistence.filter.PostCreatePayload
import de.ingrid.igeserver.persistence.filter.PostCreatePipe
import de.ingrid.igeserver.persistence.filter.PostDeletePayload
import de.ingrid.igeserver.persistence.filter.PostDeletePipe
import de.ingrid.igeserver.persistence.filter.PostPersistencePayload
import de.ingrid.igeserver.persistence.filter.PostPersistencePipe
import de.ingrid.igeserver.persistence.filter.PostPublishPayload
import de.ingrid.igeserver.persistence.filter.PostPublishPipe
import de.ingrid.igeserver.persistence.filter.PostRevertPayload
import de.ingrid.igeserver.persistence.filter.PostRevertPipe
import de.ingrid.igeserver.persistence.filter.PostUnpublishPayload
import de.ingrid.igeserver.persistence.filter.PostUnpublishPipe
import de.ingrid.igeserver.persistence.filter.PostUpdatePayload
import de.ingrid.igeserver.persistence.filter.PostUpdatePipe
import de.ingrid.igeserver.persistence.filter.PreCreatePayload
import de.ingrid.igeserver.persistence.filter.PreCreatePipe
import de.ingrid.igeserver.persistence.filter.PreDeletePayload
import de.ingrid.igeserver.persistence.filter.PreDeletePipe
import de.ingrid.igeserver.persistence.filter.PrePublishPayload
import de.ingrid.igeserver.persistence.filter.PrePublishPipe
import de.ingrid.igeserver.persistence.filter.PreRevertPayload
import de.ingrid.igeserver.persistence.filter.PreRevertPipe
import de.ingrid.igeserver.persistence.filter.PreUnpublishPayload
import de.ingrid.igeserver.persistence.filter.PreUnpublishPipe
import de.ingrid.igeserver.persistence.filter.PreUpdatePayload
import de.ingrid.igeserver.persistence.filter.PreUpdatePipe
import de.ingrid.igeserver.persistence.model.EntityType
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.DocumentWrapper
import de.ingrid.igeserver.repository.CatalogRepository
import de.ingrid.igeserver.repository.DocumentRepository
import de.ingrid.igeserver.repository.DocumentWrapperRepository
import de.ingrid.igeserver.utils.AuthUtils
import jakarta.persistence.EntityManager
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.dao.EmptyResultDataAccessException
import org.springframework.orm.ObjectOptimisticLockingFailureException
import org.springframework.security.access.AccessDeniedException
import org.springframework.security.acls.domain.BasePermission
import org.springframework.security.acls.domain.SidRetrievalStrategyImpl
import org.springframework.security.acls.model.SidRetrievalStrategy
import org.springframework.security.core.Authentication
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.security.Principal
import java.time.OffsetDateTime
import java.time.ZoneOffset
import java.util.*

enum class InitiatorAction {
    DEFAULT,
    COPY,
    IMPORT,
}

data class DocumentInfo(
    val id: Number,
    val title: String,
    val _uuid: String,
    val _state: String,
    val _hasChildren: Boolean,
    val _parent: Number?,
    val _type: String,
    val _modified: OffsetDateTime,
    val _contentModified: OffsetDateTime,
    val _pendingDate: OffsetDateTime?,
    val _tags: String,
    val hasWritePermission: Boolean,
    val hasOnlySubtreeWritePermission: Boolean,
    val isAddress: Boolean,
)

data class DeleteOptions(
    val deletePermanently: Boolean? = null,
    val force: Boolean? = null,
)

@Service
class DocumentService(
    var docRepo: DocumentRepository,
    var docWrapperRepo: DocumentWrapperRepository,
    var catalogRepo: CatalogRepository,
    var aclService: IgeAclService,
    var groupService: GroupService,
    var dateService: DateService,
    var generalProperties: GeneralProperties,
    val authUtils: AuthUtils,
    val catalogService: CatalogService,
) : MapperService() {

    // this must be initialized lazily because of cyclic dependencies otherwise
    @Autowired
    lateinit var documentTypes: List<EntityType>

    @Autowired
    private lateinit var postPersistencePipe: PostPersistencePipe

    @Autowired
    private lateinit var preCreatePipe: PreCreatePipe

    @Autowired
    private lateinit var postCreatePipe: PostCreatePipe

    @Autowired
    private lateinit var preUpdatePipe: PreUpdatePipe

    @Autowired
    private lateinit var postUpdatePipe: PostUpdatePipe

    @Autowired
    private lateinit var prePublishPipe: PrePublishPipe

    @Autowired
    private lateinit var postPublishPipe: PostPublishPipe

    @Autowired
    private lateinit var preUnpublishPipe: PreUnpublishPipe

    @Autowired
    private lateinit var postUnpublishPipe: PostUnpublishPipe

    @Autowired
    private lateinit var preRevertPipe: PreRevertPipe

    @Autowired
    private lateinit var postRevertPipe: PostRevertPipe

    @Autowired
    private lateinit var preDeletePipe: PreDeletePipe

    @Autowired
    private lateinit var postDeletePipe: PostDeletePipe

    @Autowired
    private lateinit var entityManager: EntityManager

    private val sidRetrievalStrategy: SidRetrievalStrategy = SidRetrievalStrategyImpl()

    private var log = logger()

    fun getWrapperById(id: Int): DocumentWrapper = docWrapperRepo.findById(id).get()

    fun getParentWrapper(id: Int): DocumentWrapper? = docWrapperRepo.getParentWrapper(id)

    fun getWrapperByCatalogAndDocumentUuid(
        catalogIdentifier: String,
        uuid: String,
        includeDeleted: Boolean = false,
    ): DocumentWrapper {
        try {
            return if (includeDeleted) {
                docWrapperRepo.findByCatalogAndUuidIncludingDeleted(catalogIdentifier, uuid)
            } else {
                docWrapperRepo.findByCatalog_IdentifierAndUuid(catalogIdentifier, uuid)
            }
        } catch (e: EmptyResultDataAccessException) {
            throw NotFoundException.withMissingResource(uuid, null)
        }
    }

    /**
     * This function gets the latest document version with its wrapper element. This function implicitly checks
     * permission when getting the wrapper.
     * TODO: very similar to function "getDocumentByWrapperId(...)" -> refactor
     */
    fun getDocumentFromCatalog(catalogIdentifier: String, id: Int): DocumentData {
        try {
            val wrapper = docWrapperRepo.findById(id).get()
            val doc = docRepo.getByCatalogAndUuidAndIsLatestIsTrue(wrapper.catalog!!, wrapper.uuid)
            entityManager.detach(doc)

            // always add wrapper id which is needed when saving documents for authorization check
            doc.wrapperId = id

            return DocumentData(wrapper, doc)
        } catch (ex: EmptyResultDataAccessException) {
            throw NotFoundException.withMissingResource(id.toString(), null)
        }
    }

    fun getWrapperByDocumentId(id: Int): DocumentWrapper {
        try {
            return docWrapperRepo.findById(id).get()
        } catch (ex: EmptyResultDataAccessException) {
            throw NotFoundException.withMissingResource(id.toString(), null)
        } catch (ex: NoSuchElementException) {
            throw NotFoundException.withMissingResource(id.toString(), null)
        }
    }

    fun getDocumentByWrapperId(catalogId: String, id: Int, forExport: Boolean = false): Document {
        try {
            val wrapper = docWrapperRepo.findById(id).get()
            val doc = docRepo.getByCatalogAndUuidAndIsLatestIsTrue(wrapper.catalog!!, wrapper.uuid)

            entityManager.detach(doc)
            // add metadata
            doc.hasWritePermission = wrapper.hasWritePermission
            doc.hasOnlySubtreeWritePermission = wrapper.hasOnlySubtreeWritePermission
            doc.wrapperId = wrapper.id
            // TODO AW: doc.data.put(FIELD_PARENT, wrapper.parent?.id) // make parent available in frontend
            // TODO: only call when requested!?
            return doc
        } catch (ex: EmptyResultDataAccessException) {
            throw NotFoundException.withMissingResource(id.toString(), null)
        } catch (ex: NoSuchElementException) {
            throw NotFoundException.withMissingResource(id.toString(), null)
        }
    }

    // TODO: consolidate function findChildrenDocs and findChildren
    fun findChildrenDocs(catalogId: String, parentId: Int?, isAddress: Boolean): FindAllResults<DocumentData> =
        findChildren(catalogId, parentId, if (isAddress) DocumentCategory.ADDRESS else DocumentCategory.DATA)

    fun findChildren(
        catalogId: String,
        parentId: Int?,
        docCat: DocumentCategory = DocumentCategory.DATA,
    ): FindAllResults<DocumentData> {
        val wrappers = if (parentId == null) {
            docWrapperRepo.findAllByCatalog_IdentifierAndParent_IdAndCategory(catalogId, null, docCat.value)
        } else {
            docWrapperRepo.findByParent_id(parentId.toInt())
        }

        return getDocumentsFromWrappers(wrappers)
    }

    fun getDocumentsFromWrappers(wrappers: List<DocumentWrapper>): FindAllResults<DocumentData> {
        if (wrappers.isEmpty()) return FindAllResults(0, emptyList())

        val accessibleUuids = wrappers.map { it.uuid }
        val docs = docRepo.findAllByCatalogAndIsLatestIsTrueAndUuidIn(wrappers[0].catalog!!, accessibleUuids)

        val docsData = docs.map { DocumentData(wrappers[accessibleUuids.indexOf(it.uuid)], it) }

        return FindAllResults(
            docsData.size.toLong(),
            docsData,
        )
    }

    fun findChildrenWrapper(
        catalogId: String,
        parentId: Int?,
        docCat: DocumentCategory = DocumentCategory.DATA,
    ): FindAllResults<DocumentWrapper> {
        val docs = if (parentId == null) {
            docWrapperRepo.findAllByCatalog_IdentifierAndParent_IdAndCategory(catalogId, null, docCat.value)
        } else {
            docWrapperRepo.findByParent_id(parentId.toInt())
        }

        return FindAllResults(
            docs.size.toLong(),
            docs,
        )
    }

    /**
     *  Get a list of all IDs hierarchically below a given id
     */
    fun getAllDescendantIds(catalogId: String, id: Int?): List<Int> {
        val docs = this.findChildren(catalogId, id)
        return if (docs.hits.isEmpty()) {
            emptyList()
        } else {
            docs.hits
                .flatMap { doc ->
                    if (doc.wrapper.countChildren > 0) {
                        getAllDescendantIds(
                            catalogId,
                            doc.wrapper.id!!,
                        ) + doc.wrapper.id!!
                    } else {
                        listOf(doc.wrapper.id!!)
                    }
                }
        }
    }

    fun getDocumentType(docType: String, profile: String, parentProfile: String?): EntityType {
        val profileDocumentType = documentTypes.find {
            it.className == docType && (it.profiles?.isEmpty() == true || it.profiles?.contains(profile) == true)
        }

        return profileDocumentType ?: documentTypes.find {
            it.className == docType && (it.profiles?.isEmpty() == true || it.profiles?.contains(parentProfile) == true)
        } ?: throw ServerException.withReason("DocumentType '$docType' not known in this profile: $profile")
    }

    fun isAddress(docType: String): Boolean =
        checkNotNull(documentTypes.find { it.className == docType }?.category) == DocumentCategory.ADDRESS.value

    @Transactional
    fun createDocument(
        principal: Principal,
        catalogId: String,
        document: Document,
        parentId: Int?,
        address: Boolean = false,
        publish: Boolean = false,
        initiator: InitiatorAction = InitiatorAction.DEFAULT,
    ): DocumentData {
        val filterContext = DefaultContext.withCurrentProfile(catalogId, catalogService, principal)
        val docTypeName = document.type
        val docType = getDocumentType(docTypeName, filterContext.profile, filterContext.parentProfile)

        // run pre-create pipe(s)
        val preCreatePayload = PreCreatePayload(
            docType,
            catalogId,
            document,
            parentId,
            getCategoryFromType(docTypeName, address),
            initiator,
        )
        preCreatePipe.runFilters(preCreatePayload, filterContext)

        val preUpdatePayload = PreUpdatePayload(docType, catalogId, preCreatePayload.document, preCreatePayload.wrapper)
        preUpdatePipe.runFilters(preUpdatePayload, filterContext)

        // check for permission of parent explicitly, since save operations with no ID (create)
        // are excluded from permission check
        if (parentId != null) {
            val permission = aclService.getPermissionInfo(principal as Authentication, parentId)
            if (!permission.canWrite && !permission.canOnlyWriteSubtree) {
                throw AccessDeniedException("No rights to create document")
            }
        } else {
            // check for root node permission
            val isSuperOrCatAdmin = authUtils.isAdmin(principal)
            val hasRootWrite = checkForRootPermissions(
                sidRetrievalStrategy.getSids(principal as Authentication),
                listOf(BasePermission.WRITE),
            )
            if (!isSuperOrCatAdmin && !hasRootWrite) {
                throw AccessDeniedException("No rights to create document")
            }
        }

        if (publish) {
            preUpdatePayload.document.state = DocumentState.PUBLISHED

            val prePublishPayload =
                PrePublishPayload(docType, catalogId, preUpdatePayload.document, preUpdatePayload.wrapper)
            prePublishPipe.runFilters(prePublishPayload, filterContext)
        }

        // save document
        val newDocument = docRepo.save(preUpdatePayload.document)

        // save wrapper
        val newWrapper = docWrapperRepo.save(preUpdatePayload.wrapper)

        // create ACL before trying to save since we need the permission
        aclService.createAclForDocument(newWrapper.id!!, preUpdatePayload.wrapper.parent?.id)

        // since we're within a transaction the expandInternalReferences-function would modify the db-document
        docRepo.flush()
        entityManager.detach(newDocument)

        // run post-create pipe(s)
        val postCreatePayload = PostCreatePayload(docType, catalogId, newDocument, newWrapper)
        postCreatePipe.runFilters(postCreatePayload, filterContext)
        postPersistencePipe.runFilters(postCreatePayload as PostPersistencePayload, filterContext)

        // also run update/publish pipes!
        val postWrapper = runPostUpdatePipes(docType, catalogId, newDocument, newWrapper, filterContext, publish)

        return DocumentData(postWrapper, newDocument)
    }

    fun publishPendingDocuments(principal: Principal, catalogId: String) {
        val filterContext = try {
            DefaultContext.withCurrentProfile(catalogId, catalogService, principal)
        } catch (e: ServerException) {
            log.warn("Profile probably not found. Skipping '$catalogId': ${e.message}")
            return
        }

        docWrapperRepo.findAllPending(catalogId)
            .filter { it.pending_date?.isBefore(dateService.now()) ?: false }
            .forEach { wrapper ->
                try {
                    // move last published to archive if any
                    moveLastPublishedDocumentToArchive(catalogId, wrapper)

                    val latestDoc = getDocumentFromCatalog(catalogId, wrapper.id!!)
                    latestDoc.document.apply {
                        state = DocumentState.PUBLISHED
                        contentmodified = OffsetDateTime.now()
                    }
                    val updatedPublishedDoc = docRepo.save(latestDoc.document)
                    wrapper.pending_date = null
                    val updatedWrapper = docWrapperRepo.save(wrapper)
                    val docType =
                        getDocumentType(updatedWrapper.type, filterContext.profile, filterContext.parentProfile)
                    runPostUpdatePipes(docType, catalogId, updatedPublishedDoc, wrapper, filterContext, true)
                } catch (e: Exception) {
                    log.error("Error during publishing pending document: ${wrapper.uuid}", e)
                }
            }
    }

    @Transactional
    fun updateDocument(
        principal: Principal?,
        catalogId: String,
        id: Int,
        data: Document,
    ): DocumentData {
        val filterContext = DefaultContext.withCurrentProfile(catalogId, catalogService, principal)

        // run pre-update pipe(s)
        val docData = getDocumentFromCatalog(catalogId, id)
        val docType = getDocumentType(docData.wrapper.type, filterContext.profile, filterContext.parentProfile)
        val dbVersion = docData.document.version

        // check optimistic locking manually, since new versions can be created here when publishing e.g.
        if (data.version != dbVersion) {
            throw ConcurrentModificationException.withConflictingResource(
                docData.document.id.toString(),
                dbVersion!!,
                data.version!!,
            )
        }

        // if we update a published document then create a new document with the correct latest flag
        val newDatasetVersionCreated = handleUpdateOnPublishedOnlyDocument(docData)
        if (newDatasetVersionCreated) {
            data.version = docData.document.version
        }

        val finalUpdatedDoc = prepareDocBeforeUpdate(data, docData.document, principal!!)

        val preUpdatePayload = PreUpdatePayload(docType, catalogId, finalUpdatedDoc, docData.wrapper)
        preUpdatePipe.runFilters(preUpdatePayload, filterContext)

        try {
            // the wrapperId needs to be set for correct permission when saving document
            preUpdatePayload.document.wrapperId = docData.wrapper.id
            val updatedDoc = docRepo.save(preUpdatePayload.document)

            // since we're within a transaction the expandInternalReferences-function would modify the db-document
            docRepo.flush()
            entityManager.detach(updatedDoc)

            val postWrapper =
                runPostUpdatePipes(docType, catalogId, updatedDoc, preUpdatePayload.wrapper, filterContext, false)

            return DocumentData(
                postWrapper,
                updatedDoc,
            )
        } catch (ex: ObjectOptimisticLockingFailureException) {
            throw ConcurrentModificationException.withConflictingResource(
                preUpdatePayload.document.id.toString(),
                dbVersion!!,
                data.version!!,
            )
        }
    }

    private fun handleUpdateOnPublishedOnlyDocument(
        docData: DocumentData,
        nextStateIsDraft: Boolean = true,
        delayedPublication: Boolean = false,
    ): Boolean {
        var newVersionCreated = false

        if (docData.document.state == DocumentState.PUBLISHED) {
            docData.document.isLatest = false
            if (!nextStateIsDraft && !delayedPublication) docData.document.state = DocumentState.ARCHIVED
            docRepo.save(docData.document)

            entityManager.detach(docData.document)

            prepareDocumentForCopy(docData.document)

            docData.document.state = if (nextStateIsDraft) {
                DocumentState.DRAFT_AND_PUBLISHED
            } else {
                DocumentState.PUBLISHED
            }
            newVersionCreated = true
        } else if (docData.document.state == DocumentState.DRAFT_AND_PUBLISHED && !nextStateIsDraft && !delayedPublication) {
            moveLastPublishedDocumentToArchive(docData.document.catalog!!.identifier, docData.wrapper)
            newVersionCreated = true
        }
        docData.document.modified = dateService.now()
        return newVersionCreated
    }

    private fun prepareDocumentForCopy(document: Document) {
        document.id = null
        document.isLatest = true
        document.version = document.version?.inc()
    }

    private fun moveLastPublishedDocumentToArchive(catalogId: String, wrapper: DocumentWrapper) {
        try {
            val lastPublishedDoc = getLastPublishedDocument(catalogId, wrapper.uuid)
            lastPublishedDoc.state = DocumentState.ARCHIVED
            lastPublishedDoc.wrapperId = wrapper.id
            docRepo.save(lastPublishedDoc)
        } catch (_: EmptyResultDataAccessException) {
            /* no published version -> do nothing */
        } catch (ex: ServerException) {
            /* maybe not existing address reference? -> do nothing */
            log.warn("The last published document could not be loaded correctly: ${ex.message}. Ignore error to be able to publish latest draft.")
        }
    }

    @Transactional(noRollbackFor = [PostSaveException::class])
    fun publishDocument(
        principal: Principal?,
        catalogId: String,
        id: Int,
        data: Document,
        publishDate: Date? = null,
    ): DocumentData {
        val filterContext = DefaultContext.withCurrentProfile(catalogId, catalogService, principal)

        // run pre-update pipe(s)
        val docData = getDocumentFromCatalog(catalogId, id)
        val docType = getDocumentType(docData.wrapper.type, filterContext.profile, filterContext.parentProfile)
        val dbVersion = docData.document.version

        // check optimistic locking manually, since new versions can be created here when publishing e.g.
        if (data.version != dbVersion) {
            throw ConcurrentModificationException.withConflictingResource(
                docData.document.id.toString(),
                dbVersion!!,
                data.version!!,
            )
        }

        val newDatasetVersionCreated = handleUpdateOnPublishedOnlyDocument(docData, false, publishDate != null)

        docData.document.state = if (publishDate == null) DocumentState.PUBLISHED else DocumentState.PENDING

        if (newDatasetVersionCreated) {
            data.version = docData.document.version
        }
        val finalUpdatedDoc = prepareDocBeforeUpdate(data, docData.document, principal!!)

        val preUpdatePayload = PreUpdatePayload(docType, catalogId, finalUpdatedDoc, docData.wrapper)
        preUpdatePipe.runFilters(preUpdatePayload, filterContext)

        // run pre-publish pipe(s)
        val prePublishPayload =
            PrePublishPayload(docType, catalogId, preUpdatePayload.document, preUpdatePayload.wrapper)
        prePublishPipe.runFilters(prePublishPayload, filterContext)

        try {
            val updatedDoc = docRepo.save(preUpdatePayload.document)
            val updatedWrapper = if (publishDate != null) {
                preUpdatePayload.wrapper.pending_date = publishDate.toInstant().atOffset(ZoneOffset.UTC)
                docWrapperRepo.save(preUpdatePayload.wrapper)
            } else {
                preUpdatePayload.wrapper
            }

            // since we're within a transaction the expandInternalReferences-function would modify the db-document
            // make sure database has current state
            docRepo.flush()
            entityManager.detach(updatedDoc)

            val postWrapper =
                runPostUpdatePipes(docType, catalogId, updatedDoc, updatedWrapper, filterContext, publishDate == null)

            return DocumentData(
                postWrapper,
                updatedDoc,
            )
        } catch (ex: ObjectOptimisticLockingFailureException) {
            throw ConcurrentModificationException.withConflictingResource(
                preUpdatePayload.document.id.toString(),
                dbVersion!!,
                data.version!!,
            )
        }
    }

    private fun prepareDocBeforeUpdate(newDocument: Document, dbDocument: Document, principal: Principal): Document {
        val actualUser = catalogService.getDbUserFromPrincipal(principal)
        with(dbDocument) {
            title = newDocument.title
            data = newDocument.data
            version = newDocument.version // discover concurrent editing conflict

            // set name of user who modifies document
            modifiedby = authUtils.getFullNameFromPrincipal(principal)
            contentModifiedByUser = actualUser ?: contentModifiedByUser
            contentmodifiedby =
                if (actualUser != null) authUtils.getFullNameFromPrincipal(principal) else contentmodifiedby
            contentmodified = if (actualUser != null) dateService.now() else contentmodified
        }
        return dbDocument
    }

    private fun runPostUpdatePipes(
        docType: EntityType,
        catalogId: String,
        updatedDocument: Document,
        updatedWrapper: DocumentWrapper,
        filterContext: Context,
        publish: Boolean,
    ): DocumentWrapper {
        try {
            // make sure database has current state
            docRepo.flush()

            val postUpdatePayload = PostUpdatePayload(docType, catalogId, updatedDocument, updatedWrapper)
            postUpdatePipe.runFilters(postUpdatePayload, filterContext)
            return if (publish) {
                // run post-publish pipe(s)
                val postPublishPayload =
                    PostPublishPayload(
                        docType,
                        catalogId,
                        postUpdatePayload.document,
                        postUpdatePayload.wrapper,
                    )
                postPublishPipe.runFilters(postPublishPayload, filterContext)
                postPersistencePipe.runFilters(postPublishPayload as PostPersistencePayload, filterContext)
                postPublishPayload.wrapper
            } else {
                postPersistencePipe.runFilters(postUpdatePayload as PostPersistencePayload, filterContext)
                postUpdatePayload.wrapper
            }
        } catch (ex: Exception) {
            throw PostSaveException.withException(ex)
        }
    }

    fun deleteDocument(principal: Principal, catalogId: String, id: Int, options: DeleteOptions = DeleteOptions()) {
        val filterContext = DefaultContext.withCurrentProfile(catalogId, catalogService, principal)
//        val realDelete = options.deletePermanently ?: !generalProperties.markInsteadOfDelete
        deleteRecursively(catalogId, id, filterContext, options)
    }

    private fun deleteRecursively(catalogId: String, id: Int, filterContext: Context, options: DeleteOptions) {
        // run pre-delete pipe(s)
        val docData = getDocumentFromCatalog(catalogId, id)
        val docTypeName = docData.document.type
        val docType = getDocumentType(docTypeName, filterContext.profile, filterContext.parentProfile)

        val preDeletePayload = PreDeletePayload(docType, catalogId, docData.document, docData.wrapper)

        // ignore validations to forcefully delete a document
        if (options.force != true) {
            preDeletePipe.runFilters(preDeletePayload, filterContext)
        }

        // TODO: check if document is referenced by another one and handle
        //       it somehow

        findChildrenDocs(catalogId, id, isAddress(docData.wrapper)).hits.forEach {
            deleteRecursively(catalogId, it.wrapper.id!!, filterContext, options)
        }

        val realDelete = options.deletePermanently ?: !generalProperties.markInsteadOfDelete
        if (realDelete) {
            // remove all document versions which have the same ID
            docRepo.deleteAllByCatalog_IdentifierAndUuid(catalogId, docData.document.uuid)

            // remove the wrapper
            docWrapperRepo.deleteById(id)

            // remove ACL from document, which works now since reference is by database ID instead of UUID
            // since it can happen that the same UUID exists in multiple catalogs, the ACL for a UUID could not be unique
            aclService.removeAclForDocument(id)
        } else {
            markDocumentAsDeleted(id)
        }

        // remove references in groups
        groupService.removeDocFromGroups(catalogId, id)

        // since we're within a transaction the expandInternalReferences-function would modify the db-document
        docRepo.flush()
        entityManager.detach(preDeletePayload.document)

        // run post-delete pipe(s)
        val postDeletePayload =
            PostDeletePayload(docType, catalogId, preDeletePayload.document, preDeletePayload.wrapper)
        postDeletePipe.runFilters(postDeletePayload, filterContext)
        postPersistencePipe.runFilters(postDeletePayload as PostPersistencePayload, filterContext)
    }

    private fun markDocumentAsDeleted(id: Int) {
        val markedDoc = getWrapperByDocumentId(id).apply { deleted = 1 }
        docWrapperRepo.save(markedDoc)
    }

    fun recoverDocument(wrapperId: Int) {
        docWrapperRepo.undeleteDocument(wrapperId)
    }

    fun revertDocument(principal: Principal, catalogId: String, id: Int): DocumentData {
        val docData = getDocumentFromCatalog(catalogId, id)

        // check if draft and published field are filled
        assert(docData.document.state == DocumentState.DRAFT)

        // run pre-revert pipe(s)
        val filterContext = DefaultContext.withCurrentProfile(catalogId, catalogService, principal)
        val docType = getDocumentType(docData.wrapper.type, filterContext.profile, filterContext.parentProfile)
        val preRevertPayload = PreRevertPayload(docType, catalogId, docData.document, docData.wrapper)
        preRevertPipe.runFilters(preRevertPayload, filterContext)

        // delete draft document
        docRepo.delete(docData.document)

        val latestPublishedDoc = getLastPublishedDocument(catalogId, docData.wrapper.uuid)
        latestPublishedDoc.isLatest = true
        latestPublishedDoc.wrapperId = id
        docRepo.save(latestPublishedDoc)

        // since we're within a transaction the expandInternalReferences-function would modify the db-document
        docRepo.flush()
        entityManager.detach(latestPublishedDoc)

        // run post-revert pipe(s)
        val postRevertPayload = PostRevertPayload(docType, catalogId, latestPublishedDoc, docData.wrapper)
        postRevertPipe.runFilters(postRevertPayload, filterContext)

        return DocumentData(docData.wrapper, postRevertPayload.document)
    }

    /**
     * Get the last published document version of a document with a given wrapper ID.
     * This function is used to get the last published version of a document which is not the latest version.
     *
     * @param wrapperId the wrapper ID of the document
     * @param forExport if the document is requested for export
     * @return the last published document version
     */
    fun getLastPublishedDocument(
        wrapperId: Int,
        forExport: Boolean = false,
    ): Document {
        val wrapper = getWrapperById(wrapperId)
        return getLastPublishedDocument(wrapper.catalog!!.identifier, wrapper.uuid, forExport)
    }

    /**
     * Get the last published document version of a document with a given UUID.
     * This function is used to get the last published version of a document which is not the latest version.
     *
     * @param catalogId the catalog identifier
     * @param uuid the UUID of the document
     * @param forExport if the document is requested for export
     * @return the last published document version
     */
    fun getLastPublishedDocument(
        catalogId: String,
        uuid: String,
        forExport: Boolean = false,
    ): Document {
        val doc = docWrapperRepo.getDocumentByState(catalogId, uuid, DocumentState.PUBLISHED)
        if (doc.isEmpty()) throw EmptyResultDataAccessException("Resource with $uuid not found", 1)

        val result = doc[0] as Array<*>
        val finalDoc = result[0] as Document
        entityManager.detach(finalDoc)
        finalDoc.wrapperId = result[1] as Int
        return finalDoc
    }

    fun getPendingDocument(catalogId: String, uuid: String): Document =
        docRepo.getByCatalog_IdentifierAndUuidAndState(catalogId, uuid, DocumentState.PENDING)

    fun unpublishDocument(principal: Principal, catalogId: String, id: Int): DocumentData {
        // remove publish
        val currentDoc = getDocumentFromCatalog(catalogId, id)
        val lastPublished = getLastPublishedDocument(catalogId, currentDoc.document.uuid)
        val onlyPublished = lastPublished.isLatest == true
        lastPublished.wrapperId = id

        // run pre-unpublish pipe(s)
        val filterContext = DefaultContext.withCurrentProfile(catalogId, catalogService, principal)
        val docType = getDocumentType(currentDoc.document.type, filterContext.profile, filterContext.parentProfile)
        val preUnpublishPayload = PreUnpublishPayload(docType, catalogId, lastPublished, currentDoc.wrapper)
        preUnpublishPipe.runFilters(preUnpublishPayload, filterContext)

        // update state of published version
        lastPublished.state = DocumentState.WITHDRAWN
        lastPublished.isLatest = false
        docRepo.save(lastPublished)

        // if no draft version exists, copy published version to draft and update state of published version
        val updatedDoc = if (onlyPublished) {
            // copy published version to draft
            entityManager.detach(lastPublished)
            prepareDocumentForCopy(lastPublished)
            lastPublished.state = DocumentState.DRAFT
            docRepo.save(lastPublished)
        } else {
            // set different state
            currentDoc.document.state = DocumentState.DRAFT
            docRepo.save(currentDoc.document)
        }

        // since we're within a transaction the expandInternalReferences-function would modify the db-document
        docRepo.flush()
        entityManager.detach(updatedDoc)

        // run post-unpublish pipe(s)
        val postUnpublishPayload = PostUnpublishPayload(docType, catalogId, updatedDoc, currentDoc.wrapper)
        postUnpublishPipe.runFilters(postUnpublishPayload, filterContext)

        return DocumentData(currentDoc.wrapper, postUnpublishPayload.document)
    }

    fun cancelPendingPublishing(principal: Principal, catalogId: String, id: Int): DocumentData {
        // remove pending
        val docData = getDocumentFromCatalog(catalogId, id)
        val wasPublishedBefore = try {
            getLastPublishedDocument(catalogId, docData.document.uuid)
            true
        } catch (ex: Exception) {
            false
        }
        val pendingDoc = getPendingDocument(catalogId, docData.document.uuid)

        // if no draft version exists, move pending version to draft
        val updatedDoc = if (pendingDoc.isLatest) {
            pendingDoc.state = if (wasPublishedBefore) DocumentState.DRAFT_AND_PUBLISHED else DocumentState.DRAFT
            pendingDoc.wrapperId = id
            docRepo.save(pendingDoc)
        } else {
            docData.document
        }

        // TODO: where to set pending date? better on Document instead of wrapper to allow multiple pending versions
        //       this however makes it more complicated in the frontend
        docData.wrapper.pending_date = null
        val updatedWrapper = docWrapperRepo.save(docData.wrapper)

        return DocumentData(updatedWrapper, updatedDoc)
    }

    @Deprecated("Is not secured")
    fun getAllDocumentWrappers(catalogIdentifier: String, includeFolders: Boolean = false): List<DocumentWrapper> =
        if (includeFolders) {
            docWrapperRepo.findAllDocumentsAndFoldersByCatalog_Identifier(catalogIdentifier)
        } else {
            docWrapperRepo.findAllDocumentsByCatalog_Identifier(catalogIdentifier)
        }

    fun isAddress(wrapper: DocumentWrapper): Boolean = wrapper.category == DocumentCategory.ADDRESS.value

    /**
     * Every document type belongs to a category (data or address). However, a folder can belong to multiple categories
     */
    private fun getCategoryFromType(docType: String, defaultIsAddress: Boolean): String {
        if (docType == DocumentCategory.FOLDER.value) {
            return if (defaultIsAddress) DocumentCategory.ADDRESS.value else DocumentCategory.DATA.value
        }

        return documentTypes
            .find { it.className == docType }!!
            .category
    }

    @Transactional
    fun replaceAddress(catalogId: String, source: String, target: String) {
        val refIds = docRepo.getDocIdsWithReferenceTo(catalogId, """\: \"$source\"""")
        docRepo.replaceReference(source, target, refIds)
    }

    fun updateTags(catalogId: String, wrapperId: Int, tags: TagRequest): List<String>? {
        val wrapper = docWrapperRepo.getReferenceById(wrapperId)
        val cleanedTags =
            wrapper.tags.filter { tags.add?.contains(it) != true && tags.remove?.contains(it) != true }
        wrapper.tags = (cleanedTags + (tags.add ?: emptyList()))
        docWrapperRepo.save(wrapper)
        return wrapper.tags
    }

    fun getReferencedWrapperIds(
        catalogIdentifier: String,
        document: Document?,
    ): Set<Int> {
        if (document == null) return setOf()

        return this.getReferencedUuids(document)
            .map { getWrapperByCatalogAndDocumentUuid(catalogIdentifier, it).id!! }.toSet()
    }

    fun getReferencedUuids(
        document: Document?,
    ): Set<String> {
        if (document == null) return setOf()

        val profile = document.catalog!!.type
        val catalogProfile = catalogService.getCatalogProfile(profile)
        val docType = getDocumentType(document.type, profile, catalogProfile.parentProfile)
        return docType.getReferenceIds(document).toSet()
    }

    /**
     * Get all document UUIDs which reference this document
     */
    fun getIncomingReferences(
        document: Document?,
        catalogId: String,
    ): Set<String> {
        if (document == null) return setOf()
        val profile = catalogService.getProfileFromCatalog(catalogId)
        val docType = getDocumentType(document.type, profile.identifier, profile.parentProfile)
        return docType.getIncomingReferenceIds(document).toSet()
    }

    fun validate(principal: Principal, catalogId: String, docId: Int) {
        val docData = getDocumentFromCatalog(catalogId, docId)
        val profile = catalogService.getProfileFromCatalog(catalogId)
        val filterContext = DefaultContext(catalogId, profile.identifier, profile.parentProfile, principal)
        val docType = getDocumentType(docData.wrapper.type, profile.identifier, filterContext.parentProfile)
        val prePublishPayload = PrePublishPayload(docType, catalogId, docData.document, docData.wrapper)
        prePublishPipe.runFilters(prePublishPayload, filterContext)
    }

    fun updateParent(catalogId: String, wrapperId: Int, newParentId: Int?) {
        // update ACL parent
        aclService.updateParent(wrapperId, newParentId)

        // get new parent path
        val newPath = if (newParentId == null) {
            emptyList()
        } else {
            getPathFromWrapper(newParentId) + newParentId
        }

        // updateWrapper
        val docData = getDocumentFromCatalog(catalogId, wrapperId)
        val parent =
            if (newParentId == null) null else getDocumentFromCatalog(catalogId, newParentId)

        // check parent is published if moved dataset also has been published
        if (parent != null && parent.wrapper.type != DocumentCategory.FOLDER.value && docData.document.state != DocumentState.DRAFT) {
            if (parent.document.state == DocumentState.DRAFT) {
                throw ValidationException.withReason(
                    "Parent '${parent.document.uuid}' must be published, since moved dataset '${docData.document.uuid}' is also published",
                    errorCode = "PARENT_IS_NOT_PUBLISHED",
                )
            }
        }

        docData.wrapper.parent = parent?.wrapper
        docData.wrapper.path = newPath

        docWrapperRepo.save(docData.wrapper)

        updatePathForAllChildren(catalogId, newPath, wrapperId)
    }

    private fun getPathFromWrapper(id: Int) =
        getWrapperByDocumentId(id).path

    private fun updatePathForAllChildren(catalogId: String, path: List<Int>, id: Int) {
        findChildrenWrapper(catalogId, id).hits
            .forEach {
                it.path = path + id
                // FIXME: what about the path of person under an institution???
                if (it.type == "FOLDER") {
                    updatePathForAllChildren(catalogId, it.path, it.id!!)
                }
                docWrapperRepo.save(it)
            }
    }

    fun detachDocumentFromDatabase(doc: Any) {
        this.entityManager.detach(doc)
    }
}

class DocumentData(val wrapper: DocumentWrapper, val document: Document)
