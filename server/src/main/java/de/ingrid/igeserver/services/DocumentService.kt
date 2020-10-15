package de.ingrid.igeserver.services

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.ObjectNode
import de.ingrid.igeserver.api.NotFoundException
import de.ingrid.igeserver.extension.pipe.Context
import de.ingrid.igeserver.extension.pipe.impl.DefaultContext
import de.ingrid.igeserver.model.QueryField
import de.ingrid.igeserver.model.StatisticResponse
import de.ingrid.igeserver.persistence.*
import de.ingrid.igeserver.persistence.filter.*
import de.ingrid.igeserver.persistence.model.EntityType
import de.ingrid.igeserver.persistence.model.document.DocumentType
import de.ingrid.igeserver.persistence.model.document.DocumentWrapperType
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import kotlin.reflect.KClass

@Service
class DocumentService : MapperService() {

    @Autowired
    private lateinit var documentTypes: List<EntityType>

    @Autowired
    private lateinit var dbService: DBApi

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

    enum class DocumentState(val value: String) {
        PUBLISHED("P"),
        DRAFT("W")
    }

    /**
     * Get the DocumentWrapper with the given document uuid
     */
    fun getWrapperByDocumentId(id: String, withReferences: Boolean): JsonNode? {

        val type = DocumentWrapperType::class
        val query = listOf(QueryField(FIELD_ID, id))
        val findOptions = FindOptions(
                queryType = QueryType.EXACT,
                resolveReferences = withReferences)
        val docs = dbService.findAll(type, query, findOptions)
        return when (docs.totalHits) {
            0L -> throw NotFoundException.withMissingResource(id, type.simpleName)
            1L -> docs.hits[0]
            else -> throw PersistenceException.withMultipleEntities(id, type.simpleName, dbService.currentCatalog)
        }
    }

    fun <T : EntityType> determineHasChildren(doc: JsonNode, type: KClass<T>): Boolean {
        val id = doc[FIELD_ID].asText()
        val countMap = dbService.countChildrenOfType(id, type)
        return if (countMap.containsKey(id)) {
            countMap.getValue(id) > 0
        } else false
    }

    fun findChildrenDocs(parentId: String?, isAddress: Boolean): FindAllResults {
        return findChildren(parentId, if (isAddress) DocumentCategory.ADDRESS else DocumentCategory.DATA)
    }

    fun findChildren(parentId: String?, docCat: DocumentCategory? = null): FindAllResults {
        val queryMap = mutableListOf(QueryField(FIELD_PARENT, parentId))

        //find all children regardless of category
        if (docCat != null) queryMap.add(QueryField(FIELD_CATEGORY, docCat.value))

        val findOptions = FindOptions(
                queryType = QueryType.EXACT,
                resolveReferences = true,
                queryOperator = "AND")
        return dbService.findAll(DocumentWrapperType::class, queryMap, findOptions)
    }

    /**
     * Get the latest version of the document associated with the given wrapper
     * If onlyPublished is true, the method will return the published version and will throw an exception,
     * if it does not exist. If onlyPublished is false, it will prefer the draft version, if it exists.
     */
    fun getLatestDocument(wrapper: JsonNode, onlyPublished: Boolean = false, resolveLinks: Boolean = true): ObjectNode {

        val docData: ObjectNode = getLatestDocumentVersion(wrapper, onlyPublished)

        return prepareDocument(docData, wrapper[FIELD_DOCUMENT_TYPE].asText(), onlyPublished, resolveLinks)
    }

    fun getDocumentType(docType: String): EntityType {

        return checkNotNull(documentTypes.find { it.className == docType })
    }

    fun createDocument(data: JsonNode, address: Boolean = false, publish: Boolean = false): JsonNode {
        val filterContext = DefaultContext.withCurrentProfile(dbService)
        val docTypeName = data.get(FIELD_DOCUMENT_TYPE).asText()
        val docType = getDocumentType(docTypeName)

        // run pre-create pipe(s)
        val preCreatePayload = PreCreatePayload(docType, data as ObjectNode, getCategoryFromType(docTypeName, address))
        preCreatePipe.runFilters(preCreatePayload, filterContext)

        // save document
        val newDocument = dbService.save(DocumentType::class, null, preCreatePayload.document.toString())

        // set wrapper to document association
        val field = if (publish) FIELD_PUBLISHED else FIELD_DRAFT
        preCreatePayload.wrapper.put(field, dbService.getRecordId(newDocument))

        // save wrapper
        val newWrapper = dbService.save(DocumentWrapperType::class, null, preCreatePayload.wrapper.toString())

        // run post-create pipe(s)
        val postCreatePayload = PostCreatePayload(docType, newDocument as ObjectNode, newWrapper as ObjectNode)
        postCreatePipe.runFilters(postCreatePayload, filterContext)

        // also run update pipes!
        val postWrapper = runPostUpdatePipes(docType, newDocument, newWrapper, filterContext, publish)
        return getLatestDocument(postWrapper)
    }

    fun updateDocument(id: String, data: JsonNode, publish: Boolean = false): JsonNode {
        val filterContext = DefaultContext.withCurrentProfile(dbService)
        val docTypeName = data.get(FIELD_DOCUMENT_TYPE).asText()
        val docType = getDocumentType(docTypeName)

        // run pre-update pipe(s)
        val wrapper = getWrapperByDocumentId(id, false)
        val preUpdatePayload = PreUpdatePayload(docType, data as ObjectNode, wrapper as ObjectNode)
        preUpdatePipe.runFilters(preUpdatePayload, filterContext)
        if (publish) {
            // run pre-publish pipe(s)
            val prePublishPayload = PrePublishPayload(docType, preUpdatePayload.document, preUpdatePayload.wrapper)
            prePublishPipe.runFilters(prePublishPayload, filterContext)
        }

        // TODO: use document id instead of DB-ID
        // TODO: use version as Int
        // save document with same ID or new one, if no draft version exists (because the last version is published)
        val recordId = if (!preUpdatePayload.wrapper[FIELD_DRAFT].isNull) {
            preUpdatePayload.wrapper[FIELD_DRAFT].asText()
        } else null
        val version = preUpdatePayload.document.get(FIELD_VERSION)?.asText()
        val updatedDocument = dbService.save(DocumentType::class, recordId, preUpdatePayload.document.toString(), version)

        // update wrapper to document association
        with(preUpdatePayload.wrapper) {
            val updatedRecordId = dbService.getRecordId(updatedDocument)
            if (publish) {
                // move published version to archive
                val publishedId = get(FIELD_PUBLISHED)
                if (!publishedId.isNull) {
                    withArray(FIELD_ARCHIVE).add(publishedId)
                }
                // set published version
                put(FIELD_PUBLISHED, updatedRecordId)
                // remove draft version
                put(FIELD_DRAFT, null as String?)
            } else {
                // update draft version
                val draftId = get(FIELD_DRAFT)
                if (draftId.isNull) {
                    // TODO: db_id is ORecord!
                    put(FIELD_DRAFT, updatedRecordId)
                }
                else {
                    // 'if' must have both main and 'else' branches if used as an expression
                }
            }
        }

        // save wrapper
        val updatedWrapper = dbService.save(DocumentWrapperType::class, dbService.getRecordId(preUpdatePayload.wrapper), preUpdatePayload.wrapper.toString())

        val postWrapper = runPostUpdatePipes(docType, updatedDocument, updatedWrapper, filterContext, publish)
        return getLatestDocument(postWrapper)
    }

    private fun runPostUpdatePipes(docType: EntityType, updatedDocument: Any, updatedWrapper: Any, filterContext: Context, publish: Boolean): ObjectNode {
        val postUpdatePayload = PostUpdatePayload(docType, updatedDocument as ObjectNode, updatedWrapper as ObjectNode)
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

    fun deleteRecursively(id: String) {
        val filterContext = DefaultContext.withCurrentProfile(dbService)

        // run pre-delete pipe(s)
        val wrapper = getWrapperByDocumentId(id, true)
        if (wrapper != null) {
            val data = getLatestDocumentVersion(wrapper, false)
            val docTypeName = data.get(FIELD_DOCUMENT_TYPE).asText()
            val docType = getDocumentType(docTypeName)

            val preDeletePayload = PreDeletePayload(docType, data, wrapper as ObjectNode)
            preDeletePipe.runFilters(preDeletePayload, filterContext)

            findChildrenDocs(id, isAddress(wrapper)).hits.forEach {
                deleteRecursively(it.get(FIELD_ID).asText())
            }

            // remove all document versions which have the same ID
            dbService.remove(DocumentType::class, id)

            // remove the wrapper
            dbService.remove(DocumentWrapperType::class, id)

            // run post-delete pipe(s)
            val postDeletePayload = PostDeletePayload(docType, preDeletePayload.document, preDeletePayload.wrapper)
            postDeletePipe.runFilters(postDeletePayload, filterContext)
            postPersistencePipe.runFilters(postDeletePayload as PostPersistencePayload, filterContext)
        }
    }

    fun revertDocument(id: String): JsonNode {

        // remove draft version
        val wrapper = getWrapperByDocumentId(id, false) as ObjectNode

        val publishedId = wrapper.get(FIELD_PUBLISHED)

        // check if draft and published field are filled
        assert(!wrapper.get(FIELD_DRAFT).isNull && !publishedId.isNull)

        wrapper.put(FIELD_DRAFT, null as String?)
        val recordId = dbService.getRecordId(wrapper)
//        val version = wrapper.get(FIELD_VERSION).asText()

        dbService.save(DocumentWrapperType::class, recordId, wrapper.toString())

        // return published version
        val publishedDoc = dbService.find(DocumentType::class, publishedId.asText()) as ObjectNode

        publishedDoc.put(FIELD_STATE, DocumentState.PUBLISHED.value)
//        publishedDoc.put(FIELD_HAS_CHILDREN, determineHasChildren())

        return prepareDocument(publishedDoc, wrapper.get(FIELD_DOCUMENT_TYPE).asText())
    }

    fun getDocumentStatistic(): StatisticResponse {

        // TODO: filter by not marked deleted

        val allDocumentPublishedQuery = listOf(
                QueryField(FIELD_CATEGORY, DocumentCategory.DATA.value),
                QueryField(FIELD_PUBLISHED, null, true)
        )

        val allDocumentDraftsQuery = listOf(
                QueryField(FIELD_CATEGORY, DocumentCategory.DATA.value),
                QueryField(FIELD_DOCUMENT_TYPE, DocumentCategory.FOLDER.value, true),
                QueryField(FIELD_DRAFT, null, true)
        )

        val allDocumentQuery = listOf(
                QueryField(FIELD_CATEGORY, DocumentCategory.DATA.value),
                QueryField(FIELD_DOCUMENT_TYPE, DocumentCategory.FOLDER.value, true)
        )

        val options = FindOptions(
                queryOperator = "AND",
                queryType = QueryType.EXACT)

        val allData = dbService.findAll(DocumentWrapperType::class, allDocumentQuery, options)
        val allDataDrafts = dbService.findAll(DocumentWrapperType::class, allDocumentDraftsQuery, options)
        val allDataPublished = dbService.findAll(DocumentWrapperType::class, allDocumentPublishedQuery, options)

        return StatisticResponse(
                totalNum = allData.totalHits,
                numDrafts = allDataDrafts.totalHits,
                numPublished = allDataPublished.totalHits
        )
    }

    fun isAddress(wrapper: JsonNode?): Boolean {
        return wrapper?.get(FIELD_CATEGORY)?.asText() == DocumentCategory.ADDRESS.value
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

    private fun getLatestDocumentVersion(wrapper: JsonNode, onlyPublished: Boolean): ObjectNode {
        val draft = wrapper[FIELD_DRAFT]
        val published = wrapper[FIELD_PUBLISHED]

        if (onlyPublished && published.isNull) {
            throw NotFoundException.withMissingPublishedVersion(wrapper.get(FIELD_ID).asText())
        }

        // TODO: check if isNull function really works or if we need a null comparison
        val objectNode = if (draft.isNull || onlyPublished) {
            published as ObjectNode
        } else {
            draft as ObjectNode
        }

        objectNode.put(FIELD_STATE, if (onlyPublished) DocumentState.PUBLISHED.value else determineState(wrapper))

        return objectNode
    }

    private fun determineState(node: JsonNode): String {
        val draft = !node[FIELD_DRAFT].isNull
        val published = !node[FIELD_PUBLISHED].isNull
        return if (published && draft) {
            DocumentState.PUBLISHED.value + DocumentState.DRAFT.value
        } else if (published) {
            DocumentState.PUBLISHED.value
        } else {
            DocumentState.DRAFT.value
        }
    }

    private fun prepareDocument(docData: ObjectNode, docType: String, onlyPublished: Boolean = false, resolveLinks: Boolean = true): ObjectNode {
        // set empty parent fields explicitly to null
        val parent = docData.has(FIELD_PARENT)
        if (!parent || docData.get(FIELD_PARENT).asText().isEmpty()) {
            docData.put(FIELD_PARENT, null as String?)
        }
        dbService.removeInternalFields(docData)

        // get latest references from links
        if (resolveLinks) {
            val refType = getDocumentType(docType)

            refType.updateReferences(docData, onlyPublished)
        }

        return docData
    }
}
