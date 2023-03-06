package de.ingrid.igeserver.services

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.ObjectNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.ServerException
import de.ingrid.igeserver.api.ForbiddenException
import de.ingrid.igeserver.api.NotFoundException
import de.ingrid.igeserver.configuration.GeneralProperties
import de.ingrid.igeserver.exceptions.PostSaveException
import de.ingrid.igeserver.extension.pipe.Context
import de.ingrid.igeserver.extension.pipe.impl.DefaultContext
import de.ingrid.igeserver.model.QueryField
import de.ingrid.igeserver.persistence.ConcurrentModificationException
import de.ingrid.igeserver.persistence.FindAllResults
import de.ingrid.igeserver.persistence.QueryType
import de.ingrid.igeserver.persistence.filter.*
import de.ingrid.igeserver.persistence.model.EntityType
import de.ingrid.igeserver.persistence.model.UpdateReferenceOptions
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.DocumentWrapper
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Group
import de.ingrid.igeserver.repository.CatalogRepository
import de.ingrid.igeserver.repository.DocumentRepository
import de.ingrid.igeserver.repository.DocumentWrapperRepository
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.dao.EmptyResultDataAccessException
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.data.jpa.domain.Specification
import org.springframework.orm.ObjectOptimisticLockingFailureException
import org.springframework.security.access.AccessDeniedException
import org.springframework.security.core.Authentication
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.security.Principal
import java.time.ZoneOffset
import java.util.*
import javax.persistence.EntityManager
import javax.persistence.criteria.*

@Service
class DocumentService @Autowired constructor(
    var docRepo: DocumentRepository,
    var docWrapperRepo: DocumentWrapperRepository,
    var catalogRepo: CatalogRepository,
    var aclService: IgeAclService,
    var groupService: GroupService,
    var dateService: DateService,
    var generalProperties: GeneralProperties
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

    enum class DocumentState(val value: String) {
        PUBLISHED("P"),
        DRAFT("W"),
        DRAFT_AND_PUBLISHED("PW")
    }

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

    fun getWrapperByDocumentIdAndCatalog(catalogIdentifier: String?, id: String): DocumentWrapper {
        try {
//            return docWrapperRepo.findByIdAndCatalog_Identifier(id, catalogIdentifier)
            return docWrapperRepo.findById(id.toInt()).get()
        } catch (ex: EmptyResultDataAccessException) {
            throw NotFoundException.withMissingResource(id, null)
        } catch (ex: NoSuchElementException) {
            throw NotFoundException.withMissingResource(id, null)
        }
    }

    fun getAllDocumentWrappers(catalogIdentifier: String, includeFolders: Boolean = false): List<DocumentWrapper> {
        return if (includeFolders)
            docWrapperRepo.findAllDocumentsAndFoldersByCatalog_Identifier(catalogIdentifier)
        else
            docWrapperRepo.findAllDocumentsByCatalog_Identifier(catalogIdentifier)
    }

    fun findChildrenDocs(catalogId: String, parentId: Int?, isAddress: Boolean): FindAllResults<DocumentWrapper> {
        return findChildren(catalogId, parentId, if (isAddress) DocumentCategory.ADDRESS else DocumentCategory.DATA)
    }

    fun findChildren(
        catalogId: String,
        parentId: Int?,
        docCat: DocumentCategory = DocumentCategory.DATA
    ): FindAllResults<DocumentWrapper> {

        val docs = if (parentId == null) {
            docWrapperRepo.findAllByCatalog_IdentifierAndParent_IdAndCategory(catalogId, null, docCat.value)
        } else {
            docWrapperRepo.findByParent_id(parentId.toInt())
        }
        /*val docs = docWrapperRepo.findAllByCatalog_IdentifierAndParent_IdAndCategory(
            catalogId,
            parentId,
            docCat.value
        )*/
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
                    if (doc.countChildren > 0) getAllDescendantIds(
                        catalogId,
                        doc.id!!
                    ) + doc.id!! else listOf(doc.id!!)
                }
        }
    }

    /**
     * Get the latest version of the document associated with the given wrapper
     * If onlyPublished is true, the method will return the published version and will throw an exception,
     * if it does not exist. If onlyPublished is false, it will prefer the draft version, if it exists.
     */
    fun getLatestDocument(
        wrapper: DocumentWrapper,
        onlyPublished: Boolean = false,
        resolveLinks: Boolean = true,
        catalogId: String? = null
    ): Document {

        val doc = getLatestDocumentVersion(wrapper, onlyPublished, catalogId)

        return prepareDocument(doc, wrapper.type!!, onlyPublished, resolveLinks)
    }

    // TODO: consolidate function with above
    fun getLatestDocument(
        wrapper: DocumentWrapper,
        options: UpdateReferenceOptions,
        catalogId: String? = null
    ): Document {

        val doc = getLatestDocumentVersion(wrapper, options.onlyPublished, catalogId)

        return prepareDocument(doc, wrapper.type!!, options.onlyPublished, options.forExport, options)
    }

    fun getDocumentType(docType: String): EntityType {
        return checkNotNull(documentTypes.find { it.className == docType })
    }

    fun getDocumentTypesOfProfile(profileId: String): List<EntityType> {
        return checkNotNull(documentTypes.filter { it.usedInProfile(profileId)})
    }

    @Transactional
    fun createDocument(
        principal: Principal,
        catalogId: String,
        data: JsonNode,
        parentId: Int?,
        address: Boolean = false,
        publish: Boolean = false
    ): JsonNode {
        
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
    ): JsonNode {

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

        // save document
        val newDocument = docRepo.save(preCreatePayload.document)

        // set wrapper to document association
        if (publish) {
            preCreatePayload.wrapper.published = newDocument
        } else {
            preCreatePayload.wrapper.draft = newDocument
        }

        // save wrapper
        val newWrapper = docWrapperRepo.save(preCreatePayload.wrapper)

        // create ACL before trying to save since we need the permission
        aclService.createAclForDocument(newWrapper.id!!, preCreatePayload.wrapper.parent?.id)

        // run post-create pipe(s)
        val postCreatePayload = PostCreatePayload(docType, newDocument, newWrapper)
        postCreatePipe.runFilters(postCreatePayload, filterContext)
        postPersistencePipe.runFilters(postCreatePayload as PostPersistencePayload, filterContext)

        // also run update pipes!
        val postWrapper = runPostUpdatePipes(docType, newDocument, newWrapper, filterContext, publish)
        val latestDocument = getLatestDocumentVersion(postWrapper, false)

        return convertToJsonNode(latestDocument)
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
        node.put(FIELD_ID, node.get(FIELD_ID).asText())
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
            .forEach {
                try {
                    updateWrapper(it, true, null, it.pending!!)
                    docWrapperRepo.saveAndFlush(it)
                    val docType = getDocumentType(it.type!!)
                    runPostUpdatePipes(docType, it.published!!, it, filterContext, true, null)
                } catch (e: Exception) {
                    log.error("Error during publishing pending document: ${it.id}", e)
                }
            }

    }

    fun updateDocument(
        principal: Principal?,
        catalogId: String,
        id: Int,
        data: Document,
        publish: Boolean = false,
        publishDate: Date? = null,
    ): Document {
        val filterContext = DefaultContext.withCurrentProfile(catalogId, catalogRepo, principal)

        // run pre-update pipe(s)
        val wrapper = getWrapperByDocumentId(id)
        val docType = getDocumentType(wrapper.type!!)
        val preUpdatePayload = PreUpdatePayload(docType, data, wrapper)
        preUpdatePipe.runFilters(preUpdatePayload, filterContext)
        if (publish) {
            // run pre-publish pipe(s)
            val prePublishPayload = PrePublishPayload(docType, preUpdatePayload.document, preUpdatePayload.wrapper)
            prePublishPipe.runFilters(prePublishPayload, filterContext)
        }

        try {
            preUpdatePayload.document.wrapperId = wrapper.id
            val updatedDoc = docRepo.save(preUpdatePayload.document)

            // update wrapper to document association
            updateWrapper(preUpdatePayload.wrapper, publish, publishDate, updatedDoc)

            // save wrapper
            val updatedWrapper = docWrapperRepo.saveAndFlush(preUpdatePayload.wrapper)
            val postWrapper =
                runPostUpdatePipes(docType, updatedDoc, updatedWrapper, filterContext, publish, publishDate)
            return getLatestDocument(postWrapper, catalogId = catalogId)
        } catch (ex: ObjectOptimisticLockingFailureException) {
            throw ConcurrentModificationException.withConflictingResource(
                preUpdatePayload.document.id.toString(),
                preUpdatePayload.wrapper.draft?.version ?: preUpdatePayload.wrapper.published?.version!!,
                preUpdatePayload.document.version!!
            )
        }
    }

    private fun updateWrapper(
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
        }
    }

    private fun runPostUpdatePipes(
        docType: EntityType,
        updatedDocument: Document,
        updatedWrapper: DocumentWrapper,
        filterContext: Context,
        publish: Boolean,
        publishDate: Date? = null,
    ): DocumentWrapper {
        try {
            val postUpdatePayload = PostUpdatePayload(docType, updatedDocument, updatedWrapper)
            postUpdatePipe.runFilters(postUpdatePayload, filterContext)
            return if (publish && publishDate == null) {
                // run post-publish pipe(s)
                val postPublishPayload =
                    PostPublishPayload(docType, postUpdatePayload.document, postUpdatePayload.wrapper)
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

    fun deleteDocument(principal: Principal, catalogId: String, id: String) {
        val filterContext = DefaultContext.withCurrentProfile(catalogId, catalogRepo, principal)
        deleteRecursively(catalogId, id, filterContext)
    }

    private fun deleteRecursively(catalogId: String, id: String, filterContext: Context) {
        // run pre-delete pipe(s)
        val wrapper = getWrapperByDocumentIdAndCatalog(catalogId, id)

        val data = getLatestDocumentVersion(wrapper, false)
        val docTypeName = data.type
        val docType = getDocumentType(docTypeName)

        val preDeletePayload = PreDeletePayload(docType, data, wrapper)
        preDeletePipe.runFilters(preDeletePayload, filterContext)

        // TODO: check if document is referenced by another one and handle
        //       it somehow

        findChildrenDocs(catalogId, id.toInt(), isAddress(wrapper)).hits.forEach {
            deleteRecursively(catalogId, it.id.toString(), filterContext)
        }

        if (generalProperties.markInsteadOfDelete) {
            markDocumentAsDeleted(catalogId, id)
        } else {
            // remove all document versions which have the same ID
            docRepo.deleteAllByUuid(id)

            // remove the wrapper
            docWrapperRepo.deleteById(id.toInt())

            // remove ACL from document, which works now since reference is by database ID instead of UUID
            // since it can happen that the same UUID exists in multiple catalogs, the ACL for a UUID could not be unique
            aclService.removeAclForDocument(id)
        }

        // remove references in groups
        groupService.removeDocFromGroups(catalogId, id)

        // run post-delete pipe(s)
        val postDeletePayload = PostDeletePayload(docType, preDeletePayload.document, preDeletePayload.wrapper)
        postDeletePipe.runFilters(postDeletePayload, filterContext)
        postPersistencePipe.runFilters(postDeletePayload as PostPersistencePayload, filterContext)
    }

    private fun markDocumentAsDeleted(catalogId: String, id: String) {
        val markedDoc = getWrapperByDocumentIdAndCatalog(catalogId, id).apply { deleted = 1 }
        docWrapperRepo.save(markedDoc)
    }

    fun revertDocument(principal: Principal, catalogId: String, id: Int): Document {

        // remove draft version
        val wrapper = getWrapperByDocumentId(id)

        // check if draft and published field are filled
        assert(wrapper.draft != null && wrapper.published != null)

        // run pre-revert pipe(s)
        val filterContext = DefaultContext.withCurrentProfile(catalogId, catalogRepo, principal)
        val docType = getDocumentType(wrapper.type!!)
        val preRevertPayload = PreRevertPayload(docType, wrapper.draft!!, wrapper)
        preRevertPipe.runFilters(preRevertPayload, filterContext)

        // delete draft document
        docRepo.delete(wrapper.draft!!)

        // update wrapper
        wrapper.draft = null
        val updatedWrapper = docWrapperRepo.save(wrapper)

        val doc = this.getLatestDocument(updatedWrapper, true, catalogId = catalogId)

        // run post-revert pipe(s)
        val postRevertPayload = PostRevertPayload(docType, doc, updatedWrapper)
        postRevertPipe.runFilters(postRevertPayload, filterContext)

        return postRevertPayload.document
    }

    fun unpublishDocument(principal: Principal, catalogId: String, id: Int): Document {
        // remove publish
        val wrapper = getWrapperByDocumentId(id)
        assert(wrapper.published != null)

        // run pre-unpublish pipe(s)
        val filterContext = DefaultContext.withCurrentProfile(catalogId, catalogRepo, principal)
        val docType = getDocumentType(wrapper.type!!)
        val preUnpublishPayload = PreUnpublishPayload(docType, wrapper.published!!, wrapper)
        preUnpublishPipe.runFilters(preUnpublishPayload, filterContext)

        // if no draft version exists, move published version to draft
        if (wrapper.draft == null) {
            wrapper.draft = wrapper.published
        } else {
            // else delete published version which automatically sets published version in wrapper to null
            docRepo.delete(wrapper.published!!)
        }

        // explicitly set published to null (to also determine state correctly)
        wrapper.published = null

        docWrapperRepo.save(wrapper)

        val doc = this.getLatestDocument(wrapper, catalogId = catalogId)

        // run post-unpublish pipe(s)
        val postUnpublishPayload = PostUnpublishPayload(docType, doc, wrapper)
        postUnpublishPipe.runFilters(postUnpublishPayload, filterContext)

        return postUnpublishPayload.document
    }

    fun cancelPendingPublishing(principal: Principal, catalogId: String, id: Int): Document {
        // remove pending
        val wrapper = getWrapperByDocumentId(id)
        assert(wrapper.pending != null)

        // if no draft version exists, move pending version to draft
        if (wrapper.draft == null) {
            wrapper.draft = wrapper.pending
        }

        wrapper.pending = null
        wrapper.pending_date = null
        docWrapperRepo.save(wrapper)

        return getLatestDocument(wrapper, catalogId = catalogId)
    }

    fun removePendingVersion(id: Int): DocumentWrapper {
        val wrapper = getWrapperByDocumentId(id)
        wrapper.pending = null
        wrapper.pending_date = null
        docWrapperRepo.save(wrapper)
        return wrapper
    }

    // TODO: the same function is also defined in IndexingTask
    private fun getElasticsearchAliasFromCatalog(catalog: Catalog) =
        catalog.settings?.config?.elasticsearchAlias ?: catalog.identifier

    fun isAddress(wrapper: DocumentWrapper): Boolean {
        return wrapper.category == DocumentCategory.ADDRESS.value
    }

    /**
     * Every document type belongs to a category (data or address). However a folder can belong to multiple categories
     */
    private fun getCategoryFromType(docType: String, defaultIsAddress: Boolean): String {
        if (docType == DocumentCategory.FOLDER.value) {
            return if (defaultIsAddress) DocumentCategory.ADDRESS.value else DocumentCategory.DATA.value
        }

        return documentTypes
            .find { it.className == docType }!!
            .category
    }

    private fun getLatestDocumentVersion(
        wrapper: DocumentWrapper,
        onlyPublished: Boolean,
        catalogId: String? = null
    ): Document {

        if (onlyPublished && wrapper.published == null) {
            throw NotFoundException.withMissingPublishedVersion(wrapper.uuid)
        }

        val objectNode = if (onlyPublished) {
            wrapper.published
        } else  {
            wrapper.draft ?: wrapper.pending ?: wrapper.published
        }


        if (objectNode == null) {
            throw ServerException.withReason("Document has no draft or published version: " + wrapper.id)
        }

        // we need to detach entity, otherwise unwanted updated operations can happen when we change this
        // this happened by modifying the data-field and doing a flush, which lead to an update of the document
        // and increase of the version
        entityManager.detach(objectNode)

        objectNode.state = if (onlyPublished) DocumentState.PUBLISHED.value else wrapper.getState()
        objectNode.hasWritePermission = wrapper.hasWritePermission
        objectNode.hasOnlySubtreeWritePermission = wrapper.hasOnlySubtreeWritePermission
        objectNode.wrapperId = wrapper.id
        objectNode.data.put(FIELD_PARENT, wrapper.parent?.id?.toString()) // make parent available in frontend
        objectNode.catalogIdentifier = catalogId

        return objectNode
    }

    private fun prepareDocument(
        docData: Document,
        docType: String,
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
            val refType = getDocumentType(docType)

            try {
                refType.updateReferences(docData, options)
            } catch (ex: AccessDeniedException) {
                throw ForbiddenException.withAccessRights("No access to referenced dataset")
            }
        }

        return docData
    }

    @Deprecated("Search is really slow with lot of data", ReplaceWith("ResearchService"))
    fun find(
        catalogId: String,
        category: String = "data",
        query: List<QueryField> = emptyList(),
        pageRequest: PageRequest = PageRequest.of(0, 10),
        userGroups: Set<Group> = emptySet()
    ): Page<DocumentWrapper> {

        val specification = getSearchSpecification(catalogId, category, query, userGroups)
        return docWrapperRepo.findAll(specification, pageRequest)

    }

    fun getSearchSpecification(
        catalog: String,
        category: String,
        queryFields: List<QueryField>,
        userGroups: Set<Group> = emptySet()
    ): Specification<DocumentWrapper> {
        return Specification<DocumentWrapper> { wrapper, cq, cb ->
            val catalogWrapper = wrapper.join<DocumentWrapper, Catalog>("catalog")

            val draft = wrapper.join<DocumentWrapper, Document>("draft", JoinType.LEFT)
            val published = wrapper.join<DocumentWrapper, Document?>("published", JoinType.LEFT)

            cq.orderBy(
                listOf(
                    cb.desc(draft.get<String>("modified")),
                    cb.desc(published.get<String>("modified"))
                )
            )

            val preds = queryFields
                .map { queryField -> createPredicateForField(cb, draft, published, queryField) }

            val combindPreds = if (queryFields.isNotEmpty() && queryFields[0].operator == "OR") {
                cb.or(*preds.toTypedArray())
            } else {
                cb.and(*preds.toTypedArray())
            }

            var result = cb.and(
                cb.equal(catalogWrapper.get<String>("identifier"), catalog),
                cb.equal(wrapper.get<String>("category"), category),
                combindPreds
            )

            // TODO probably performance bottle neck. Analyze and Adapt.
            // necessary for rights management
            val datasetUuids = docWrapperRepo.getAll().map { it?.id }
            val exp: Expression<String> = wrapper.get("id")
            val predicate: Predicate = exp.`in`(datasetUuids)
            result = cb.and(predicate, result)

            result

        }
    }

    private fun createPredicateForField(
        cb: CriteriaBuilder,
        draft: Join<DocumentWrapper, Document>,
        published: Join<DocumentWrapper, Document>,
        queryField: QueryField
    ): Predicate? {

        if (queryField.field == "title" || queryField.field == "type" || queryField.field == "uuid") {
            return cb.or(
                handleNot(
                    cb, queryField, handleComparisonType(cb, queryField, draft)
                ),
                handleNot(
                    cb, queryField, handleComparisonType(cb, queryField, published)
                )
            )
        } else if (queryField.field == "published" && queryField.value == null) {
            return if (queryField.invert) {
                cb.isNotNull(published)
            } else {
                cb.isNull(published)
            }
        } else {
            return cb.or(
                handleNot(
                    cb, queryField, handleComparisonTypeJson(cb, queryField, draft)
                ),
                handleNot(
                    cb, queryField, handleComparisonTypeJson(cb, queryField, published)
                )
            )
        }
    }

    private fun handleNot(cb: CriteriaBuilder, queryField: QueryField, predicate: Predicate?): Predicate? {
        return if (queryField.invert) cb.not(predicate) else predicate
    }

    private fun handleComparisonType(
        cb: CriteriaBuilder,
        queryField: QueryField,
        docJoin: Join<DocumentWrapper, Document>
    ): Predicate? {
        val value = queryField.value?.lowercase()
        return when (queryField.queryType) {
            QueryType.EXACT -> cb.equal(cb.lower(docJoin.get(queryField.field)), value)
            else -> cb.like(cb.lower(docJoin.get(queryField.field)), "%$value%")
        }
    }

    private fun handleComparisonTypeJson(
        cb: CriteriaBuilder,
        queryField: QueryField,
        docJoin: Join<DocumentWrapper, Document>
    ): Predicate? {
        val value = queryField.value?.lowercase()
        return when (queryField.queryType) {
            QueryType.EXACT -> cb.equal(cb.lower(createJsonExtract(cb, docJoin, queryField.field)), value)
            else -> cb.like(cb.lower(createJsonExtract(cb, docJoin, queryField.field)), "%$value%")
        }
    }

    private fun createJsonExtract(
        cb: CriteriaBuilder,
        docJoin: Join<DocumentWrapper, Document>,
        field: String
    ): Expression<String>? {
        val literals = field.split(".").map { cb.literal(it) }

        return cb.function(
            "jsonb_extract_path_text",
            String::class.java,
            docJoin.get<String>("data"),
            *literals.toTypedArray()
        )
    }

    @Transactional
    fun replaceAddress(catalogId: String, source: String, target: String) {
        val refIds = docRepo.getDocIdsWithReferenceTo(catalogId, """\: \"$source\"""")
//        println(refIds.joinToString(", "))
        docRepo.replaceReference(source, target, refIds)
    }
}
