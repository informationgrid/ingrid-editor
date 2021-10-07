package de.ingrid.igeserver.services

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.ObjectNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.elasticsearch.IndexInfo
import de.ingrid.elasticsearch.IndexManager
import de.ingrid.igeserver.ClientException
import de.ingrid.igeserver.api.ForbiddenException
import de.ingrid.igeserver.api.NotFoundException
import de.ingrid.igeserver.configuration.GeneralProperties
import de.ingrid.igeserver.extension.pipe.Context
import de.ingrid.igeserver.extension.pipe.impl.DefaultContext
import de.ingrid.igeserver.model.QueryField
import de.ingrid.igeserver.model.StatisticResponse
import de.ingrid.igeserver.persistence.FindAllResults
import de.ingrid.igeserver.persistence.QueryType
import de.ingrid.igeserver.persistence.filter.*
import de.ingrid.igeserver.persistence.model.EntityType
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.DocumentWrapper
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Group
import de.ingrid.igeserver.repository.CatalogRepository
import de.ingrid.igeserver.repository.DocumentRepository
import de.ingrid.igeserver.repository.DocumentWrapperRepository
import de.ingrid.igeserver.repository.UserRepository
import org.elasticsearch.client.transport.NoNodeAvailableException
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Value
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.data.jpa.domain.Specification
import org.springframework.security.access.AccessDeniedException
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import javax.persistence.criteria.*

@Service
class DocumentService @Autowired constructor(
    var docRepo: DocumentRepository,
    var userRepo: UserRepository,
    var docWrapperRepo: DocumentWrapperRepository,
    var catalogRepo: CatalogRepository,
    var aclService: IgeAclService,
    var groupService: GroupService,
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
    private lateinit var preDeletePipe: PreDeletePipe

    @Autowired
    private lateinit var postDeletePipe: PostDeletePipe

    @Autowired(required = false)
    private var indexManager: IndexManager? = null

    @Value("\${elastic.alias}")
    private lateinit var elasticsearchAlias: String

    enum class DocumentState(val value: String) {
        PUBLISHED("P"),
        DRAFT("W")
    }

    /**
     * Get the DocumentWrapper with the given document uuid
     */
    fun getWrapperByDocumentId(id: String): DocumentWrapper = docWrapperRepo.findById(id)

    fun documentExistsNot(id: String): Boolean {
        return !documentExists(id)
    }

    fun documentExists(id: String): Boolean {
        return docWrapperRepo.existsById(id)
    }

    fun getTitleFromDocumentId(id: String): String {
        val wrapper = docWrapperRepo.findByDraftUuidOrPublishedUuid(id, id)
        return wrapper.draft?.title ?: wrapper.published?.title ?: "???!"
    }

    fun findChildrenDocs(catalogId: String, parentId: String?, isAddress: Boolean): FindAllResults<DocumentWrapper> {
        return findChildren(catalogId, parentId, if (isAddress) DocumentCategory.ADDRESS else DocumentCategory.DATA)
    }

    fun findChildren(
        catalogId: String,
        parentId: String?,
        docCat: DocumentCategory = DocumentCategory.DATA
    ): FindAllResults<DocumentWrapper> {

        val docs = docWrapperRepo.findAllByCatalog_IdentifierAndParent_IdAndCategory(
            catalogId,
            parentId,
            docCat.value
        )
        return FindAllResults(
            docs.size.toLong(),
            docs
        )

    }

    /**
     * Get the latest version of the document associated with the given wrapper
     * If onlyPublished is true, the method will return the published version and will throw an exception,
     * if it does not exist. If onlyPublished is false, it will prefer the draft version, if it exists.
     */
    fun getLatestDocument(
        wrapper: DocumentWrapper,
        onlyPublished: Boolean = false,
        resolveLinks: Boolean = true
    ): Document {

        val doc = getLatestDocumentVersion(wrapper, onlyPublished)

        return prepareDocument(doc, wrapper.type!!, onlyPublished, resolveLinks)
    }

    fun getDocumentType(docType: String): EntityType {

        return checkNotNull(documentTypes.find { it.className == docType })
    }

    // TODO: make use of create action only, write is only temporary
    @PreAuthorize(
        "hasPermission(#parentId, 'de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.DocumentWrapper','CREATE') || " +
                "hasPermission(#parentId, 'de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.DocumentWrapper', 'WRITE')"
    )
    @Transactional
    fun createDocument(
        catalogId: String,
        data: JsonNode,
        parentId: String?,
        address: Boolean = false,
        publish: Boolean = false
    ): JsonNode {
        val filterContext = DefaultContext.withCurrentProfile(catalogId, catalogRepo)
        val docTypeName = data.get(FIELD_DOCUMENT_TYPE).asText()
        val docType = getDocumentType(docTypeName)

        val document = convertToDocument(data)

        // run pre-create pipe(s)
        val preCreatePayload = PreCreatePayload(docType, document, getCategoryFromType(docTypeName, address))
        preCreatePipe.runFilters(preCreatePayload, filterContext)

        // save document
        val newDocument = docRepo.save(preCreatePayload.document)

        // set wrapper to document association
        if (publish) {
            preCreatePayload.wrapper.published = newDocument
        } else {
            preCreatePayload.wrapper.draft = newDocument
        }

        // handle ACL
        aclService.createAclForDocument(document.uuid, preCreatePayload.wrapper.parent?.id)

        // save wrapper
        val newWrapper = docWrapperRepo.save(preCreatePayload.wrapper)

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
        return node

    }

    fun convertToDocument(docJson: JsonNode): Document {

        val titleString = docJson.get("title").asText()

        return Document().apply {
            title = titleString
            type = docJson.get(FIELD_DOCUMENT_TYPE).asText()
            version = docJson.get(FIELD_VERSION)?.asInt()
            if (docJson.hasNonNull(FIELD_ID)) {
                uuid = docJson.get(FIELD_ID).asText()
            }
            data = removeInternalFields(docJson as ObjectNode)
        }

    }

    private fun removeInternalFields(node: ObjectNode): ObjectNode {
        listOf(
            FIELD_VERSION,
            FIELD_CREATED,
            FIELD_MODIFIED,
            FIELD_ID,
            FIELD_DOCUMENT_TYPE,
            "title",
            "hasWritePermission"
        )
            .forEach { node.remove(it) }
        return node
    }

    fun updateDocument(catalogId: String, id: String, data: Document, publish: Boolean = false): Document {
        val filterContext = DefaultContext.withCurrentProfile(catalogId, catalogRepo)

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

        // save document with same ID or new one, if no draft version exists (because the last version is published)
        val draftId = preUpdatePayload.wrapper.draft?.id
        val createdDate = preUpdatePayload.wrapper.draft?.created ?: preUpdatePayload.wrapper.published?.created

        // set server side fields from previous document version
        preUpdatePayload.document.id = preUpdatePayload.document.id ?: draftId
        preUpdatePayload.document.created = createdDate

        val updatedDoc = docRepo.save(preUpdatePayload.document)

        // update wrapper to document association
        with(preUpdatePayload.wrapper) {
            if (publish) {
                // move published version to archive
                if (published != null) {
                    archive.add(published!!)
                }
                // set published version
                published = updatedDoc
                // remove draft version
                draft = null
            } else {
                // update draft version
                if (draft == null) {
                    draft = updatedDoc
                } else {
                    // 'if' must have both main and 'else' branches if used as an expression
                }
            }
        }

        // save wrapper
        val updatedWrapper = docWrapperRepo.saveAndFlush(preUpdatePayload.wrapper)
        val postWrapper = runPostUpdatePipes(docType, updatedDoc, updatedWrapper, filterContext, publish)
        return getLatestDocument(postWrapper)
    }

    private fun runPostUpdatePipes(
        docType: EntityType,
        updatedDocument: Document,
        updatedWrapper: DocumentWrapper,
        filterContext: Context,
        publish: Boolean
    ): DocumentWrapper {
        val postUpdatePayload = PostUpdatePayload(docType, updatedDocument, updatedWrapper)
        postUpdatePipe.runFilters(postUpdatePayload, filterContext)
        return if (publish) {
            // run post-publish pipe(s)
            val postPublishPayload = PostPublishPayload(docType, postUpdatePayload.document, postUpdatePayload.wrapper)
            postPublishPipe.runFilters(postPublishPayload, filterContext)
            postPersistencePipe.runFilters(postPublishPayload as PostPersistencePayload, filterContext)
            postPublishPayload.wrapper
        } else {
            postPersistencePipe.runFilters(postUpdatePayload as PostPersistencePayload, filterContext)
            postUpdatePayload.wrapper
        }
    }

    fun deleteRecursively(catalogId: String, id: String) {
        val filterContext = DefaultContext.withCurrentProfile(catalogId, catalogRepo)

        // run pre-delete pipe(s)
        val wrapper = getWrapperByDocumentId(id)

        val data = getLatestDocumentVersion(wrapper, false)
        val docTypeName = data.type!!
        val docType = getDocumentType(docTypeName)

        val preDeletePayload = PreDeletePayload(docType, data, wrapper)
        preDeletePipe.runFilters(preDeletePayload, filterContext)

        findChildrenDocs(catalogId, id, isAddress(wrapper)).hits.forEach {
            deleteRecursively(catalogId, it.id)
        }

        if (generalProperties.markInsteadOfDelete) {
            markDocumentAsDeleted(id)
        } else {
            // remove all document versions which have the same ID
            docRepo.deleteAllByUuid(id)

            // remove the wrapper
            docWrapperRepo.deleteById(id)

            // remove ACL from document
            aclService.removeAclForDocument(id)
        }

        // remove references in groups
        groupService.removeDocFromGroups(catalogId, id)

        // run post-delete pipe(s)
        val postDeletePayload = PostDeletePayload(docType, preDeletePayload.document, preDeletePayload.wrapper)
        postDeletePipe.runFilters(postDeletePayload, filterContext)
        postPersistencePipe.runFilters(postDeletePayload as PostPersistencePayload, filterContext)
    }

    private fun markDocumentAsDeleted(id: String) {
        val markedDoc = getWrapperByDocumentId(id).apply { deleted = 1 }
        docWrapperRepo.save(markedDoc)
    }

    fun revertDocument(catalogId: String, id: String): Document {

        // remove draft version
        val wrapper = getWrapperByDocumentId(id)

        // check if draft and published field are filled
        assert(wrapper.draft != null && wrapper.published != null)

        wrapper.draft = null
        val updatedWrapper = docWrapperRepo.save(wrapper)

        val publishedDoc = updatedWrapper.published!!
        publishedDoc.state = DocumentState.PUBLISHED.value

        return publishedDoc
    }

    fun unpublishDocument(catalogId: String, id: String): Document {
        // remove publish
        val wrapper = getWrapperByDocumentId(id)
        assert(wrapper.published != null)

        // if no draft version exists, move published version to draft
        if (wrapper.draft == null) {
            wrapper.draft = wrapper.published
            wrapper.published = null
        } else {
            // else delete published version which automatically sets published version in wrapper to null
            docRepo.delete(wrapper.published!!)
        }
        docWrapperRepo.save(wrapper)

        // remove from index
        removeFromIndex(id)

        // update state
        wrapper.draft!!.state = DocumentState.DRAFT.value
        return wrapper.draft!!
    }

    private fun removeFromIndex(id: String) {
        try {
            if (indexManager != null) {
                val oldIndex = indexManager!!.getIndexNameFromAliasName(elasticsearchAlias, generalProperties.uuid)
                val info = IndexInfo().apply {
                    realIndexName = oldIndex
                    toType = "base"
                    toAlias = elasticsearchAlias
                }
                indexManager!!.delete(info, id, true)
            }
        } catch (ex: NoNodeAvailableException) {
            throw ClientException.withReason("No connection to Elasticsearch: ${ex.message}")
        }
    }

    fun getDocumentStatistic(catalogId: String): StatisticResponse {

        // TODO: filter by not marked deleted

        val allData = docWrapperRepo.findAllByCatalog_IdentifierAndCategory(catalogId, DocumentCategory.DATA.value)
        val allDataDrafts = docWrapperRepo.findAllDrafts(catalogId)
        val allDataPublished = docWrapperRepo.findAllPublished(catalogId)
        val statsPerType = mutableMapOf<String, StatisticResponse>()

        documentTypes.forEach { type ->
            statsPerType[type.className] = StatisticResponse(
                totalNum = allData.filter { it.type == type.className }.size,
                numDrafts = allDataDrafts.filter { it.type == type.className }.size,
                numPublished = allDataPublished.filter { it.type == type.className }.size,
                statsPerType = null
            )
        }

        return StatisticResponse(
            totalNum = allData.size,
            numDrafts = allDataDrafts.size,
            numPublished = allDataPublished.size,
            statsPerType = statsPerType
        )
    }

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

    private fun getLatestDocumentVersion(wrapper: DocumentWrapper, onlyPublished: Boolean): Document {

        if (onlyPublished && wrapper.published == null) {
            throw NotFoundException.withMissingPublishedVersion(wrapper.id)
        }

        // TODO: check if isNull function really works or if we need a null comparison
        val objectNode = if (wrapper.draft == null || onlyPublished) {
            wrapper.published
        } else {
            wrapper.draft
        }!!

        objectNode.state = if (onlyPublished) DocumentState.PUBLISHED.value else wrapper.getState()
        objectNode.hasWritePermission = wrapper.hasWritePermission
        objectNode.hasOnlySubtreeWritePermission = wrapper.hasOnlySubtreeWritePermission

        return objectNode
    }

    private fun prepareDocument(
        docData: Document,
        docType: String,
        onlyPublished: Boolean = false,
        resolveLinks: Boolean = true
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
                refType.updateReferences(docData, onlyPublished)
            } catch (ex: AccessDeniedException) {
                throw ForbiddenException.withAccessRights("No access to referenced dataset")
            }
        }

        return docData
    }

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
}
