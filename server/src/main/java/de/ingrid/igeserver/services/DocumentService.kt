package de.ingrid.igeserver.services

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.ObjectNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.api.NotFoundException
import de.ingrid.igeserver.extension.pipe.Context
import de.ingrid.igeserver.extension.pipe.impl.DefaultContext
import de.ingrid.igeserver.model.QueryField
import de.ingrid.igeserver.model.StatisticResponse
import de.ingrid.igeserver.persistence.FindAllResults
import de.ingrid.igeserver.persistence.FindOptions
import de.ingrid.igeserver.persistence.QueryOperator
import de.ingrid.igeserver.persistence.QueryType
import de.ingrid.igeserver.persistence.filter.*
import de.ingrid.igeserver.persistence.model.EntityType
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.DocumentWrapper
import de.ingrid.igeserver.repository.CatalogRepository
import de.ingrid.igeserver.repository.DocumentRepository
import de.ingrid.igeserver.repository.DocumentWrapperRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.data.domain.Example
import org.springframework.stereotype.Service

@Service
class DocumentService : MapperService() {

    @Autowired
    private lateinit var documentTypes: List<EntityType>

    @Autowired
    private lateinit var docRepo: DocumentRepository

    @Autowired
    private lateinit var docWrapperRepo: DocumentWrapperRepository

    @Autowired
    private lateinit var catalogRepo: CatalogRepository

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
    fun getWrapperByDocumentId(id: String, withReferences: Boolean): DocumentWrapper {

/*
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
*/
        return docWrapperRepo.findByUuid(id)

    }

    fun determineHasChildren(doc: DocumentWrapper): Boolean {
        val example = DocumentWrapper().apply { parent = DocumentWrapper().apply { uuid = doc.uuid }}
        return docWrapperRepo.count(Example.of(example)) > 0
    }

    fun findChildrenDocs(catalogId: String, parentId: String?, isAddress: Boolean): FindAllResults {
        return findChildren(catalogId, parentId, if (isAddress) DocumentCategory.ADDRESS else DocumentCategory.DATA)
    }

    fun findChildren(catalogId: String, parentId: String?, docCat: DocumentCategory? = null): FindAllResults {
        val queryMap = mutableListOf(
            QueryField(FIELD_PARENT, parentId),
            QueryField("catalog.identifier", catalogId)
        )

        // find all children regardless of category
        if (docCat != null) queryMap.add(QueryField(FIELD_CATEGORY, docCat.value))

        val findOptions = FindOptions(
            queryType = QueryType.EXACT,
            resolveReferences = true,
            queryOperator = QueryOperator.AND
        )

//        return dbService.findAll(DocumentWrapperType::class, queryMap, findOptions)
        val docs = docWrapperRepo.findAllByCatalog_IdentifierAndParent_UuidAndCategory(
            catalogId,
            parentId,
            docCat?.value ?: "data"
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

    fun createDocument(
        catalogId: String,
        data: JsonNode,
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
//        val newDocument = dbService.save(DocumentType::class, null, preCreatePayload.document.toString())
        val newDocument = docRepo.save(preCreatePayload.document)

        // set wrapper to document association
        if (publish) {
            preCreatePayload.wrapper.published = newDocument
        } else {
            preCreatePayload.wrapper.draft = newDocument
        }

        // save wrapper
//        val newWrapper = dbService.save(DocumentWrapperType::class, null, preCreatePayload.wrapper.toString())
        val newWrapper = docWrapperRepo.save(preCreatePayload.wrapper)

        // run post-create pipe(s)
        val postCreatePayload = PostCreatePayload(docType, newDocument, newWrapper)
        postCreatePipe.runFilters(postCreatePayload, filterContext)
        postPersistencePipe.runFilters(postCreatePayload as PostPersistencePayload, filterContext)

        // also run update pipes!
        val postWrapper = runPostUpdatePipes(docType, newDocument, newWrapper, filterContext, publish)
//        val latestDocument = getLatestDocument(postWrapper)
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
            title= titleString
            data = docJson as ObjectNode
        }
        
    }

    fun updateDocument(catalogId: String, id: String, data: Document, publish: Boolean = false): Document {
        val filterContext = DefaultContext.withCurrentProfile(catalogId, catalogRepo)
//        val docTypeName = data.get(FIELD_DOCUMENT_TYPE).asText()
//        val docType = getDocumentType(docTypeName)

        // run pre-update pipe(s)
        val wrapper = getWrapperByDocumentId(id, false)
        val docType = getDocumentType(wrapper.type!!)
        val preUpdatePayload = PreUpdatePayload(docType, data, wrapper)
        preUpdatePipe.runFilters(preUpdatePayload, filterContext)
        if (publish) {
            // run pre-publish pipe(s)
            val prePublishPayload = PrePublishPayload(docType, preUpdatePayload.document, preUpdatePayload.wrapper)
            prePublishPipe.runFilters(prePublishPayload, filterContext)
        }

        // TODO: use document id instead of DB-ID
        // TODO: use version as Int
        // save document with same ID or new one, if no draft version exists (because the last version is published)
        val recordId = preUpdatePayload.wrapper.draft?.id

//        val version = preUpdatePayload.document.version
//        val updatedDocument = dbService.save(DocumentType::class, recordId, preUpdatePayload.document.toString(), version)
        preUpdatePayload.document.id = recordId
        val updatedDoc = docRepo.save(preUpdatePayload.document)

        // update wrapper to document association
        with(preUpdatePayload.wrapper) {
//            val updatedRecordId = dbService.getRecordId(updatedDocument)
            if (publish) {
                // move published version to archive
//                val publishedId = published?.id
                if (published != null) {
                    archive.add(published!!)
                }
                // set published version
                published = updatedDoc
                // remove draft version
                draft = null
            } else {
                // update draft version
//                val draftId = get(FIELD_DRAFT)
                if (draft == null) {
                    // TODO: db_id is ORecord!
                    draft = updatedDoc
                } else {
                    // 'if' must have both main and 'else' branches if used as an expression
                }
            }
        }

        // save wrapper
//        val updatedWrapper = dbService.save(DocumentWrapperType::class, dbService.getRecordId(preUpdatePayload.wrapper), preUpdatePayload.wrapper.toString())
        val updatedWrapper = docWrapperRepo.save(preUpdatePayload.wrapper)

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
        val wrapper = getWrapperByDocumentId(id, true)
        // TODO: migrate
        /*if (wrapper != null) {
            val data = getLatestDocumentVersion(wrapper, false)
            val docTypeName = data.get(FIELD_DOCUMENT_TYPE).asText()
            val docType = getDocumentType(docTypeName)

            val preDeletePayload = PreDeletePayload(docType, data, wrapper as ObjectNode)
            preDeletePipe.runFilters(preDeletePayload, filterContext)

            findChildrenDocs(catalogId, id, isAddress(wrapper)).hits.forEach {
                deleteRecursively(catalogId, it.get(FIELD_ID).asText())
            }

            // remove all document versions which have the same ID
            dbService.remove(DocumentType::class, id)

            // remove the wrapper
            dbService.remove(DocumentWrapperType::class, id)

            // run post-delete pipe(s)
            val postDeletePayload = PostDeletePayload(docType, preDeletePayload.document, preDeletePayload.wrapper)
            postDeletePipe.runFilters(postDeletePayload, filterContext)
            postPersistencePipe.runFilters(postDeletePayload as PostPersistencePayload, filterContext)
        }*/
    }

    fun revertDocument(catalogId: String, id: String): Document {

        // remove draft version
        val wrapper = getWrapperByDocumentId(id, false)

        val publishedId = wrapper.published?.id

        // check if draft and published field are filled
        assert(wrapper.draft != null && wrapper.published != null)

        wrapper.draft = null
//        val recordId = dbService.getRecordId(wrapper)
//        val version = wrapper.get(FIELD_VERSION).asText()

//        val updatedWrapper = dbService.save(DocumentWrapperType::class, recordId, wrapper.toString())
        val updatedWrapper = docWrapperRepo.save( wrapper)

        // return published version
//        val publishedDoc = dbService.find(DocumentType::class, publishedId.asText()) as ObjectNode

        val publishedDoc = updatedWrapper.published!!
        publishedDoc.state = DocumentState.PUBLISHED.value
//        publishedDoc.put(FIELD_HAS_CHILDREN, determineHasChildren())

        return publishedDoc
    }

    fun getDocumentStatistic(catalogId: String): StatisticResponse {

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

        val allData = docWrapperRepo.findAllByCatalog_IdentifierAndCategory(catalogId, DocumentCategory.DATA.value)
        val allDataDrafts = docWrapperRepo.findAllDrafts(catalogId)
        val allDataPublished = docWrapperRepo.findAllPublished(catalogId)

        return StatisticResponse(
            totalNum = allData.size,
            numDrafts = allDataDrafts.size,
            numPublished = allDataPublished.size
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
            throw NotFoundException.withMissingPublishedVersion(wrapper.uuid)
        }

        // TODO: check if isNull function really works or if we need a null comparison
        val objectNode = if (wrapper.draft == null || onlyPublished) {
            wrapper.published
        } else {
            wrapper.draft
        }

        objectNode!!.state = if (onlyPublished) DocumentState.PUBLISHED.value else determineState(wrapper)

        return objectNode
    }

    private fun determineState(wrapper: DocumentWrapper): String {
        val draft = wrapper.draft != null
        val published = wrapper.published != null
        return if (published && draft) {
            DocumentState.PUBLISHED.value + DocumentState.DRAFT.value
        } else if (published) {
            DocumentState.PUBLISHED.value
        } else {
            DocumentState.DRAFT.value
        }
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
//        dbService.removeInternalFields(docData)

        // get latest references from links
        if (resolveLinks) {
            val refType = getDocumentType(docType)

            refType.updateReferences(docData, onlyPublished)
        }

        return docData
    }
}
