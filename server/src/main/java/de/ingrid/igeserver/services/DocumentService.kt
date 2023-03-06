package de.ingrid.igeserver.services

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.ObjectNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.api.ForbiddenException
import de.ingrid.igeserver.api.NotFoundException
import de.ingrid.igeserver.configuration.GeneralProperties
import de.ingrid.igeserver.exceptions.PostSaveException
import de.ingrid.igeserver.extension.pipe.Context
import de.ingrid.igeserver.extension.pipe.impl.DefaultContext
import de.ingrid.igeserver.persistence.ConcurrentModificationException
import de.ingrid.igeserver.persistence.FindAllResults
import de.ingrid.igeserver.persistence.filter.*
import de.ingrid.igeserver.persistence.model.EntityType
import de.ingrid.igeserver.persistence.model.UpdateReferenceOptions
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.DocumentWrapper
import de.ingrid.igeserver.repository.CatalogRepository
import de.ingrid.igeserver.repository.DocumentRepository
import de.ingrid.igeserver.repository.DocumentWrapperRepository
import de.ingrid.igeserver.utils.AuthUtils
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.dao.EmptyResultDataAccessException
import org.springframework.orm.ObjectOptimisticLockingFailureException
import org.springframework.security.access.AccessDeniedException
import org.springframework.security.core.Authentication
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.security.Principal
import java.time.ZoneOffset
import java.util.*
import javax.persistence.EntityManager

@Service
class DocumentService @Autowired constructor(
    var docRepo: DocumentRepository,
    var docWrapperRepo: DocumentWrapperRepository,
    var catalogRepo: CatalogRepository,
    var aclService: IgeAclService,
    var groupService: GroupService,
    var dateService: DateService,
    var generalProperties: GeneralProperties,
    val authUtils: AuthUtils,
    val catalogService: CatalogService
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

    private var log = logger()

    /**
     * Get the DocumentWrapper with the given document uuid
     */
    @Deprecated(
        message = "This function can return more than one result if a document is imported in more than one catalog",
        replaceWith = ReplaceWith("getWrapperByDocumentIdAndCatalog", "catalogId", "uuid")
    )
    fun getWrapperByDocumentId(id: String): DocumentWrapper = docWrapperRepo.findById(id.toInt()).get()

    fun getWrapperByDocumentId(id: Int): DocumentWrapper = docWrapperRepo.findById(id).get()

    fun getWrapperByCatalogAndDocumentUuid(catalogIdentifier: String, uuid: String): DocumentWrapper {
        try {
            return docWrapperRepo.findByCatalog_IdentifierAndUuid(catalogIdentifier, uuid)
        } catch (e: EmptyResultDataAccessException) {
            throw NotFoundException.withMissingResource(uuid, null)
        }
    }

    /**
     * This function gets the latest document version with its wrapper element. This function implicitly checks
     * permission when getting the wrapper.
     */
    fun getDocumentFromCatalog(catalogIdentifier: String, id: Int, expandReferences: Boolean = false): DocumentData {
        try {
            val wrapper = docWrapperRepo.findById(id).get()
            val doc = docRepo.getByCatalogAndUuidAndIsLatestIsTrue(wrapper.catalog!!, wrapper.uuid)
            entityManager.detach(doc)

            return if (expandReferences) DocumentData(
                wrapper,
                expandInternalReferences(doc, options = UpdateReferenceOptions(catalogId = catalogIdentifier))
            )
            else DocumentData(wrapper, doc)
        } catch (ex: EmptyResultDataAccessException) {
            throw NotFoundException.withMissingResource(id.toString(), null)
        }
    }

    fun getWrapperByDocumentIdAndCatalog(catalogIdentifier: String?, id: Int): DocumentWrapper {
        try {
//            return docWrapperRepo.findByIdAndCatalog_Identifier(id, catalogIdentifier)
            return docWrapperRepo.findById(id).get()
        } catch (ex: EmptyResultDataAccessException) {
            throw NotFoundException.withMissingResource(id.toString(), null)
        } catch (ex: NoSuchElementException) {
            throw NotFoundException.withMissingResource(id.toString(), null)
        }
    }

    fun getDocumentByWrapperId(catalogId: String, id: Int): Document {
        try {
            val wrapper = docWrapperRepo.findById(id).get()
            val doc = docRepo.getByCatalogAndUuidAndIsLatestIsTrue(wrapper.catalog!!, wrapper.uuid)

            // add metadata
            doc.hasWritePermission = wrapper.hasWritePermission
            doc.hasOnlySubtreeWritePermission = wrapper.hasOnlySubtreeWritePermission
            doc.wrapperId = wrapper.id
            doc.data.put(FIELD_PARENT, wrapper.parent?.id) // make parent available in frontend
            // TODO: only call when requested!?
            return expandInternalReferences(doc, options = UpdateReferenceOptions(catalogId = catalogId))
        } catch (ex: EmptyResultDataAccessException) {
            throw NotFoundException.withMissingResource(id.toString(), null)
        } catch (ex: NoSuchElementException) {
            throw NotFoundException.withMissingResource(id.toString(), null)
        }
    }

    fun findChildrenDocs(catalogId: String, parentId: Int?, isAddress: Boolean): FindAllResults<DocumentData> {
        return findChildren(catalogId, parentId, if (isAddress) DocumentCategory.ADDRESS else DocumentCategory.DATA)
    }

    fun findChildren(
        catalogId: String,
        parentId: Int?,
        docCat: DocumentCategory = DocumentCategory.DATA
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
            docsData
        )
    }

    fun findChildrenWrapper(
        catalogId: String,
        parentId: Int?,
        docCat: DocumentCategory = DocumentCategory.DATA
    ): FindAllResults<DocumentWrapper> {

        val docs = if (parentId == null) {
            docWrapperRepo.findAllByCatalog_IdentifierAndParent_IdAndCategory(catalogId, null, docCat.value)
        } else {
            docWrapperRepo.findByParent_id(parentId.toInt())
        }

        return FindAllResults(
            docs.size.toLong(),
            docs
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
                    if (doc.wrapper.countChildren > 0) getAllDescendantIds(
                        catalogId,
                        doc.wrapper.id!!
                    ) + doc.wrapper.id!! else listOf(doc.wrapper.id!!)
                }
        }
    }

    fun getDocumentType(docType: String): EntityType {
        return checkNotNull(documentTypes.find { it.className == docType })
    }

    fun getDocumentTypesOfProfile(profileId: String): List<EntityType> {
        return checkNotNull(documentTypes.filter { it.usedInProfile(profileId) })
    }

    @Transactional
    fun createDocument(
        principal: Principal,
        catalogId: String,
        data: JsonNode,
        parentId: Int?,
        address: Boolean = false,
        publish: Boolean = false
    ): DocumentData {
        (data as ObjectNode).put(FIELD_PARENT, parentId)
        val document = convertToDocument(data)
        return createDocument(principal, catalogId, document, parentId, address, publish)

    }


    @Transactional
    fun createDocument(
        principal: Principal,
        catalogId: String,
        document: Document,
        parentId: Int?,
        address: Boolean = false,
        publish: Boolean = false
    ): DocumentData {

        val filterContext = DefaultContext.withCurrentProfile(catalogId, catalogRepo, principal)
        val docTypeName = document.type
        val docType = getDocumentType(docTypeName)

        // run pre-create pipe(s)
        val preCreatePayload = PreCreatePayload(docType, document, getCategoryFromType(docTypeName, address))
        preCreatePipe.runFilters(preCreatePayload, filterContext)


        // check for permission of parent explicitly, since save operations with no ID (create)
        // are excluded from permission check
        if (parentId != null) {
            val permission = aclService.getPermissionInfo(principal as Authentication, parentId)
            if (!permission.canWrite && !permission.canOnlyWriteSubtree) {
                throw AccessDeniedException("No rights to create document")
            }
        }

        if (publish) {
            preCreatePayload.document.state = DOCUMENT_STATE.PUBLISHED

            val prePublishPayload = PrePublishPayload(docType, preCreatePayload.document, preCreatePayload.wrapper)
            prePublishPipe.runFilters(prePublishPayload, filterContext)
        }

        // save document
        val newDocument = docRepo.save(preCreatePayload.document)

        // save wrapper
        val newWrapper = docWrapperRepo.save(preCreatePayload.wrapper)

        // create ACL before trying to save since we need the permission
        aclService.createAclForDocument(newWrapper.id!!, preCreatePayload.wrapper.parent?.id)

        // run post-create pipe(s)
        val postCreatePayload = PostCreatePayload(docType, newDocument, newWrapper)
        postCreatePipe.runFilters(postCreatePayload, filterContext)
        postPersistencePipe.runFilters(postCreatePayload as PostPersistencePayload, filterContext)
        // run post-publish pipe(s)
        val postPublishPayload = PostPublishPayload(docType, postCreatePayload.document, postCreatePayload.wrapper)
        postPublishPipe.runFilters(postPublishPayload, filterContext)

        // also run update pipes!
        val postWrapper = runPostUpdatePipes(docType, newDocument, newWrapper, filterContext, publish)

        return DocumentData(postWrapper, newDocument)
    }

    /**
     * Map data-field from entity to root
     */
    fun convertToJsonNode(document: Document): JsonNode {

        val node = jacksonObjectMapper().convertValue(document, ObjectNode::class.java)
        val data = node.remove("data")
        data.fields().forEach { entry ->
            node.replace(entry.key, entry.value)
        }
        // convert FIELD_ID to String, since frontend needs it as string
//        node.put(FIELD_ID, node.get(FIELD_ID).asText())
        return node

    }

    fun convertToDocument(docJson: JsonNode): Document {

        val titleString = docJson.get("title").asText()

        return Document().apply {
            title = titleString
            type = docJson.get(FIELD_DOCUMENT_TYPE).asText()
            version = docJson.get(FIELD_VERSION)?.asInt()
            if (docJson.hasNonNull(FIELD_UUID)) {
                uuid = docJson.get(FIELD_UUID).asText()
            }
            data = removeInternalFields(docJson as ObjectNode)
        }

    }

    private fun removeInternalFields(node: ObjectNode): ObjectNode {
        val copy = jacksonObjectMapper().createObjectNode().setAll<ObjectNode>(node)
        listOf(
            FIELD_VERSION,
            FIELD_CREATED_USER_EXISTS,
            FIELD_MODIFIED_USER_EXISTS,
            FIELD_CREATED,
            FIELD_MODIFIED,
            FIELD_CREATED_BY,
            FIELD_MODIFIED_BY,
            FIELD_ID,
            FIELD_DOCUMENT_TYPE,
            "title",
            "hasWritePermission",
            "hasOnlySubtreeWritePermission",
            "_wrapperId",
//            FIELD_PARENT // the parent is only stored in document wrapper -> still needed in default document update
        )
            .forEach { copy.remove(it) }
        return copy
    }

    // TODO: refactor since removeInternalFields does almost the same, find out difference and why
    fun removeInternalFieldsForImport(json: ObjectNode) {
        listOf(
//            FIELD_ID,
            FIELD_VERSION,
//            FIELD_CREATED,
//            FIELD_MODIFIED,
            FIELD_STATE,
            FIELD_HAS_CHILDREN,
            "hasWritePermission",
            "hasOnlySubtreeWritePermission"
        ).forEach { json.remove(it) }
    }

    fun publishPendingDocuments(principal: Principal, catalogId: String) {
        val filterContext = DefaultContext.withCurrentProfile(catalogId, catalogRepo, principal)

        docWrapperRepo.findAllPending(catalogId)
            .filter { it.pending_date?.isBefore(dateService.now()) ?: false }
            .forEach { wrapper ->
                try {
                    val latestDoc = getDocumentFromCatalog(catalogId, wrapper.id!!)
                    latestDoc.document.state = DOCUMENT_STATE.PUBLISHED
                    val updatedPublishedDoc = docRepo.save(latestDoc.document)
                    wrapper.pending_date = null
                    val updatedWrapper = docWrapperRepo.save(wrapper)
                    val docType = getDocumentType(updatedWrapper.type)
                    runPostUpdatePipes(docType, updatedPublishedDoc, wrapper, filterContext, true)
                } catch (e: Exception) {
                    log.error("Error during publishing pending document: ${wrapper.id}", e)
                }
            }

    }

    fun updateDocument(
        principal: Principal?,
        catalogId: String,
        id: Int,
        data: Document,
    ): DocumentData {
        val filterContext = DefaultContext.withCurrentProfile(catalogId, catalogRepo, principal)

        // run pre-update pipe(s)
        val docData = getDocumentFromCatalog(catalogId, id)
        val docType = getDocumentType(docData.wrapper.type)
        val dbVersion = docData.document.version

        // if we update a published document then create a new document with the correct latest flag
        handleUpdateOnPublishedOnlyDocument(docData)

        val finalUpdatedDoc = prepareDocBeforeUpdate(data, docData.document, principal!!)

        val preUpdatePayload = PreUpdatePayload(docType, finalUpdatedDoc, docData.wrapper)
        preUpdatePipe.runFilters(preUpdatePayload, filterContext)

        try {
            // the wrapperId needs to be set for correct permission when saving document
            preUpdatePayload.document.wrapperId = docData.wrapper.id
            val updatedDoc = docRepo.save(preUpdatePayload.document)

            val postWrapper =
                runPostUpdatePipes(docType, updatedDoc, preUpdatePayload.wrapper, filterContext, false)
            return DocumentData(
                postWrapper,
                expandInternalReferences(updatedDoc, options = UpdateReferenceOptions(catalogId = catalogId))
            )
        } catch (ex: ObjectOptimisticLockingFailureException) {
            throw ConcurrentModificationException.withConflictingResource(
                preUpdatePayload.document.id.toString(),
                dbVersion!!,
                data.version!!
            )
        }
    }

    private fun handleUpdateOnPublishedOnlyDocument(docData: DocumentData, nextStateIsDraft: Boolean = true) {

        if (docData.document.state == DOCUMENT_STATE.PUBLISHED) {
            docData.document.isLatest = false
            if (!nextStateIsDraft) docData.document.state = DOCUMENT_STATE.ARCHIVED
            docRepo.save(docData.document)

            // prepare new document
            entityManager.detach(docData.document)
            docData.document.id = null
            docData.document.isLatest = true
            docData.document.version = docData.document.version?.inc()

            docData.document.state = if (nextStateIsDraft)
                DOCUMENT_STATE.DRAFT_AND_PUBLISHED
            else DOCUMENT_STATE.PUBLISHED
        } else if (docData.document.state == DOCUMENT_STATE.DRAFT_AND_PUBLISHED && !nextStateIsDraft) {

            val lastPublishedDoc =
                getLastPublishedDocument(docData.document.catalog!!.identifier, docData.document.uuid)
            lastPublishedDoc.state = DOCUMENT_STATE.ARCHIVED
            docRepo.save(lastPublishedDoc)
        }
        docData.document.modified = dateService.now()
    }

    fun publishDocument(
        principal: Principal?,
        catalogId: String,
        id: Int,
        data: Document,
        publishDate: Date? = null,
    ): DocumentData {
        val filterContext = DefaultContext.withCurrentProfile(catalogId, catalogRepo, principal)

        // run pre-update pipe(s)
        val docData = getDocumentFromCatalog(catalogId, id)
        val docType = getDocumentType(docData.wrapper.type)
        val dbVersion = docData.document.version

        handleUpdateOnPublishedOnlyDocument(docData, false)

        docData.document.state = if (publishDate == null) DOCUMENT_STATE.PUBLISHED else DOCUMENT_STATE.PENDING

        val finalUpdatedDoc = prepareDocBeforeUpdate(data, docData.document, principal!!)

        val preUpdatePayload = PreUpdatePayload(docType, finalUpdatedDoc, docData.wrapper)
        preUpdatePipe.runFilters(preUpdatePayload, filterContext)


        // run pre-publish pipe(s)
        val prePublishPayload = PrePublishPayload(docType, preUpdatePayload.document, preUpdatePayload.wrapper)
        prePublishPipe.runFilters(prePublishPayload, filterContext)

        try {

            val updatedDoc = docRepo.save(preUpdatePayload.document)
            val updatedWrapper = if (publishDate != null) {
                preUpdatePayload.wrapper.pending_date = publishDate.toInstant().atOffset(ZoneOffset.UTC)
                docWrapperRepo.save(preUpdatePayload.wrapper)
            } else {
                preUpdatePayload.wrapper
            }

            val postWrapper =
                runPostUpdatePipes(docType, updatedDoc, updatedWrapper, filterContext, publishDate == null)

            return DocumentData(
                postWrapper,
                expandInternalReferences(updatedDoc, options = UpdateReferenceOptions(catalogId = catalogId))
            )
        } catch (ex: ObjectOptimisticLockingFailureException) {
            throw ConcurrentModificationException.withConflictingResource(
                preUpdatePayload.document.id.toString(),
                dbVersion!!,
                data.version!!
            )
        }
    }

    private fun prepareDocBeforeUpdate(newDocument: Document, dbDocument: Document, principal: Principal): Document {
        with(dbDocument) {
            title = newDocument.title
            data = newDocument.data
            version = newDocument.version // discover concurrent editing conflict

            // remove parent from document (only store parent in wrapper)
            data.remove(FIELD_PARENT)

            // set name of user who modifies document
            modifiedby = authUtils.getFullNameFromPrincipal(principal)
            modifiedByUser = catalogService.getDbUserFromPrincipal(principal)
        }
        return dbDocument
    }

    /*    private fun updateWrapper(
        documentWrapper: DocumentWrapper,
        publish: Boolean,
        publishDate: Date? = null,
        updatedDoc: Document
    ) {
        with(documentWrapper) {
            if (publish && publishDate == null) {
                // move published version to archive
                if (published != null) {
                    archive.add(published!!)
                }

                // if no draft then manually increase version
                if (draft == null) {
                    updatedDoc.version = updatedDoc.version?.inc()
                }

                // set published version
                published = updatedDoc

                // remove draft version
                draft = null
                pending = null
                pending_date = null
            } else if (publish && publishDate != null) {
                // add delayed publishing
                pending = updatedDoc
                pending_date = publishDate.toInstant().atOffset(ZoneOffset.UTC)
            } else {
                // update draft version
                if (draft == null) {
                    // since new document we update version manually
                    updatedDoc.version = updatedDoc.version?.inc()
                    draft = updatedDoc
                }
            }
        }*/

    private fun runPostUpdatePipes(
        docType: EntityType,
        updatedDocument: Document,
        updatedWrapper: DocumentWrapper,
        filterContext: Context,
        publish: Boolean
    ): DocumentWrapper {
        try {
            // make sure database has current state
            docRepo.flush()

            val postUpdatePayload = PostUpdatePayload(docType, updatedDocument, updatedWrapper)
            postUpdatePipe.runFilters(postUpdatePayload, filterContext)
            return if (publish) {
                // run post-publish pipe(s)
                val postPublishPayload =
                    PostPublishPayload(
                        docType,
                        postUpdatePayload.document,
                        postUpdatePayload.wrapper
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

    fun deleteDocument(principal: Principal, catalogId: String, id: Int) {
        val filterContext = DefaultContext.withCurrentProfile(catalogId, catalogRepo, principal)
        deleteRecursively(catalogId, id, filterContext)
    }

    private fun deleteRecursively(catalogId: String, id: Int, filterContext: Context) {
        // run pre-delete pipe(s)
        val docData = getDocumentFromCatalog(catalogId, id)
//        val wrapper = getWrapperByDocumentIdAndCatalog(catalogId, id)

//        val data = getLatestDocumentVersion(wrapper, false)
        val docTypeName = docData.document.type
        val docType = getDocumentType(docTypeName)

        val preDeletePayload = PreDeletePayload(docType, docData.document, docData.wrapper)
        preDeletePipe.runFilters(preDeletePayload, filterContext)

        // TODO: check if document is referenced by another one and handle
        //       it somehow

        findChildrenDocs(catalogId, id, isAddress(docData.wrapper)).hits.forEach {
            deleteRecursively(catalogId, it.wrapper.id!!, filterContext)
        }

        if (generalProperties.markInsteadOfDelete) {
            markDocumentAsDeleted(catalogId, id)
        } else {
            // remove all document versions which have the same ID
            docRepo.deleteAllByUuid(docData.document.uuid)

            // remove the wrapper
            docWrapperRepo.deleteById(id)

            // remove ACL from document, which works now since reference is by database ID instead of UUID
            // since it can happen that the same UUID exists in multiple catalogs, the ACL for a UUID could not be unique
            aclService.removeAclForDocument(id)
        }

        // remove references in groups
        groupService.removeDocFromGroups(catalogId, id)

        // run post-delete pipe(s)
        val postDeletePayload =
            PostDeletePayload(docType, preDeletePayload.document, preDeletePayload.wrapper)
        postDeletePipe.runFilters(postDeletePayload, filterContext)
        postPersistencePipe.runFilters(postDeletePayload as PostPersistencePayload, filterContext)
    }

    private fun markDocumentAsDeleted(catalogId: String, id: Int) {
        val markedDoc = getWrapperByDocumentIdAndCatalog(catalogId, id).apply { deleted = 1 }
        docWrapperRepo.save(markedDoc)
    }

    fun revertDocument(principal: Principal, catalogId: String, id: Int): DocumentData {

        val docData = getDocumentFromCatalog(catalogId, id)

        // check if draft and published field are filled
        assert(docData.document.state == DOCUMENT_STATE.DRAFT)

        // run pre-revert pipe(s)
        val filterContext = DefaultContext.withCurrentProfile(catalogId, catalogRepo, principal)
        val docType = getDocumentType(docData.wrapper.type)
        val preRevertPayload = PreRevertPayload(docType, docData.document, docData.wrapper)
        preRevertPipe.runFilters(preRevertPayload, filterContext)

        // delete draft document
        docRepo.delete(docData.document)

        val latestPublishedDoc = getLastPublishedDocument(catalogId, docData.wrapper.uuid)
        latestPublishedDoc.isLatest = true
        docRepo.save(latestPublishedDoc)

        // run post-revert pipe(s)
        val postRevertPayload = PostRevertPayload(docType, latestPublishedDoc, docData.wrapper)
        postRevertPipe.runFilters(postRevertPayload, filterContext)

        return DocumentData(docData.wrapper, postRevertPayload.document)
    }

    fun getLastPublishedDocument(catalogId: String, uuid: String): Document {
        val doc = docRepo.getByCatalog_IdentifierAndUuidAndState(catalogId, uuid, DOCUMENT_STATE.PUBLISHED)
        return expandInternalReferences(doc, options = UpdateReferenceOptions(catalogId = catalogId))
    }

    fun getPendingDocument(catalogId: String, uuid: String): Document {
        return docRepo.getByCatalog_IdentifierAndUuidAndState(catalogId, uuid, DOCUMENT_STATE.PENDING)
    }

    fun unpublishDocument(principal: Principal, catalogId: String, id: Int): DocumentData {
        // remove publish
        val currentDoc = getDocumentFromCatalog(catalogId, id)
        val lastPublished = getLastPublishedDocument(catalogId, currentDoc.document.uuid)

        // run pre-unpublish pipe(s)
        val filterContext = DefaultContext.withCurrentProfile(catalogId, catalogRepo, principal)
        val docType = getDocumentType(currentDoc.document.type)
        val preUnpublishPayload = PreUnpublishPayload(docType, lastPublished, currentDoc.wrapper)
        preUnpublishPipe.runFilters(preUnpublishPayload, filterContext)

        // if no draft version exists, move published version to draft
        val updatedDoc = if (lastPublished.isLatest) {
            lastPublished.state = DOCUMENT_STATE.DRAFT
            docRepo.save(lastPublished)
        } else {
            // else delete published version which automatically sets published version in wrapper to null
            docRepo.delete(lastPublished)
            currentDoc.document.state = DOCUMENT_STATE.DRAFT
            docRepo.save(currentDoc.document)
        }

        // run post-unpublish pipe(s)
        val postUnpublishPayload = PostUnpublishPayload(docType, updatedDoc, currentDoc.wrapper)
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
            pendingDoc.state = if (wasPublishedBefore) DOCUMENT_STATE.DRAFT_AND_PUBLISHED else DOCUMENT_STATE.DRAFT
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

    // TODO: the same function is also defined in IndexingTask
    private fun getElasticsearchAliasFromCatalog(catalog: Catalog) =
        catalog.settings?.config?.elasticsearchAlias ?: catalog.identifier

    fun getAllDocumentWrappers(catalogIdentifier: String, includeFolders: Boolean = false): List<DocumentWrapper> {
        return if (includeFolders)
            docWrapperRepo.findAllDocumentsAndFoldersByCatalog_Identifier(catalogIdentifier)
        else
            docWrapperRepo.findAllDocumentsByCatalog_Identifier(catalogIdentifier)
    }

    fun isAddress(wrapper: DocumentWrapper): Boolean {
        return wrapper.category == DocumentCategory.ADDRESS.value
    }

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

    private fun expandInternalReferences(
        docData: Document,
        onlyPublished: Boolean = false,
        resolveLinks: Boolean = true,
        options: UpdateReferenceOptions = UpdateReferenceOptions(onlyPublished)
    ): Document {
        // set empty parent fields explicitly to null
        val parent = docData.data.has(FIELD_PARENT)
        if (!parent || docData.data.get(FIELD_PARENT).asText().isEmpty()) {
            docData.data.put(FIELD_PARENT, null as String?)
        }

        // get latest references from links
        if (resolveLinks) {
            val refType = getDocumentType(docData.type)

            try {
                refType.updateReferences(docData, options)
            } catch (ex: AccessDeniedException) {
                throw ForbiddenException.withAccessRights("No access to referenced dataset")
            }
        }

        return docData
    }

    @Transactional
    fun replaceAddress(catalogId: String, source: String, target: String) {
        val refIds = docRepo.getDocIdsWithReferenceTo(catalogId, """\: \"$source\"""")
//        println(refIds.joinToString(", "))
        docRepo.replaceReference(source, target, refIds)
    }
}

class DocumentData(val wrapper: DocumentWrapper, val document: Document)
